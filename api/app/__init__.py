from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import logging
basedir = os.path.abspath(os.path.dirname(__name__))

# Init app
app = Flask(__name__)
CORS(app)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Heroku logs to stdout
app.config['LOG_TO_STDOUT'] = os.environ.get('LOG_TO_STDOUT')
if app.config['LOG_TO_STDOUT']:
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    app.logger.addHandler(stream_handler)

# Init db
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from .active_learning import update_predictions
from app import routes, models
from app.models import LabeledFile, ModelAccuracy, Prediction

if db.session.query(Prediction).first() is None:
    update_predictions()


# Load the database instance and models to flask shell
@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'LabeledFile': LabeledFile,
        'ModelAccuracy': ModelAccuracy,
        'Prediction': Prediction
    }
