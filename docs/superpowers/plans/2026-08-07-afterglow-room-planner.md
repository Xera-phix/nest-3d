# Afterglow Room Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive 3D studio planner with movable furniture, precision controls, history, export, and a cinematic Room-to-Plan transition.

**Architecture:** A React application renders a procedural Three.js scene through React Three Fiber. A focused Zustand store owns serializable editor state while pure domain functions handle room bounds, snapping, collision checks, and history-friendly transforms. DOM controls, keyboard commands, and the 3D scene all consume the same store contract.

**Tech Stack:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Motion, Lucide React, Vitest, Testing Library, and Playwright.

## Global Constraints

- The room interior is fixed at 4.2 m wide, 3.4 m deep, and 2.65 m high.
- The first screen is the working room; do not add a marketing page.
- Use procedural local geometry and generated canvas textures; do not depend on remote 3D models.
- Cap renderer DPR at 1.75 and use demand-based rendering while idle.
- Room-to-Plan transition lasts 1.15 seconds with exponential ease-out.
- Reduced motion uses a 160 ms crossfade and immediate wall-state change.
- Desktop is above 1100 px, tablet is 720-1099 px, and mobile is below 720 px.
- Touch targets are at least 44 px and visible body text meets WCAG AA contrast.
- Use Instrument Sans for UI, Newsreader for the room title, and IBM Plex Mono for dimensions.
- Do not commit changes unless the user explicitly requests a commit.

---

## File Map

- `package.json`: scripts and runtime/test dependencies.
- `vite.config.ts`, `tsconfig*.json`, `index.html`: Vite and TypeScript entry configuration.
- `src/main.tsx`, `src/App.tsx`: application bootstrap and top-level error/loading boundaries.
- `src/styles.css`: tokens, responsive shell, component states, reduced-motion rules.
- `src/domain/room.ts`: room constants, clamping, snapping, and overlap calculations.
- `src/domain/catalog.ts`: furniture definitions, footprints, labels, and initial layout.
- `src/domain/types.ts`: shared serializable editor types.
- `src/store/editorStore.ts`: selection, transforms, undo/redo, duplication, deletion, reset, and view state.
- `src/scene/RoomCanvas.tsx`: Canvas configuration, scene composition, and WebGL fallback wiring.
- `src/scene/ArchitecturalShell.tsx`: floor, walls, window, door, skirting, grid, and dimensions.
- `src/scene/Furniture.tsx`: furniture collection, pointer selection, drag behavior, and selection visuals.
- `src/scene/models/*.tsx`: focused procedural models for bed, desk/chair, storage, seating, decor, and lighting.
- `src/scene/materials.ts`: shared authored materials and procedural canvas textures.
- `src/scene/CameraRig.tsx`: perspective/orthographic camera choreography, focus, orbit, and tour.
- `src/scene/TransformController.tsx`: Drei transform controls synchronized with the editor store.
- `src/ui/AppHeader.tsx`: project identity, undo/redo, reset, and export.
- `src/ui/ToolRail.tsx`: Select, Move, Rotate, and Tour controls.
- `src/ui/ViewSwitch.tsx`: Room/Plan segmented control.
- `src/ui/Inspector.tsx`: numeric transform fields and item actions.
- `src/ui/FurnitureList.tsx`: keyboard-accessible parallel DOM list.
- `src/ui/StatusToast.tsx`: export, collision, and transient status announcements.
- `src/hooks/useEditorShortcuts.ts`: global keyboard command routing.
- `src/lib/exportImage.ts`: download the current canvas as a PNG.
- `src/test/*`: Vitest setup and focused domain/store/component tests.
- `e2e/room-planner.spec.ts`, `playwright.config.ts`: browser interaction and responsive visual checks.

---

