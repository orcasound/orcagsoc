// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
import '../sass/listen.scss'
import '../media/empty.mp3'
import sp from './UI/spectrogram'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

interface IUncertainty {
    id: number
    audioUrl: string
    location: string
    duration: number
    timestamp: string
    confidence: number
    orca: boolean
}

const ready = (callback: () => void) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    const playPauseBtn = document.getElementById('play-pause')
    let uncertainties: IUncertainty[] = []
    let labels: object[] = []
    let unlabeled = new Set<number>()
    let currentSample = 0

    window.parent.postMessage('ready', '*')
    sp.attached()
    sp.startRender()
    sp.loopChanged(true)

    // --------------------------------------------
    const loadNextAudio = function () {
        document.getElementById(
            'progress-label'
        ).textContent = `${currentSample}/5`
        document.getElementById('progress').style.width = `${
            currentSample * 20
        }%`

        sp.stop()
        playPauseBtn.classList.remove('playing')

        if (currentSample === 5) {
            document.getElementById('blurred-background').style.display =
                'block'
            document.getElementById('labeled-by-container').style.display =
                'block'
            return
        }

        sp.load(uncertainties[currentSample].audioUrl)
        document.getElementById('timestamp').innerText =
            uncertainties[currentSample].timestamp
        document.getElementById(
            'duration'
        ).innerText = `${uncertainties[currentSample].duration} seconds`
        document.getElementById('predicted-orca').innerText = uncertainties[
            currentSample
        ].orca
            ? 'One orca detected'
            : 'No orcas detected'
        document.getElementById('confidence').innerText = `${uncertainties[
            currentSample
        ].confidence.toFixed(2)}% confidence`
        document.getElementById('location').innerText =
            uncertainties[currentSample].location
    }

    // --------------------------------------------
    const startSession = function () {
        // Get uncertainties from the backend using Fetch
        fetch(`${process.env.API_URL}/uncertainties`)
            .then((response) => response.json())
            .then((json) => {
                uncertainties = json
                console.log(uncertainties)
                unlabeled = new Set(uncertainties.map((value) => value.id))
                // Load first audio
                loadNextAudio()
            })
            .catch((error) => console.error('Fetch Error!', error))

        // Initialize evertything to zero
        currentSample = 0
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
    document.getElementById('view-details').addEventListener('click', () => {
        const detailsContainer = document.getElementById('details-container')
        const expandMoreIcon = document.getElementById('expand-more')
        const expandLessIcon = document.getElementById('expand-less')
        const viewDetailsText = document.getElementById('view-details-text')
        if (detailsContainer.style.maxHeight == '') {
            detailsContainer.style.maxHeight = '15rem'
            expandMoreIcon.style.display = 'none'
            expandLessIcon.style.display = 'block'
            viewDetailsText.textContent = 'Hide Details'
        } else {
            detailsContainer.style.maxHeight = ''
            expandMoreIcon.style.display = 'block'
            expandLessIcon.style.display = 'none'
            viewDetailsText.textContent = 'View Details'
        }
    })

    // --------------------------------------------
    const handleSelectedLabel = function (isOrca: boolean, extraLabel: string) {
        // Add the current label to the list
        labels.push({
            id: uncertainties[currentSample].id,
            audioUrl: uncertainties[currentSample].audioUrl,
            orca: isOrca,
            extraLabel: extraLabel ? extraLabel : '',
        })
        unlabeled.delete(uncertainties[currentSample].id)

        // Load the next audio
        currentSample += 1
        loadNextAudio()
    }

    const changeHoverToLabelBtn = function (el: Element, add: boolean) {
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
        let lastTouched = null as Element
        item.addEventListener('touchstart', () => {
            window.blockMenuHeaderScroll = true
            item.classList.add('hovered')
            const eb = item.querySelector('.expanded-box') as HTMLElement
            eb.style.display = 'flex'
        })
        item.addEventListener('touchmove', (e: TouchEvent) => {
            if (window.blockMenuHeaderScroll) {
                e.preventDefault()
            }
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
            const eb = item.querySelector('.expanded-box') as HTMLElement
            eb.style.display = 'none'
            item.classList.remove('hovered')
            lastTouched = null
        })
    })

    if (!window.isMobile) {
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
    document.getElementById('next').addEventListener('click', () => {
        currentSample += 1
        loadNextAudio()
    })

    // --------------------------------------------
    document.getElementById('submit-form').addEventListener('click', () => {
        // Send the labels and the expertise level to the server
        const checked = document.querySelector(
            'input[name=labeled-by]:checked'
        ) as HTMLInputElement
        const data = {
            labels: labels,
            expertiseLevel: checked.value,
            unlabeled: [...unlabeled],
        }

        fetch(`${process.env.API_URL}/labeledfiles`, {
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
        // Send the unlabeled files to the server before leaving the window
        const data = {
            labels: [] as any,
            expertiseLevel: '',
            unlabeled: [...unlabeled],
        }
        navigator.sendBeacon(
            `${process.env.API_URL}/labeledfiles`,
            JSON.stringify(data)
        )
    }
})
