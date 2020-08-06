import aiohttp
import asyncio
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


async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()


async def train():
    print('Training...')
    r = await fetch(f'{os.environ.get("ML_ENDPOINT_URL")}/train')
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
    print('Finished training')


async def predict():
    print('Predicting...')
    r = await fetch(f'{os.environ.get("ML_ENDPOINT_URL")}/predict')
    predictions = r['predictions']
    session['s3_unlabeled_path'] = r['s3_unlabeled_path']

    for prediction in predictions:
        newPrediction = Prediction(prediction['predicted_value'],
                                   prediction['audio_url'],
                                   prediction['location'],
                                   prediction['duration'],
                                   prediction['timestamp'])
        db.session.add(newPrediction)

    db.session.commit()
    print('Finished predicting')


async def train_and_predict():
    # Clear tables
    Prediction.query.delete()
    ConfusionMatrix.query.delete()
    Accuracy.query.delete()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(train())
    loop.run_until_complete(predict())


def update_s3_dir(filename, orca, validation):
    calls_path = 'calls' if orca else 'nocalls'
    validation_path = 'validation' if validation else 'train'
    subprocess.run([
        'aws', 's3', 'mv', f'{session["s3_unlabeled_path"]}{filename}.png',
        f'{session["s3_labeled_path"]}{validation_path}/{calls_path}/'
    ])