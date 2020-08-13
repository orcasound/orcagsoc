# AL&L of Orca Sounds' ML Endpoint

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**The ML Endpoint** consists of two functions: the train function trains an h5 model stored on s3 using labeled data from s3 as well, and returns some statistics about the training process; the predict function returns the predicted value of all the unlabeled images located on an s3 bucket.

# Getting Started

-   Make sure [Python](https://www.python.org/) and [AWS CLI](https://aws.amazon.com/cli/) are installed
-   Clone the repo and `cd` into the project directory
-   Create a virtual environment: `python -m venv venv`
-   Activate the virtual environment: `source venv/bin/activate` or `venv\Scripts\activate` for windows
-   Install the dependencies: `pip install -r requirements.txt`
-   Create a `.env` file with the following parameters:
    -   S3_MODEL_PATH=s3://orcagsoc/models/srkw_cnn.h5
    -   S3_LABELED_PATH=s3://orcagsoc/labeled_test/
    -   S3_UNLABELED_PATH=s3://orcagsoc/unlabeled_test/
    -   IMG_WIDTH=607
    -   IMG_HEIGHT=617
    -   EPOCHS=1
    -   AWS_ACCESS_KEY_ID=[access key]
    -   AWS_SECRET_ACCESS_KEY=[password]
-   Run `flask run` to start a development server in [http://localhost:5001](http://localhost:5001)

### Deployment

A

-   `npm run build` builds the production code to the `dist` folder
-   Then use the `npm run deploy` command to publish the dist folder to the gh-pages branch on GitHub
