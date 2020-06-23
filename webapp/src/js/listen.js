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
import '../media/empty.mp3'
import sp from './UI/spectrogram'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

const API_URL = process.env.API_URL || 'http://localhost:5000'

const ready = (callback) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    const playPauseBtn = document.getElementById('play-pause')
    let filenames = []
    let labels = []
    let currentFile = 0

    window.parent.postMessage('ready', '*')
    sp.attached()
    sp.startRender()
    sp.loopChanged(true)

    const startSession = function () {
        // Get audio filenames from the backend using Fetch
        fetch(`${API_URL}/filenames`)
            .then((response) => response.json())
            .then((json) => {
                filenames = json
                console.log('filenames:', filenames)
                // Load first audio
                sp.load(`https://jd-r-bucket.s3.amazonaws.com/${filenames[0]}`)
            })
            .catch((error) => console.error('Fetch Error!', error))

        // Initialize evertything to zero
        currentFile = 0
        document.getElementById('progress-label').textContent = '0/5'
        document.getElementById('progress').style.width = '0%'
        labels = []
    }
    startSession()

    // --------------------------------------------
    playPauseBtn.addEventListener('click', () => {
        if (playPauseBtn.classList.contains('playing')) {
            playPauseBtn.classList.remove('playing')
            sp.stop()
        } else {
            playPauseBtn.classList.add('playing')
            // Play audio **************************
            sp.play()
        }
    })

    const killSound = function () {
        playPauseBtn.classList.remove('playing')
        sp.stop()
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
            filename: filenames[currentFile],
            orca: isOrca,
            extraLabel: extraLabel ? extraLabel : '',
        })

        // Load the next audio
        sp.stop()
        currentFile += 1
        document.getElementById(
            'progress-label'
        ).textContent = `${currentFile}/5`
        document.getElementById('progress').style.width = `${currentFile * 20}%`
        playPauseBtn.classList.remove('playing')
        if (currentFile === 5) {
            document.getElementById('blurred-background').style.display =
                'block'
            document.getElementById('labeled-by-container').style.display =
                'block'
            return
        }
        sp.load(
            `https://jd-r-bucket.s3.amazonaws.com/${filenames[currentFile]}`
        )
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
    document.getElementById('submit-form').addEventListener('click', () => {
        // Send the labels and the expertise level to the server
        const checked = document.querySelector('input[name=labeled-by]:checked')
        const data = {
            labels: labels,
            expertiseLevel: checked.value,
        }

        fetch(`${API_URL}/labeledfiles`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }).catch((error) => console.error('Fetch Error!', error))

        // Start labeling again
        document.getElementById('blurred-background').style.display = 'none'
        document.getElementById('labeled-by-container').style.display = 'none'
        startSession()
    })

    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = '.' // Go to the home page
    })

    // --------------------------------------------
    window.onunload = () => {
        // Before leaving the window
        // Send the labels to the server if there are any
        if (labels.length !== 0) {
            const checked = document.querySelector(
                'input[name=labeled-by]:checked'
            )
            const data = {
                labels: labels,
                expertiseLevel: checked.value,
            }
            navigator.sendBeacon(
                `${API_URL}/labeledfiles`,
                JSON.stringify(data)
            )
        }
    }
})
