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

## WindowFrame
- **Outer dimensions:** Window chrome adds 8px per side (4px padding + 4px border) beyond content region.
- **Border:** 4px total width composed of 2px highlight (top/left) and 2px shadow (bottom/right) using `border` + pseudo-elements for bevel.
- **Corner radius:** 6px (`var(--gn-radius-medium)`); title bar clips to same radius on top corners.
- **Shadow:** `var(--gn-shadow-window)` for inactive, `var(--gn-shadow-window-active)` when focused.
- **Resize handles:**
  - Corners: 16px square hit targets positioned absolutely.
  - Edges: 6px wide/height strips inset 2px from border.
- **Active state:** Saturate border colors by +10% and elevate shadow to `--gn-shadow-window-active`.
- **Inactive state:** Desaturate border by 20%, reduce opacity of title bar icon/text to 65%.
- **Z-index:** Default `var(--gn-z-window)`; focused window bumps to `var(--gn-z-window) + 2` via inline style.

## TitleBar
- **Overall height:** 36px including 4px top padding and 2px bottom alignment rule.
- **Layout:** Horizontal flex with 8px gap between icon, title, and system controls.
- **Padding:** 0 12px (left/right) to align with window content grid.
- **Icon size:** 20px square bitmap with 2px inset shadow.
- **Title text:** Medium weight sans, 16px size, 18px line-height, uppercase disabled.
- **System buttons:**
  - Button group width: each 32px wide, 28px tall, spaced by 2px.
  - Hit slop: extra 4px clickable padding applied via pseudo-element.
  - Close button accent color uses `rgb(var(--gn-color-critical))`; others use `rgb(var(--gn-color-accent))`.
- **Gradient:** Default theme uses subtle vertical gradient from `rgb(var(--gn-color-accent-soft) / 0.65)` at top to `rgb(var(--gn-color-accent))` at bottom; fallback is flat fill when `prefers-reduced-motion: reduce`.

## Taskbar
- **Height:** 48px total (40px bar + 4px top separator + 4px drop shadow region).
- **Padding:** 0 12px; icons align to 8px grid.
- **Background:** `rgb(var(--gn-color-surface-inset))` with top border `rgb(var(--gn-color-border-strong))` and inner highlight `rgb(var(--gn-color-surface))`.
- **Active window indicator:** 2px high strip positioned at top of task button using `rgb(var(--gn-color-accent))`.
- **Clock:** 14px type, right-aligned, min width 72px, updates each minute.
- **Start button:** 120px wide, 40px tall, beveled using `var(--gn-shadow-button)`; icon 24px square.
- **Z-index:** Fixed at `var(--gn-z-taskbar)`.

## ButtonRetro
- **Default:** 32px height, padding 0 16px, radius `var(--gn-radius-soft)`.
- **Bevel:**
  - Top/left highlight border: 2px `rgb(var(--gn-color-surface))`.
  - Bottom/right shadow border: 2px rgba(var(--gn-color-shadow-ambient) / 0.35).
- **Hover:** Shift gradient to lighten highlight by 10%, apply translateY(-1px) with `var(--gn-motion-duration-fast)`.
- **Active/Pressed:** Invert bevel (highlight bottom/right) and move down 1px; reduce box-shadow to `0 1px 2px rgba(var(--gn-color-shadow-ambient) / 0.2)`.
- **Disabled:** Reduce opacity to 55%, remove hover/active transitions, cursor set to `not-allowed`.
- **Icon variant:** Leading icon 16px square with 8px gap to label.
