from app.models import LabeledFile


def test_get_filenames(test_client):
    """
    GIVEN a Flask application
    WHEN the '/filenames' page is requested (GET)
    THEN check the response is valid
    """
    response = test_client.get('/filenames')
    assert response.status_code == 200


def test_post_labeledfiles(test_client, init_database):
    """
    GIVEN a Flask application
    WHEN the '/labeledfiles' page is posted to (POST)
    THEN check the response is valid
    """
    response = test_client.post('/labeledfiles',
                                json={
                                    "labels": [{
                                        "filename": "sound50.mp3",
                                        "orca": True,
                                        "extra_label": "K"
                                    }],
                                    "expertise_level":
                                    "Beginner"
                                })
    assert response.status_code == 200
    assert response.json['success']
