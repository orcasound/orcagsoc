import requests
from app import db
from app.models import Prediction, ConfusionMatrix, Accuracy, ModelAccuracy
import subprocess
import os

# Global
session = {
    'goal': 10,
    'cur_labels': 0,
    's3_labeled_path': '',
    's3_unlabeled_path': ''
}


def train_and_predict():
    # Train
    print('Training...')
    r = requests.get(f'{os.environ.get("ML_ENDPOINT_URL")}/train').json()
    acc = r['acc']
    val_acc = r['val_acc']
    loss = r['loss']
    val_loss = r['val_loss']
    tn, fp, fn, tp = r['cm']
    session['s3_labeled_path'] = r['s3_labeled_path']

    Accuracy.query.delete()
    db.session.add_all([
        Accuracy(acc[i], val_acc[i], loss[i], val_loss[i])
        for i in range(len(acc))
    ])

    ConfusionMatrix.query.delete()
    db.session.add(ConfusionMatrix(tn, fp, fn, tp))

    db.session.add(ModelAccuracy(val_acc[-1], r['labeled_files']))

    db.session.commit()
    print('Finished training')

    # Predict
    print('Predicting...')
    r = requests.get(f'{os.environ.get("ML_ENDPOINT_URL")}/predict').json()
    predictions = r['predictions']
    session['s3_unlabeled_path'] = r['s3_unlabeled_path']

    Prediction.query.delete()
    db.session.add_all([
        Prediction(prediction['predicted_value'], prediction['audio_url'],
                   prediction['location'], prediction['duration'],
                   prediction['timestamp']) for prediction in predictions
    ])

    db.session.commit()
    print('Finished predicting')


def update_s3_dir(filename, orca, validation):
    calls_path = 'calls' if orca else 'nocalls'
    validation_path = 'validation' if validation else 'train'
    subprocess.run([
        'aws', 's3', 'mv', f'{session["s3_unlabeled_path"]}{filename}.png',
        f'{session["s3_labeled_path"]}{validation_path}/{calls_path}/'
    ])