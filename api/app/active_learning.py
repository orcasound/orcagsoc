import requests
from app import db
from app.models import Prediction


def update_predictions():
    Prediction.query.delete()  # Clear table

    r = requests.get('http://localhost:5001/predict').json()

    predictions = r['predictions']
    filenames = r['filenames']
    model = r['model']

    for i in range(len(predictions)):
        newPrediction = Prediction(model, predictions[i][0], filenames[i])
        db.session.add(newPrediction)

    db.session.commit()

    # uncertainties = [abs(p[0] - 0.5) for p in predictions]

    # clean_filenames = [
    #     file.split('\\')[1].split('_')[0] for file in data_generator.filenames
    # ]

    # filenames_with_uncertainties = zip(clean_filenames, uncertainties)

    # sorted_filenames_by_uncertainty = sorted(filenames_with_uncertainties,
    #                                          key=lambda x: x[1])

    # iter_sorted_filenames = iter(sorted_filenames_by_uncertainty)