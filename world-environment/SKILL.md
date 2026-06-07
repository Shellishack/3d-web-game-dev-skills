# World Environment Assembly

Use this skill when building an outdoor 3D scene from modular terrain, weather, labels, props, spawn points, and environmental update systems.

## Architecture

Put scene assembly in a `game/scenes/` module. Keep React components responsible for mounting the canvas and lifecycle, but keep terrain, prop creation, lighting, weather, and per-frame environment updates in plain TypeScript functions.

A useful structure is:

- data tables describe locations, scene variants, item metadata, and spawn profiles
- environment modules create lighting, sky, weather, and terrain helpers
- controller modules update player movement
- NPC modules update autonomous characters
- UI modules render overlays and panels
- a bridge context shares only cross-boundary state such as scene focus or pause handlers

```ts
export interface SceneProfile {
  key: string
  biome: 'forest' | 'coast' | 'city' | 'mountain'
  terrainStyle: string
  spawnTags: string[]
  riskDelta: number
}

export interface EnvironmentSystems {
  lighting: LightingRig
  weather: WeatherSystem
  terrainHeight: (x: number, z: number) => number
}
```

## Terrain

For compact worlds, start with a subdivided ground mesh and reshape vertices from a deterministic height function. Recompute normals after editing positions. Keep a matching `terrainHeight(x, z)` function for player grounding, NPC grounding, camera clamps, and spawn adjustment.

```ts
import { MeshBuilder, VertexBuffer, VertexData, type Scene } from '@babylonjs/core'

export function terrainHeightForBiome(biome: string, x: number, z: number) {
  if (biome === 'mountain') return Math.max(0, 0.04 * x + Math.sin(z * 0.35) * 0.4)
  if (biome === 'coast') return Math.sin(x * 0.18) * 0.08
  return Math.sin(x * 0.2) * Math.cos(z * 0.2) * 0.12
}

export function buildGround(scene: Scene, biome: string, halfSize: number) {
  const ground = MeshBuilder.CreateGround('ground', { width: halfSize * 2, height: halfSize * 2, subdivisions: 64, updatable: true }, scene)
  const positions = ground.getVerticesData(VertexBuffer.PositionKind) ?? []
  const indices = ground.getIndices() ?? []
  const normals: number[] = []

  for (let index = 0; index < positions.length; index += 3) {
    positions[index + 1] = terrainHeightForBiome(biome, positions[index], positions[index + 2])
  }

  VertexData.ComputeNormals(positions, indices, normals)
  ground.updateVerticesData(VertexBuffer.PositionKind, positions)
  ground.updateVerticesData(VertexBuffer.NormalKind, normals)
  return ground
}
```

Layer simple meshes on top of the terrain for paths, water, plazas, hills, rocks, trees, signs, beacons, and region markers. Give these helpers generic names such as `addTree`, `addRock`, `addPathSegment`, and `addRegionMarker`.

## Weather

Represent weather as profiles rather than booleans. A profile can include cloud amount, cloud color, fog boost, light scale, star multiplier, and display name. Select a profile from day plus scene key or biome using a deterministic seed so reloads are stable.

```ts
export interface WeatherProfile {
  key: string
  cloudCount: number
  cloudAlpha: number
  fogBoost: number
  lightScale: number
  starBoost: number
}

export function selectWeather(day: number, biome: string): WeatherProfile {
  const seed = day * 31 + biome.length * 17
  const clear = { key: 'clear', cloudCount: 0, cloudAlpha: 0, fogBoost: 0, lightScale: 1, starBoost: 0.8 }
  const cloudy = { key: 'cloudy', cloudCount: 8, cloudAlpha: 0.45, fogBoost: 0.002, lightScale: 0.85, starBoost: 0.3 }
  return seed % 3 === 0 ? cloudy : clear
}
```

Clouds can be made from grouped low-detail spheres. Spawn them in a broad region, move them with wind in the render loop, and dispose them after they leave an exit region. Keep spawn timing seed-based to avoid completely random scene behavior.

## Scene Loop

The render loop should update in this order:

```ts
engine.runRenderLoop(() => {
  const dt = Math.min(engine.getDeltaTime() / 16.67, 2)
  const now = performance.now()

  updateLightingRig(systems.lighting, now)
  updateWeather(systems.weather, dt, now)
  const input = readInputSnapshot()
  activeController.update({ input, dt, player, terrainHeight: systems.terrainHeight, worldHalfSize })
  updateCharacters(dt, now)
  updateWorldLabels(scene.activeCamera)
  scene.render()
})
```

## Cleanup

On unmount, remove window/document/canvas listeners, release pointer lock, clear bridge handlers, dispose scene resources, and dispose the engine. This prevents stale input and duplicated render loops during hot reloads or scene switches.
