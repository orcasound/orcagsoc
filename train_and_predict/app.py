from flask import Flask
from predict import get_predictions_on_unlabeled
from train import train
app = Flask(__name__)


@app.route('/predict')
def get_predictions():
    predictions, filenames = get_predictions_on_unlabeled()
    return {'predictions': predictions, 'filenames': filenames}


@app.route('/train')
def train_model():
    acc, val_acc, loss, val_loss, cm = train()
    return {"acc": acc, "val_acc": val_acc, "loss": loss, "val_loss": val_loss, "cm": cm}