### Task 1: Foundation, Domain Geometry, and Editor Store

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/domain/types.ts`
- Create: `src/domain/room.ts`
- Create: `src/domain/catalog.ts`
- Create: `src/store/editorStore.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/room.test.ts`
- Create: `src/test/editorStore.test.ts`

**Interfaces:**
- Produces `FurnitureItem`, `FurnitureKind`, `TransformMode`, and `ViewMode` types.
- Produces `ROOM`, `clampPosition(item, position)`, `snapValue(value, step)`, and `findOverlaps(items)`.
- Produces `useEditorStore` with serializable editor state and action methods used by every later task.

- [x] **Step 1: Create the package and toolchain configuration**

Use scripts `dev`, `build`, `lint`, `test`, `test:watch`, and `test:e2e`. Runtime dependencies are `@react-three/drei`, `@react-three/fiber`, `lucide-react`, `motion`, `react`, `react-dom`, `three`, and `zustand`. Development dependencies are current compatible versions of Vite, TypeScript, ESLint, React Testing Library, Vitest, jsdom, and Playwright.

Run:

```powershell
npm install
```

Expected: dependencies install without peer-dependency errors.

- [x] **Step 2: Write failing room-domain tests**

Cover exact behavior:

```ts
expect(clampPosition(bed, { x: 9, z: -9 })).toEqual({ x: 1.45, z: -1.1 })
expect(snapValue(0.137, 0.05)).toBe(0.15)
expect(findOverlaps([bedAtOrigin, deskAtOrigin])).toEqual(['bed', 'desk'])
expect(findOverlaps([bedAtOrigin, deskFarAway])).toEqual([])
```

Run:

```powershell
npm test -- src/test/room.test.ts
```

Expected: FAIL because the domain modules do not exist yet.

- [x] **Step 3: Implement domain types, room math, and curated catalog**

Define:

```ts
export type ViewMode = 'room' | 'plan'
export type TransformMode = 'select' | 'move' | 'rotate'
export type FurnitureKind =
  | 'bed' | 'rug' | 'desk' | 'chair' | 'bookcase'
  | 'lounge' | 'side-table' | 'floor-lamp' | 'plant'

export interface FurnitureItem {
  id: string
  kind: FurnitureKind
  label: string
  position: { x: number; z: number }
  rotation: number
  footprint: { width: number; depth: number }
  scale: number
}
```

`clampPosition` must account for half-footprint size. `findOverlaps` returns stable, unique IDs for axis-aligned footprint intersections. `catalog.ts` exports immutable `INITIAL_FURNITURE` with all nine pieces placed in a composed but nonoverlapping layout.

- [x] **Step 4: Run domain tests**

Run:

```powershell
npm test -- src/test/room.test.ts
```

Expected: PASS.

- [x] **Step 5: Write failing editor-store tests**

Test selection, snapped movement, rotation, duplication with a unique ID, delete/undo, redo, reset, and disabled undo/redo boundaries. Reset the store in `beforeEach`.

```ts
useEditorStore.getState().select('bed')
useEditorStore.getState().updatePosition('bed', { x: 0.137, z: 0.261 })
expect(item('bed').position).toEqual({ x: 0.15, z: 0.25 })

