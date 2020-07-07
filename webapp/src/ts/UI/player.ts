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

import { loadTrackSrc } from '../util/util'

class Player {
    context: AudioContext
    mix: GainNode
    filterGain: GainNode
    analyser: AnalyserNode
    buffer: AudioBuffer
    input: MediaStreamAudioSourceNode
    source: AudioBufferSourceNode
    loop: boolean
    osc: OscillatorNode
    stream: MediaStream
    playTimer: ReturnType<typeof setTimeout>
    bandpass: BiquadFilterNode
    constructor() {
        // Create an audio graph.
        window.AudioContext = window.AudioContext
        var context = new AudioContext()
        var analyser = context.createAnalyser()
        //analyser.fftSize = 2048 * 2 * 2
        // analyser.fftSize = (window.isMobile)? 2048 : 8192;
        analyser.fftSize = window.isMobile ? 1024 : 2048
        analyser.smoothingTimeConstant = 0
        // Create a mix.
        var mix = context.createGain()
        // Create a bandpass filter.
        var bandpass = context.createBiquadFilter()
        bandpass.Q.value = 10
        bandpass.type = 'bandpass'
        var filterGain = context.createGain()
        filterGain.gain.value = 1
        // Connect audio processing graph
        mix.connect(analyser)
        analyser.connect(filterGain)
        filterGain.connect(context.destination)
        this.context = context
        this.mix = mix
        // this.bandpass = bandpass;
        this.filterGain = filterGain
        this.analyser = analyser
        this.buffer = null

        loadTrackSrc(
            this.context,
            'empty.mp3',
            function (buffer: AudioBuffer) {
                var source = this.createSource_(buffer, true)
                source.loop = true
                source.start(0)
            }.bind(this)
        )

        // this.startedAt = 0
        // this.pausedAt = 0
    }
    loadSrc(src: string) {
        // Stop all of the mic stuff.
        this.filterGain.gain.value = 1
        if (this.input) {
            this.input.disconnect()
            this.input = null
            return
        }
        loadTrackSrc(
            this.context,
            src,
            function (buffer: AudioBuffer) {
                this.buffer = buffer
            }.bind(this)
        )
    }
    // playUserAudio(src) {
    //     // Stop all of the mic stuff.
    //     this.filterGain.gain.value = 1
    //     if (this.input) {
    //         this.input.disconnect()
    //         this.input = null
    //         return
    //     }
    //     this.buffers['user'] = src.buffer
    //     this.playHelper_('user')
    // }
    play() {
        // const offset = this.pausedAt
        this.source = this.createSource_(this.buffer, true)
        this.source.start(0)
        // this.source.start(0, offset)
        // this.startedAt = this.context.currentTime - offset
        // this.pausedAt = 0
        if (!this.loop) {
            this.playTimer = setTimeout(
                function () {
                    this.stop()
                }.bind(this),
                this.buffer.duration * 2000
            )
        }
    }
    // pause() {
    //     const elapsed = this.context.currentTime - this.startedAt
    //     this.stop()
    //     this.pausedAt = elapsed
    //     this.paused = true
    // }
    live() {
        // The AudioContext may be in a suspended state prior to the page receiving a user
        // gesture. If it is, resume it.
        if (this.context.state === 'suspended') {
            this.context.resume()
        }
        if (window.isIOS) {
            window.parent.postMessage('error2', '*')
            console.log('cant use mic on ios')
        } else {
            if (this.input) {
                this.input.disconnect()
                this.input = null
                return
            }
            var self = this
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(function (stream) {
                    self.onStream_(stream)
                })
                .catch(function () {
                    self.onStreamError_()
                })
            this.filterGain.gain.value = 0
        }
    }
    onStream_(stream: MediaStream) {
        var input = this.context.createMediaStreamSource(stream)
        input.connect(this.mix)
        this.input = input
        this.stream = stream
    }
    onStreamError_() {
        // TODO: Error handling.
    }
    setLoop(loop: boolean) {
        this.loop = loop
    }
    createSource_(buffer: AudioBuffer, loop: boolean) {
        var source = this.context.createBufferSource()
        source.buffer = buffer
        source.loop = loop
        source.connect(this.mix)
        return source
    }
    setMicrophoneInput() {
        // TODO: Implement me!
    }
    stop() {
        if (this.source) {
            this.source.stop(0)
            this.source = null
            clearTimeout(this.playTimer)
            this.playTimer = null
        }
        if (this.input) {
            this.input.disconnect()
            this.input = null
            return
        }
        // this.pausedAt = 0
        // this.startedAt = 0
    }
    getAnalyserNode() {
        return this.analyser
    }
    setBandpassFrequency(freq: number) {
        if (freq == null) {
            console.log('Removing bandpass filter')
            // Remove the effect of the bandpass filter completely, connecting the mix to the analyser directly.
            this.mix.disconnect()
            this.mix.connect(this.analyser)
        } else {
            // console.log('Setting bandpass frequency to %d Hz', freq);
            // Only set the frequency if it's specified, otherwise use the old one.
            this.bandpass.frequency.value = freq
            this.mix.disconnect()
            this.mix.connect(this.bandpass)
            // bandpass is connected to filterGain.
            this.filterGain.connect(this.analyser)
        }
    }
    playTone(freq: number) {
        if (!this.osc) {
            this.osc = this.context.createOscillator()
            this.osc.connect(this.mix)
            this.osc.type = 'sine'
            this.osc.start(0)
        }
        this.osc.frequency.value = freq
        this.filterGain.gain.value = 0.2
    }
    stopTone() {
        this.osc.stop(0)
        this.osc = null
    }
}

export default Player
