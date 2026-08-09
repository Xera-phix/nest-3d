import { create } from 'zustand'
import { INITIAL_FURNITURE } from '../domain/catalog'
import {
  clampPosition,
  findOverlaps,
  normalizeRoomDimensions,
  ROOM,
  snapValue,
} from '../domain/room'
import type {
  EditorStatus,
  FurnitureItem,
  ImageObjectInput,
  Position2D,
  RoomDimensions,
  TransformMode,
  ViewMode,
} from '../domain/types'

const HISTORY_LIMIT = 50
const TRANSLATION_SNAP = 0.05
const ROTATION_SNAP = Math.PI / 12

function cloneFurniture(items: FurnitureItem[]) {
  return items.map((item) => ({
    ...item,
    position: { ...item.position },
    footprint: { ...item.footprint },
  }))
}

function initialFurniture() {
  return cloneFurniture(INITIAL_FURNITURE)
}

function furnitureChanged(first: FurnitureItem[], second: FurnitureItem[]) {
  return JSON.stringify(first) !== JSON.stringify(second)
}

function cloneRoomDimensions(roomDimensions: RoomDimensions) {
  return { ...roomDimensions }
}

interface EditorSnapshot {
  furniture: FurnitureItem[]
  roomDimensions: RoomDimensions
}

function cloneSnapshot(
  roomDimensions: RoomDimensions,
  furniture: FurnitureItem[],
): EditorSnapshot {
  return {
    furniture: cloneFurniture(furniture),
    roomDimensions: cloneRoomDimensions(roomDimensions),
  }
}

function roomDimensionsChanged(
  first: RoomDimensions,
  second: RoomDimensions,
) {
  return (
    first.width !== second.width ||
    first.depth !== second.depth ||
    first.height !== second.height
  )
}

interface EditorStore {
  furniture: FurnitureItem[]
  roomDimensions: RoomDimensions
  selectedId: string | null
  transformMode: TransformMode
  viewMode: ViewMode
  snapEnabled: boolean
  overlapIds: string[]
  isTouring: boolean
  status: EditorStatus | null
  canUndo: boolean
  canRedo: boolean
  past: EditorSnapshot[]
  future: EditorSnapshot[]
  interactionSnapshot: FurnitureItem[] | null
  select: (id: string | null) => void
  setTransformMode: (mode: TransformMode) => void
  setViewMode: (mode: ViewMode) => void
  updateRoomDimensions: (dimensions: RoomDimensions) => void
  updatePosition: (
    id: string,
    position: Position2D,
    commit?: boolean,
  ) => void
  updateRotation: (id: string, radians: number, commit?: boolean) => void
  addImageObject: (input: ImageObjectInput) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  undo: () => void
  redo: () => void
  reset: () => void
  setTouring: (isTouring: boolean) => void
  setStatus: (status: EditorStatus | null) => void
}

function withMutation(
  state: EditorStore,
  furniture: FurnitureItem[],
  selectedId = state.selectedId,
) {
  if (!furnitureChanged(state.furniture, furniture)) return state

  const past = [
    ...state.past,
    cloneSnapshot(state.roomDimensions, state.furniture),
  ].slice(
    -HISTORY_LIMIT,
  )

  return {
    ...state,
    furniture,
    selectedId,
    overlapIds: findOverlaps(furniture),
    past,
    future: [],
    interactionSnapshot: null,
    canUndo: true,
    canRedo: false,
  }
}

function findAvailablePosition(
  item: FurnitureItem,
  furniture: FurnitureItem[],
  roomDimensions: RoomDimensions,
) {
  const xLimit = Math.max(
    0,
    roomDimensions.width / 2 - item.footprint.width / 2,
  )
  const zLimit = Math.max(
    0,
    roomDimensions.depth / 2 - item.footprint.depth / 2,
  )
  const candidates: Position2D[] = []

  for (let x = -xLimit; x <= xLimit + 0.001; x += 0.2) {
    for (let z = -zLimit; z <= zLimit + 0.001; z += 0.2) {
      candidates.push({
        x: Number(x.toFixed(2)),
        z: Number(z.toFixed(2)),
      })
    }
  }
  candidates.push({ x: 0, z: 0 })
  candidates.sort(
    (first, second) =>
      first.x ** 2 + first.z ** 2 - (second.x ** 2 + second.z ** 2),
  )

  for (const position of candidates) {
    const candidate = {
      ...item,
      position: clampPosition(item, position, roomDimensions),
    }
    if (!findOverlaps([...furniture, candidate]).includes(item.id)) {
      return candidate.position
    }
  }

  return clampPosition(item, { x: 0, z: 0 }, roomDimensions)
}

