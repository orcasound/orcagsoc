## Preprocess unlabeled data

preprocess_unlabeled.py is a python script that generates mp3 files and spectrograms, given a directory containing ts files.

To run the script:

-   Install [Python](https://www.python.org/) and [ffmpeg](https://ffmpeg.org/)
-   Create venv: `python -m venv venv`
-   Activate venv: `source venv/bin/activate` or `venv\Scripts\Activate.ps1` if you're using PS in windows
-   Install dependencies: `pip install -r requirements.txt`
-   Run script: `python preprocess_unlabeled.py [input_dir] [output_dir] [duration (default=3)]`

For example, to run the script with test data:
Run `python preprocess_unlabeled.py testdata unlabeled_test` and the script would generate an `unlabeled_test` directory with two subdirectories: `mp3` containing the mp3 files, and `spectrograms` containing the spectrograms of the mp3 files.  
A testdata folder containing ts files has been provided to test the script.  
But the objective is to download the ts files from an s3 bucket. For that you would need to install [AWS CLI](https://aws.amazon.com/cli/) and configure it by entering your access keys after the following command `aws configure`. Then you can run `aws s3 sync [remote s3 directory] [local directory]`, e.g. `aws s3 sync s3://streaming-orcasound-net/rpi_orcasound_lab/hls/1594150218/ ts`  
The preprocessed unlabeled files can then be uploaded to s3 by running `aws s3 sync [local directory] [remote s3 directory]`, e.g. `aws s3 sync unlabeled s3://orcagsoc/unlabeled/`
