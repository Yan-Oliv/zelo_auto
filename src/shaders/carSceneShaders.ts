export const dustVertexShader = /* glsl */ `
varying vec3 vLocalPosition;
varying vec3 vWorldPosition;

void main() {
  vLocalPosition = position;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

export const dustFragmentShader = /* glsl */ `
uniform float uCleanProgress;
uniform float uTime;
uniform vec3 uDustColor;

varying vec3 vLocalPosition;
varying vec3 vWorldPosition;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p *= 2.1;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float vertical = smoothstep(-1.25, 1.85, vLocalPosition.y);
  float forward = smoothstep(1.2, -1.5, vLocalPosition.z);
  float cleanDirection = mix(vertical, forward, 0.32);
  float grittyNoise = fbm(vLocalPosition * 2.7 + vec3(0.0, uTime * 0.04, uTime * 0.02));
  float threshold = uCleanProgress * 1.45 - cleanDirection * 0.58;
  float dissolve = smoothstep(threshold - 0.14, threshold + 0.16, grittyNoise);
  float lowerBias = smoothstep(1.5, -0.7, vLocalPosition.y);
  float opacity = (1.0 - dissolve) * mix(0.45, 0.92, lowerBias);
  opacity *= 0.92;

  if (opacity <= 0.003) discard;

  gl_FragColor = vec4(uDustColor, opacity);
}
`

export const particleVertexShader = /* glsl */ `
attribute float aScale;
attribute float aPhase;

uniform float uProgress;
uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;
varying float vFoam;
varying float vWater;

void main() {
  float dustPhase = 1.0 - smoothstep(0.0, 0.33, uProgress);
  float foamRise = smoothstep(0.33, 0.48, uProgress);
  float foamFall = 1.0 - smoothstep(0.54, 0.66, uProgress);
  float foamPhase = foamRise * foamFall;
  float waterPhase = smoothstep(0.66, 1.0, uProgress);

  vec3 transformed = position;

  transformed.x += sin(uTime * 0.7 + aPhase * 18.0) * 0.22 * dustPhase;
  transformed.z += cos(uTime * 0.58 + aPhase * 12.0) * 0.18 * dustPhase;
  transformed.y += sin(uTime * 0.66 + aPhase * 24.0) * 0.14 * dustPhase;

  float foamFallDistance = mod(uTime * (0.45 + aPhase * 0.5) + aPhase * 4.0, 4.6);
  transformed.x += sin(uTime * 0.45 + aPhase * 40.0) * 0.06 * foamPhase;
  transformed.z += cos(uTime * 0.4 + aPhase * 28.0) * 0.05 * foamPhase;
  transformed.y = mix(transformed.y, 1.75 - foamFallDistance, foamPhase);

  float waterFallDistance = mod(uTime * (1.25 + aPhase) + aPhase * 8.0, 4.9);
  transformed.x += sin(uTime * 0.8 + aPhase * 33.0) * 0.03 * waterPhase;
  transformed.z += cos(uTime * 0.74 + aPhase * 29.0) * 0.02 * waterPhase;
  transformed.y = mix(transformed.y, 1.45 - waterFallDistance, waterPhase);

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

  float size = mix(3.0, 4.0, dustPhase);
  size = mix(size, 12.0, foamPhase);
  size = mix(size, 4.2, waterPhase);
  gl_PointSize = size * aScale * uPixelRatio * (320.0 / -mvPosition.z);

  vAlpha = dustPhase * 0.65 + foamPhase * 0.55 + waterPhase * (1.0 - uProgress) * 0.85;
  vFoam = foamPhase;
  vWater = waterPhase;

  gl_Position = projectionMatrix * mvPosition;
}
`

export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vFoam;
varying float vWater;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float dist = length(centered);
  float core = smoothstep(0.5, 0.0, dist);
  if (core <= 0.01) discard;

  vec3 dustColor = vec3(0.6627, 0.5882, 0.4902);
  vec3 foamColor = vec3(0.9176, 0.9568, 1.0);
  vec3 waterColor = vec3(1.0, 1.0, 1.0);

  vec3 color = mix(dustColor, foamColor, vFoam);
  color = mix(color, waterColor, vWater);

  float alpha = core * vAlpha;
  gl_FragColor = vec4(color, alpha);
}
`
