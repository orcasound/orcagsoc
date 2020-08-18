import librosa
import matplotlib.pyplot as plt
from skimage.restoration import denoise_wavelet
import os


def apply_per_channel_energy_norm(spectrogram):
    """Apply PCEN.

    This function normalizes a time-frequency representation S by
    performing automatic gain control, followed by nonlinear compression:

    P[f, t] = (S / (eps + M[f, t])**gain + bias)**power - bias**power
    PCEN is a computationally efficient frontend for robust detection
    and classification of acoustic events in heterogeneous environments.

    This can be used to perform automatic gain control on signals that
    cross or span multiple frequency bans, which may be desirable
    for spectrograms with high frequency resolution.

    Args:
        spectrograms: The data from the audio file used to create spectrograms.
        sampling_rate: The sampling rate of the audio files.

    Returns:
        PCEN applied spectrogram data.
    """

    pcen_spectrogram = librosa.core.pcen(spectrogram)
    return pcen_spectrogram


def wavelet_denoising(spectrogram):
    """In this step we would apply Wavelet-denoising.

    Wavelet denoising is an effective method for SNR improvement
    in environments with wide range of noise types competing for the
    same subspace.

    Wavelet denoising relies on the wavelet representation of
    the image. Gaussian noise tends to be represented by small values in the
    wavelet domain and can be removed by setting coefficients below
    a given threshold to zero (hard thresholding) or
    shrinking all coefficients toward zero by a given
    amount (soft thresholding).

    Args:
        data:Spectrogram data in the form of numpy array.

    Returns:
        Denoised spectrogram data in the form of numpy array.
    """
    im_bayes = denoise_wavelet(spectrogram,
                               multichannel=False,
                               convert2ycbcr=False,
                               method="BayesShrink",
                               mode="soft")
    return im_bayes


def spec_plot_and_save(denoised_data, f_name, output_dir):
    """Generate the spectrogram and save them.

    Args:
        denoised_data: The spectrogram data that is generated either by
        PCEN or Wavelet-denoising.
        f_name: The name of the output file.
        output_dir: The path to the output directory.

    Returns:
        none.
    """
    fig, ax = plt.subplots()
    i = 0
    ax.imshow(denoised_data)
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)
    fig.set_size_inches(10, 10)
    # os.chdir(plotPath)
    fig.savefig(os.path.join(output_dir, f"{f_name[:-4]}.png"),
                dpi=80,
                bbox_inches="tight",
                quality=95,
                pad_inches=0.0)
    fig.canvas.draw()
    fig.canvas.flush_events()
    i += 1
    plt.close(fig)


def select_spec_case(plot_path, folder_path, pcen=False, wavelet=False):
    """Selects the preprocessing steps to be applied to the spectrogram.

    Depending upon the choices entered by the user this function would
    select the necessary preprocessing stages and call their respective
    functions.

    Args:
        plot_path: The output path where we want to plot the spectrograms.
        folder: The input_path which contains the audio that would
            be used to generate spectrograms.
        pcen: Could be set to True if we want to apply PCEN to spectrograms.
        wavelet:Could be set to true if we want to apply Wavelet denoising
            to the spectrograms.

    Returns:
        None.
    """
    onlyfiles = [
        f for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f))
    ]
    for id, file in enumerate(onlyfiles):
        fpath = os.path.join(folder_path, file)
        data, sr = librosa.core.load(fpath, res_type="kaiser_best")
        f_name = os.path.basename(file)

        spectrogram_data = librosa.feature.melspectrogram(data, sr=sr, power=1)
        if pcen and not wavelet:
            pcen_spec = apply_per_channel_energy_norm(spectrogram_data)
        elif pcen and wavelet:
            pcen_spec = apply_per_channel_energy_norm(spectrogram_data)
            spectrogram_data = wavelet_denoising(pcen_spec)
        spec_plot_and_save(spectrogram_data, f_name, plot_path)