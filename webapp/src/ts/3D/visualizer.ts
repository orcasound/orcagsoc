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
import {
    commonVertexShader,
    frequencyFragmentShader,
    waveformFragmentShader,
    sonogramFragmentShader,
    sonogramVertexShader,
} from './shaders'

import Shader from './shader'

import Matrix4x4 from './matrix4x4'
import CameraController from './cameracontroller'

const ANALYSISTYPE_FREQUENCY = 0
const ANALYSISTYPE_SONOGRAM = 1
const ANALYSISTYPE_3D_SONOGRAM = 2
const ANALYSISTYPE_WAVEFORM = 3

// The "model" matrix is the "world" matrix in Standard Annotations and Semantics
var model: Matrix4x4 = null
var view: Matrix4x4 = null
var projection: Matrix4x4 = null

/**
 * Class AnalyserView
 */
class AnalyserView {
    analysisType: number
    sonogram3DWidth: number
    sonogram3DHeight: number
    sonogram3DGeometrySize: number
    freqByteData: Uint8Array
    texture: WebGLTexture
    TEXTURE_HEIGHT: number
    yoffset: number
    frequencyShader: Shader
    waveformShader: Shader
    sonogramShader: Shader
    sonogram3DShader: Shader
    backgroundColor: number[]
    foregroundColor: number[]
    canvas: HTMLCanvasElement
    gl: WebGL2RenderingContext | WebGLRenderingContext
    cameraController: CameraController
    has3DVisualizer: any
    vboTexCoordOffset: number
    vbo: WebGLBuffer
    vbo3DTexCoordOffset: number
    sonogram3DVBO: WebGLBuffer
    sonogram3DNumIndices: number
    sonogram3DIBO: WebGLBuffer
    analyser: AnalyserNode
    constructor(canvas: HTMLCanvasElement) {
        // NOTE: the default value of this needs to match the selected radio button
        // This analysis type may be overriden later on if we discover we don't support the right shader features.
        this.analysisType = ANALYSISTYPE_3D_SONOGRAM
        this.sonogram3DWidth = 256
        this.sonogram3DHeight = 256
        this.sonogram3DGeometrySize = 9.5
        this.TEXTURE_HEIGHT = 256
        this.yoffset = 0
        // Background color
        this.backgroundColor = [0.08, 0.08, 0.08, 1]
        this.foregroundColor = [0, 0.7, 0, 1]
        this.canvas = canvas
        this.initGL()
    }
    getAvailableContext(canvas: HTMLCanvasElement) {
        if (canvas.getContext) {
            try {
                const webgl2 = canvas.getContext('webgl2', {
                    antialias: true,
                })
                if (webgl2 !== null) return webgl2
            } catch (ex) {
                console.log(ex.mesage)
            }
            try {
                const webgl = canvas.getContext('webgl', {
                    antialias: true,
                })
                if (webgl !== null) return webgl
            } catch (ex) {
                console.log(ex.mesage)
            }
        }
        return null
    }
    initGL() {
        model = new Matrix4x4()
        view = new Matrix4x4()
        projection = new Matrix4x4()
        // ________________________________________
        var sonogram3DWidth = this.sonogram3DWidth
        var sonogram3DHeight = this.sonogram3DHeight
        var sonogram3DGeometrySize = this.sonogram3DGeometrySize
        var backgroundColor = this.backgroundColor
        // ________________________________________
        var canvas = this.canvas
        // ________________________________________
        var gl = this.getAvailableContext(canvas)
        this.gl = gl
        // If we're missing this shader feature, then we can't do the 3D visualization.
        this.has3DVisualizer =
            gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0
        if (
            !this.has3DVisualizer &&
            this.analysisType == ANALYSISTYPE_3D_SONOGRAM
        )
            this.analysisType = ANALYSISTYPE_FREQUENCY
        var cameraController = new CameraController(canvas)
        this.cameraController = cameraController
        cameraController.xRot = -180
        cameraController.yRot = 270
        cameraController.zRot = 90
        cameraController.xT = 0
        // Zoom level.
        cameraController.yT = -2
        // Translation in the x axis.
        cameraController.zT = -2
        gl.clearColor(
            backgroundColor[0],
            backgroundColor[1],
            backgroundColor[2],
            backgroundColor[3]
        )
        gl.enable(gl.DEPTH_TEST)
        // Initialization for the 2D visualizations
        var vertices = new Float32Array([
            1.0,
            1.0,
            0.0,
            -1.0,
            1.0,
            0.0,
            -1.0,
            -1.0,
            0.0,
            1.0,
            1.0,
            0.0,
            -1.0,
            -1.0,
            0.0,
            1.0,
            -1.0,
            0.0,
        ])
        var texCoords = new Float32Array([
            1.0,
            1.0,
            0.0,
            1.0,
            0.0,
            0.0,
            1.0,
            1.0,
            0.0,
            0.0,
            1.0,
            0.0,
        ])
        var vboTexCoordOffset = vertices.byteLength
        this.vboTexCoordOffset = vboTexCoordOffset
        // Create the vertices and texture coordinates
        var vbo = gl.createBuffer()
        this.vbo = vbo
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            vboTexCoordOffset + texCoords.byteLength,
            gl.STATIC_DRAW
        )
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices)
        gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords)
        // Initialization for the 3D visualizations
        var numVertices = sonogram3DWidth * sonogram3DHeight
        if (numVertices > 65536) {
            throw 'Sonogram 3D resolution is too high: can only handle 65536 vertices max'
        }
        vertices = new Float32Array(numVertices * 3)
        texCoords = new Float32Array(numVertices * 2)
        for (var z = 0; z < sonogram3DHeight; z++) {
            for (var x = 0; x < sonogram3DWidth; x++) {
                // Generate a reasonably fine mesh in the X-Z plane
                vertices[3 * (sonogram3DWidth * z + x) + 0] =
                    (sonogram3DGeometrySize * (x - sonogram3DWidth / 2)) /
                    sonogram3DWidth
                vertices[3 * (sonogram3DWidth * z + x) + 1] = 0
                vertices[3 * (sonogram3DWidth * z + x) + 2] =
                    (sonogram3DGeometrySize * (z - sonogram3DHeight / 2)) /
                    sonogram3DHeight
                texCoords[2 * (sonogram3DWidth * z + x) + 0] =
                    x / (sonogram3DWidth - 1)
                texCoords[2 * (sonogram3DWidth * z + x) + 1] =
                    z / (sonogram3DHeight - 1)
            }
        }
        var vbo3DTexCoordOffset = vertices.byteLength
        this.vbo3DTexCoordOffset = vbo3DTexCoordOffset
        // Create the vertices and texture coordinates
        var sonogram3DVBO = gl.createBuffer()
        this.sonogram3DVBO = sonogram3DVBO
        gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            vbo3DTexCoordOffset + texCoords.byteLength,
            gl.STATIC_DRAW
        )
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices)
        gl.bufferSubData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset, texCoords)
        // Now generate indices
        var sonogram3DNumIndices =
            (sonogram3DWidth - 1) * (sonogram3DHeight - 1) * 6
        this.sonogram3DNumIndices = sonogram3DNumIndices - 6 * 600
        var indices = new Uint16Array(sonogram3DNumIndices)
        // We need to use TRIANGLES instead of for example TRIANGLE_STRIP
        // because we want to make one draw call instead of hundreds per
        // frame, and unless we produce degenerate triangles (which are very
        // ugly) we won't be able to split the rows.
        var idx = 0
        for (let z = 0; z < sonogram3DHeight - 1; z++) {
            for (let x = 0; x < sonogram3DWidth - 1; x++) {
                indices[idx++] = z * sonogram3DWidth + x
                indices[idx++] = z * sonogram3DWidth + x + 1
                indices[idx++] = (z + 1) * sonogram3DWidth + x + 1
                indices[idx++] = z * sonogram3DWidth + x
                indices[idx++] = (z + 1) * sonogram3DWidth + x + 1
                indices[idx++] = (z + 1) * sonogram3DWidth + x
            }
        }
        var sonogram3DIBO = gl.createBuffer()
        this.sonogram3DIBO = sonogram3DIBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sonogram3DIBO)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
        // Note we do not unbind this buffer -- not necessary
        // Load the shaders
        this.frequencyShader = new Shader(
            gl,
            commonVertexShader,
            frequencyFragmentShader
        )
        this.waveformShader = new Shader(
            gl,
            commonVertexShader,
            waveformFragmentShader
        )
        this.sonogramShader = new Shader(
            gl,
            commonVertexShader,
            sonogramFragmentShader
        )
        if (this.has3DVisualizer) {
            this.sonogram3DShader = new Shader(
                gl,
                sonogramVertexShader,
                sonogramFragmentShader
            )
        }
    }
    initByteBuffer() {
        var gl = this.gl
        var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT
        if (
            !this.freqByteData ||
            this.freqByteData.length != this.analyser.frequencyBinCount
        ) {
            var freqByteData = new Uint8Array(this.analyser.frequencyBinCount)
            this.freqByteData = freqByteData
            // (Re-)Allocate the texture object
            if (this.texture) {
                gl.deleteTexture(this.texture)
                this.texture = null
            }
            var texture = gl.createTexture()
            this.texture = texture
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            // TODO(kbr): WebGL needs to properly clear out the texture when null is specified
            var tmp = new Uint8Array(freqByteData.length * TEXTURE_HEIGHT)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.ALPHA,
                freqByteData.length,
                TEXTURE_HEIGHT,
                0,
                gl.ALPHA,
                gl.UNSIGNED_BYTE,
                tmp
            )
        }
    }
    setAnalysisType(type: number) {
        // Check for read textures in vertex shaders.
        if (!this.has3DVisualizer && type == ANALYSISTYPE_3D_SONOGRAM) return
        this.analysisType = type
    }
    doFrequencyAnalysis() {
        var freqByteData = this.freqByteData
        switch (this.analysisType) {
            case ANALYSISTYPE_FREQUENCY:
                this.analyser.smoothingTimeConstant = 0.75
                this.analyser.getByteFrequencyData(freqByteData)
                break
            case ANALYSISTYPE_SONOGRAM:
            case ANALYSISTYPE_3D_SONOGRAM:
                this.analyser.smoothingTimeConstant = 0
                this.analyser.getByteFrequencyData(freqByteData)
                break
            case ANALYSISTYPE_WAVEFORM:
                this.analyser.smoothingTimeConstant = 0.1
                this.analyser.getByteTimeDomainData(freqByteData)
                break
        }
        this.drawGL()
    }
    drawGL() {
        var canvas = this.canvas
        var gl = this.gl
        var vbo = this.vbo
        var vboTexCoordOffset = this.vboTexCoordOffset
        var sonogram3DVBO = this.sonogram3DVBO
        var vbo3DTexCoordOffset = this.vbo3DTexCoordOffset
        var sonogram3DGeometrySize = this.sonogram3DGeometrySize
        var sonogram3DNumIndices = this.sonogram3DNumIndices
        var sonogram3DHeight = this.sonogram3DHeight
        var freqByteData = this.freqByteData
        var texture = this.texture
        var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT
        var frequencyShader = this.frequencyShader
        var waveformShader = this.waveformShader
        var sonogramShader = this.sonogramShader
        var sonogram3DShader = this.sonogram3DShader
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
        if (
            this.analysisType != ANALYSISTYPE_SONOGRAM &&
            this.analysisType != ANALYSISTYPE_3D_SONOGRAM
        ) {
            this.yoffset = 0
        }
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            this.yoffset,
            freqByteData.length,
            1,
            gl.ALPHA,
            gl.UNSIGNED_BYTE,
            freqByteData
        )
        if (
            this.analysisType == ANALYSISTYPE_SONOGRAM ||
            this.analysisType == ANALYSISTYPE_3D_SONOGRAM
        ) {
            this.yoffset = (this.yoffset + 1) % TEXTURE_HEIGHT
        }
        var yoffset = this.yoffset
        // Point the frequency data texture at texture unit 0 (the default),
        // which is what we're using since we haven't called activeTexture
        // in our program
        var vertexLoc
        var texCoordLoc
        var frequencyDataLoc
        var foregroundColorLoc
        var backgroundColorLoc
        var texCoordOffset
        var currentShader
        switch (this.analysisType) {
            case ANALYSISTYPE_FREQUENCY:
            case ANALYSISTYPE_WAVEFORM:
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
                currentShader =
                    this.analysisType == ANALYSISTYPE_FREQUENCY
                        ? frequencyShader
                        : waveformShader
                currentShader.bind()
                vertexLoc = currentShader.gPositionLoc
                texCoordLoc = currentShader.gTexCoord0Loc
                frequencyDataLoc = currentShader.frequencyDataLoc
                foregroundColorLoc = currentShader.foregroundColorLoc
                backgroundColorLoc = currentShader.backgroundColorLoc
                gl.uniform1f(
                    currentShader.yoffsetLoc,
                    0.5 / (TEXTURE_HEIGHT - 1)
                )
                texCoordOffset = vboTexCoordOffset
                break
            case ANALYSISTYPE_SONOGRAM:
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
                sonogramShader.bind()
                vertexLoc = sonogramShader.gPositionLoc
                texCoordLoc = sonogramShader.gTexCoord0Loc
                frequencyDataLoc = sonogramShader.frequencyDataLoc
                foregroundColorLoc = sonogramShader.foregroundColorLoc
                backgroundColorLoc = sonogramShader.backgroundColorLoc
                gl.uniform1f(
                    sonogramShader.yoffsetLoc,
                    yoffset / (TEXTURE_HEIGHT - 1)
                )
                texCoordOffset = vboTexCoordOffset
                break
            case ANALYSISTYPE_3D_SONOGRAM:
                gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO)
                sonogram3DShader.bind()
                vertexLoc = sonogram3DShader.gPositionLoc
                texCoordLoc = sonogram3DShader.gTexCoord0Loc
                frequencyDataLoc = sonogram3DShader.frequencyDataLoc
                foregroundColorLoc = sonogram3DShader.foregroundColorLoc
                backgroundColorLoc = sonogram3DShader.backgroundColorLoc
                gl.uniform1i(sonogram3DShader.vertexFrequencyDataLoc, 0)
                var normalizedYOffset = this.yoffset / (TEXTURE_HEIGHT - 1)
                gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset)
                var discretizedYOffset =
                    Math.floor(normalizedYOffset * (sonogram3DHeight - 1)) /
                    (sonogram3DHeight - 1)
                gl.uniform1f(
                    sonogram3DShader.vertexYOffsetLoc,
                    discretizedYOffset
                )
                gl.uniform1f(
                    sonogram3DShader.verticalScaleLoc,
                    sonogram3DGeometrySize / 3.5
                )
                // Set up the model, view and projection matrices
                projection.loadIdentity()
                projection.perspective(
                    55 /*35*/,
                    canvas.width / canvas.height,
                    1,
                    100
                )
                view.loadIdentity()
                view.translate(0, 0, -9.0 /*-13.0*/)
                // Add in camera controller's rotation
                model.loadIdentity()
                model.rotate(this.cameraController.xRot, 1, 0, 0)
                model.rotate(this.cameraController.yRot, 0, 1, 0)
                model.rotate(this.cameraController.zRot, 0, 0, 1)
                model.translate(
                    this.cameraController.xT,
                    this.cameraController.yT,
                    this.cameraController.zT
                )
                // Compute necessary matrices
                var mvp = new Matrix4x4()
                mvp.multiply(model)
                mvp.multiply(view)
                mvp.multiply(projection)
                gl.uniformMatrix4fv(
                    sonogram3DShader.worldViewProjectionLoc,
                    false,
                    mvp.elements
                )
                texCoordOffset = vbo3DTexCoordOffset
                break
        }
        if (frequencyDataLoc) {
            gl.uniform1i(frequencyDataLoc, 0)
        }
        if (foregroundColorLoc) {
            gl.uniform4fv(foregroundColorLoc, this.foregroundColor)
        }
        if (backgroundColorLoc) {
            gl.uniform4fv(backgroundColorLoc, this.backgroundColor)
        }
        // Set up the vertex attribute arrays
        gl.enableVertexAttribArray(vertexLoc)
        gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(texCoordLoc)
        gl.vertexAttribPointer(
            texCoordLoc,
            2,
            gl.FLOAT,
            false,
            0,
            texCoordOffset
        )
        // Clear the render area
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        // Actually draw
        if (
            this.analysisType == ANALYSISTYPE_FREQUENCY ||
            this.analysisType == ANALYSISTYPE_WAVEFORM ||
            this.analysisType == ANALYSISTYPE_SONOGRAM
        ) {
            gl.drawArrays(gl.TRIANGLES, 0, 6)
        } else if (this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
            // Note: this expects the element array buffer to still be bound
            gl.drawElements(
                gl.TRIANGLES,
                sonogram3DNumIndices,
                gl.UNSIGNED_SHORT,
                0
            )
        }
        // Disable the attribute arrays for cleanliness
        gl.disableVertexAttribArray(vertexLoc)
        gl.disableVertexAttribArray(texCoordLoc)
    }
    setAnalyserNode(analyser: AnalyserNode) {
        this.analyser = analyser
    }
    getAnalysisType() {
        return this.analysisType
    }
}

export default AnalyserView