useEditorStore.getState().remove('bed')
useEditorStore.getState().undo()
expect(item('bed')).toBeDefined()
```

Run:

```powershell
npm test -- src/test/editorStore.test.ts
```

Expected: FAIL because the store does not exist.

- [x] **Step 6: Implement the Zustand editor store**

Expose these actions with exact names:

```ts
select(id: string | null): void
setTransformMode(mode: TransformMode): void
setViewMode(mode: ViewMode): void
updatePosition(id: string, position: Position2D, commit?: boolean): void
updateRotation(id: string, radians: number, commit?: boolean): void
duplicate(id: string): void
remove(id: string): void
undo(): void
redo(): void
reset(): void
setTouring(isTouring: boolean): void
setStatus(status: EditorStatus | null): void
```

Store history snapshots only at committed transform boundaries, not every pointer frame. Keep at most 50 snapshots. Derive overlap IDs after every furniture mutation.

- [x] **Step 7: Run the foundation test suite and typecheck**

Run:

```powershell
npm test -- src/test/room.test.ts src/test/editorStore.test.ts
npm run build
```

Expected: all tests pass and TypeScript emits no errors.

---

### Task 2: Procedural Room and Furniture Scene

**Files:**
- Create: `src/scene/materials.ts`
- Create: `src/scene/ArchitecturalShell.tsx`
- Create: `src/scene/Furniture.tsx`
- Create: `src/scene/models/Bed.tsx`
- Create: `src/scene/models/Workspace.tsx`
- Create: `src/scene/models/Storage.tsx`
- Create: `src/scene/models/Seating.tsx`
- Create: `src/scene/models/Decor.tsx`
- Create: `src/scene/models/Lighting.tsx`
- Create: `src/scene/RoomCanvas.tsx`
- Create: `src/test/catalog.test.ts`

**Interfaces:**
- Consumes `INITIAL_FURNITURE`, `FurnitureItem`, `ROOM`, and `useEditorStore`.
- Produces `<RoomCanvas />`, the full-screen render surface later wrapped by the product UI.
- Produces model components accepting `{ item: FurnitureItem; selected: boolean; hovered: boolean }`.

- [x] **Step 1: Write failing catalog integrity tests**

Assert nine unique IDs, known footprint dimensions, positions inside the room, and no initial overlaps.

Run:

```powershell
npm test -- src/test/catalog.test.ts
```

Expected: FAIL until any catalog errors from Task 1 are corrected.

- [x] **Step 2: Implement shared procedural materials**

Create reusable `MeshStandardMaterial` instances for chalk plaster, concrete, oak, graphite metal, cobalt fabric, vermilion accents, foliage, ceramic, and translucent glass. Generate oak grain and rug weave with `CanvasTexture`; set color space and anisotropy correctly. Do not allocate materials inside render loops.

- [x] **Step 3: Implement the architectural shell**

Render a 4.2 m by 3.4 m floor slab, north and west walls, skirting, a framed north-wall window, and a west-wall door. Use a soft blueprint grid and edge datum lines. In Plan mode, animate wall height from 2.65 m to 0.12 m and display dimension lines labeled `4.20 m` and `3.40 m`.

- [x] **Step 4: Implement detailed furniture models**

Build recognizable models from softened boxes, cylinders, lathed forms, and instanced repeated parts:

- Bed: frame, mattress, duvet fold, two pillows, and headboard.
- Desk/chair: oak top, steel legs, drawer, monitor, task chair seat/back/casters.
- Bookcase: frame, shelves, varied book blocks, and two storage boxes.
- Lounge: curved-looking cushions assembled from rounded boxes, oak feet, and bolster.
- Side table/decor: table, ceramic planter, stems/leaves, and small objects.
- Floor lamp: weighted base, stem, angled arm, shade, and emissive bulb.

Keep dimensions tied to item footprints so selection and collision behavior remain credible.

- [x] **Step 5: Implement furniture selection and direct dragging**

In `Furniture.tsx`, stop pointer propagation, select on pointer-down, and drag against a horizontal plane while pointer capture is active. Set `document.body.style.cursor` to `grabbing` only during drag and restore it on release/unmount. Call `updatePosition(..., false)` during movement and once with `commit: true` on release.

- [x] **Step 6: Configure the Canvas and lighting**

Use:

```tsx
<Canvas
  frameloop="demand"
  dpr={[1, 1.75]}
  shadows
  gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
  camera={{ position: [5.8, 5.2, 6.4], fov: 38, near: 0.1, far: 100 }}
