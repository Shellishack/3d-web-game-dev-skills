# Diegetic World Text and Signs

Use this skill when adding signs, labels, speech bubbles, markers, or other text that exists inside a 3D scene.

## Pattern

Use dynamic canvas textures for short world text. Draw text into a `DynamicTexture` or canvas, assign it to a plane material, then place the plane in the world. This is useful for signs, region labels, speech bubbles, nameplates, debug markers, and prompt callouts.

Keep the text system generic:

- `createWorldLabel(scene, id, text, position)` for fixed labels
- `createSpeechBubble(scene, parent, id, initialText)` for character-attached text
- `drawBubbleText(texture, text, tone)` for redraws
- `faceCamera(plane, parent, camera)` for billboarding when needed

```ts
import { Color3, DynamicTexture, MeshBuilder, StandardMaterial, TransformNode, Vector3, type Camera, type Scene } from '@babylonjs/core'

export function createWorldLabel(scene: Scene, id: string, text: string, position: Vector3) {
  const texture = new DynamicTexture(`${id}-texture`, { width: 512, height: 160 }, scene)
  texture.hasAlpha = true
  texture.drawText(text, null, 96, 'bold 52px Inter, Arial', '#191714', '#f6dc72', true)

  const material = new StandardMaterial(`${id}-material`, scene)
  material.diffuseTexture = texture
  material.emissiveColor = Color3.FromHexString('#fff1a0')
  material.specularColor = Color3.Black()

  const plane = MeshBuilder.CreatePlane(id, { width: 2.6, height: 0.8 }, scene)
  plane.position = position
  plane.material = material
  plane.isPickable = false
  return { plane, texture }
}
```

## Texture Setup

Use a power-of-two texture size large enough for readable text, such as 512x160 or 512x192. Enable alpha. Draw a filled background only when readability needs it. Use high-contrast text and simple font stacks.

For multiline bubbles, split primary and secondary lines before drawing. Truncate or wrap long lines. Do this before drawing to avoid overflowing the texture.

```ts
export function drawBubbleText(texture: DynamicTexture, text: string, urgent = false) {
  texture.clear()
  const [primary, secondary] = text.split('\n')
  const line = primary.length > 34 ? `${primary.slice(0, 31)}...` : primary
  const background = urgent ? '#ffd1c2' : '#ffffff'

  texture.drawText(line, null, secondary ? 84 : 116, 'bold 38px Inter, Arial', '#181820', background, true)
  if (secondary) {
    texture.drawText(secondary.slice(0, 32), null, 142, 'bold 30px Inter, Arial', '#5f4524', null, true)
  }
}

export function createSpeechBubble(scene: Scene, parent: TransformNode, id: string, text: string) {
  const texture = new DynamicTexture(`${id}-texture`, { width: 512, height: 192 }, scene)
  texture.hasAlpha = true
  drawBubbleText(texture, text)

  const material = new StandardMaterial(`${id}-material`, scene)
  material.diffuseTexture = texture
  material.emissiveColor = Color3.FromHexString('#f7f2df')
  material.specularColor = Color3.Black()

  const plane = MeshBuilder.CreatePlane(id, { width: 1.5, height: 0.56 }, scene)
  plane.parent = parent
  plane.position = new Vector3(0, 1.45, 0)
  plane.material = material
  plane.isPickable = false
  return { plane, texture }
}
```

## Materials

Assign the dynamic texture to a standard or unlit material. Use emissive color lightly for readability in dark scenes. Disable strong specular highlights so text does not wash out.

World text meshes should usually be non-pickable and excluded from shadow casting. If the sign is a physical object, separate the sign board mesh from the text plane so only the board participates in shadows.

## Camera Facing

For speech bubbles and nameplates, rotate the plane toward the active camera each frame. If the plane is parented to a character, account for parent rotation so the bubble faces the camera in world space.

```ts
export function faceCamera(plane: { rotation: Vector3 }, parent: TransformNode, camera: Camera) {
  plane.rotation.x = 0
  plane.rotation.y = Math.atan2(camera.position.x - parent.position.x, camera.position.z - parent.position.z) - parent.rotation.y + Math.PI
  plane.rotation.z = 0
}
```

Fixed signs do not need billboarding if they are placed with intentional orientation. Use this for wayfinding and place identity.

## Rules

- Keep world text short.
- Redraw textures only when text changes.
- Hide first-person self-bubbles or labels that would occlude the view.
- Dispose dynamic textures with their planes when the character or marker is removed.
- Keep prompts generic and driven by interaction state, not hard-coded inside the drawing helper.
