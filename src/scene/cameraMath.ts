import { ROOM } from '../domain/room'
import type { FurnitureItem, RoomDimensions } from '../domain/types'

export type VectorTuple = [number, number, number]

interface CameraComposition {
  position: VectorTuple
  target: VectorTuple
}

interface TourKeyframe extends CameraComposition {
  time: number
}

export const ROOM_CAMERA: CameraComposition = {
  position: [5.8, 5.2, 6.4],
  target: [0, 0.55, 0],
}

export const PLAN_CAMERA: CameraComposition = {
  position: [0, 8.6, 0.001],
  target: [0, 0, 0],
}

export function getRoomCamera(
  aspect: number,
  roomDimensions: RoomDimensions = ROOM,
): CameraComposition {
  const portraitScale = Math.min(
    1.25,
    Math.max(1, 0.8 / Math.max(aspect, 0.1)),
  )
  const roomScale = Math.max(
    roomDimensions.width / ROOM.width,
    roomDimensions.depth / ROOM.depth,
    roomDimensions.height / ROOM.height,
  )
  const distanceScale = portraitScale * roomScale
  const target: VectorTuple = [
    0,
    rounded(ROOM_CAMERA.target[1] * (roomDimensions.height / ROOM.height)),
    0,
  ]

  return {
    position: ROOM_CAMERA.position.map((value, index) =>
      rounded(
        target[index] +
          (value - ROOM_CAMERA.target[index]) * distanceScale,
      ),
    ) as VectorTuple,
    target,
  }
}

export const TOUR_KEYFRAMES: TourKeyframe[] = [
  { time: 0, ...ROOM_CAMERA },
  {
    time: 2.6,
    position: [3.25, 2.45, 3.65],
    target: [0.78, 0.48, 0.3],
  },
  {
    time: 5.2,
    position: [-3.35, 2.35, 2.85],
    target: [-1.2, 0.65, -1.05],
  },
  {
    time: 7.8,
    position: [4.7, 5.6, 5.4],
    target: [0, 0.45, 0],
  },
]

function rounded(value: number) {
  return Number(value.toFixed(4))
}

export function getPlanFrustum(
  aspect: number,
  roomDimensions: RoomDimensions = ROOM,
) {
  const minimumWidth = roomDimensions.width + 0.8
  const minimumHeight = roomDimensions.depth + 0.8
  const width = Math.max(minimumWidth, minimumHeight * aspect)
  const height = width / aspect

  return { width: rounded(width), height: rounded(height) }
}

export function focusTargetFor(item: FurnitureItem): VectorTuple {
  return [item.position.x, 0.45, item.position.z]
}