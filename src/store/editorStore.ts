import { create } from 'zustand'
import { INITIAL_FURNITURE } from '../domain/catalog'
import { clampPosition, findOverlaps, snapValue } from '../domain/room'
import type {
  EditorStatus,
  FurnitureItem,
  Position2D,
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

interface EditorStore {
  furniture: FurnitureItem[]
  selectedId: string | null
  transformMode: TransformMode
  viewMode: ViewMode
  snapEnabled: boolean
  overlapIds: string[]
  isTouring: boolean
  status: EditorStatus | null
  canUndo: boolean
  canRedo: boolean
  past: FurnitureItem[][]
  future: FurnitureItem[][]
  interactionSnapshot: FurnitureItem[] | null
  select: (id: string | null) => void
  setTransformMode: (mode: TransformMode) => void
  setViewMode: (mode: ViewMode) => void
  updatePosition: (
    id: string,
    position: Position2D,
    commit?: boolean,
  ) => void
  updateRotation: (id: string, radians: number, commit?: boolean) => void
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

  const past = [...state.past, cloneFurniture(state.furniture)].slice(
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

export const useEditorStore = create<EditorStore>((set) => ({
  furniture: initialFurniture(),
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
      const clampedPosition = clampPosition(item, snappedPosition)
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
      const past = [...state.past, cloneFurniture(historyBase)].slice(
        -HISTORY_LIMIT,
      )

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
      const past = [...state.past, cloneFurniture(historyBase)].slice(
        -HISTORY_LIMIT,
      )

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
        position: clampPosition(source, {
          x: source.position.x + 0.15,
          z: source.position.z + 0.15,
        }),
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
      const future = [cloneFurniture(state.furniture), ...state.future].slice(
        0,
        HISTORY_LIMIT,
      )
      const furniture = cloneFurniture(previous)

      return {
        ...state,
        furniture,
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
      const past = [...state.past, cloneFurniture(state.furniture)].slice(
        -HISTORY_LIMIT,
      )
      const furniture = cloneFurniture(next)

      return {
        ...state,
        furniture,
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