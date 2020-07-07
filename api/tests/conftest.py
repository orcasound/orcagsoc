import pytest
from app import app, db
from app.models import LabeledFile, ModelAccuracy
from flask_sqlalchemy import SQLAlchemy
import os
import tempfile
basedir = os.path.abspath(os.path.dirname(__file__))


@pytest.fixture(scope='module')
def test_client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(
        basedir, 'test.db')
    app.config['TESTING'] = True

    # Flask provides a way to test your application by exposing the Werkzeug
    # test Client and handling the context locals for you.
    testing_client = app.test_client()

    # Establish an application context before running the tests.
    ctx = app.app_context()
    ctx.push()

    yield testing_client  # this is where the testing happens!

    ctx.pop()


@pytest.fixture(scope='module')
def init_database():
    # Create the database and the database table
    db.create_all()

    # Insert user data
    labeled_file1 = LabeledFile('sound20.mp3', True, '', 'Beginner')
    labeled_file2 = LabeledFile('sound30.wav', False, 'Whale', '')
    accuracy1 = ModelAccuracy(0.82)
    accuracy2 = ModelAccuracy(0.9)
    db.session.add(labeled_file1)
    db.session.add(labeled_file2)
    db.session.add(accuracy1)
    db.session.add(accuracy2)

    # Commit the changes for the users
    db.session.commit()

    yield db  # this is where the testing happens!

    db.drop_all()