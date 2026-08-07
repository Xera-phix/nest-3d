# Afterglow Room Planner

This file is the durable project instruction and session handoff for future
agents. Read it before changing the application. Update it when architecture,
verified behavior, commands, or project status materially changes.

## Session Protocol

At the start of any task-oriented session - any interaction where tools will be
used to produce deliverables - invoke the `task-observer` skill before beginning
work. This keeps reusable workflow observations in `skill-observations/log.md`.

When loading a skill, check the observation log for OPEN observations tagged to
that skill. Apply those insights during the current work even when the skill has
not yet been updated through review.

Do not commit or push unless the user explicitly requests it. Never revert user
changes or unrelated work in a dirty worktree.

## Product

Afterglow is a portfolio-grade 3D room planner for a fixed 4.2 m by 3.4 m studio.
The first screen is the working room, not a landing page. The experience should
feel tactile, precise, calm, and materially rich, like an architect's physical
model rather than a game editor or generic SaaS dashboard.

The target user is a design-conscious renter or homeowner comparing furniture
arrangements before moving anything heavy. The core loop is immediate:

1. Select furniture.
2. Move or rotate it.
3. Compare Room and Plan views.
4. Trust visible dimensions, snapping, bounds, collision warnings, and history.

Canonical product and design references:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/superpowers/specs/2026-08-07-afterglow-room-planner-design.md`
- `docs/superpowers/plans/2026-08-07-afterglow-room-planner.md`

## Current Status

The first release is implemented and verified as of 2026-08-07. All six tasks
and every checklist item in the implementation plan are complete.

Implemented capabilities:

- Full-viewport procedural Three.js room with north and west walls, floor,
  window, door, skirting, datum lines, grid, and dimensions.
- Nine recognizable procedural furniture pieces: bed, rug, desk, task chair,
  bookcase, lounge chair, side table, floor lamp, and plant.
- Accessible DOM furniture list parallel to the WebGL scene.
- Furniture selection, direct floor-plane dragging, transform gizmos, numeric
  inspector fields, snapping, room bounds, collision warnings, duplicate, and
  delete.
- Fifty-snapshot bounded undo/redo history and curated layout reset.
- Perspective Room view and orthographic Plan view with animated camera and wall
  cutaway choreography.
- Interruptible guided tour and double-click furniture focus.
- PNG export with status feedback.
- Responsive desktop, tablet, and mobile editor layouts.
- Reduced-motion and reduced-transparency support.
- Lazy-loaded 3D scene with a real loading state.

## Stack

- React 19, TypeScript 6, Vite 8
- Three.js through React Three Fiber and Drei
- Zustand for editor state
- Lucide for UI icons
- Vitest, jsdom, Testing Library, and user-event
- Playwright with Chromium for real browser interaction and visual QA

Runtime used during implementation:

- Node.js 22.20.0
- npm 10.9.3

## Commands

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 4173
npm run lint
npm test
npm run build
npm run test:e2e
```

Run one focused unit suite with:

```powershell
npm test -- src/test/editorStore.test.ts
```

Run one browser journey with:

```powershell
npx playwright test e2e/room-planner.spec.ts -g "camera orbiting"
```

Generated directories such as `node_modules/`, `dist/`, `test-results/`, and
`playwright-report/` are ignored and must not be committed.

## Verified Baseline

The final release gate completed successfully on 2026-08-07:

- `npm run lint`: clean, zero warnings or errors.
- `npm test`: 6 files and 26 unit/component tests passed.
- `npm run build`: TypeScript and Vite production build passed.
- `npm run test:e2e`: 7 Chromium journeys passed.

The browser suite verifies:

- Visible canvas aspect and WebGL drawing-buffer aspect agree.
- Multiple sampled framebuffer pixels prove the room is nonblank.
- DOM selection exposes the correct inspector.
- Arrow-key nudging changes position and Undo restores it.
- Room/Plan switching completes without page errors.
- Starting Tour from Plan enters Room, remains active, and cancels through a
  view switch.
