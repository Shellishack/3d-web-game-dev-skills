# Procedural Sky Dome and Celestial Bodies

Use this skill when creating a reusable dynamic sky for a web-based 3D game.

## Pattern

Prefer a large inside-facing sky dome when the sky needs animated color, stars, sunrise/sunset gradients, or sun/moon direction. Use a static skybox only when the scene art is fixed and time of day does not matter.

The sky module should provide:

- a dome mesh with depth writes disabled
- a shader material or sky material with day/night uniforms
- sun and moon disc meshes parented to the scene, marked as infinite distance or otherwise camera-relative
- optional halo meshes or billboard planes for glow
- texture loading for celestial bodies when custom art is needed

```ts
import { Mesh, MeshBuilder, Scene, ShaderMaterial, Vector3 } from '@babylonjs/core'

export interface SkyRig {
  skyMaterial: ShaderMaterial
  sunDisc: Mesh
  moonDisc: Mesh
}

export function createSkyRig(scene: Scene): SkyRig {
  const skyMaterial = new ShaderMaterial('sky-material', scene, { vertex: 'sky', fragment: 'sky' }, {
    attributes: ['position'],
    uniforms: ['worldViewProjection', 'dayAmount', 'moonAmount', 'starBoost', 'sunDirection'],
  })
  skyMaterial.backFaceCulling = false
  skyMaterial.disableDepthWrite = true

  const dome = MeshBuilder.CreateSphere('sky-dome', { diameter: 1600, segments: 32, sideOrientation: Mesh.BACKSIDE }, scene)
  dome.material = skyMaterial
  dome.infiniteDistance = true
  dome.isPickable = false

  const sunDisc = MeshBuilder.CreatePlane('sun-disc', { width: 70, height: 70 }, scene)
  const moonDisc = MeshBuilder.CreatePlane('moon-disc', { width: 55, height: 55 }, scene)
  for (const disc of [sunDisc, moonDisc]) {
    disc.billboardMode = Mesh.BILLBOARDMODE_ALL
    disc.infiniteDistance = true
    disc.isPickable = false
  }

  return { skyMaterial, sunDisc, moonDisc }
}
```

## Shader Inputs

Keep shader uniforms generic:

- `dayAmount`: 0 at night, 1 in daylight
- `moonAmount`: inverse or separately shaped night visibility
- `starBoost`: weather/biome multiplier
- `sunDirection`: normalized direction for glow and horizon tint

Inside the shader, blend low-horizon and high-sky colors for night, day, and dusk. Use a cheap hash function over normalized direction or cell coordinates to place procedural stars. Mask stars by altitude so they do not appear below the horizon.

```glsl
precision highp float;
varying vec3 vPosition;
uniform float dayAmount;
uniform float moonAmount;
uniform float starBoost;
uniform vec3 sunDirection;

float hash(vec3 p) {
  p = fract(p * vec3(123.34, 345.45, 456.21));
  p += dot(p, p.yzx + 34.345);
  return fract((p.x + p.y) * p.z);
}

void main(void) {
  vec3 dir = normalize(vPosition);
  float horizon = smoothstep(-0.25, 0.8, dir.y);
  vec3 night = mix(vec3(0.02, 0.03, 0.08), vec3(0.08, 0.11, 0.22), horizon);
  vec3 day = mix(vec3(0.70, 0.82, 0.86), vec3(0.25, 0.55, 0.90), horizon);
  float star = smoothstep(0.993, 1.0, hash(floor(dir * 180.0))) * smoothstep(0.08, 0.4, dir.y);
  vec3 color = mix(night, day, dayAmount) + vec3(0.8, 0.9, 1.0) * star * moonAmount * starBoost;
  gl_FragColor = vec4(color, 1.0);
}
```

## Celestial Discs

Use billboard planes for sun and moon discs. Apply alpha textures with clamp wrapping and high anisotropic filtering. A small custom shader can feather the disc edge, discard transparent pixels, and scale emissive strength based on daylight or moonlight.

Place the visual discs far from the camera using the orbit direction, while the actual directional light can remain at a shorter practical distance. This keeps visuals impressive without breaking shadow precision.

```ts
export function updateSkyRig(sky: SkyRig, elapsedMs: number, starBoost: number) {
  const cycle = (elapsedMs % 180_000) / 180_000
  const angle = cycle * Math.PI * 2
  const sunDirection = new Vector3(-Math.cos(angle), Math.sin(angle), Math.cos(angle) * 0.25).normalize()
  const daylight = Math.max(0, Math.min(1, (sunDirection.y + 0.2) / 0.75))

  sky.skyMaterial.setFloat('dayAmount', daylight)
  sky.skyMaterial.setFloat('moonAmount', 1 - daylight)
  sky.skyMaterial.setFloat('starBoost', starBoost)
  sky.skyMaterial.setVector3('sunDirection', sunDirection)
  sky.sunDisc.position = sunDirection.scale(750)
  sky.moonDisc.position = sunDirection.scale(-720)
}
```

## Verification

Test midday, sunset, midnight, and dawn. Confirm the dome renders behind everything, stars do not shimmer excessively, and celestial discs stay visible without interfering with picking, shadows, or first-person view models.
