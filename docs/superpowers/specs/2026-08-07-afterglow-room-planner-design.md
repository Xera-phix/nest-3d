# Afterglow Room Planner Design

## Product

Afterglow is a portfolio-grade spatial planning tool for arranging a fixed 4.2 m by 3.4 m studio. Its first screen is the working room, not a marketing page. The experience should feel like an architect's physical model brought to life: tactile, precise, warm, and unusually calm for a 3D editor.

The first release prioritizes one excellent room over a general floor-plan engine. Room dimensions are visible but fixed. Furniture can be selected, moved, rotated, duplicated, removed, and restored to the curated starting layout.

## Audience and Job

The primary user is a design-conscious renter or homeowner trying arrangements before moving furniture. Their main job is to compare a few layouts quickly while retaining enough numeric feedback to trust the result.

## Technical Approach

Use React, TypeScript, Vite, React Three Fiber, Drei, Three.js, Zustand, and Motion. Procedural geometry keeps the project self-contained and avoids fragile remote model dependencies. Furniture models should be assembled from softened primitives with authored materials, proportions, and small construction details.

The scene owns rendering, ray casting, camera choreography, object transforms, shadows, and environment lighting. The application store owns furniture state, selection, view mode, transform mode, snapping, history, and the short guided-tour state. DOM controls read from and dispatch to the same store.

## Spatial Model

- Room interior: 4.2 m wide, 3.4 m deep, 2.65 m high.
- Open viewing sides: south and east walls are represented only by floor-edge datum lines.
- Architectural shell: north and west walls, floor slab, north-wall window, west-wall door and frame, skirting, and dimension marks.
- Starting furniture: bed, rug, desk, chair, bookcase, lounge chair, side table, floor lamp, and plant.
- Movable bounds are derived from each item's footprint and clamped within the room.
- Translation uses the X/Z floor plane. Rotation is around Y in 15-degree increments when snapping is enabled.
- Collisions are communicated as a warning tint and status message but do not hard-block exploration.

## Core Interaction

The canvas fills the viewport. A restrained header contains the product name, project title, undo, redo, and export. A left rail switches between Select, Move, Rotate, and Tour. A bottom view switch toggles Room and Plan. Selecting an item opens a compact inspector on the right with dimensions, position, rotation, duplicate, and delete.

Pointer behavior:

- Click furniture to select it.
- Drag selected furniture across the floor in Select or Move mode.
- Use the transform gizmo in Move or Rotate mode for precision.
- Click empty floor or press Escape to clear selection.
- Orbit, pan, and zoom when not dragging an object.
- Double-click an item to focus the camera on it.

Keyboard behavior:

- `V` toggles Room and Plan.
- `W` selects Move and `R` selects Rotate.
- Arrow keys nudge the selected item by 5 cm, or 1 cm while Shift is held.
- `[` and `]` rotate the selected item by 15 degrees.
- `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` undo and redo.
- `Delete` removes the selected item.
- `Escape` clears selection or exits Tour.

## Camera and Signature Transition

Room mode uses a perspective camera in a three-quarter axonometric composition. Plan mode uses an orthographic camera directly above the room. The view transition lasts 1.15 seconds with an exponential ease-out:

1. The perspective camera lifts and rotates toward the room center.
2. The visible walls lower to datum height between 20% and 70% progress.
3. The projection crossfades to the orthographic camera around the midpoint.
4. Dimension lines draw in and labels settle during the last 35%.
5. Furniture materials flatten slightly in Plan mode to improve footprint legibility.

Reduced-motion mode replaces the sweep with a 160 ms crossfade and immediate wall state change.

Tour mode is a short, interruptible camera sequence: room reveal, bed/rug composition, work corner, then plan view. Any pointer drag, wheel, Escape, or view-switch action cancels it.

## Visual Direction

Physical scene: a renter uses the planner on a bright laptop beside a window in late afternoon, wanting the calm confidence of an architecture studio rather than a game editor.

Color strategy is a full palette with disciplined roles:

- `canvas`: neutral mist, `oklch(0.955 0.008 220)`.
- `wall`: chalk, `oklch(0.975 0.006 220)`.
- `ink`: graphite, `oklch(0.235 0.018 245)`.
- `blueprint`: cobalt, `oklch(0.53 0.2 256)`.
- `action`: vermilion, `oklch(0.66 0.21 34)`.
- `oak`: honey wood, `oklch(0.72 0.09 70)`.

Use Instrument Sans for product UI and labels, Newsreader for the project title and room name, and IBM Plex Mono for dimensions. Typography remains compact inside controls; the room itself is the visual hero.

The canvas background uses a subtle technical paper grid and soft radial illumination. UI surfaces are opaque or nearly opaque; blur is reserved for the camera-transition scrim and is not a general card treatment. Corners are 6 px or less.

## Component States

Every icon control has default, hover, active, focus-visible, and disabled states with a tooltip. Active transform modes use cobalt; destructive actions use vermilion only on hover or confirmation. Selected furniture receives a thin cobalt outline and a soft floor contact ring. Hover receives only an outline, preserving selected-state priority.

Loading shows the architectural shell immediately and a small progress label while scene assets initialize. Since geometry is local, this state should be brief. WebGL failure shows a clear explanation and a reload action rather than a blank canvas.

An empty furniture state keeps the room visible and offers Reset layout. Export success is announced in a compact status toast. Invalid collisions are announced through an `aria-live` region and visual footprint tint.

## Responsive Behavior

- Desktop above 1100 px: header, left tool rail, right inspector, bottom view switch.
- Tablet from 720 px to 1099 px: inspector becomes a bottom sheet; tool rail remains vertical.
- Mobile below 720 px: header becomes a compact top bar, tools become a bottom dock, inspector is a draggable-height bottom sheet, and the canvas retains at least 58% of viewport height.
- Touch supports one-finger object drag and two-finger orbit/zoom. Controls remain at least 44 px.
- Long labels wrap; project title truncates. No control changes size when its state changes.

## Accessibility

The canvas has a descriptive label and a parallel DOM furniture list for selecting items by keyboard. Tooltips do not contain essential information. Focus order is header, tools, furniture list, inspector, view switch. Status changes are announced politely. Contrast meets WCAG AA. Reduced motion and reduced transparency are respected.

## Performance

Target a stable 60 fps on a recent laptop and 30 fps on a midrange phone. Cap DPR at 1.75, use on-demand rendering while idle, share materials and geometry where possible, keep shadow casters deliberate, and avoid post-processing that materially softens the scene. High-quality contact shadows and baked-looking procedural materials take priority over bloom.

## Validation

- Unit-test store actions, history behavior, room clamping, snapping, and overlap detection.
- Component-test tool state, keyboard shortcuts, inspector inputs, and view switching.
- Use Playwright at desktop and mobile sizes for selection, dragging, camera switching, reset, and export.
- Capture screenshots in Room and Plan modes and verify canvas pixels are nonblank.
- Confirm no UI overlap at 1440x900, 1024x768, and 390x844.
- Verify reduced-motion behavior and keyboard-only selection.

## Non-Goals for First Release

- Arbitrary wall drawing or nonrectangular rooms.
- User-uploaded 3D models.
- Photorealistic path tracing.
- Accounts, cloud saving, or collaboration.
- Automatic layout generation.

The state model and scene boundaries should leave room for editable dimensions and a furniture catalog later without building those systems prematurely.