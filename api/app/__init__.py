from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
basedir = os.path.abspath(os.path.dirname(__name__))

# Init app
app = Flask(__name__)
CORS(app, origins='http://localhost:8080')

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init db
db = SQLAlchemy(app)

from app import routes, models
from app.models import LabeledFile


# Load the database instance and models to flask shell
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'LabeledFile': LabeledFile}
