import { describe, expect, it } from 'vitest'
import { INITIAL_FURNITURE } from '../domain/catalog'
import {
  PLAN_CAMERA,
  ROOM_CAMERA,
  TOUR_KEYFRAMES,
  focusTargetFor,
  getPlanFrustum,
  getRoomCamera,
} from '../scene/cameraMath'

describe('camera compositions', () => {
  it('frames the full room in plan view at wide and narrow aspects', () => {
    expect(getPlanFrustum(16 / 9)).toEqual({
      width: 7.4667,
      height: 4.2,
    })
    expect(getPlanFrustum(390 / 844)).toEqual({
      width: 5,
      height: 10.8205,
    })
  })

  it('uses distinct room and top-down camera compositions', () => {
    expect(ROOM_CAMERA.position).toEqual([5.8, 5.2, 6.4])
    expect(ROOM_CAMERA.target).toEqual([0, 0.55, 0])
    expect(PLAN_CAMERA.position).toEqual([0, 8.6, 0.001])
    expect(PLAN_CAMERA.target).toEqual([0, 0, 0])
  })

  it('pulls the room camera back for narrow mobile framing', () => {
    expect(getRoomCamera(16 / 9)).toEqual(ROOM_CAMERA)
    expect(getRoomCamera(390 / 844)).toEqual({
      position: [7.25, 6.3625, 8],
      target: [0, 0.55, 0],
    })
  })

  it('expands room and plan framing for larger dimensions', () => {
    const largerRoom = { width: 6, depth: 4, height: 3 }
    const roomCamera = getRoomCamera(16 / 9, largerRoom)

    expect(roomCamera.position[0]).toBeGreaterThan(ROOM_CAMERA.position[0])
    expect(roomCamera.position[2]).toBeGreaterThan(ROOM_CAMERA.position[2])
    expect(getPlanFrustum(16 / 9, largerRoom)).toEqual({
      width: 8.5333,
      height: 4.8,
    })
  })

  it('focuses above the selected furniture center', () => {
    const bed = INITIAL_FURNITURE.find((item) => item.id === 'bed')
    if (!bed) throw new Error('Bed fixture is missing')

    expect(focusTargetFor(bed)).toEqual([0.9, 0.45, 0.35])
  })

  it('keeps guided-tour keyframes ordered and above the room', () => {
    expect(TOUR_KEYFRAMES.map(({ time }) => time)).toEqual([0, 2.6, 5.2, 7.8])
    expect(
      TOUR_KEYFRAMES.every(({ position }) => position[1] > 1),
    ).toBe(true)
  })
})