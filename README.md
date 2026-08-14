# Afterglow Room Planner

Afterglow is an interactive 3D studio planner for comparing furniture layouts
before moving anything heavy. The editor opens directly into a configurable
room and supports precise object transforms, Room and Plan views, history,
collision warnings, image-based object imports, and PNG export.

## MVP features

- Procedural 3D room and nine-piece furniture catalog
- Direct furniture dragging with camera-orbit isolation
- Move, rotate, snap, duplicate, delete, Undo, and Redo controls
- Editable room width, depth, and height
- Perspective Room and orthographic Plan views
- Local PNG, JPEG, or WebP imports and CORS-enabled image URL imports
- Responsive desktop, tablet, and mobile editor layouts
- Guided camera tour and PNG layout export

Imported images are rendered as dimensioned textured proxy objects. They are
not converted into generated 3D meshes. Remote image servers must permit CORS.

## Local development

Use Node.js 22 or newer.

```powershell
npm install
npm run dev -- --host=127.0.0.1 --port=4173
```

Open `http://127.0.0.1:4173/`.

## Verification

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

The browser suite uses Chromium and verifies useful WebGL pixels, canvas
sizing, core planning workflows, direct manipulation, image import, export,
responsive layouts, and reduced-motion behavior.

## Deployment

The repository includes a Vercel configuration for the Vite production build.

```powershell
npx vercel --prod
```