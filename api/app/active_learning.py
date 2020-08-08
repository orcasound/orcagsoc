import requests
from app import db
from app.models import Prediction, ConfusionMatrix, Accuracy, ModelAccuracy
import subprocess
import os

# Global
session = {
    'goal': os.environ.get("RETRAIN_TARGET"),
    'cur_labels': 0,
    'training': False
}


def train_and_predict():
    # Train
    print('Training...')
    session['training'] = True
    r = requests.get(f'{os.environ.get("ML_ENDPOINT_URL")}/train').json()
    acc = r['acc']
    val_acc = r['val_acc']
    loss = r['loss']
    val_loss = r['val_loss']
    tn, fp, fn, tp = r['cm']

    Accuracy.query.delete()
    db.session.add_all([
        Accuracy(acc[i], val_acc[i], loss[i], val_loss[i])
        for i in range(len(acc))
    ])

    ConfusionMatrix.query.delete()
    db.session.add(ConfusionMatrix(tn, fp, fn, tp))

    db.session.add(ModelAccuracy(val_acc[-1], r['labeled_files']))

    db.session.commit()
    session['training'] = False
    print('Finished training')

    # Predict
    print('Predicting...')
    r = requests.get(f'{os.environ.get("ML_ENDPOINT_URL")}/predict').json()
    predictions = r['predictions']

    Prediction.query.delete()
    db.session.add_all([
        Prediction(prediction['predicted_value'], prediction['audio_url'],
                   prediction['location'], prediction['duration'],
                   prediction['timestamp']) for prediction in predictions
    ])

    db.session.commit()
    print('Finished predicting')


s3_unlabeled_path = os.environ.get('S3_UNLABELED_PATH')
s3_labeled_path = os.environ.get('S3_LABELED_PATH')
labeled_path = s3_labeled_path.split('/')[-2]
s3_url = f'https://{s3_labeled_path.split("/")[2]}.s3.amazonaws.com/{labeled_path}'


def update_s3_dir(audio_url, orca, validation):
    calls_path = 'calls' if orca else 'nocalls'
    validation_path = 'validation' if validation else 'train'
    filename = audio_url.split('/')[-1].split('.')[0]
    subprocess.run([
        'aws', 's3', 'mv', f'{s3_unlabeled_path}spectrograms/{filename}.png',
        f'{s3_labeled_path}{validation_path}/{calls_path}/'
    ])
    subprocess.run([
        'aws', 's3', 'mv', f'{s3_unlabeled_path}mp3/{filename}.mp3',
        f'{s3_labeled_path}mp3/{calls_path}/'
    ])
    return f'{s3_url}/mp3/{calls_path}/{filename}.mp3'