from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint, TensorBoard
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
import os
import subprocess
from sklearn.metrics import confusion_matrix
from time import time


def train(s3_model_path, s3_labeled_path, img_width, img_height, epochs):
    local_labeled_path = s3_labeled_path.split('/')[-2]

    local_model_path = os.path.basename(s3_model_path)
    model_version = local_model_path.split('_')[-1].split('.')[0]
    new_model_version = str(int(model_version) + 1)
    new_model_name = '_'.join(
        local_model_path.split('_')[:-1] + [new_model_version])
    new_model_name = f'{new_model_name}.h5'
    if not os.path.isfile(local_model_path):
        subprocess.run(['aws', 's3', 'cp', s3_model_path, '.'])

    model = load_model(local_model_path)
    # Download data from s3 to `labeled` directory
    subprocess.run(['aws', 's3', 'sync', s3_labeled_path, local_labeled_path])

    train_data_path = os.path.join(local_labeled_path, 'train')
    validation_data_path = os.path.join(local_labeled_path, 'validation')

    # Change the batchsize according to your system RAM
    batch_size = 32

    # Train the Detection model
    checkpoint = ModelCheckpoint(filepath=new_model_name,
                                 monitor='val_loss',
                                 verbose=0,
                                 save_best_only=True)

    reduce_lr = ReduceLROnPlateau(monitor='val_loss',
                                  factor=0.1,
                                  patience=100,
                                  min_lr=1e-8)

    # tensorboard = TensorBoard(log_dir='log_dir',
    #                           histogram_freq=1,
    #                           embeddings_freq=1)

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
                        callbacks=[checkpoint, reduce_lr])

    # Loss and Accuracy curves.
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']

    # Confusion Matrix
    predictions = model.predict(validation_generator)

    predictions[predictions <= 0.5] = 0
    predictions[predictions > 0.5] = 1

    true_classes = validation_generator.classes

    cm = confusion_matrix(true_classes, predictions).ravel().tolist()

    # Load best model
    model = load_model(new_model_name)
    model_loss, model_acc = model.evaluate(validation_generator)

    new_s3_model_path = f'{os.path.dirname(s3_model_path)}/{new_model_name}'
    subprocess.run(['aws', 's3', 'cp', new_model_name, new_s3_model_path])

    return acc, val_acc, loss, val_loss, cm, train_generator.n, model_acc, model_loss, new_s3_model_path
