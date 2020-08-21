# AL&L of Orca Sounds' API

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**This API** serves as an interface between the machine learning model(s) and the webapp. To use it, a postgres db and an ML endpoint are needed.

# Docs

## Database models

<img src="assets/models.jpg">

**labeled_file** table:  
Label for an audio file made by a human annotator. All the labeled files then conform the labeled dataset used by the ML model.  
**model** table:  
Stores data about a model after every training round, as well as the number of files that were used to train it.  
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
    | URL            | Method | Description                                                            |
    | -------------- | ------ | ---------------------------------------------------------------------- |
    | /uncertainties | GET    | Get the next 5 audio files, in which the ML model had most uncertainty |

#### Success Response

**Code:** `200 OK`  
**Example:**  
The filenames are appended to an s3 bucket url (https://example.s3.amazonaws.com/), and the audio could be fetched using Ajax.

```JSON
[
  "mp3/sound1.mp3",
  "mp3/sound4.mp3",
  "mp3/sound6.mp3",
  "mp3/sound2.mp3",
  "mp3/sound3.mp3"
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
    "expertiseLevel": "Beginner",
    "unlabeled": []
}
```

#### Error Responses

**Code:** `500 SERVER ERROR`  
**Condition:** If fields are missing  
**Example:**

```JSON
{
    "labels": [{"filename": "5", "orca": true}],
    "expertiseLevel": "",
    "unlabeled": []
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

| URL         | Method | Description                                                                                                                                                                                 |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /statistics | GET    | Get confusion matrix, and list of losses and accuracies of last training round of the ML model, as well as the accuracies of the ML model vs the number of files used to train it over time |

#### Success Response

**Code:** `200 OK`  
**Example:**

```JSON
{
  "accuracy": {
    "test": [0.12, 0.45, 0.67, 0.78, 0.82, 0.89, 0.9, 0.92, 0.925],
    "train": [0.2, 0.5, 0.7, 0.8, 0.85, 0.9, 0.92, 0.925, 0.93]
  },
  "confusionMatrix": [
    [80, 46],
    [43, 100]
  ],
  "validationHistory": [
    ["Wed, 24 Jun 2020 00:00:00 GMT", 2],
    ["Thu, 25 Jun 2020 00:00:00 GMT", 6],
    ["Fri, 26 Jun 2020 00:00:00 GMT", 8]
  ],
  "modelAccuracy": [
    ["Wed, 24 Jun 2020 00:00:00 GMT", 0.8],
    ["Thu, 25 Jun 2020 00:00:00 GMT", 0.85],
    ["Fri, 26 Jun 2020 00:00:00 GMT", 0.9]
  ]
}
```

# Getting Started

This API requires a database and a ML endpoint to run, the easiest way to do that would be run the ML endpoint's docker container by following the [train_and_predict quick method](../train_and_predict/README.md#quick-method), and to start a docker postgres database with the following command: `docker run --name postgres -p 5432:5432 -e POSTGRES_DB=orcagsoc -e POSTGRES_PASSWORD=<database-password> -d postgres`.

### Quick Method

-   Make sure [Docker](https://www.docker.com/) is installed
-   Run the following command with your AWS access keys:  
    `docker run --rm --name activelearning_api -d -p 5000:5000 -e S3_LABELED_PATH=s3://orcagsoc/labeled_test/ -e S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/ -e RETRAIN_TARGET=20 -e S3_MODEL_PATH=s3://orcagsoc/models/srkw_cnn_0.h5 -e IMG_WIDTH=607 -e IMG_HEIGHT=617 -e EPOCHS=1 --link postgres:dbserver -e DATABASE_URL=postgresql+psycopg2://postgres:<database-password>@dbserver/orcagsoc -e ML_ENDPOINT_URL=http://host.docker.internal:5001 jdiegors/activelearning_api:latest`

### Flexible Method

-   Install [pipenv](https://pypi.org/project/pipenv/)
-   Run `pipenv shell` to start a virtual environment
-   Run `pipenv install` to install the required dependencies
-   Create a `.env` file with the following parameters:

    ```
    DATABASE_URL=postgresql+psycopg2://postgres:<database-password>@localhost:5432/orcagsoc
    ML_ENDPOINT_URL=http://127.0.0.1:5001
    S3_LABELED_PATH=s3://orcagsoc/labeled_test/
    S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/
    S3_MODEL_PATH=s3://orcagsoc/models/srkw_cnn_0.h5
    RETRAIN_TARGET=20
    IMG_WIDTH=607
    IMG_HEIGHT=617
    EPOCHS=1
    ```

-   Run `flask db upgrade` to update the tables of the database
-   `flask run` starts a development server in http://localhost:5000
-   If you plan to contribute, please configure your text editor / IDE to use Flake8 to lint and YAPF to format Python code

### Testing

-   Run `python -m pytest -v`

### Deployment

Follow the quick start method on your server of choice.  
Otherwise, to push to a different docker container registry, create an account on https://hub.docker.com, login from the command line `docker login`, build the image with `docker build -t activelearning_api .` from within the project directory, rename it to `docker tag activelearning_api:latest <your-docker-registry-account>/activelearning_api:latest`, push it to the Docker registry `docker push <your-docker-registry-account>/activelearning_api:latest`. Now you can follow the quick start method.
