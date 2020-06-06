'use strict'
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
window.isAndroid = /Android/.test(navigator.userAgent) && !window.MSStream

window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60)
        }
    )
})()

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
import '../sass/listen.scss'
import sp from './UI/spectrogram'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

const ready = (callback) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    const playPauseBtn = document.getElementById('play-pause')
    let audioIds = []
    let labels = []
    let currentId = 0

    window.parent.postMessage('ready', '*')
    sp.attached()
    sp.startRender()
    sp.loopChanged(true)

    const startSession = function () {
        // Get audio ids from backend with an Ajax call
        // TODO: Implement this!
        audioIds = ['1', '4', '6', '2', '3', '5']

        // Initialize evertything to zero
        currentId = 0
        document.getElementById('progress-label').textContent = '0/5'
        document.getElementById('progress').style.width = '0%'
        labels = []
    }
    startSession()

    // --------------------------------------------
    playPauseBtn.addEventListener('click', () => {
        sp.stop()
        if (playPauseBtn.classList.contains('playing')) {
            playPauseBtn.classList.remove('playing')
        } else {
            playPauseBtn.classList.add('playing')
            // Play audio **************************
            sp.play(
                `https://jd-r-bucket.s3.amazonaws.com/mp3/sound${audioIds[currentId]}.mp3`
            )
        }
    })

    const killSound = function () {
        sp.stop()
        playPauseBtn.classList.remove('playing')
    }

    window.addEventListener('blur', function () {
        killSound()
    })
    document.addEventListener('visibilitychange', function () {
        killSound()
    })

    // --------------------------------------------
    document.querySelectorAll('.label-btn').forEach((item) =>
        item.addEventListener('click', () => {
            let isOrca = false
            if (
                item.parentElement.parentElement.id === 'orca' ||
                item.parentElement.id === 'orca'
            ) {
                isOrca = true
            } else {
                isOrca = false
            }
            // Add the current label to the list
            labels.push({
                id: parseInt(audioIds[currentId]),
                orca: isOrca,
                extra_label: item.id,
            })

            // Load the next audio
            sp.stop()
            currentId += 1
            document.getElementById(
                'progress-label'
            ).textContent = `${currentId}/5`
            document.getElementById('progress').style.width = `${
                currentId * 20
            }%`
            playPauseBtn.classList.remove('playing')
            if (currentId === 5) {
                document.getElementById('blurred-background').style.display =
                    'block'
                document.getElementById('labeled-by-container').style.display =
                    'block'
            }
        })
    )

    // --------------------------------------------
    document.getElementById('submit-form').addEventListener('click', () => {
        const checked = document.querySelector('input[name=labeled-by]:checked')
        // Send the array to the server
        console.log({ labels: labels, expertise_level: checked.value }) // TODO: Implement this with Ajax

        // Start labeling again
        document.getElementById('blurred-background').style.display = 'none'
        document.getElementById('labeled-by-container').style.display = 'none'
        startSession()
    })

    // --------------------------------------------
    document.getElementById('back-btn').addEventListener('click', () => {
        // Send the labels to the server if there are any
        if (labels.length !== 0) {
            console.log({ labels: labels, expertise_level: '' })
        }
        window.location.href = '/' // Go to the home page
    })
})
