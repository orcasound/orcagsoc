from app import db
from datetime import datetime


class LabeledFile(db.Model):
    ''' Label for an audio file made by a human annotator.
    All the labeled files then conform the labeled dataset used by the ML model
    '''
    id = db.Column(db.Integer, primary_key=True)
    audio_url = db.Column(db.String(100))
    orca = db.Column(db.Boolean)
    extra_label = db.Column(db.String(10))
    expertise_level = db.Column(db.String(10))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, audio_url, orca, extra_label, expertise_level):
        self.audio_url = audio_url
        self.orca = orca
        self.extra_label = extra_label
        self.expertise_level = expertise_level

    def __repr__(self):
        return '<LabeledFile {}>'.format(self.audio_url)


class Model(db.Model):
    '''ML Model saved after each training round.'''
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    version = db.Column(db.Integer)
    url = db.Column(db.String(100))
    accuracy = db.Column(db.Float)
    loss = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    labeled_files = db.Column(db.Integer)

    def __init__(self, name, version, url, accuracy, loss, labeled_files):
        self.name = name
        self.version = version
        self.url = url
        self.accuracy = accuracy
        self.loss = loss
        self.labeled_files = labeled_files

    def __repr__(self):
        return '<Model {}>'.format(self.name)


class Prediction(db.Model):
    '''Unlabeled file predicted by an ML model'''
    id = db.Column(db.Integer, primary_key=True)
    predicted_value = db.Column(db.Float)
    audio_url = db.Column(db.String(100))
    location = db.Column(db.String(30))
    duration = db.Column(db.Float)
    timestamp = db.Column(db.DateTime)
    labeling = db.Column(db.Boolean)

    def __init__(self, predicted_value, audio_url, location, duration,
                 timestamp):
        self.predicted_value = predicted_value
        self.audio_url = audio_url
        self.location = location
        self.duration = duration
        self.timestamp = timestamp
        self.labeling = False

    def __repr__(self):
        return '<Prediction {}>'.format(self.audio_url)


class ConfusionMatrix(db.Model):
    '''Last training round's confusion matrix'''
    id = db.Column(db.Integer, primary_key=True)
    tn = db.Column(db.Integer)
    fp = db.Column(db.Integer)
    fn = db.Column(db.Integer)
    tp = db.Column(db.Integer)

    def __init__(self, tn, fp, fn, tp):
        self.tn = tn
        self.fp = fp
        self.fn = fn
        self.tp = tp


class Accuracy(db.Model):
    '''Last training round's losses and accuracies'''
    id = db.Column(db.Integer, primary_key=True)
    acc = db.Column(db.Float)
    val_acc = db.Column(db.Float)
    loss = db.Column(db.Float)
    val_loss = db.Column(db.Float)

    def __init__(self, acc, val_acc, loss, val_loss):
        self.acc = acc
        self.val_acc = val_acc
        self.loss = loss
        self.val_loss = val_loss