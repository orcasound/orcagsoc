# AL&L of Orca Sounds' API

This API serves as an interface between the machine learning model(s) and the webapp.

## AL&L of Orca Sounds

Active Listening and Learning of Orca Sounds is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

## Getting Started

-   Install [pipenv](https://pypi.org/project/pipenv/)
-   Run `pipenv shell`to start a virtual environment
-   Run `pipenv install` to install the required dependencies
-   You also need a local sqlite database, so run `flask shell` then `db.create_all()` inside the python shell, and finally `exit()`
-   Run `flask run` to start a development server in http://localhost:5000
-   If you plan to contribute, please configure your text editor / IDE to use Flake8 to lint and YAPF to format Python code

### Testing

-   Run `python -m pytest -v`
