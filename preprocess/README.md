## Getting started

- Install [Python](https://www.python.org/), [ffmpeg](https://ffmpeg.org/) and [AWS CLI](https://aws.amazon.com/cli/)  
- Configure AWS CLI by entering your access key: `aws configure`
- Create venv: `python -m venv venv`  
- Activate venv: `source venv/bin/activate`  
- Install dependencies: `pip install -r requirements.txt`  
- Run script: `python preprocess_unlabeled.py [name of s3 folder]`
