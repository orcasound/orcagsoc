from flask import Flask
from predict import get_predictions_on_unlabeled
from train import train
app = Flask(__name__)


@app.route('/predict')
def get_predictions():
    predictions, s3_unlabeled_path = get_predictions_on_unlabeled()
    return {"predictions": predictions, "s3_unlabeled_path": s3_unlabeled_path}


@app.route('/train')
def train_model():
    acc, val_acc, loss, val_loss, cm, s3_labeled_path, labeled_files = train()
    return {
        "acc": acc,
        "val_acc": val_acc,
        "loss": loss,
        "val_loss": val_loss,
        "cm": cm,
        's3_labeled_path': s3_labeled_path,
        'labeled_files': labeled_files
    }
