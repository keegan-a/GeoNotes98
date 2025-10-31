# Accessibility & Interaction Notes

GeoNotes 98 is built to welcome thoughtful writing with minimal friction. This document outlines keyboard support, ARIA usage, and design decisions that keep the experience inclusive.

## Keyboard map

| Action | Shortcut |
|--------|----------|
| Focus next control | `Tab`
| Focus previous control | `Shift+Tab`
| Create new note | `Alt+N` (desktop menu) or click “New note” button |
| Save active note | `Ctrl+S` / `Cmd+S`
| Delete focused note | `Delete` (button is focusable) |
| Toggle ambient messages | `Alt+A` (button is focusable) |
| Export desk | `Alt+E` (button focusable + clickable) |

The UI avoids hidden gestures; every interaction has a visible control.

## Focus management

- Note windows are `role="region"` with descriptive `aria-label`s.
- Title inputs and text areas are standard form elements with visible focus rings.
- Sticker removal buttons are only shown on hover visually but remain in the DOM and reachable by keyboard (`Tab` reveals them sequentially).
- Global actions (New note, Export desk, Pause ambient) sit in a single toolbar with logical tab order.

## ARIA & announcements

- Status messages (“Saved quietly.”, “There’s time to return.”) appear in a visually distinct pill and are announced via `aria-live="polite"` in the layout layer (handled in the Svelte component).
- Ambient reflections live inside `aria-live="polite"` containers so screen readers encounter them naturally without interrupting reading.

## Visual contrast

- Text uses `--ink` (`#2a1f35` by default) on warm off-white backgrounds, meeting WCAG AA.
- Buttons maintain at least a 3:1 contrast ratio even when themed.
- Hover and focus states rely on both color and shadow shifts.

## Motion sensitivity

- Animations are slow and gentle; there are no sudden flashes.
- Stickers drift softly. To fully disable, remove the `animate-drift` class in a custom build or add a prefers-reduced-motion check (hook provided in the component).

## Screen reader testing checklist

1. Launch GeoNotes 98 (`npm run dev` or `npm run tauri:dev`).
2. Navigate using `Tab` and `Shift+Tab`; ensure order cycles through header → notes → sticker drawer.
3. With a note focused, press `Ctrl+S`/`Cmd+S` and confirm “Saved quietly.” announcement.
4. Add a sticker and verify it announces as “Sticker” with the remove button in sequence.
5. Trigger “Export desk” and confirm confirmation status message.

GeoNotes 98 will continue to add refinements (e.g., optional reduced motion toggle) as the desk evolves. Contributions improving accessibility are warmly welcomed.
