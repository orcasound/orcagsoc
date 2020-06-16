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
        // Get audio ids from backend using Fetch
        fetch('http://localhost:5000/')
            .then((response) => response.json())
            .then((json) => {
                audioIds = json
                console.log('audioIds:', audioIds)
            })
            .catch((error) => console.error('Fetch Error!', error))

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
    const handleSelectedLabel = function (isOrca, extraLabel) {
        // Add the current label to the list
        labels.push({
            id: parseInt(audioIds[currentId]),
            orca: isOrca,
            extra_label: extraLabel ? extraLabel : '',
        })

        // Load the next audio
        sp.stop()
        currentId += 1
        document.getElementById('progress-label').textContent = `${currentId}/5`
        document.getElementById('progress').style.width = `${currentId * 20}%`
        playPauseBtn.classList.remove('playing')
        if (currentId === 5) {
            document.getElementById('blurred-background').style.display =
                'block'
            document.getElementById('labeled-by-container').style.display =
                'block'
        }
    }

    const changeHoverToLabelBtn = function (el, add) {
        if (!el) return
        const label = el.querySelector('label')
        if (label) {
            add
                ? el.classList.add('button-hovered')
                : el.classList.remove('button-hovered')
            label.style.visibility = add ? 'visible' : 'hidden'
        }
    }

    document.querySelectorAll('.expandable').forEach((item) => {
        let lastTouched = ''
        item.addEventListener('touchstart', () => {
            item.classList.add('hovered')
            item.querySelector('.expanded-box').style.display = 'flex'
        })
        item.addEventListener('touchmove', (e) => {
            let xPos = e.touches[0].pageX
            let yPos = e.touches[0].pageY
            const hoveredEl = document.elementFromPoint(xPos, yPos)
            if (hoveredEl.classList.contains('label-btn')) {
                if (lastTouched !== hoveredEl) {
                    changeHoverToLabelBtn(lastTouched, false) // false = remove
                    changeHoverToLabelBtn(hoveredEl, true) // true = add
                    lastTouched = hoveredEl
                }
            }
        })
        item.addEventListener('touchend', () => {
            changeHoverToLabelBtn(lastTouched, false)
            let isOrca = false
            if (item.id === 'orca') {
                isOrca = true
            }
            handleSelectedLabel(isOrca, lastTouched.id)
            item.querySelector('.expanded-box').style.display = 'none'
            item.classList.remove('hovered')
            lastTouched = ''
        })
    })

    const supportsTouch = 'ontouchstart' in window
    if (!supportsTouch) {
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
                handleSelectedLabel(isOrca, item.id)
            })
        )
    }

    // --------------------------------------------
    const sendLabels = async function (data) {
        await fetch('http://localhost:5000', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    document.getElementById('submit-form').addEventListener('click', () => {
        const checked = document.querySelector('input[name=labeled-by]:checked')
        // Send the labels and the expertise level to the server
        sendLabels({
            labels: labels,
            expertise_level: checked.value,
        }).catch((error) => console.error('Fetch Error!', error))

        // Start labeling again
        document.getElementById('blurred-background').style.display = 'none'
        document.getElementById('labeled-by-container').style.display = 'none'
        startSession()
    })

    document.getElementById('back-btn').addEventListener('click', () => {
        // Send the labels to the server if there are any
        if (labels.length !== 0) {
            sendLabels({ labels: labels, expertise_level: '' })
                .then(() => (window.location.href = '/')) // Go to the home page
                .catch((error) => console.error('Fetch Error!', error))
        } else {
            window.location.href = '/'
        }
    })
})
