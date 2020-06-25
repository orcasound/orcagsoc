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
    date = db.Column(db.DateTime, index=True, default=date.today)

    def __init__(self, filename, orca, extra_label, expertise_level):
        self.filename = filename
        self.orca = orca
        self.extra_label = extra_label
        self.expertise_level = expertise_level

    def __repr__(self):
        return '<LabeledFile {}>'.format(self.filename)
