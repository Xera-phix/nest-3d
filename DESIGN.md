# Design System

## Theme

Afterglow is a late-afternoon architectural model: cool daylight on a pale concrete slab, warm oak construction, cobalt planning marks, and a small vermilion action vocabulary. The canvas feels environmental; the controls remain quiet, opaque, and work-focused.

## Color

Use OKLCH tokens throughout.

- Identity / oak: `oklch(0.691 0.146 74.6)`
- Canvas mist: `oklch(0.955 0.008 220)`
- Surface: `oklch(0.985 0.004 220)`
- Ink: `oklch(0.235 0.018 245)`
- Muted ink: `oklch(0.49 0.025 240)`
- Blueprint / selected: `oklch(0.53 0.2 256)`
- Action / warning: `oklch(0.66 0.21 34)`
- Success: `oklch(0.58 0.13 150)`

The honey seed is the product's material identity. Cobalt communicates spatial selection and measurement. Vermilion is reserved for deletion, collision, and decisive feedback.

## Typography

- Product UI: Instrument Sans, 400-650.
- Room and project names: Newsreader, 400-500, used sparingly.
- Dimensions and coordinates: IBM Plex Mono, 400-500.
- Use fixed rem sizes with a compact 1.15 scale. Labels and controls never use the display face.

## Layout

The WebGL canvas is full-bleed. Desktop controls occupy four predictable edges: header at top, tools at left, inspector at right, view switch at bottom. The model remains visually dominant. Tablet moves the inspector into a bottom sheet. Mobile compacts the header and moves tools into a bottom dock while preserving at least 58% of the viewport for the room.

## Components

- Icon buttons are 44 px, square, 6 px radius, with native tooltips and visible focus rings.
- Panels are opaque cool-white with a one-pixel ink tint and restrained shadow. Avoid nested cards.
- Segmented controls communicate mutually exclusive modes with `aria-pressed`.
- Numeric fields use mono values, visible units, and standard input behavior.
- Selected furniture uses a cobalt outline plus floor ring. Collision uses vermilion tint plus status text.
- Status toasts are compact, semantic, and announced through `aria-live`.

## Motion

- Standard UI state transitions: 180 ms exponential ease-out.
- Room-to-Plan camera transition: 1.15 s exponential ease-out with wall cutaway and dimensions.
- Guided tour: interruptible and spatially continuous.
- Reduced motion replaces camera sweeps with a 160 ms crossfade or immediate state change.

## Responsive Breakpoints

- Desktop: above 1100 px.
- Tablet: 720-1099 px.
- Mobile: below 720 px.

## Voice

Use direct spatial language: Room, Plan, Move, Rotate, Reset layout, Export image. Labels name what people see and control. Status copy states the result and next action without apology or promotional language.