- Reset restores the curated layout.
- Export downloads `afterglow-layout.png`.
- Real pointer gestures drag furniture and orbit the camera.
- Desktop 1440x900, tablet 1024x768, and mobile 390x844 have no horizontal
  overflow.
- Reduced-motion mode switches views without losing the canvas.

Playwright screenshots are generated under `test-results/` during runs and are
not source artifacts.

## Architecture

### Domain

- `src/domain/types.ts`: serializable furniture and editor types.
- `src/domain/room.ts`: room constants, snapping, clamping, and overlap math.
- `src/domain/catalog.ts`: curated nine-piece starting layout and validation.

Keep spatial math pure and testable. Furniture positions use the X/Z floor
plane; Y is vertical. The room interior is 4.2 m wide, 3.4 m deep, and 2.65 m
high. Rugs are non-collidable; collisions warn but never hard-block movement.

### Store

- `src/store/editorStore.ts`: the single editor store and history boundary.

The store owns furniture, selection, transform mode, view mode, snapping,
overlap IDs, tour state, status, and undo/redo snapshots. Store history only at
committed transform boundaries, never for every pointer frame. Keep snapshots
serializable and capped at 50.

Important tour invariant: `setTouring(true)` atomically enters Room view and
keeps `isTouring` true. Explicit `setViewMode(...)` cancels an active tour.

### Scene

- `src/scene/RoomCanvas.tsx`: renderer, lights, adaptive DPR, lazy scene surface,
  and framebuffer sizing.
- `src/scene/ArchitecturalShell.tsx`: room geometry, grid, dimensions, wall
  cutaway, window, and door.
- `src/scene/Furniture.tsx`: furniture dispatch, selection, hover, drag, and
  collision presentation.
- `src/scene/TransformController.tsx`: Drei transform gizmo integration.
- `src/scene/CameraRig.tsx`: camera ownership, view transitions, focus, orbit,
  and tour timing.
- `src/scene/cameraMath.ts`: pure camera compositions and framing math.
- `src/scene/materials.ts`: shared procedural materials and textures.
- `src/scene/models/*.tsx`: procedural furniture models.

The scene uses `frameloop="demand"`. Any state or camera path that changes
visible pixels must invalidate frames until it settles.

Do not co-locate exported camera math with React components; Fast Refresh lint
requires pure helpers to remain in `cameraMath.ts`.

### UI

- `src/App.tsx`: editor composition and selection-aware responsive state.
- `src/ui/AppHeader.tsx`: identity, history, reset, and export.
- `src/ui/ToolRail.tsx`: Select, Move, Rotate, and Tour.
- `src/ui/FurnitureList.tsx`: accessible object selection.
- `src/ui/Inspector.tsx`: precise transforms and object actions.
- `src/ui/ViewSwitch.tsx`: Room/Plan segmented control.
- `src/ui/StatusToast.tsx`: polite export and error announcements.
- `src/hooks/useEditorShortcuts.ts`: global keyboard routing with editable-field
  protection.

### Tests

- `src/test/*.test.*`: domain, store, camera, shortcuts, and application shell.
- `e2e/room-planner.spec.ts`: WebGL, workflow, pointer, responsive, export, and
  reduced-motion browser coverage.
- `playwright.config.ts`: Chromium and local Vite server configuration.

Vitest explicitly excludes `e2e/**`; Playwright specs must not be discovered by
the unit runner.

## Interaction Contract

Pointer controls:

- Click furniture to select.
- Drag furniture across the floor in Select or Move mode.
- Use the gizmo in Move or Rotate mode for precision.
- Click the floor or press Escape to clear selection.
- Orbit, pan, and zoom when not dragging furniture.
- Double-click furniture to focus the camera.

Keyboard controls:

- `V`: toggle Room/Plan.
- `W`: Move mode.
- `R`: Rotate mode.
- Arrow keys: nudge 5 cm.
- Shift plus Arrow: nudge 1 cm.
- `[` and `]`: rotate 15 degrees.
- `Ctrl/Cmd+Z`: undo.
- `Ctrl/Cmd+Shift+Z`: redo.
- Delete/Backspace: remove selected furniture.
- Escape: clear selection and stop Tour.

## Responsive Contract