>
```

Add a late-afternoon key light through the window, broad fill, hemisphere light, contact shadows, and soft fog. Use `PerformanceMonitor` to lower DPR on stressed devices. Clicking the floor clears selection.

- [x] **Step 7: Validate scene compilation and catalog**

Run:

```powershell
npm test -- src/test/catalog.test.ts
npm run build
```

Expected: tests and production build pass.

---

### Task 3: Precision Transform Controls and Keyboard Input

**Files:**
- Create: `src/scene/TransformController.tsx`
- Create: `src/hooks/useEditorShortcuts.ts`
- Create: `src/test/useEditorShortcuts.test.tsx`
- Modify: `src/scene/RoomCanvas.tsx`

**Interfaces:**
- Consumes the selected item and transform actions from `useEditorStore`.
- Produces `<TransformController />` and `useEditorShortcuts()`.

- [x] **Step 1: Write failing shortcut tests**

Render a harness that calls `useEditorShortcuts()`. Verify `V`, `W`, `R`, arrows, brackets, Delete, Escape, `Ctrl+Z`, and `Ctrl+Shift+Z`. Verify shortcuts do not fire while an input or textarea is focused.

Run:

```powershell
npm test -- src/test/useEditorShortcuts.test.tsx
```

Expected: FAIL because the hook does not exist.

- [x] **Step 2: Implement keyboard command routing**

Use a single `keydown` listener installed by the hook and clean it up on unmount. Shift changes arrow nudge from 0.05 m to 0.01 m. Brackets rotate by `Math.PI / 12`. Prevent browser defaults only for handled commands.

- [x] **Step 3: Implement Drei transform controls**

Attach `TransformControls` to the selected furniture group in Move or Rotate mode. Restrict translation to X/Z and rotation to Y. Use 0.05 m translation snap and 15-degree rotation snap. Disable orbit controls while the gizmo is active. Commit one history snapshot when dragging ends.

- [x] **Step 4: Run shortcut tests and build**

Run:

```powershell
npm test -- src/test/useEditorShortcuts.test.tsx
npm run build
```

Expected: PASS.

---

### Task 4: Camera Choreography and Guided Tour

**Files:**
- Create: `src/scene/CameraRig.tsx`
- Create: `src/test/cameraTargets.test.ts`
- Modify: `src/scene/RoomCanvas.tsx`
- Modify: `src/domain/types.ts`

**Interfaces:**
- Produces `ROOM_CAMERA`, `PLAN_CAMERA`, `focusTargetFor(item)`, and `<CameraRig />`.
- Consumes `viewMode`, `isTouring`, and selection from `useEditorStore`.

- [x] **Step 1: Write failing camera-target tests**

Verify room and plan targets frame all room corners, focus targets offset above item centers, and tour keyframes remain inside safe camera bounds.

Run:

```powershell
npm test -- src/test/cameraTargets.test.ts
```

Expected: FAIL because camera targets are undefined.

- [x] **Step 2: Implement projection-aware camera interpolation**

Mount perspective and orthographic cameras. Animate position, quaternion, target, field of view/zoom, and blend progress with a 1.15-second exponential ease-out. Switch the active camera near midpoint only after matching apparent scale to avoid a visible jump. Write transition progress to a ref consumed by the architectural shell for wall and dimension animation.

- [x] **Step 3: Implement orbit and focus behavior**

Use damped `OrbitControls` with bounded polar angles and distances. Double-clicking furniture sets a focus request; animate the orbit target and camera to frame its footprint. Any orbit, wheel, drag, or view switch cancels Tour.

- [x] **Step 4: Implement the guided tour**

Run four deterministic keyframes: overview, sleeping zone, work zone, and plan. Provide pause-free movement with short dwells and an immediate Escape path. In reduced-motion mode, jump between compositions with 160 ms crossfades.

- [x] **Step 5: Run camera tests and build**

Run:

```powershell
npm test -- src/test/cameraTargets.test.ts
npm run build
```

Expected: PASS.

---

### Task 5: Product UI, Inspector, Export, and Responsive Layout

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/ui/AppHeader.tsx`
- Create: `src/ui/ToolRail.tsx`
- Create: `src/ui/ViewSwitch.tsx`
- Create: `src/ui/Inspector.tsx`
- Create: `src/ui/FurnitureList.tsx`
- Create: `src/ui/StatusToast.tsx`
- Create: `src/lib/exportImage.ts`
- Create: `src/test/App.test.tsx`

**Interfaces:**
- Consumes `<RoomCanvas />`, `useEditorStore`, and `useEditorShortcuts()`.
- Produces the complete responsive editor shell and `downloadCanvas(canvas, filename)`.

- [x] **Step 1: Write failing application-shell tests**

Mock `RoomCanvas` and verify:

```ts
expect(screen.getByRole('button', { name: 'Move furniture' })).toBeEnabled()
expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
await user.click(screen.getByRole('button', { name: 'Plan view' }))
expect(useEditorStore.getState().viewMode).toBe('plan')
```

