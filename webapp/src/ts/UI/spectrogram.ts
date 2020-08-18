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
import Player from './player'
import AnalyserView from '../3D/visualizer'

const spectrogram = document.querySelector('#spectrogram') as HTMLCanvasElement
const legend = document.querySelector('#legend') as HTMLCanvasElement

const A = 19.86218362749959
const B = 0.0003457334974465534

const spec3D = {
    cxRot: 90,
    prevX: 0,
    isRendering: false,
    player: null as Player,
    analyserView: null as AnalyserView,
    canvas: null as HTMLCanvasElement,
    attached: function () {
        spec3D.onResize_()
        spec3D.init_()

        window.addEventListener('resize', spec3D.onResize_.bind(spec3D))
    },
    load: function (src: string) {
        spec3D.player.loadSrc(src)
    },
    stop: function () {
        spec3D.player.stop()
    },

    isPlaying: function () {
        return !!this.player.source
    },

    stopRender: function () {
        spec3D.isRendering = false
    },

    startRender: function () {
        if (spec3D.isRendering) {
            return
        }
        spec3D.isRendering = true
        spec3D.draw_()
    },

    loopChanged: function (loop: boolean) {
        spec3D.player.setLoop(loop)
    },

    play: function () {
        // spec3D.src = src
        // spec3D.player.playSrc(src)
        spec3D.player.play()
    },

    live: function () {
        spec3D.player.live()
    },

    init_: function () {
        // Initialize everything.
        var player = new Player()
        var analyserNode = player.getAnalyserNode()

        var analyserView = new AnalyserView(this.canvas)
        analyserView.setAnalyserNode(analyserNode)
        analyserView.initByteBuffer()

        spec3D.player = player
        spec3D.analyserView = analyserView
    },

    onResize_: function () {
        spec3D.canvas = spectrogram

        // access sibling or parent elements here
        spectrogram.width = window.innerWidth
        spectrogram.height = window.innerHeight

        // Also size the legend canvas.
        legend.width = window.innerWidth
        legend.height = window.innerHeight - 158

        spec3D.drawLegend_()
    },

    draw_: function () {
        if (!spec3D.isRendering) {
            return
        }

        spec3D.analyserView.doFrequencyAnalysis()
        requestAnimationFrame(spec3D.draw_.bind(spec3D))
    },

    drawLegend_: function () {
        // Draw a simple legend.
        var ctx = legend.getContext('2d')
        var x = legend.width - 10

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '14px Roboto'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText('20,000 Hz -', x, legend.height - spec3D.freqToY(20000))
        ctx.fillText('2,000 Hz -', x, legend.height - spec3D.freqToY(2000))
        ctx.fillText('200 Hz -', x, legend.height - spec3D.freqToY(200))
        ctx.fillText('20 Hz -', x, legend.height - spec3D.freqToY(20))
    },

    /**
     * Convert between frequency and the offset on the canvas (in screen space).
     * For now, we fudge this...
     *
     * TODO(smus): Make this work properly with WebGL.
     */
    freqStart: 20,
    freqEnd: 20000,
    padding: 30,
    yToFreq: function (y: number) {
        var padding = spec3D.padding
        var height = spectrogram.height

        if (
            height < 2 * padding || // The spectrogram isn't tall enough
            y < padding || // Y is out of bounds on top.
            y > height - padding
        ) {
            // Y is out of bounds on the bottom.
            return null
        }
        var percentFromBottom = 1 - (y - padding) / (height - padding)
        var freq =
            spec3D.freqStart +
            (spec3D.freqEnd - spec3D.freqStart) * percentFromBottom
        let log = A * Math.exp(B * freq)
        return log
    },

    // Just an inverse of yToFreq.
    freqToY: function (logFreq: number) {
        // Go from logarithmic frequency to linear.
        var freq = Math.log(logFreq / A) / B
        var height = spectrogram.height
        var padding = spec3D.padding
        // Get the frequency percentage.
        var percent =
            (freq - spec3D.freqStart) / (spec3D.freqEnd - spec3D.freqStart)
        // Apply padding, etc.
        return spec3D.padding + percent * (height - 2 * padding)
    },
    easeInOutCubic: function (t: number, b: number, c: number, d: number) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b
        return (c / 2) * ((t -= 2) * t * t + 2) + b
    },
    easeInOutQuad: function (t: number, b: number, c: number, d: number) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t + b
        return (-c / 2) * (--t * (t - 2) - 1) + b
    },
    easeInOutQuint: function (t: number, b: number, c: number, d: number) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b
        return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b
    },
    easeInOutExpo: function (t: number, b: number, c: number, d: number) {
        if (t == 0) return b
        if (t == d) return b + c
        if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b
        return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b
    },
}

export default spec3D
