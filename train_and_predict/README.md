# AL&L of Orca Sounds' ML Endpoint

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**The ML Endpoint** is a small flask app that given an h5 file, a labeled dataset and an unlabeled dataset, trains an ML model on the labeled data and predicts on the unlabeled data.

# Available Endpoints

All the paramaters are taken from a `.env` file.

### Train

| URL                                   | Method | Description                                                                                                                                                |
| ------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [/train](http://localhost:5001/train) | GET    | Trains an h5 model stored on s3 for the given number of epochs, using labeled data from s3 as well, and returns some statistics about the training process |

### Predict

| URL                                       | Method | Description                                                                     |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| [/predict](http://localhost:5001/predict) | GET    | Returns the predicted value of all the unlabeled images located on an s3 bucket |

# Getting Started

### Quick Method

-   Make sure [Docker](https://www.docker.com/) is installed
-   Run the following command with your AWS access keys:  
    `docker run --rm --name activelearning_ml -d -p 5001:5001 -e S3_MODEL_PATH=s3://orcagsoc/models/srkw_cnn.h5 -e S3_LABELED_PATH=s3://orcagsoc/labeled_test/ -e S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/ -e IMG_WIDTH=607 -e IMG_HEIGHT=617 -e EPOCHS=1 -e AWS_ACCESS_KEY_ID=[access key] -e AWS_SECRET_ACCESS_KEY=[secret access key] jdiegors/activelearning_ml:latest`

### Flexible Method

-   Make sure [Python](https://www.python.org/) and [AWS CLI](https://aws.amazon.com/cli/) are installed
-   Clone the repo and `cd` into the project directory
-   Create a virtual environment: `python -m venv venv`
-   Activate the virtual environment: `source venv/bin/activate` or `venv\Scripts\activate` for windows
-   Install the dependencies: `pip install -r requirements.txt`
-   Create a `.env` file with the following parameters:

    ```
    S3_MODEL_PATH=s3://orcagsoc/models/srkw_cnn.h5
    S3_LABELED_PATH=s3://orcagsoc/labeled_test/
    S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/
    IMG_WIDTH=607
    IMG_HEIGHT=617
    EPOCHS=1
    AWS_ACCESS_KEY_ID=[access key]
    AWS_SECRET_ACCESS_KEY=[secret access key]
    ```

-   Run `flask run` to start a development server in [http://localhost:5001](http://localhost:5001)

### Deployment

Follow the quick start method on your server of choice.  
Otherwise, to push to a different docker container registry, create an account on https://hub.docker.com, login from the command line `docker login`, build the image with `docker build -t activelearning_ml .` from within the project directory, rename it to `docker tag activelearning_ml:latest <your-docker-registry-account>/activelearning_ml:latest`, push it to the Docker registry `docker push <your-docker-registry-account>/activelearning_ml:latest`.. Now you can follow the quick start method.