Also verify selecting `bed` shows numeric X/Z/rotation fields, duplicate/delete actions, and the accessible furniture list.

Run:

```powershell
npm test -- src/test/App.test.tsx
```

Expected: FAIL because the shell does not exist.

- [x] **Step 2: Implement the editor shell and token system**

Define OKLCH tokens from the design spec, semantic z-index layers, 44 px controls, visible focus rings, 6 px maximum radii, and stable dimensions. Import the three specified fonts with fallbacks. The canvas remains full-bleed; controls float in reserved screen zones without framing the scene inside a card.

- [x] **Step 3: Implement header, tools, and view switch**

Use Lucide icons for undo, redo, image export, reset, pointer, move, rotate, play, cube, and plan. Every icon button has an `aria-label` and native tooltip. The Room/Plan control is a labeled segmented control. Disable history actions at boundaries.

- [x] **Step 4: Implement the inspector and furniture list**

Show item label, dimensions, X, Z, and degrees. Commit typed positions through room clamping and typed rotation through snapping. Include duplicate and delete commands. Keep the furniture list visually compact but available to keyboard and screen-reader users; the selected row uses `aria-current="true"`.

- [x] **Step 5: Implement export and status feedback**

`downloadCanvas` calls `toBlob`, creates a temporary object URL, triggers `afterglow-layout.png`, revokes the URL, and returns a promise. Success and failure write concise status messages to an `aria-live="polite"` toast. Do not hide the canvas controls in the exported image because only WebGL pixels are exported.

- [x] **Step 6: Implement responsive and reduced-motion behavior**

At tablet size, move Inspector to a bottom sheet. Below 720 px, move tools into a fixed bottom dock, compact the header, retain at least 58% canvas height, and make the inspector a bounded bottom sheet. Add `prefers-reduced-motion` and `prefers-reduced-transparency` rules. Ensure project-title truncation and label wrapping cannot resize controls.

- [x] **Step 7: Run component tests and full verification**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and the production bundle builds.

---

### Task 6: Browser Interaction, Visual QA, and Final Polish

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/room-planner.spec.ts`
- Modify: scene or UI files only where browser evidence identifies a defect.

**Interfaces:**
- Consumes the completed application through the Vite preview server.
- Produces reproducible desktop/mobile browser checks and screenshot artifacts.

- [x] **Step 1: Write browser tests for critical flows**

Cover:

- Canvas becomes nonblank by sampling multiple pixels.
- Bed can be selected from the DOM list and its inspector appears.
- Arrow-key nudging changes the X field.
- Room/Plan switch updates pressed state and completes without a page error.
- Undo restores the prior X value.
- Reset restores the initial value.
- Export triggers a PNG download.
- No horizontal overflow at 1440x900, 1024x768, or 390x844.

- [x] **Step 2: Install the Playwright browser and run E2E tests**

Run:

```powershell
npx playwright install chromium
npm run test:e2e
```

Expected: all critical-flow tests pass in Chromium.

- [x] **Step 3: Start the development server for visual inspection**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL and remains running for browser inspection.

- [x] **Step 4: Capture and inspect responsive screenshots**

Capture Room and Plan at 1440x900, tablet at 1024x768, and mobile at 390x844. Check scene framing, contact shadows, material legibility, wall cutaway, dimension labels, control overlap, text clipping, and furniture recognizability.

- [x] **Step 5: Test real pointer interaction and motion**

Drag furniture, orbit the scene, switch views during Tour, and verify Tour cancels cleanly. Confirm selected/hover/collision states remain distinct. In reduced-motion emulation, verify no sweeping camera movement occurs.

- [x] **Step 6: Apply one evidence-driven polish pass**

Only change issues visible in screenshots or browser behavior. Prioritize scene framing, overlapping UI, illegible materials, low contrast, jank, and touch ergonomics. Do not add decorative effects merely to make the scene busier.

- [x] **Step 7: Run final verification**

Run:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected: all unit, component, build, and browser checks pass. Leave the development server running and report its URL.