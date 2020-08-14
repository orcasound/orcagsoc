# AL&L of Orca Sounds' API

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**This API** serves as an interface between the machine learning model(s) and the webapp.

# Docs

## Database models

<img src="assets/models.jpg">

**labeled_file** table:  
Label for an audio file made by a human annotator. All the labeled files then conform the labeled dataset used by the ML model.  
**model_accuracy** table:  
Stores the accuracy of the model after every training round and the number of files used for training.  
**confusion_matrix** table:  
Stores the confusion matrix generated after a retraining using the validation dataset.  
**accuracy** table:  
Stores a list of loss and accuracies after every epoch.  
**prediction** table:  
Stores the predicted value of an unlabeled file, alongside with more information about that file.

## Endpoints

-   `GET` [/uncertainties](#get-uncertainties)
-   `POST`[/labeledfile](#add-labeled-files)
-   `GET` [/statistics](#get-statistics)

-   ### Get Uncertainties
    | URL            | Method | Description                                                         |
    | -------------- | ------ | ------------------------------------------------------------------- |
    | /uncertainties | GET    | Get the next 5 audio files, where the ML model had most uncertainty |

#### Success Response

**Code:** `200 OK`  
**Example:**

```JSON
[
    {
        "audioUrl": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154250.mp3",
        "confidence": 73.10559153556824,
        "duration": 3.0,
        "id": 601,
        "location": "Haro Strait",
        "orca": true,
        "timestamp": "Tue, 07 Jul 2020 20:37:30 GMT"
    },
    {
        "audioUrl": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154862.mp3",
        "confidence": 74.55249428749084,
        "duration": 3.0,
        "id": 794,
        "location": "Haro Strait",
        "orca": true,
        "timestamp": "Tue, 07 Jul 2020 20:47:42 GMT"
    },
    {
        "audioUrl": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154934.mp3",
        "confidence": 75.39503574371338,
        "duration": 3.0,
        "id": 818,
        "location": "Haro Strait",
        "orca": true,
        "timestamp": "Tue, 07 Jul 2020 20:48:54 GMT"
    },
    {
        "audioUrl": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154556.mp3",
        "confidence": 75.6567895412445,
        "duration": 3.0,
        "id": 699,
        "location": "Haro Strait",
        "orca": true,
        "timestamp": "Tue, 07 Jul 2020 20:42:36 GMT"
    },
    {
        "audioUrl": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154832.mp3",
        "confidence": 75.72913765907288,
        "duration": 3.0,
        "id": 784,
        "location": "Haro Strait",
        "orca": true,
        "timestamp": "Tue, 07 Jul 2020 20:47:12 GMT"
    }
]
```

-   ### Add Labeled Files

| URL          | Method | Description                           |
| ------------ | ------ | ------------------------------------- |
| /labeledfile | POST   | Add new labeled files to the database |

#### Data Constrains

```JSON
{
    "headers": {
        "Content-Type": "['application/json' or 'text/plain;charset=UTF-8']",
    },
    "body": {
        "labels": "[list of labels]",
        "expertiseLevel": "[can be an empty string][10 chars max]"
    }
}

label = {
    "filename": "[unicode 50 chars max]",
    "orca": "[true or false]",
    "extraLabel":"[can be an empty string][10 chars max]"
}
```

#### Success Response

**Code:** `201 CREATED`  
**Condition:** If everything is OK  
**Example:**

```JSON
{
    "labels": [{"filename": "5", "orca": true, "extraLabel":"K"}],
    "unlabeled": []
    "expertiseLevel": "Beginner"
}
```

#### Error Responses

**Code:** `500 SERVER ERROR`  
**Condition:** If fields are missing  
**Example:**

```JSON
{
    "labels": [{"filename": "5", "orca": true}],
    "expertiseLevel": ""
}
```

**Code:** `415 UNSUPPORTED MEDIA TYPE`  
**Condition:** If the Content-Type header is missing or not supported
**Example:**

```JSON
headers: {
    "Content-Type": "application/pdf"
}
```

-   ### Get Statistics

| URL         | Method | Description                                                                                                              |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| /statistics | GET    | Get statistics about the last training round of the ML model, as well as about the performance of the ML model over time |

#### Success Response

**Code:** `200 OK`  
**Example:**

```JSON
{
    "accuracy": {
        "train": [
            0.7096773982048035
        ],
        "validation": [
            0.6222222447395325
        ]
    },
    "accuracyVLabels": {
        "accuracies": [
            0.6222222447395325,
            0.6222222447395325,
            0.6666666865348816,
            0.6222222447395325
        ],
        "dates": [
            "Wed, 12 Aug 2020 18:13:11 GMT",
            "Wed, 12 Aug 2020 18:19:08 GMT",
            "Wed, 12 Aug 2020 18:20:49 GMT",
            "Wed, 12 Aug 2020 18:28:28 GMT"
        ],
        "labels": [
            124,
            124,
            124,
            124
        ]
    },
    "confusionMatrix": [
        10,
        10,
        7,
        18
    ],
    "loss": {
        "train": [
            0.7021337747573853
        ],
        "validation": [
            0.7545308470726013
        ]
    },
    "retrain": {
        "goal": "20",
        "progress": 0
    },
    "training": false
}
```

# Getting Started

This API requires a database and a ML endpoint to run, the easiest way to do that would be run the ML endpoint's docker container by following the [train_and_predict quick method](../train_and_predict/README.md#quick-method), and to start a docker postgres database with the following command: `docker run --name postgres -p 5432:5432 -e POSTGRES_DB=orcagsoc -e POSTGRES_PASSWORD=postgres -d postgres`.

### Quick Method

-   Make sure [Docker](https://www.docker.com/) is installed
-   `docker run --rm --name activelearning_api -d -p 5000:5000 -e AWS_ACCESS_KEY_ID=AKIAZN2WCXIF3ILPLCXY -e AWS_SECRET_ACCESS_KEY=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 -e S3_LABELED_PATH=s3://orcagsoc/labeled_test/ -e S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/ -e RETRAIN_TARGET=20 --link postgres:dbserver -e DATABASE_URL=postgresql+psycopg2://postgres:postgres@dbserver/orcagsoc -e ML_ENDPOINT_URL=http://host.docker.internal:5001 jdiegors/activelearning_api:latest`

### Flexible Method

-   Install [pipenv](https://pypi.org/project/pipenv/)
-   Run `pipenv shell` to start a virtual environment
-   Run `pipenv install` to install the required dependencies
-   You also need a local database, so use the `flask db upgrade` command to create one
-   `flask run` starts a development server in http://localhost:5000
-   If you plan to contribute, please configure your text editor / IDE to use Flake8 to lint and YAPF to format Python code

### Testing

-   Run `python -m pytest -v`

### Deployment

Follow the quick start method on your server of choice.  
Otherwise, to push to a different docker container registry, create an account on https://hub.docker.com, login from the command line `docker login`, build the image with `docker build -t activelearning_api .` from within the project directory, rename it to `docker tag activelearning_api:latest <your-docker-registry-account>/activelearning_api:latest`, push it to the Docker registry `docker push <your-docker-registry-account>/activelearning_api:latest`.. Now you can follow the quick start method.
