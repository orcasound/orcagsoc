import requests
from app import db
from app.models import Prediction, ConfusionMatrix, Accuracy, ModelAccuracy
import subprocess

# Global
num_labels = {'goal': 20, 'cur': 0}


def train_and_predict():
    # Clear tables
    Prediction.query.delete()
    ConfusionMatrix.query.delete()
    Accuracy.query.delete()

    # Train
    r = requests.get('http://localhost:5001/train').json()

    acc = r['acc']
    val_acc = r['val_acc']
    tn, fp, fn, tp = r['cm']

    for i in range(len(acc)):
        db.session.add(Accuracy(acc[i], val_acc[i]))

    db.session.add(ConfusionMatrix(tn, fp, fn, tp))

    db.session.add(ModelAccuracy(val_acc[-1]))

    # Predict
    r = requests.get('http://localhost:5001/predict').json()

    predictions = r['predictions']
    filenames = r['filenames']
    model = r['model']

    for i in range(len(predictions)):
        newPrediction = Prediction(model, predictions[i][0], filenames[i])
        db.session.add(newPrediction)

    db.session.commit()


def update_s3_dir(filename, orca, validation):
    calls_path = 'calls' if orca else 'nocalls'
    validation_path = 'validation' if validation else 'train'
    subprocess.run([
        'aws', 's3', 'mv',
        f's3://orcagsoc/unlabeled_test/spectrograms/{filename}_0000.png',
        f's3://orcagsoc/labeled_test/{validation_path}/{calls_path}/'
    ])