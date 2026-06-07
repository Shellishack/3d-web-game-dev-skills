# HUD Overlay for 3D Web Games

Use this skill when building a compact React HUD over a Babylon.js, Three.js, or canvas-based game.

## Pattern

Keep the 3D scene and HUD as sibling layers inside a full-viewport shell. The scene owns rendering, camera, pointer lock, and simulation. The HUD owns readable status, commands, and short-lived player-facing indicators.

Use absolute positioning with a high z-index and `pointer-events: none` on passive HUD containers. Re-enable `pointer-events: auto` only for interactive buttons, panels, or controls. This prevents the overlay from blocking camera drag, pointer lock, or touch look by accident.

## Data Flow

Pass HUD values as plain props from app/game state:

- current day, wave, round, or level
- primary currency or score
- danger, heat, stamina, health, morale, or other risk metric
- short forecast/status label
- booleans for open panels, failure states, or alerts
- callbacks for explicit UI commands

Do not let HUD components mutate simulation state directly. They should call named callbacks such as `onToggleDetails`, `onOpenMap`, or `onPause`.

```tsx
interface StatusHudProps {
  level: number
  credits: number
  risk: number
  forecast: string
  detailsOpen: boolean
  onToggleDetails: () => void
}

export function StatusHud({ level, credits, risk, forecast, detailsOpen, onToggleDetails }: StatusHudProps) {
  const item = 'flex items-center gap-1 whitespace-nowrap font-black text-white [text-shadow:0_2px_8px_rgb(0_0_0_/_0.75)]'

  return (
    <header className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100vw-1rem)] items-center gap-3" aria-label="Game status">
      <span className={item}>Day {level}</span>
      <span className={item}>${credits}</span>
      <span className={risk > 70 ? `${item} text-orange-200` : item}>{risk}%</span>
      <span className={`${item} min-w-0 overflow-hidden text-ellipsis`}>{forecast}</span>
      <button className="pointer-events-auto grid h-8 w-8 place-items-center" onClick={onToggleDetails} type="button" aria-label={detailsOpen ? 'Close details' : 'Open details'}>
        {detailsOpen ? 'x' : 'i'}
      </button>
    </header>
  )
}
```

## Layout Guidance

Build the top HUD as a tight status strip, not a dashboard. Favor icon plus value pairs, strong text shadows, and transparent backgrounds so the world remains visible. Use `max-width: calc(100vw - padding)` and `overflow-hidden` to keep long values from breaking mobile layouts.

For values that can become urgent, change tone locally on that item instead of restyling the whole HUD. For example, a danger metric can warm from neutral to warning while cash and day remain stable.

## Implementation Checklist

- Render HUD outside the canvas but inside the viewport shell.
- Keep status items small, stable, and scan-friendly.
- Use icon components rather than text labels where the meaning is familiar.
- Add `aria-label` to the HUD region and icon-only buttons.
- Avoid storing duplicate derived state such as `cursorAvailable` when it can be computed from scene focus.
- Confirm HUD controls do not interfere with pointer lock or mobile touch zones.

## Good Fit

This pattern works for exploration games, management games, multiplayer scenes, and first-person/third-person hybrids where the player needs constant status without leaving the world view.
