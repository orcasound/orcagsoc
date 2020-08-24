from flask import Flask, jsonify, request
import subprocess
app = Flask(__name__)

from predict import get_predictions_on_unlabeled
from train import train


@app.route('/')
def home():
    return 'ML enpoint is running!'


@app.route('/predict')
def get_predictions():
    model_url = request.args['model_url']
    unlabeled_url = request.args['unlabeled_url']
    img_width = int(request.args['img_width'])
    img_height = int(request.args['img_height'])
    predictions = get_predictions_on_unlabeled(model_url, unlabeled_url,
                                               img_width, img_height)
    return jsonify(predictions)


@app.route('/train')
def train_model():
    model_url = request.args['model_url']
    labeled_url = request.args['labeled_url']
    img_width = int(request.args['img_width'])
    img_height = int(request.args['img_height'])
    epochs = int(request.args['epochs'])
    acc, val_acc, loss, val_loss, cm, labeled_files, model_acc, model_loss, model_url = train(
        model_url, labeled_url, img_width, img_height, epochs)
    return {
        "acc": acc,
        "val_acc": val_acc,
        "loss": loss,
        "val_loss": val_loss,
        "cm": cm,
        'labeled_files': labeled_files,
        'model_acc': model_acc,
        'model_loss': model_loss,
        'model_url': model_url
    }
