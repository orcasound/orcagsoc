"""Preprocess unlabeled data from s3 bucket.

This module takes a directory containing ts audiofiles from an s3 bucket,
generates mp3 files of a specified duration. Then for each audio, its mel spectrogram is computed,
and per-channel energy normalization and wavelet denoising are applied to the spectrograms.

Example:
    $ python preprocess_unlabeled.py 1542432734

"""

import os
import argparse
import subprocess
import librosa
from util import select_spec_case
from shutil import rmtree


def main(folder_name, trimmed_dur):
    # Get ts files from s3
    # subprocess.run([
    #     'aws', 's3', 'sync',
    #     's3://streaming-orcasound-net/rpi_orcasound_lab/hls/%s/' % folder_name,
    #     'temp'
    # ])

    # Write a file with the name of the ts files for ffmpeg
    ts_files = [
        f for f in os.listdir('temp')
        if os.path.isfile(os.path.join('temp', f))
    ]
    with open('temp/mylist.txt', 'w') as output:
        for f in ts_files:
            output.write("file %s \n" % f)

    # Concatenate them into a single file
    subprocess.run([
        'ffmpeg', '-f', 'concat', '-safe', '0', '-i', 'temp/mylist.txt', '-c',
        'copy', 'temp/all.ts'
    ])

    # Convert concatenated ts file to mp3
    subprocess.run([
        'ffmpeg', '-i', 'temp/all.ts', '-c:v', 'libx264', '-c:a', 'copy',
        '-bsf:a', 'aac_adtstoasc', 'temp/output.mp4'
    ])
    subprocess.run(['ffmpeg', '-i', 'temp/output.mp4', 'temp/output.mp3'])

    # Trim audio file to multiple files of duration timmed_dir
    # Store audios in directory unlabeled/[folder_name]_mp3
    audios_dir = 'unlabeled/%s_mp3' % folder_name
    input_dur = int(librosa.get_duration(filename='temp/output.mp3'))

    if not os.path.exists(audios_dir):
        os.makedirs(audios_dir)

    file_num = 0
    for start_time in range(0, input_dur, trimmed_dur):
        subprocess.run([
            'ffmpeg', '-ss',
            '%d' % start_time, '-t',
            '%d' % trimmed_dur, '-i', 'temp/output.mp3',
            '%s/%03d.mp3' % (audios_dir, file_num)
        ])
        file_num += 1

    # Generate spectrograms from audio files
    # Store spectrogram in directory unlabeled/[folder_name]_spectrograms
    specs_dir = 'unlabeled/%s_spectrograms' % folder_name
    if not os.path.exists(specs_dir):
        os.makedirs(specs_dir)

    select_spec_case(plot_path=specs_dir,
                     folder_path=audios_dir,
                     pcen=True,
                     wavelet=True)

    # Delete temporary directory
    rmtree('temp')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)

    parser.add_argument(
        's3_dir',
        help=
        'Name of the directory inside an s3 bucket containing audios in transport stream (ts) format'
    )
    parser.add_argument(
        '--duration',
        default=3,
        type=int,
        help=
        'Duration in seconds of the output mp3 files (default: %(default)s)')

    args = parser.parse_args()

    main(args.s3_dir, args.duration)