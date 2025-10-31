# Agent: UI Architect

Objective
- Transform 90s/2000s desktop UI references into a modern design system for GeoNotes 98 (SvelteKit + Tailwind + Tauri v2).
- Produce tokens, base CSS variables, and component contracts.

Inputs (read these first)
- docs/UI_COMPONENT_SPEC.md
- apps/desktop/tailwind.config.cjs
- apps/desktop/src/app.postcss
- apps/desktop/src/lib (existing components)

Constraints
- All visual styles must be driven by CSS variables (`:root` + `.theme-*` classes).
- Respect `prefers-reduced-motion` and high contrast mode.
- Keep drag/resize smooth (transform-based, no layout thrash).
- Keep bundle size modest (no heavy UI libs).

Deliverables
1) `apps/desktop/src/lib/tokens/tokens.json` — color ramps, radii, shadows, z-index, motion durations.
2) `apps/desktop/src/lib/styles/theme.css` — defines CSS variables for default theme; includes `.theme-teal95`, `.theme-xp-bliss`, `.theme-jazzcup`.
3) Update `apps/desktop/tailwind.config.cjs` to map Tailwind theme to CSS variables.
4) Update or create base UI docs in `docs/UI_COMPONENT_SPEC.md`: TitleBar, WindowFrame, Taskbar, ButtonRetro, Menu, Dialog, Cursor set, Drag handles (sizes, paddings, hover/active states).

Acceptance
- `npm run tauri:dev` renders desktop with default theme.
- Switching `document.documentElement.classList` between theme classes visibly changes colors without layout shifts.
- PR includes code comments explaining token names and purpose.
