from app import db
from datetime import date


class LabeledFile(db.Model):
    ''' Label for an audio file made by a human annotator.
    All the labeled files then conform the labeled dataset used by the ML model
    '''
    id = db.Column(db.Integer, primary_key=True)
    # filename = db.Column(db.String(50), unique=True)
    filename = db.Column(db.String(50))
    orca = db.Column(db.Boolean)
    extra_label = db.Column(db.String(10))
    expertise_level = db.Column(db.String(10))
    date = db.Column(db.Date, index=True, default=date.today)

    def __init__(self, filename, orca, extra_label, expertise_level):
        self.filename = filename
        self.orca = orca
        self.extra_label = extra_label
        self.expertise_level = expertise_level

    def __repr__(self):
        return '<LabeledFile {}>'.format(self.filename)


class ModelAccuracy(db.Model):
    '''ML Model Acccuracy after each training round.'''
    id = db.Column(db.Integer, primary_key=True)
    accuracy = db.Column(db.Float)
    date = db.Column(db.Date, index=True, default=date.today)

    def __init__(self, accuracy):
        self.accuracy = accuracy

    def __repr__(self):
        return '<ModelAccuracy {}>'.format(self.accuracy)


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    predicted_value = db.Column(db.Float)
    filename = db.Column(db.String(50), index=True)
    labeling = db.Column(db.Boolean)

    def __init__(self, predicted_value, filename):
        self.predicted_value = predicted_value
        self.filename = filename
        self.labeling = False

    def __repr__(self):
        return '<Prediction {}>'.format(self.filename)


class ConfusionMatrix(db.Model):
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