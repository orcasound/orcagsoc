from flask import jsonify, request
from app import app, db, models
from app.models import LabeledFile, ModelAccuracy, Prediction
import itertools
import json
import datetime

# filenames = iter([
#     'sound1.mp3', 'sound4.mp3', 'sound6.mp3', 'sound2.mp3', 'sound3.mp3',
#     'sound5.mp3'
# ])
# filenames = [
#     'mp3/sound1.mp3',
#     'mp3/sound4.mp3',
#     'mp3/sound6.mp3',
#     'mp3/sound2.mp3',
#     'mp3/sound3.mp3',
# ]

confusion_matrix = [[80, 46], [43, 100]]
train_accuracy = [0.2, 0.5, 0.7, 0.8, 0.85, 0.9, 0.92, 0.925, 0.93]
test_accuracy = [0.12, 0.45, 0.67, 0.78, 0.82, 0.89, 0.9, 0.92, 0.925]


# Get the next 5 files with most uncertainty
@app.route('/filenames', methods=['GET'])
def get_filenames():
    # return jsonify(list(itertools.islice(filenames, 5)))
    predictions = db.session.query(Prediction).order_by(
        db.func.abs(0.5 - Prediction.predicted_value)).filter(
            ~Prediction.labeling).limit(5).all()
    for p in predictions:
        p.labeling = True
    db.session.commit()
    filenames = [p.filename for p in predictions]
    return jsonify(filenames)


# Add new labeled files
@app.route('/labeledfiles', methods=['POST'])
def post_labeledfiles():
    if request.headers['Content-Type'] == 'text/plain;charset=UTF-8':
        data = json.loads(request.data.decode('utf-8'))
    elif request.headers['Content-Type'] == 'application/json':
        data = request.json
    else:
        return jsonify({'error': 'Unsupported Media Type'}), 415

    labels = data['labels']
    expertise_level = data['expertiseLevel']
    unlabeled = data['unlabeled']
    for filename in unlabeled:
        cur_f = db.session.query(Prediction).filter(
            Prediction.filename == filename).first()
        cur_f.labeling = False

    for label in labels:
        # if 'filename' not in label or 'orca' not in label or 'extraLabel' not in label:
        #     return {'success': False}, 400

        filename = label['filename']
        orca = label['orca']
        extra_label = label['extraLabel']

        newLabeledFile = LabeledFile(filename, orca, extra_label,
                                     expertise_level)
        db.session.add(newLabeledFile)

    db.session.commit()
    return {'success': True}, 201


# Get Confusion Matrix, Model Accuracy and Number of Labeled files over Time
@app.route('/statistics', methods=['GET'])
def get_statistics():
    samples_by_day = db.session.query(
        LabeledFile.date, db.func.count(LabeledFile.date)).group_by(
            LabeledFile.date).order_by(LabeledFile.date).all()

    samples_by_day = [list(elem) for elem in samples_by_day]
    for i in range(1, len(samples_by_day)):
        samples_by_day[i][1] += samples_by_day[i - 1][1]

    model_accuracy = db.session.query(ModelAccuracy.date,
                                      ModelAccuracy.accuracy).all()

    data = {
        'confusionMatrix': confusion_matrix,
        'accuracy': {
            'train': train_accuracy,
            'test': test_accuracy
        },
        'validationHistory': samples_by_day,
        'modelAccuracy': model_accuracy,
    }
    return data