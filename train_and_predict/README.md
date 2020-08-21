# AL&L of Orca Sounds' ML Endpoint

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**The ML Endpoint** is a small flask app that given an h5 file, a labeled dataset and an unlabeled dataset, trains an ML model on the labeled data and predicts on the unlabeled data.

# Available Endpoints

-   [/train](#train)
-   [/predict](#predict)

## Train

Trains an h5 model stored on s3 for the given number of epochs, using labeled data from s3 as well, and returns some statistics about the training process

**URL:** /train?model_url=[path]&labeled_url=[path]&img_width=[int]&img_height=[int]&epochs=[int]  
**Method:** GET  
**Success Response:**

-   Condition: If all parameters are provided, and if model_url and labeled_url paths exist on s3
-   Code: `200 OK`
-   Content example:

```
http://localhost:5001/train?model_url=s3://orcagsoc/models/srkw_cnn_0.h5&labeled_url=s3://orcagsoc/labeled_test/&img_width=607&img_height=617&epochs=1

{
  "acc": [
    0.5159235596656799
  ],
  "cm": [
    9,
    11,
    10,
    23
  ],
  "labeled_files": 157,
  "loss": [
    1.031740427017212
  ],
  "model_acc": 0.6037735939025879,
  "model_loss": 0.8503243923187256,
  "model_url": "s3://orcagsoc/models/srkw_cnn_1.h5",
  "val_acc": [
    0.6037735939025879
  ],
  "val_loss": [
    0.8503243923187256
  ]
}
```

**Error Response:**

-   Condition: If parameters are missing, or if model_url or labeled_url paths do not exist
-   Code: `500 Server Error`
-   Content example:

```
http://localhost:5001/train?model_url=s3://orcagsoc/models/srkw_cnn_0.h5
KeyError: 'labeled_url'

OR

http://localhost:5001/train?model_url=s3://orcagsoc/models/no_model_0.h5&labeled_url=s3://orcagsoc/labeled_test/&img_width=607&img_height=617&epochs=1
OSError: SavedModel file does not exist at: no_model_0.h5/{saved_model.pbtxt|saved_model.pb}
```

## Predict

Returns the predicted value of all the unlabeled images located on an s3 bucket

**URL:** /predict?model_url=[path]&unlabeled_url=[path]&img_width=[int]&img_height=[int]&epochs=[int]  
**Method:** GET  
**Success Response:**

-   Condition: If all parameters are provided, and if model_url and unlabeled_url paths exist on s3
-   Code: `200 OK`
-   Content example:

```
http://localhost:5001/predict?model_url=s3://orcagsoc/models/srkw_cnn_0.h5&unlabeled_url=s3://orcagsoc/unlabeled_test/&img_width=607&img_height=617

[
  {
    "audio_url": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154118.mp3",
    "duration": 3,
    "location": "Haro Strait",
    "predicted_value": 0.007200658321380615,
    "timestamp": "Tue, 07 Jul 2020 15:35:18 GMT"
  },
  {
    "audio_url": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154121.mp3",
    "duration": 3,
    "location": "Haro Strait",
    "predicted_value": 0.007294178009033203,
    "timestamp": "Tue, 07 Jul 2020 15:35:21 GMT"
  },
  {
    "audio_url": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154124.mp3",
    "duration": 3,
    "location": "Haro Strait",
    "predicted_value": 0.00517234206199646,
    "timestamp": "Tue, 07 Jul 2020 15:35:24 GMT"
  },
  {
    "audio_url": "https://orcagsoc.s3.amazonaws.com/unlabeled_test/mp3/orcasoundlab_1594154130.mp3",
    "duration": 3,
    "location": "Haro Strait",
    "predicted_value": 0.03828537464141846,
    "timestamp": "Tue, 07 Jul 2020 15:35:30 GMT"
  },
  ...
]
```

**Error Response:**

-   Condition: If parameters are missing, or if model_url or unlabeled_url paths do not exist
-   Code: `500 Server Error`
-   Content example:

```
http://localhost:5001/predict?model_url=s3://orcagsoc/models/srkw_cnn_0.h5
KeyError: 'unlabeled_url'

OR

http://localhost:5001/predict?model_url=s3://orcagsoc/models/no_model_0.h5&unlabeled_url=s3://orcagsoc/unlabeled_test/&img_width=607&img_height=617
OSError: SavedModel file does not exist at: no_model_0.h5/{saved_model.pbtxt|saved_model.pb}
```

# Getting Started

### Quick Method

-   Make sure [Docker](https://www.docker.com/) is installed
-   Run:  
    `docker run --name activelearning_ml -d -p 5001:5001 -e AWS_ACCESS_KEY_ID=<access-key-id> -e AWS_SECRET_ACCESS_KEY=<secret-access-key> --rm jdiegors/activelearning_ml:latest`

### Flexible Method

-   Make sure [Python](https://www.python.org/) and [AWS CLI](https://aws.amazon.com/cli/) are installed
-   Configure AWS CLI by entering your access keys after `aws configure`
-   Clone the repo and `cd` into the project directory
-   Create a virtual environment: `python -m venv venv`
-   Activate the virtual environment: `source venv/bin/activate` or `venv\Scripts\activate` for windows
-   Install the dependencies: `pip install -r requirements.txt`
-   Run `flask run` to start a development server in [http://localhost:5001](http://localhost:5001)

### Deployment

Follow the quick start method on your server of choice.  
Otherwise, to push to a different docker container registry, create an account on https://hub.docker.com, login from the command line `docker login`, build the image with `docker build -t activelearning_ml .` from within the project directory, rename it to `docker tag activelearning_ml:latest <your-docker-registry-account>/activelearning_ml:latest`, push it to the Docker registry `docker push <your-docker-registry-account>/activelearning_ml:latest`. Now you can follow the quick start method.
