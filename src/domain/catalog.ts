import type { FurnitureItem } from './types'
import { clampPosition, findOverlaps } from './room'

export const INITIAL_FURNITURE: FurnitureItem[] = [
  {
    id: 'bed',
    kind: 'bed',
    label: 'Low platform bed',
    position: { x: 0.9, z: 0.35 },
    rotation: 0,
    footprint: { width: 1.55, depth: 2 },
    scale: 1,
  },
  {
    id: 'rug',
    kind: 'rug',
    label: 'Woven cobalt rug',
    position: { x: 0.55, z: 0.3 },
    rotation: 0,
    footprint: { width: 1.9, depth: 1.4 },
    scale: 1,
    collidable: false,
  },
  {
    id: 'desk',
    kind: 'desk',
    label: 'Oak writing desk',
    position: { x: -1.2, z: -1.35 },
    rotation: 0,
    footprint: { width: 1.35, depth: 0.62 },
    scale: 1,
  },
  {
    id: 'chair',
    kind: 'chair',
    label: 'Task chair',
    position: { x: -1.2, z: -0.7 },
    rotation: Math.PI,
    footprint: { width: 0.58, depth: 0.58 },
    scale: 1,
  },
  {
    id: 'bookcase',
    kind: 'bookcase',
    label: 'Open bookcase',
    position: { x: -1.55, z: 1.45 },
    rotation: 0,
    footprint: { width: 0.95, depth: 0.36 },
    scale: 1,
  },
  {
    id: 'lounge',
    kind: 'lounge',
    label: 'Cobalt lounge chair',
    position: { x: -0.35, z: 0.65 },
    rotation: -Math.PI / 12,
    footprint: { width: 0.85, depth: 0.9 },
    scale: 1,
  },
  {
    id: 'side-table',
    kind: 'side-table',
    label: 'Round side table',
    position: { x: -0.15, z: 1.4 },
    rotation: 0,
    footprint: { width: 0.42, depth: 0.42 },
    scale: 1,
  },
  {
    id: 'floor-lamp',
    kind: 'floor-lamp',
    label: 'Cantilever floor lamp',
    position: { x: 1.88, z: 1.48 },
    rotation: -Math.PI / 4,
    footprint: { width: 0.34, depth: 0.34 },
    scale: 1,
  },
  {
    id: 'plant',
    kind: 'plant',
    label: 'Fiddle-leaf fig',
    position: { x: -1.8, z: 0.75 },
    rotation: 0,
    footprint: { width: 0.48, depth: 0.48 },
    scale: 1,
  },
]

export function validateFurnitureCatalog(items: FurnitureItem[]) {
  const errors: string[] = []
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()

  for (const item of items) {
    if (seenIds.has(item.id)) duplicateIds.add(item.id)
    seenIds.add(item.id)
  }

  for (const id of duplicateIds) {
    errors.push(`Duplicate furniture id: ${id}`)
  }

  for (const item of items) {
    const clamped = clampPosition(item, item.position)
    if (
      clamped.x !== item.position.x ||
      clamped.z !== item.position.z
    ) {
      errors.push(`Furniture outside room: ${item.id}`)
    }
  }

  for (const id of new Set(findOverlaps(items))) {
    errors.push(`Overlapping furniture: ${id}`)
  }

  return errors
}