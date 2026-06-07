# Reusable First-Person and Third-Person Controllers

Use this skill when implementing interchangeable player controllers for a 3D web game.

## Contract

Define a controller interface with a `mode` string and an `update(context)` method. The context should include the active camera, third-person camera when relevant, the player transform, normalized input, delta time, terrain height lookup, camera clamp helper, and world bounds.

Keep input collection outside controllers. Controllers should receive normalized axes such as `{ x, z, jump }`, not keyboard events. This lets keyboard, gamepad, touch sticks, and AI playback use the same movement code.

```ts
import type { ArcRotateCamera, Camera, TransformNode } from '@babylonjs/core'

export interface MoveInput {
  x: number
  z: number
  jump: boolean
}

export interface ControllerContext {
  camera: Camera
  orbitCamera: ArcRotateCamera
  player: TransformNode
  input: MoveInput
  dt: number
  terrainHeight: (x: number, z: number) => number
  clampOrbitCamera: (camera: ArcRotateCamera) => void
  worldHalfSize: number
}

export interface PlayerController {
  readonly mode: 'firstPerson' | 'thirdPerson'
  update(context: ControllerContext): void
}
```

## First-Person Controller

Use the active camera forward ray to derive horizontal forward movement. Flatten the vector by zeroing Y, normalize it, then derive a right vector perpendicular to forward. Move the player transform by the weighted forward/right vector and copy the camera position to player position plus eye height.

For jumping, track vertical velocity and an air offset inside the controller. Apply gravity each frame, clamp the offset to zero, and ground the player with `terrainHeight(x, z) + airOffset`.

```ts
import { Vector3 } from '@babylonjs/core'

export class FirstPersonController implements PlayerController {
  readonly mode = 'firstPerson' as const
  private verticalVelocity = 0
  private airOffset = 0

  update({ camera, player, input, dt, terrainHeight, worldHalfSize }: ControllerContext) {
    const forward = camera.getForwardRay().direction.clone()
    forward.y = 0
    if (forward.lengthSquared() > 0.0001) forward.normalize()

    const right = new Vector3(forward.z, 0, -forward.x)
    const move = forward.scale(input.z).add(right.scale(input.x))
    if (move.lengthSquared() > 0.0001) {
      move.normalize()
      player.position.x = clamp(player.position.x + move.x * 0.14 * dt, -worldHalfSize, worldHalfSize)
      player.position.z = clamp(player.position.z + move.z * 0.14 * dt, -worldHalfSize, worldHalfSize)
      player.rotation.y = Math.atan2(move.x, move.z)
    }

    if (input.jump && this.airOffset <= 0.01) this.verticalVelocity = 0.08
    this.verticalVelocity -= 0.0065 * dt
    this.airOffset = Math.max(0, this.airOffset + this.verticalVelocity * dt)
    if (this.airOffset === 0) this.verticalVelocity = 0

    player.position.y = terrainHeight(player.position.x, player.position.z) + this.airOffset
    camera.position.copyFrom(player.position.add(new Vector3(0, 1.3, 0)))
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
```

## Third-Person Controller

For an orbit camera, derive forward from `camera.target - camera.position`, flatten it, and move the player relative to that view direction. Update the orbit target to follow the player. Preserve user-controlled orbit angles when movement should not forcibly rotate the camera.

```ts
export class ThirdPersonController implements PlayerController {
  readonly mode = 'thirdPerson' as const

  update({ orbitCamera, player, input, dt, terrainHeight, clampOrbitCamera, worldHalfSize }: ControllerContext) {
    const forward = orbitCamera.target.subtract(orbitCamera.position)
    forward.y = 0
    if (forward.lengthSquared() > 0.0001) forward.normalize()

    const right = new Vector3(forward.z, 0, -forward.x)
    const move = forward.scale(input.z).add(right.scale(input.x))
    if (move.lengthSquared() > 0.0001) {
      move.normalize()
      player.position.x = clamp(player.position.x + move.x * 0.14 * dt, -worldHalfSize, worldHalfSize)
      player.position.z = clamp(player.position.z + move.z * 0.14 * dt, -worldHalfSize, worldHalfSize)
      player.rotation.y = Math.atan2(move.x, move.z)
    }

    player.position.y = terrainHeight(player.position.x, player.position.z)
    orbitCamera.target = player.position.add(new Vector3(0, 0.6, 0))
    clampOrbitCamera(orbitCamera)
  }
}
```

## Switching Modes

Create both controllers and switch the active reference. Swap active cameras at the same time. Detach orbit controls when entering pointer-lock first person, and release pointer lock when returning to third person or opening UI.

```ts
function setControllerMode(mode: PlayerController['mode']) {
  activeController = mode === 'firstPerson' ? firstPersonController : thirdPersonController
  scene.activeCamera?.detachControl()
  scene.activeCamera = mode === 'firstPerson' ? firstPersonCamera : orbitCamera
  if (mode === 'thirdPerson') orbitCamera.attachControl(canvas, true)
}
```

## Rules

- Clamp player X/Z inside world bounds in the controller.
- Keep speed constants per controller, not in input code.
- Keep camera math in controllers and game rules elsewhere.
- Hide the third-person player mesh and show a view model only while first-person mode is active.
- Make delta time frame-rate independent.
