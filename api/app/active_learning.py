import requests
from app import db
from app.models import Prediction, ConfusionMatrix, Accuracy, ModelAccuracy
import subprocess

# Global
session = {
    'goal': 10,
    'cur_labels': 0,
    'training': False,
    's3_labeled_path': '',
    's3_unlabeled_path': ''
}
model_uri = 'http://3bf93f26b64e.ngrok.io'


def train_and_predict():
    session['training'] = True
    # Clear tables
    Prediction.query.delete()
    ConfusionMatrix.query.delete()
    Accuracy.query.delete()

    # Train
    r = requests.get(f'{model_uri}/train').json()

    acc = r['acc']
    val_acc = r['val_acc']
    loss = r['loss']
    val_loss = r['val_loss']
    tn, fp, fn, tp = r['cm']
    session['s3_labeled_path'] = r['s3_labeled_path']

    for i in range(len(acc)):
        db.session.add(Accuracy(acc[i], val_acc[i], loss[i], val_loss[i]))

    db.session.add(ConfusionMatrix(tn, fp, fn, tp))

    db.session.add(ModelAccuracy(val_acc[-1], r['labeled_files']))

    # Predict
    r = requests.get(f'{model_uri}/predict').json()

    predictions = r['predictions']
    session['s3_unlabeled_path'] = r['s3_unlabeled_path']

    for prediction in predictions:
        newPrediction = Prediction(prediction['predicted_value'],
                                   prediction['audio_url'],
                                   prediction['location'],
                                   prediction['timestamp'])
        db.session.add(newPrediction)

    db.session.commit()
    session['training'] = False


def update_s3_dir(filename, orca, validation):
    calls_path = 'calls' if orca else 'nocalls'
    validation_path = 'validation' if validation else 'train'
    subprocess.run([
        'aws', 's3', 'mv', f'{session["s3_unlabeled_path"]}{filename}.png',
        f'{session["s3_labeled_path"]}{validation_path}/{calls_path}/'
    ])