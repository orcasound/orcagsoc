from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import subprocess


def get_predictions_on_unlabeled():
    model_path = 'srkw_cnn.h5'

    # Download data from s3 to `unlabeled` directory
    s3_unlabeled_path = 's3://orcagsoc/unlabeled_test/spectrograms/'
    subprocess.run(['aws', 's3', 'sync', s3_unlabeled_path, 'unlabeled_test'])

    model = load_model(model_path)

    img_width, img_height = 607, 617

    image_generator = ImageDataGenerator()
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

    clean_filenames = [
        file.split('\\')[1].split('_')[0] for file in data_generator.filenames
    ]

    return predictions, clean_filenames, model_path.split('.')[0]


if __name__ == '__main__':
    print(get_predictions_on_unlabeled())