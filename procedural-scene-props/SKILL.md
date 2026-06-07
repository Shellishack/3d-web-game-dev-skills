# Procedural Low-Poly Scene Props

Use this skill when adding lightweight procedural props to a stylized 3D world without relying on a full art pipeline.

## Pattern

Build small prop helper functions that accept a scene, name, position, and a few scale/color options. Each helper returns a root transform or mesh. Parent child meshes to the root so the prop can be moved, animated, hidden, or disposed as one object.

Good helper categories:

- rocks from irregular polyhedrons or scaled spheres
- trees from cylinder trunks and clustered leaf shapes
- steam, smoke, or mist from translucent spheres or planes
- vehicles from simple boxes/cylinders
- characters from cylinders, spheres, and small accessories
- terrain patches from flattened boxes or ground planes
- beacons and markers from simple emissive meshes

```ts
import { Color3, MeshBuilder, StandardMaterial, TransformNode, Vector3, type Scene } from '@babylonjs/core'

function makeMat(scene: Scene, name: string, color: string) {
  const material = new StandardMaterial(name, scene)
  material.diffuseColor = Color3.FromHexString(color)
  material.specularColor = Color3.Black()
  return material
}

export function addLowPolyTree(scene: Scene, name: string, position: Vector3, height = 1) {
  const root = new TransformNode(name, scene)
  root.position = position

  const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, { height: 1.1 * height, diameter: 0.18, tessellation: 6 }, scene)
  trunk.parent = root
  trunk.position.y = 0.55 * height
  trunk.material = makeMat(scene, `${name}-trunk-mat`, '#6b4a2f')

  for (let layer = 0; layer < 3; layer += 1) {
    const leaves = MeshBuilder.CreateSphere(`${name}-leaves-${layer}`, { diameter: 1.0 - layer * 0.18, segments: 8 }, scene)
    leaves.parent = root
    leaves.position.y = (1.15 + layer * 0.32) * height
    leaves.scaling = new Vector3(1, 0.55, 1)
    leaves.material = makeMat(scene, `${name}-leaf-mat-${layer}`, '#3f8f58')
  }

  root.getChildMeshes().forEach((mesh) => { mesh.isPickable = false })
  return root
}
```

## Materials

Create small material factories for common needs: matte material, water material, ground marker material, emissive marker material. Set specular color intentionally so low-poly shapes do not look accidentally plastic.

Avoid creating unlimited duplicate materials in large scenes. For repeated props, cache shared materials by color and purpose when scale grows.

## Determinism

For variation, use deterministic seed helpers instead of raw randomness. Drive scale, rotation, puff placement, tree height, or rock shape from a seed based on scene id plus index. This makes procedural scenes stable across reloads and easier to test.

```ts
function seeded01(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
}

function seededRange(seed: number, min: number, max: number) {
  return min + seeded01(seed) * (max - min)
}

export function addRock(scene: Scene, name: string, x: number, z: number, seed: number) {
  const rock = MeshBuilder.CreatePolyhedron(name, { type: 0, size: seededRange(seed, 0.4, 1.1) }, scene)
  rock.position = new Vector3(x, seededRange(seed + 1, 0.05, 0.15), z)
  rock.rotation = new Vector3(seededRange(seed + 2, -0.2, 0.2), seededRange(seed + 3, 0, Math.PI), seededRange(seed + 4, -0.2, 0.2))
  rock.scaling.y = seededRange(seed + 5, 0.45, 0.9)
  rock.material = makeMat(scene, `${name}-mat`, '#8b8f86')
  rock.isPickable = false
  return rock
}
```

## Composition

Favor many simple meshes with clear silhouettes over complex geometry. Use low tessellation for stylized characters and props. Add a small number of distinctive accessories to communicate role, faction, item type, or hazard without relying on detailed textures.

## Performance

Mark decorative meshes as non-pickable. Skip shadows for tiny, translucent, UI-like, or camera-attached meshes. Consider instances or thin instances when repeating hundreds of the same mesh.

## Verification

Walk around the scene in both camera modes. Confirm props sit on the terrain height, do not block navigation unexpectedly, and read clearly from gameplay distance.
