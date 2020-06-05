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
import '../sass/screen.scss'
import sp from './UI/spectrogram'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
const playPauseBtn = document.querySelector('#play-pause')
const labelBtn = document.querySelectorAll('.label-btn')
const progressBar = document.querySelector('#progress')
const progressBarLabel = document.querySelector('#progress-label')
const labels = []
const audioIds = ['1', '4', '6', '2', '3', '5']
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

const ready = (callback) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    window.parent.postMessage('ready', '*')
    sp.attached()
    sp.startRender()
    sp.loopChanged(true)

    // Get audio ids from backend with an Ajax call
    let currentId = 0
    progressBarLabel.textContent = '0/5'
    progressBar.style.width = '0%'

    // --------------------------------------------
    labelBtn.forEach((item) =>
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
            progressBarLabel.textContent = `${currentId}/5`
            progressBar.style.width = `${currentId * 20}%`
            playPauseBtn.classList.remove('playing')
            if (currentId === 5) {
                console.log(labels)
            }
        })
    )

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
})
