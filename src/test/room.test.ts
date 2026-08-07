import { describe, expect, it } from 'vitest'
import type { FurnitureItem } from '../domain/types'
import { clampPosition, findOverlaps, snapValue } from '../domain/room'

const compactItem: FurnitureItem = {
  id: 'compact',
  kind: 'side-table',
  label: 'Compact item',
  position: { x: 0, z: 0 },
  rotation: 0,
  footprint: { width: 1.3, depth: 1.2 },
  scale: 1,
}

function at(
  item: FurnitureItem,
  id: string,
  x: number,
  z: number,
): FurnitureItem {
  return { ...item, id, position: { x, z } }
}

describe('room geometry', () => {
  it('clamps a footprint fully inside the room', () => {
    expect(clampPosition(compactItem, { x: 9, z: -9 })).toEqual({
      x: 1.45,
      z: -1.1,
    })
  })

  it('snaps measurements to the nearest step', () => {
    expect(snapValue(0.137, 0.05)).toBe(0.15)
    expect(snapValue(-0.124, 0.05)).toBe(-0.1)
  })

  it('returns stable unique ids for intersecting footprints', () => {
    const first = at(compactItem, 'first', 0, 0)
    const second = at(compactItem, 'second', 0.5, 0)

    expect(findOverlaps([first, second])).toEqual(['first', 'second'])
  })

  it('returns no ids for separated footprints', () => {
    const first = at(compactItem, 'first', -1, 0)
    const second = at(compactItem, 'second', 1, 0)

    expect(findOverlaps([first, second])).toEqual([])
  })
})