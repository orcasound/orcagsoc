from flask import jsonify, request
from app import app, db, models
from app.models import LabeledFile
import itertools

filenames = iter([
    'sound1.mp3', 'sound4.mp3', 'sound6.mp3', 'sound2.mp3', 'sound3.mp3',
    'sound5.mp3'
])


# Get the next 5 files with most uncertainty
@app.route('/filenames', methods=['GET'])
def get_filenames():
    return jsonify(list(itertools.islice(filenames, 5)))


# Add new labeled files
@app.route('/labeledfiles', methods=['POST'])
def post_labeledfiles():
    labels = request.json['labels']
    expertise_level = request.json['expertise_level']
    for label in labels:
        filename = label['filename']
        orca = label['orca']
        extra_label = label['extra_label']

        newLabeledFile = LabeledFile(filename, orca, extra_label,
                                     expertise_level)
        db.session.add(newLabeledFile)
    db.session.commit()
    return {'success': True}
