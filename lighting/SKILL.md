# Dynamic World Lighting

Use this skill when adding reusable outdoor lighting, fog, shadows, and post-processing to a 3D web game.

## Pattern

Create lighting through a single world-environment module that returns a small lighting handle. The handle should contain ambient light, key directional light, shadow generator, optional sky material, optional celestial meshes, and post-processing pipeline references.

Keep setup and updates separate:

- setup creates lights, shadow settings, fog defaults, sky material, and render pipeline
- update computes time-of-day values and applies them every frame

```ts
import { Color3, DirectionalLight, HemisphericLight, Scene, ShadowGenerator, Vector3 } from '@babylonjs/core'

export interface LightingRig {
  ambient: HemisphericLight
  key: DirectionalLight
  shadows: ShadowGenerator
  weather: WeatherProfile
}

export interface WeatherProfile {
  fogBoost: number
  lightScale: number
  starScale: number
}

export function createLightingRig(scene: Scene, weather: WeatherProfile, shadowHalfSize: number): LightingRig {
  scene.fogMode = Scene.FOGMODE_EXP2
  scene.fogDensity = 0.006 + weather.fogBoost

  const ambient = new HemisphericLight('ambient-light', new Vector3(0.25, 1, 0.35), scene)
  ambient.intensity = 0.8
  ambient.specular = Color3.Black()

  const key = new DirectionalLight('main-directional-light', new Vector3(-0.3, -0.8, -0.25), scene)
  key.intensity = 1
  key.orthoLeft = -shadowHalfSize
  key.orthoRight = shadowHalfSize
  key.orthoTop = shadowHalfSize
  key.orthoBottom = -shadowHalfSize

  const shadows = new ShadowGenerator(2048, key)
  shadows.useBlurExponentialShadowMap = true
  shadows.blurKernel = 24

  return { ambient, key, shadows, weather }
}
```

## Lighting Model

Use a hemispheric or ambient light for base readability and a directional light for sun/moon shadows. Drive both from a normalized cycle value in the range `0..1`.

Typical update flow:

1. Convert elapsed time to a cycle fraction.
2. Map the fraction to an orbit angle.
3. Calculate sun altitude and direction.
4. Derive daylight and moonlight weights.
5. Lerp light colors, fog color, ambient color, and shadow darkness.
6. Move the directional light to match the active celestial source.

```ts
const DAY_LENGTH_MS = 180_000

export function updateLightingRig(rig: LightingRig, elapsedMs: number) {
  const cycle = (elapsedMs % DAY_LENGTH_MS) / DAY_LENGTH_MS
  const angle = cycle * Math.PI * 2
  const altitude = Math.sin(angle)
  const daylight = Math.max(0, Math.min(1, (altitude + 0.2) / 0.75))
  const moonlight = 1 - daylight
  const direction = new Vector3(-Math.cos(angle), altitude, Math.cos(angle) * 0.25).normalize()

  rig.key.position = direction.scale(50)
  rig.key.direction = direction.scale(-1).normalize()
  rig.key.intensity = (0.25 + daylight * 1.2 + moonlight * 0.35) * rig.weather.lightScale
  rig.key.diffuse = Color3.Lerp(Color3.FromHexString('#a9bbff'), Color3.FromHexString('#fff0bf'), daylight)
  rig.ambient.intensity = (0.45 + daylight * 0.55) * rig.weather.lightScale
  rig.key.getScene().fogColor = Color3.Lerp(Color3.FromHexString('#12182d'), Color3.FromHexString('#9cc7df'), daylight)
}
```

Weather or biome profiles can scale intensity, fog density, star visibility, and cloud amount without changing the lighting algorithm.

## Shadows

Use one directional shadow generator for outdoor scenes. Configure an orthographic shadow box around playable space, not the whole world. Register shadow casters after scene meshes are created, and skip non-world elements such as first-person view models, labels, UI planes, sky domes, cloud volumes, and celestial discs.

## Post-Processing

Start restrained. Enable antialiasing or samples first. Bloom can be wired but kept low or disabled until art direction requires it. Avoid heavy post effects during early gameplay work because they can hide readability and performance issues.

## Implementation Checklist

- Keep all day/night constants in the environment module.
- Avoid per-mesh lighting code in gameplay systems.
- Use weather profiles to adjust lighting, not one-off conditionals scattered through scene code.
- Update fog and clear color with the same daylight value as lights.
- Expose a debug toggle for sun/moon lighting when building tools or screenshots.
