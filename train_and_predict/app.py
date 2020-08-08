from flask import Flask, jsonify
from tensorflow.keras.models import load_model
import subprocess
import os
app = Flask(__name__)

s3_model_path = os.environ.get('S3_MODEL_PATH')
local_model_path = s3_model_path.split('/')[-1]
if not os.path.isfile(local_model_path):
    subprocess.run(['aws', 's3', 'cp', s3_model_path, '.'])

model = load_model(local_model_path)
from predict import get_predictions_on_unlabeled
from train import train


@app.route('/predict')
def get_predictions():
    predictions = get_predictions_on_unlabeled()
    return jsonify(predictions)


@app.route('/train')
def train_model():
    acc, val_acc, loss, val_loss, cm, labeled_files = train()
    return {
        "acc": acc,
        "val_acc": val_acc,
        "loss": loss,
        "val_loss": val_loss,
        "cm": cm,
        'labeled_files': labeled_files
    }
