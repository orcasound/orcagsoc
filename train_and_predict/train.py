from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
import os
import subprocess
from sklearn.metrics import confusion_matrix


def train():
    model_path = 'srkw_cnn.h5'
    model = load_model(model_path)

    # Download data from s3 to `labeled` directory
    s3_labeled_path = 's3://orcagsoc/labeled_test/'
    subprocess.run(['aws', 's3', 'sync', s3_labeled_path, 'labeled_test'])

    img_width, img_height = 607, 617
    epochs = 5

    train_data_path = 'labeled_test//train'
    validation_data_path = 'labeled_test//validation'

    # Change the batchsize according to your system RAM
    batch_size = 64

    # Train the Detection model
    reduce_lr = ReduceLROnPlateau(monitor='val_loss',
                                  factor=0.1,
                                  patience=100,
                                  min_lr=1e-8)

    train_datagen = ImageDataGenerator(rescale=1. / 255,
                                       shear_range=0.2,
                                       zoom_range=0.2)

    # only rescaling
    test_datagen = ImageDataGenerator(rescale=1. / 255)

    train_generator = train_datagen.flow_from_directory(
        train_data_path,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='binary',
        shuffle=True)

    validation_generator = test_datagen.flow_from_directory(
        validation_data_path,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='binary',
        shuffle=False)

    history = model.fit(train_generator,
                        epochs=epochs,
                        validation_data=validation_generator,
                        callbacks=[reduce_lr])

    model.save('srkw_cnn.h5')

    # Accuracy curves.
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    acc = val_acc = 0

    # Confusion Matrix
    predictions = model.predict(validation_generator)

    predictions[predictions <= 0.5] = 0
    predictions[predictions > 0.5] = 1

    true_classes = validation_generator.classes

    cm = confusion_matrix(true_classes, predictions).tolist()

    return acc, val_acc, cm


if __name__ == '__main__':
    print(train())