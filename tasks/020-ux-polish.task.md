# Task 020: Desktop UX Polish

Goal
- Implement desktop behaviors:
  - Draggable/resizable windows (WindowFrame + TitleBar).
  - Snap-to-grid toggle (8px).
  - Taskbar with clock and start menu button.
  - Keyboard: Ctrl+N (new note), Ctrl+S (save), Alt+Tab (cycle windows), Esc (close focused).

Definition of Done
- Manual check: 3 windows on screen; drag, resize, snap works; start menu toggles; clock updates.
- Minimal lag while dragging (transform-based).
- Add basic tests:
  - Unit: window state reducer (open/close/focus/minimize).
  - Playwright: screenshot of desktop with 3 windows, compare snapshot.
