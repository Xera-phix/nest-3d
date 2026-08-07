import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_FURNITURE } from '../domain/catalog'
import { useEditorStore } from '../store/editorStore'

function item(id: string) {
  return useEditorStore.getState().furniture.find((entry) => entry.id === id)
}

describe('editor store', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('selects furniture and applies snapped movement', () => {
    useEditorStore.getState().select('bed')
    useEditorStore
      .getState()
      .updatePosition('bed', { x: 0.137, z: 0.261 }, true)

    expect(useEditorStore.getState().selectedId).toBe('bed')
    expect(item('bed')?.position).toEqual({ x: 0.15, z: 0.25 })
  })

  it('snaps rotation to fifteen-degree increments', () => {
    useEditorStore.getState().updateRotation('desk', 0.31, true)

    expect(item('desk')?.rotation).toBeCloseTo(Math.PI / 12)
  })

  it('duplicates with a unique id and selects the copy', () => {
    useEditorStore.getState().duplicate('chair')

    const state = useEditorStore.getState()
    expect(state.furniture).toHaveLength(INITIAL_FURNITURE.length + 1)
    expect(state.selectedId).toMatch(/^chair-copy-/)
    expect(new Set(state.furniture.map(({ id }) => id)).size).toBe(
      state.furniture.length,
    )
  })

  it('restores deletion through undo and reapplies it through redo', () => {
    useEditorStore.getState().remove('bed')
    expect(item('bed')).toBeUndefined()

    useEditorStore.getState().undo()
    expect(item('bed')).toBeDefined()

    useEditorStore.getState().redo()
    expect(item('bed')).toBeUndefined()
  })

  it('reset restores the curated layout and clears history boundaries', () => {
    useEditorStore.getState().remove('rug')
    useEditorStore.getState().reset()

    const state = useEditorStore.getState()
    expect(state.furniture).toEqual(INITIAL_FURNITURE)
    expect(state.selectedId).toBeNull()
    expect(state.canUndo).toBe(false)
    expect(state.canRedo).toBe(false)
  })

  it('starts a tour in room view without cancelling it', () => {
    useEditorStore.getState().setViewMode('plan')
    useEditorStore.getState().setTouring(true)

    expect(useEditorStore.getState().viewMode).toBe('room')
    expect(useEditorStore.getState().isTouring).toBe(true)
  })
})