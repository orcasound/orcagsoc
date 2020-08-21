import requests
from app import db
from app.models import Prediction, ConfusionMatrix, Accuracy, Model
import subprocess
import os

# Global
session = {
    'goal': int(os.environ.get("RETRAIN_TARGET")),
    'cur_labels': 0,
    'training': False
}

ml_endpoint_url = os.environ.get("ML_ENDPOINT_URL")
s3_model_path = os.environ.get("S3_MODEL_PATH")
s3_unlabeled_path = os.environ.get('S3_UNLABELED_PATH')
s3_labeled_path = os.environ.get('S3_LABELED_PATH')
img_width = os.environ.get('IMG_WIDTH')
img_height = os.environ.get('IMG_HEIGHT')
epochs = os.environ.get('EPOCHS')

labeled_path = s3_labeled_path.split('/')[-2]
s3_url = f'https://{s3_labeled_path.split("/")[2]}.s3.amazonaws.com/{labeled_path}'

model_name = os.path.basename(s3_model_path)
model_name = '_'.join(model_name.split('_')[:-1])


def train_and_predict():
    # Train
    print('Training...')
    session['training'] = True
    # Get latest model
    latest_model = db.session.query(Model).filter(
        Model.name == model_name).order_by(Model.version.desc()).first()
    if latest_model is None:
        latest_model = Model(model_name, 0, s3_model_path, 0, 0, 0)

    url = (
        f'{ml_endpoint_url}/train?model_url={latest_model.url}'
        f'&labeled_url={s3_labeled_path}&img_width={img_width}&img_height={img_height}&epochs={epochs}'
    )

    r = requests.get(url).json()
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

    db.session.add(
        Model(latest_model.name, latest_model.version + 1, r['model_url'],
              r['model_acc'], r['model_loss'], r['labeled_files']))

    db.session.commit()
    session['training'] = False
    print('Finished training')

    # Predict
    print('Predicting...')
    url = (
        f'{ml_endpoint_url}/predict?model_url={latest_model.url}'
        f'&unlabeled_url={s3_unlabeled_path}&img_width={img_width}&img_height={img_height}'
    )

    predictions = requests.get(url).json()

    Prediction.query.delete()
    db.session.add_all([
        Prediction(prediction['predicted_value'], prediction['audio_url'],
                   prediction['location'], prediction['duration'],
                   prediction['timestamp']) for prediction in predictions
    ])

    db.session.commit()
    print('Finished predicting')


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