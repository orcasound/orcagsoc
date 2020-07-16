## Preprocess unlabeled data

preprocess_unlabeled.py is a python script that generates mp3 files and spectrograms, given a directory containing ts files.

To run the script:

-   Install [Python](https://www.python.org/) and [ffmpeg](https://ffmpeg.org/)
-   Create venv: `python -m venv venv`
-   Activate venv: `source venv/bin/activate`
-   Install dependencies: `pip install -r requirements.txt`
-   Run script with test data: `python preprocess_unlabeled.py testdata`

The script then generates an `unlabeled` directory with two subdirectories: `mp3` containing the mp3 files, and `spectrograms` containing the spectrograms of the mp3 files.  
A testdata folder containing ts files has been provided to test the script.  
But the objective is to download the ts files from an s3 bucket. For that you would need to install [AWS CLI](https://aws.amazon.com/cli/) and configure it by entering your access keys after the following command `aws configure`. Then you can run `aws s3 [remote s3 directory] [local destination]`, e.g. `sync s3://streaming-orcasound-net/rpi_orcasound_lab/hls/1542432734/ ts`