export const useEditorStore = create<EditorStore>((set) => ({
  furniture: initialFurniture(),
  roomDimensions: cloneRoomDimensions(ROOM),
  selectedId: null,
  transformMode: 'select',
  viewMode: 'room',
  snapEnabled: true,
  overlapIds: [],
  isTouring: false,
  status: null,
  canUndo: false,
  canRedo: false,
  past: [],
  future: [],
  interactionSnapshot: null,

  select: (selectedId) => set({ selectedId }),
  setTransformMode: (transformMode) => set({ transformMode }),
  setViewMode: (viewMode) => set({ viewMode, isTouring: false }),
  updateRoomDimensions: (dimensions) =>
    set((state) => {
      const roomDimensions = normalizeRoomDimensions(
        dimensions,
        state.roomDimensions,
      )
      if (!roomDimensionsChanged(state.roomDimensions, roomDimensions)) {
        return state
      }

      const furniture = state.furniture.map((item) => ({
        ...item,
        position: clampPosition(item, item.position, roomDimensions),
      }))
      const past = [
        ...state.past,
        cloneSnapshot(state.roomDimensions, state.furniture),
      ].slice(-HISTORY_LIMIT)

      return {
        ...state,
        roomDimensions,
        furniture,
        overlapIds: findOverlaps(furniture),
        past,
        future: [],
        interactionSnapshot: null,
        canUndo: true,
        canRedo: false,
      }
    }),
  updatePosition: (id, position, commit = true) =>
    set((state) => {
      const item = state.furniture.find((entry) => entry.id === id)
      if (!item) return state

      const snappedPosition = state.snapEnabled
        ? {
            x: snapValue(position.x, TRANSLATION_SNAP),
            z: snapValue(position.z, TRANSLATION_SNAP),
          }
        : position
      const clampedPosition = clampPosition(
        item,
        snappedPosition,
        state.roomDimensions,
      )
      const furniture = state.furniture.map((entry) =>
        entry.id === id ? { ...entry, position: clampedPosition } : entry,
      )

      if (!commit) {
        return {
          ...state,
          furniture,
          overlapIds: findOverlaps(furniture),
          interactionSnapshot:
            state.interactionSnapshot ?? cloneFurniture(state.furniture),
        }
      }

      const historyBase = state.interactionSnapshot ?? state.furniture
      if (!furnitureChanged(historyBase, furniture)) {
        return { ...state, interactionSnapshot: null }
      }
      const past = [
        ...state.past,
        cloneSnapshot(state.roomDimensions, historyBase),
      ].slice(-HISTORY_LIMIT)

      return {
        ...state,
        furniture,
        overlapIds: findOverlaps(furniture),
        past,
        future: [],
        interactionSnapshot: null,
        canUndo: true,
        canRedo: false,
      }
    }),
  updateRotation: (id, radians, commit = true) =>
    set((state) => {
      const item = state.furniture.find((entry) => entry.id === id)
      if (!item) return state
      const rotation = state.snapEnabled
        ? snapValue(radians, ROTATION_SNAP)
        : radians
      const furniture = state.furniture.map((entry) =>
        entry.id === id ? { ...entry, rotation } : entry,
      )

      if (!commit) {
        return {
          ...state,
          furniture,
          interactionSnapshot:
            state.interactionSnapshot ?? cloneFurniture(state.furniture),
        }
      }

      const historyBase = state.interactionSnapshot ?? state.furniture
      if (!furnitureChanged(historyBase, furniture)) {
        return { ...state, interactionSnapshot: null }
      }
      const past = [
        ...state.past,
        cloneSnapshot(state.roomDimensions, historyBase),
      ].slice(-HISTORY_LIMIT)

      return {
        ...state,
        furniture,
        past,
        future: [],
        interactionSnapshot: null,
        canUndo: true,
        canRedo: false,
      }
    }),
  addImageObject: (input) =>
    set((state) => {
      let objectNumber = 1
      while (
        state.furniture.some(
          (item) => item.id === `image-object-${objectNumber}`,
        )
      ) {
        objectNumber += 1
      }

      const measurement = (value: number, maximum: number) =>
        snapValue(
          Math.max(0.1, Math.min(maximum, Number.isFinite(value) ? value : 1)),
          0.05,
        )
      const width = measurement(input.width, state.roomDimensions.width)
      const depth = measurement(input.depth, state.roomDimensions.depth)
      const imageObject: FurnitureItem = {
        id: `image-object-${objectNumber}`,
        kind: 'image-object',
        label: input.label.trim() || `Imported object ${objectNumber}`,
        position: { x: 0, z: 0 },
        rotation: 0,
        footprint: { width, depth },
        scale: 1,
        imageSource: input.imageSource,
        modelHeight: measurement(input.height, state.roomDimensions.height),
      }
      imageObject.position = findAvailablePosition(
        imageObject,
        state.furniture,
        state.roomDimensions,
      )

      return withMutation(
        state,
        [...state.furniture, imageObject],
        imageObject.id,
      )
    }),
  duplicate: (id) =>
    set((state) => {
      const source = state.furniture.find((item) => item.id === id)
      if (!source) return state
      const copyNumber =
        state.furniture.filter((item) => item.id.startsWith(`${id}-copy-`))
          .length + 1
      const copyId = `${id}-copy-${copyNumber}`
      const copy = {
        ...source,
        id: copyId,
        label: `${source.label} copy`,
        position: clampPosition(
          source,
          {
            x: source.position.x + 0.15,
            z: source.position.z + 0.15,
          },
          state.roomDimensions,
        ),
      }

      return withMutation(state, [...state.furniture, copy], copyId)
    }),
  remove: (id) =>
    set((state) => {
      const furniture = state.furniture.filter((item) => item.id !== id)
      return withMutation(
        state,
        furniture,
        state.selectedId === id ? null : state.selectedId,
      )
    }),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1)
      if (!previous) return state
      const past = state.past.slice(0, -1)
      const future = [
        cloneSnapshot(state.roomDimensions, state.furniture),
        ...state.future,
      ].slice(0, HISTORY_LIMIT)
      const furniture = cloneFurniture(previous.furniture)

      return {
        ...state,
        furniture,
        roomDimensions: cloneRoomDimensions(previous.roomDimensions),
        selectedId: furniture.some((item) => item.id === state.selectedId)
          ? state.selectedId
          : null,
        overlapIds: findOverlaps(furniture),
        past,
        future,
        canUndo: past.length > 0,
        canRedo: true,
        interactionSnapshot: null,
      }
    }),
  redo: () =>
    set((state) => {
      const [next, ...future] = state.future
      if (!next) return state
      const past = [
        ...state.past,
        cloneSnapshot(state.roomDimensions, state.furniture),
      ].slice(-HISTORY_LIMIT)
      const furniture = cloneFurniture(next.furniture)

      return {
        ...state,
        furniture,
        roomDimensions: cloneRoomDimensions(next.roomDimensions),
        overlapIds: findOverlaps(furniture),
        past,
        future,
        canUndo: true,
        canRedo: future.length > 0,
        interactionSnapshot: null,
      }
    }),
  reset: () =>
    set({
      furniture: initialFurniture(),
      roomDimensions: cloneRoomDimensions(ROOM),
      selectedId: null,
      transformMode: 'select',
      viewMode: 'room',
      snapEnabled: true,
      overlapIds: [],
      isTouring: false,
      status: null,
      canUndo: false,
      canRedo: false,
      past: [],
      future: [],
      interactionSnapshot: null,
    }),
  setTouring: (isTouring) =>
    set(isTouring ? { isTouring: true, viewMode: 'room' } : { isTouring: false }),
  setStatus: (status) => set({ status }),
}))