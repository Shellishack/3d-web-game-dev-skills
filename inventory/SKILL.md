# Quick-Slot Inventory Bar

Use this skill when creating a reusable inventory bar with quick slots and an expandable bag panel for a 3D web game.

## Pattern

Separate inventory ownership from inventory presentation. Game state decides what items exist, what the player owns, and what each item does. The UI renders slots, current selection, item assignment, and clear/select commands.

Use a fixed number of quick slots represented as an array of item keys or `null`. Track one selected slot index. The bag panel assigns owned items into the selected slot; the compact bar selects slots during play.

```ts
export type ItemKey = 'lamp' | 'medkit' | 'scanner' | 'snack'
export type InventorySlot = ItemKey | null

export interface ItemDefinition {
  name: string
  shortName: string
  description: string
  tone: string
}

export const items: Record<ItemKey, ItemDefinition> = {
  lamp: { name: 'Signal Lamp', shortName: 'Lamp', description: 'Improves visibility in dark areas.', tone: 'yellow' },
  medkit: { name: 'Medkit', shortName: 'Med', description: 'Stabilizes injured characters.', tone: 'red' },
  scanner: { name: 'Scanner', shortName: 'Scan', description: 'Reveals nearby interactables.', tone: 'blue' },
  snack: { name: 'Snack Pack', shortName: 'Snack', description: 'Restores a small amount of stamina.', tone: 'green' },
}
```

## Component Contract

A reusable inventory component usually needs:

- `slots`: fixed-length list of item ids or empty values
- `ownedItems`: list of item ids available to assign
- `selectedSlot`: current slot index
- `bagOpen`: whether the expanded panel is visible
- `onSelectSlot(index)`
- `onAssignSlot(index, itemId)`
- `onClearSlot(index)`
- `onToggleBag()`

```tsx
interface InventoryBarProps {
  slots: InventorySlot[]
  ownedItems: ItemKey[]
  selectedSlot: number
  bagOpen: boolean
  onSelectSlot: (slotIndex: number) => void
  onAssignSlot: (slotIndex: number, item: ItemKey) => void
  onClearSlot: (slotIndex: number) => void
  onToggleBag: () => void
}
```

Item metadata should come from a separate data table keyed by item id. Include display name, description, icon, cost, rarity, or color tone there, not inside slot logic.

## UI Structure

Place the compact bar near the bottom center of the viewport. Wrap it in a `pointer-events: none` container and make only controls interactive. Use stable button dimensions so empty slots and named slots do not resize the layout.

```tsx
function QuickSlots({ slots, selectedSlot, onSelectSlot }: Pick<InventoryBarProps, 'slots' | 'selectedSlot' | 'onSelectSlot'>) {
  return (
    <div className="pointer-events-auto flex gap-1 rounded-md bg-black/55 p-1">
      {slots.map((item, index) => (
        <button className="grid h-12 min-w-14 place-items-center rounded border text-xs" key={index} onClick={() => onSelectSlot(index)} type="button" aria-pressed={selectedSlot === index}>
          <span>{index + 1}</span>
          <strong>{item ? items[item].shortName : '-'}</strong>
        </button>
      ))}
    </div>
  )
}
```

When expanded, show the bag panel above the quick bar. Split it into slot selection and assignable item list on desktop; collapse to one column on narrow screens. Keep the active slot visibly marked.

## Design Rules

- Use short item labels in quick slots; keep full names/descriptions for the bag panel.
- Reserve color swatches or tones for item categories, not random decoration.
- Make empty slots explicit.
- Keep all commands reversible: assigning replaces, clearing empties, selecting does not consume.
- Do not bake item effects into the inventory UI.

## Verification

Check mouse, keyboard, and touch layouts. Make sure the bar does not cover critical mobile controls and that long item names wrap or shorten without shifting slot size.
