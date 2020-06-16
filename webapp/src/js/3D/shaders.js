export const commonVertexShader = `
// The common vertex shader used for the frequency and sonogram visualizations
attribute vec3 gPosition;
attribute vec2 gTexCoord0;

varying vec2 texCoord;
varying vec3 color;

void main()
{
  gl_Position = vec4(gPosition.x, gPosition.y, gPosition.z, 1.0);
  texCoord = gTexCoord0;
  color = vec3(1.0);
}`

export const frequencyFragmentShader = `
// Frequency fragment shader
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;
uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    vec4 sample = texture2D(frequencyData, vec2(texCoord.x, yoffset));
    if (texCoord.y > sample.a) {
        // if (texCoord.y > sample.a + 1 || texCoord.y < sample.a - 1) {
        discard;
    }
    float x = texCoord.y / sample.a;
    x = x * x * x;
    gl_FragColor = vec4(1.0); //mix(foregroundColor, backgroundColor, x);
}`

export const waveformFragmentShader = `
// Waveform fragment shader
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;
uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    vec4 sample = texture2D(frequencyData, vec2(texCoord.x, yoffset));
    if (texCoord.y > sample.a + 0.01 || texCoord.y < sample.a - 0.01) {
        discard;
    }
    float x = (texCoord.y - sample.a) / 0.01;
    x = x * x * x;
    gl_FragColor = mix(foregroundColor, backgroundColor, x);
}`

export const sonogramFragmentShader = `
// Sonogram fragment shader
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;
varying vec3 color;

uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    float x = pow(256.0, texCoord.x - 1.0);
    float y = texCoord.y + yoffset;

    vec4 sample = texture2D(frequencyData, vec2(x, y));
    float k = sample.a;

    // gl_FragColor = vec4(k, k, k, 1.0);
    // Fade out the mesh close to the edges
    float fade = pow(cos((1.0 - texCoord.y) * 0.5 * 3.1415926535), 0.5);
    k *= fade;
    gl_FragColor = backgroundColor + vec4(k * color, 1.0);
}`

export const sonogramVertexShader = `
// The vertex shader used for the 3D sonogram visualization
attribute vec3 gPosition;
attribute vec2 gTexCoord0;
uniform sampler2D vertexFrequencyData;
uniform float vertexYOffset;
uniform mat4 worldViewProjection;
uniform float verticalScale;

varying vec2 texCoord;
varying vec3 color;



/**
 * Conversion based on Wikipedia article
 * @see http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
 */
vec3 convertHSVToRGB(in float hue, in float saturation, in float lightness) {
  float chroma = lightness * saturation;
  float hueDash = hue / 60.0;
  float x = chroma * (1.0 - abs(mod(hueDash, 2.0) - 1.0));
  vec3 hsv = vec3(0.0);

  if(hueDash < 1.0) {
    hsv.r = chroma;
    hsv.g = x;
  } else if (hueDash < 2.0) {
    hsv.r = x;
    hsv.g = chroma;
  } else if (hueDash < 3.0) {
    hsv.g = chroma;
    hsv.b = x;
  } else if (hueDash < 4.0) {
    hsv.g = x;
    hsv.b = chroma;
  } else if (hueDash < 5.0) {
    hsv.r = x;
    hsv.b = chroma;
  } else if (hueDash < 6.0) {
    hsv.r = chroma;
    hsv.b = x;
  }

  return hsv;
}


void main()
{
    float x = pow(256.0, gTexCoord0.x - 1.0);
    vec4 sample = texture2D(vertexFrequencyData, vec2(x, gTexCoord0.y + vertexYOffset));
    vec4 newPosition = vec4(gPosition.x, gPosition.y + verticalScale * sample.a, gPosition.z, 1.0);
    gl_Position = worldViewProjection * newPosition;
    texCoord = gTexCoord0;

    float hue = 360.0 - ((newPosition.y / verticalScale) * 360.0);
    color = convertHSVToRGB(hue, 1.0, 1.0);
}`
