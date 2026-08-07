import type { FurnitureItem, Position2D } from './types'

export const ROOM = {
  width: 4.2,
  depth: 3.4,
  height: 2.65,
} as const

function roundMeasurement(value: number) {
  return Number(value.toFixed(4))
}

export function snapValue(value: number, step: number) {
  if (step <= 0) return value
  return roundMeasurement(Math.round(value / step) * step)
}

export function clampPosition(
  item: FurnitureItem,
  position: Position2D,
): Position2D {
  const xLimit = ROOM.width / 2 - item.footprint.width / 2
  const zLimit = ROOM.depth / 2 - item.footprint.depth / 2

  return {
    x: roundMeasurement(Math.max(-xLimit, Math.min(xLimit, position.x))),
    z: roundMeasurement(Math.max(-zLimit, Math.min(zLimit, position.z))),
  }
}

function intersects(first: FurnitureItem, second: FurnitureItem) {
  const horizontalDistance = Math.abs(first.position.x - second.position.x)
  const verticalDistance = Math.abs(first.position.z - second.position.z)
  const combinedHalfWidth =
    (first.footprint.width + second.footprint.width) / 2
  const combinedHalfDepth =
    (first.footprint.depth + second.footprint.depth) / 2

  return (
    horizontalDistance < combinedHalfWidth &&
    verticalDistance < combinedHalfDepth
  )
}

export function findOverlaps(items: FurnitureItem[]) {
  const overlappingIds = new Set<string>()
  const collidableItems = items.filter((item) => item.collidable !== false)

  for (let firstIndex = 0; firstIndex < collidableItems.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < collidableItems.length;
      secondIndex += 1
    ) {
      const first = collidableItems[firstIndex]
      const second = collidableItems[secondIndex]

      if (intersects(first, second)) {
        overlappingIds.add(first.id)
        overlappingIds.add(second.id)
      }
    }
  }

  return items
    .map(({ id }) => id)
    .filter((id) => overlappingIds.has(id))
}