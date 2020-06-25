# AL&L of Orca Sounds' API

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**This API** serves as an interface between the machine learning model(s) and the webapp.

# Docs

## Database models

**labeled_file** table:  
<img src="assets/labeled_file_table.jpg" width="220">  
Label for an audio file made by a human annotator. All the labeled files then conform the labeled dataset used by the ML model.

## Endpoints

The service is running on https://orcagsoc.herokuapp.com

### Get Filenames

| URL        | Method | Description                                                                      |
| ---------- | ------ | -------------------------------------------------------------------------------- |
| /filenames | GET    | Get the names of the next 5 audio files, where the ML model had most uncertainty |

### Add Labeled Files

| URL          | Method | Description                           |
| ------------ | ------ | ------------------------------------- |
| /labeledfile | POST   | Add new labeled files to the database |

### Get Statistics

| URL         | Method | Description                                                                                                                                |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| /statistics | GET    | Get confusion matrix and list of accuracies of last training round of the ML model, as well as the total number of labeled files over time |

# Getting Started

-   Install [pipenv](https://pypi.org/project/pipenv/)
-   Run `pipenv shell` to start a virtual environment
-   Run `pipenv install` to install the required dependencies
-   You also need a local sqlite database, so use the `flask db upgrade` command to create one
-   `flask run` starts a development server in http://localhost:5000
-   If you plan to contribute, please configure your text editor / IDE to use Flake8 to lint and YAPF to format Python code

### Testing

-   Run `python -m pytest -v`

### Deployment

-   Once the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed, login to your Heroku account with `heroku login`
-   Then add a remote to your local repository with the `heroku git:remote -a orcagsoc` command
-   To deploy the app use the `git push heroku master` command from your local repository's master branch
