/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/

'use strict'
import '../sass/screen.scss'
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
import spec3D from './UI/spectrogram'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

const ready = (callback) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    window.parent.postMessage('ready', '*')

    const sp = spec3D
    sp.attached()
    const playpause = document.querySelector('#play-pause')

    // --------------------------------------------
    playpause.addEventListener('click', () => {
        sp.startRender()

        sp.stop()
        sp.drawingMode = false

        if (playpause.classList.contains('playing')) {
            playpause.classList.remove('playing')
        } else {
            playpause.classList.add('playing')
            // Play audio **************************
            sp.loopChanged(true)
            sp.play(playpause.getAttribute('data-src'))
        }
    })

    const killSound = function () {
        sp.startRender()
        sp.stop()
        playpause.classList.remove('playing')
    }

    window.addEventListener('blur', function () {
        killSound()
    })
    document.addEventListener('visibilitychange', function () {
        killSound()
    })
})
