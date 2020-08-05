from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import subprocess
from datetime import datetime


def get_predictions_on_unlabeled():
    model_path = 'srkw_cnn.h5'
    parse_location = {'orcasoundlab': 'Haro Strait'}

    # Download data from s3 to `unlabeled` directory
    s3_unlabeled_path = 's3://orcagsoc/unlabeled_test/spectrograms/'
    subprocess.run(
        ['aws', 's3', 'sync', s3_unlabeled_path, 'unlabeled_test', '--delete'])

    model = load_model(model_path)

    img_width, img_height = 607, 617

    image_generator = ImageDataGenerator(rescale=1. / 255)
    data_generator = image_generator.flow_from_directory(
        '.',
        # only read images from `unlabeled` directory
        classes=['unlabeled_test'],
        # don't generate labels
        class_mode=None,
        # don't shuffle
        shuffle=False,
        # use same size as in training
        target_size=(img_width, img_height),
        batch_size=64)

    predictions = model.predict(data_generator).tolist()

    s3_url = 'https://orcagsoc.s3.amazonaws.com/unlabeled_test'
    predictions_list = []
    for i in range(len(predictions)):
        cur_prediction = {}
        cur_prediction['predicted_value'] = predictions[i][0]
        cur_file = (data_generator.filenames[i].split('/')[1]).split('.')[0]
        cur_prediction['audio_url'] = f'{s3_url}/mp3/{cur_file}.mp3'
        location, timestamp = cur_file.split('_')
        cur_prediction['location'] = parse_location[location]
        cur_prediction['timestamp'] = datetime.fromtimestamp(int(timestamp))
        predictions_list.append(cur_prediction)

    return predictions_list, s3_unlabeled_path


if __name__ == '__main__':
    print(get_predictions_on_unlabeled())