/**
 * @fileoverview This file contains a class which assists with the
 * loading of GLSL shaders.
 */
/**

 * Loads a shader from vertex and fragment programs specified in
 * "script" nodes in the HTML page. This provides a convenient
 * mechanism for writing GLSL snippets without the burden of
 * additional syntax like per-line quotation marks.
 * @param {!WebGLRenderingContext} gl The WebGLRenderingContext
 *     into which the shader will be loaded.
 * @param {!string} vertexScriptName The name of the HTML Script node
 *     containing the vertex program.
 * @param {!string} fragmentScriptName The name of the HTML Script node
 *     containing the fragment program.
 */

/**
 * Helper which convers GLSL names to JavaScript names.
 * @private
 */
const glslNameToJs_ = function (name: string) {
    return name.replace(/_(.)/g, function (_, p1) {
        return p1.toUpperCase()
    })
}

/**
 * Creates a new Shader object, loading and linking the given vertex
 * and fragment shaders into a program.
 * @param {!WebGLRenderingContext} gl The WebGLRenderingContext
 *     into which the shader will be loaded.
 * @param {!string} vertex The vertex shader.
 * @param {!string} fragment The fragment shader.
 */

class Shader {
    program: WebGLProgram
    gl: WebGLRenderingContext;
    [key: string]: any
    constructor(gl: WebGLRenderingContext, vertex: string, fragment: string) {
        this.program = gl.createProgram()
        this.gl = gl
        var vs = this.loadShader(this.gl.VERTEX_SHADER, vertex)
        if (vs == null) {
            return
        }
        this.gl.attachShader(this.program, vs)
        this.gl.deleteShader(vs)
        var fs = this.loadShader(this.gl.FRAGMENT_SHADER, fragment)
        if (fs == null) {
            return
        }
        this.gl.attachShader(this.program, fs)
        this.gl.deleteShader(fs)
        this.gl.linkProgram(this.program)
        this.gl.useProgram(this.program)
        // Check the link status
        var linked = this.gl.getProgramParameter(
            this.program,
            this.gl.LINK_STATUS
        )
        if (!linked) {
            var infoLog = this.gl.getProgramInfoLog(this.program)
            console.log('Error linking program:\n' + infoLog)
            this.gl.deleteProgram(this.program)
            this.program = null
            return
        }
        // find uniforms and attributes
        var re = /(uniform|attribute)\s+\S+\s+(\S+)\s*;/g
        var match = null
        while ((match = re.exec(vertex + '\n' + fragment)) != null) {
            var glslName = match[2]
            var jsName = glslNameToJs_(glslName)
            var loc = -1
            if (match[1] == 'uniform') {
                this[jsName + 'Loc'] = this.getUniform(glslName)
            } else if (match[1] == 'attribute') {
                this[jsName + 'Loc'] = this.getAttribute(glslName)
            }
            if (loc >= 0) {
                this[jsName + 'Loc'] = loc
            }
        }
    }
    /**
     * Binds the shader's program.
     */
    bind() {
        this.gl.useProgram(this.program)
    }
    /**
     * Helper for loading a shader.
     * @private
     */
    loadShader(type: number, shaderSrc: string) {
        var shader = this.gl.createShader(type)
        if (shader == null) {
            return null
        }
        // Load the shader source
        this.gl.shaderSource(shader, shaderSrc)
        // Compile the shader
        this.gl.compileShader(shader)
        // Check the compile status
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            var infoLog = this.gl.getShaderInfoLog(shader)
            console.log('Error compiling shader:\n' + infoLog)
            this.gl.deleteShader(shader)
            return null
        }
        return shader
    }
    /**
     * Helper for looking up an attribute's location.
     * @private
     */
    getAttribute(name: string) {
        return this.gl.getAttribLocation(this.program, name)
    }
    /**
     * Helper for looking up an attribute's location.
     * @private
     */
    getUniform(name: string) {
        return this.gl.getUniformLocation(this.program, name)
    }
}

export default Shader