- Desktop above 1100 px: top header, left rail/list, right inspector, bottom
  view switch.
- Tablet 720-1099 px: bottom inspector sheet, vertical tool rail.
- Mobile below 720 px: compact header, horizontal object strip until selection,
  scroll-bounded inspector, bottom view switch, and bottom tool dock.

At narrow portrait aspect ratios, Room mode uses an aspect-aware camera and a
low architectural wall cutaway so furniture remains legible. OrbitControls must
allow the longer portrait camera distance. Do not remove those adjustments based
only on desktop screenshots.

## Visual System

Use the established OKLCH palette and local design language from `DESIGN.md`:

- Honey/oak for product identity.
- Cobalt for spatial selection and measurement.
- Vermilion for deletion, collision, and decisive warnings.
- Cool mist canvas, chalk surfaces, and graphite text.

Product UI uses Instrument Sans; project names use Newsreader sparingly;
measurements use IBM Plex Mono. Controls are opaque, compact, 44 px minimum,
and no more than 6 px radius. Avoid nested cards, glassmorphism, decorative
orbs, marketing-page composition, and generic dashboard styling. The room is
the primary interface.

## Hard-Won Implementation Notes

1. CSS canvas dimensions and WebGL drawing-buffer dimensions are separate
   contracts. A canvas can fill the viewport while still rendering at intrinsic
   300x150. Keep the E2E aspect-ratio assertion.
2. React Three Fiber's configured `size` may already match the wrapper before
   the renderer subscription observes a change. `RoomCanvas` synchronizes the
   renderer to the configured size in `onCreated`; preserve this unless a tested
   framework upgrade makes it unnecessary.
3. Demand-render camera deltas must be clamped. Idle time must not count as
   animation time or a tour can jump directly to its final keyframe.
4. Starting Tour from Plan previously cancelled itself because `setViewMode`
   cancels Tour. Tour start now owns the Room-view transition atomically in the
   store.
5. Portrait framing originally failed because OrbitControls clamped the
   responsive camera to the desktop maximum distance and full-height walls
   dominated the viewport. Mobile now combines a bounded camera scale, larger
   orbit limit, and low wall cutaway.
6. Use supported Three.js basic PCF shadows. Do not restore deprecated
   `PCFSoftShadowMap` behavior.
7. Keep the 3D scene lazy-loaded. The normal application chunk is about 214 kB
   minified while the Three.js scene is isolated in a roughly 1.095 MB lazy
   chunk.
8. Parallel file mutations are safe only when target file sets are disjoint.
   Overlapping parallel writes previously concatenated scene source. Serialize
   edits to the same path and compile immediately after broad changes.

## Accessibility and Quality Bar

- Maintain WCAG 2.1 AA contrast for DOM controls and text.
- Preserve keyboard access and the parallel DOM furniture list.
- Keep touch targets at least 44 px.
- Use shape/status text in addition to color for selection and collisions.
- Announce status through `aria-live`.
- Respect reduced motion and reduced transparency.
- Validate text clipping, control overlap, canvas framing, and nonblank WebGL at
  desktop, tablet, and mobile sizes after visual changes.
- For frontend changes, inspect real Chromium screenshots; unit tests alone do
  not validate scene composition.

## Non-Goals for This Release

- Arbitrary wall drawing or nonrectangular rooms.
- Editable room dimensions.
- User-uploaded 3D models.
- Accounts, persistence, collaboration, or cloud saving.
- Automatic layout generation.
- Photorealistic path tracing.

The current boundaries should support editable dimensions or a broader catalog
later, but do not build those systems speculatively.

## Resume Checklist

1. Read this file, `PRODUCT.md`, `DESIGN.md`, and the relevant source/tests.
2. Invoke `task-observer` and scan OPEN observations.
3. Run `git status --short`; preserve unrelated user work.
4. Form one local hypothesis and one focused check before editing.
5. For bug fixes or behavior changes, add the focused test first when practical.
6. After the first edit, run the narrowest executable validation immediately.
7. Before claiming completion, run lint, unit tests, build, and relevant E2E
   journeys. For release-level work, run the full four-command gate.
