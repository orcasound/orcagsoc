from flask import Flask
from predict import get_predictions_on_unlabeled
from train import train
app = Flask(__name__)


@app.route('/predict')
def get_predictions():
    predictions, filenames, model = get_predictions_on_unlabeled()
    return {'predictions': predictions, 'filenames': filenames, 'model': model}


@app.route('/train')
def train_model():
    acc, val_acc, cm = train()
    return {
        "accuracy": {
            "train": acc,
            "validation": val_acc
        },
        "confusionMatrix": cm
    }