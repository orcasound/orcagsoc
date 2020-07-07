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

export const loadTrackSrc = function (
    context: AudioContext,
    src: string,
    callback: (buffer: AudioBuffer) => void,
    opt_progressCallback?: (percent: number) => void
) {
    const loadingEl = document.getElementById('loadingSound')
    var request = new XMLHttpRequest()
    request.open('GET', src, true)
    request.responseType = 'arraybuffer'

    // Decode asynchronously.
    request.onload = function () {
        loadingEl.style.display = 'none'
        context.decodeAudioData(
            request.response,
            function (buffer) {
                callback(buffer)
            },
            function (e) {
                console.error(e)
            }
        )
    }
    if (opt_progressCallback) {
        request.onprogress = function (e) {
            var percent = e.loaded / e.total
            opt_progressCallback(percent)
        }
    }

    request.send()
    loadingEl.style.display = 'block'
}

declare global {
    interface Window {
        isMobile: boolean
        isIOS: boolean
        isAndroid: boolean
        requestAnimFrame: (callback: () => {}) => void
        Apex: object
        blockMenuHeaderScroll: boolean
    }
}

window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
window.isAndroid = /Android/.test(navigator.userAgent) && !window.MSStream

window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback: () => {}) {
            window.setTimeout(callback, 1000 / 60)
        }
    )
})()
