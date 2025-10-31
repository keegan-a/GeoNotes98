# UI Component Spec (Seed)

Components to define precisely:
- WindowFrame (frame, border, shadow, resize handles, z-order, active/blur states)
- TitleBar (gradient/flat fill, icon, title text, system buttons: minimize/maximize/close)
- ButtonRetro (default, hover, active, disabled; bevel/shadow rules)
- Taskbar (height, background, active window indicator, clock)
- StartMenu (open/close animation, menu items)
- Menu, Dialog (padding, typography, separators)
- Cursor set (default, move, resize-n/e/s/w/ne/nw/se/sw)

Grids & Measurements:
- Base spacing: 4px, 8px grid.
- Hit targets: min 32x32 px for toolbar and system controls.
- Shadows: outer (y=2–6px), low blur for retro feel; avoid heavy blur.

Typography:
- Sans with crisp rendering; avoid faux pixel fonts at small sizes unless aliased properly.

Motion:
- 150–250ms ease; reduced-motion = 0ms.
