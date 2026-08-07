# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue

---

## 2026-08-07

- Task 1 checkpoint: no reusable skill observations.

### Observation 1: Parallel writes need disjoint-target assertion

**Status:** OPEN
**Date:** 2026-08-07
**Session context:** Building a procedural React Three Fiber scene with multiple file-edit batches.
**Skill:** New skill candidate: parallel-tool safety
**Type:** open-source
**Phase/Area:** Multi-tool write dispatch

**Issue:** Two nominally parallel edit calls targeted the same newly created files. The editor accepted both and concatenated their contents, producing syntactically corrupted source rather than a clean last-writer result.

**Suggested improvement:** Before dispatching a parallel batch containing mutations, compute each call's target file set and reject or serialize the batch when any paths overlap. Follow the batch with a compile check when writes are broad.

**Principle:** Parallel mutation is safe only when write sets are provably disjoint; target overlap must be treated as a hard serialization boundary.

- Task 3 checkpoint: no additional reusable skill observations.

- Task 4 checkpoint: no additional reusable skill observations.

- Task 5 checkpoint: no additional reusable skill observations.

### Observation 2: Validate WebGL buffer and CSS dimensions separately

**Status:** OPEN
**Date:** 2026-08-07
**Session context:** Responsive visual QA for a full-viewport React Three Fiber editor.
**Skill:** Existing skill candidate: frontend-design visual verification
**Type:** cross-cutting
**Phase/Area:** Browser QA / WebGL rendering

**Issue:** A canvas filled the viewport in CSS while its drawing buffer remained at the intrinsic 300 by 150 pixels. Screenshots still looked plausibly rendered, but the stretched aspect distorted camera framing and could also compromise export resolution and pointer coordinates.

**Suggested improvement:** For canvas applications, pair screenshot and pixel checks with an assertion that drawing-buffer aspect matches the visible client-rect aspect within a small tolerance at every target viewport.

**Principle:** A visually full-size canvas is not necessarily a correctly sized renderer; verify CSS dimensions and drawing-buffer dimensions as separate contracts.

- Task 6 checkpoint: browser behavior, responsive screenshots, real pointer gestures, reduced motion, and release verification complete.