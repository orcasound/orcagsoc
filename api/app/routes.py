from flask import jsonify, request
from app import app, db, models
from app.models import LabeledFile, ModelAccuracy, Prediction, Accuracy, ConfusionMatrix
import itertools
import json
import datetime
from .active_learning import update_s3_dir, train_and_predict, session


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
    predicted_values = [p.predicted_value for p in predictions]
    data = {'filenames': filenames, 'predictions': predicted_values}
    return data


# Add new labeled files
@app.route('/labeledfiles', methods=['POST'])
def post_labeledfiles():
    if request.headers['Content-Type'] == 'text/plain;charset=UTF-8':
        data = json.loads(request.data.decode('utf-8'))
    elif request.headers['Content-Type'] == 'application/json':
        data = request.json
    else:
        return jsonify({'error': 'Unsupported Media Type'}), 415

    labels = []
    if 'labels' in data:
        labels = data['labels']

    expertise_level = ''
    if 'expertiseLevel' in data:
        expertise_level = data['expertiseLevel']

    unlabeled = []
    if 'unlabeled' in data:
        unlabeled = data['unlabeled']

    for filename in unlabeled:
        cur_f = db.session.query(Prediction).filter(
            Prediction.filename == filename).first()
        if cur_f is not None:
            cur_f.labeling = False

    for i, label in enumerate(labels):
        filename = label['filename']
        orca = label['orca']
        extra_label = label['extraLabel']

        validation = i == 4
        update_s3_dir(filename, orca, validation)

        newLabeledFile = LabeledFile(filename, orca, extra_label,
                                     expertise_level)
        db.session.add(newLabeledFile)

    db.session.commit()
    session['cur_labels'] += len(labels)
    if not session['training'] and session['cur_labels'] >= session['goal']:
        train_and_predict()
        session['cur_labels'] = 0

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

    accuracy = db.session.query(Accuracy.acc, Accuracy.val_acc, Accuracy.loss, Accuracy.val_loss).all()
    train = []
    validation = []
    train_l = []
    validation_l = []
    for t in accuracy:
        train.append(t[0])
        validation.append(t[1])
        train_l.append(t[2])
        validation_l.append(t[3])

    [confusion_matrix
     ] = db.session.query(ConfusionMatrix.tn, ConfusionMatrix.fp,
                          ConfusionMatrix.fn, ConfusionMatrix.tp).all()

    data = {
        'confusionMatrix': confusion_matrix,
        'accuracy': {
            'train': train,
            'validation': validation
        },
        'loss': {
            'train': train_l,
            'validation': validation_l
        },
        'validationHistory': samples_by_day,
        'modelAccuracy': model_accuracy,
    }
    return data