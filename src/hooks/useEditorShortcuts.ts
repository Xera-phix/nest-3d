import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

function nudgeSelected(x: number, z: number, precision: boolean) {
  const state = useEditorStore.getState()
  const selected = state.furniture.find((item) => item.id === state.selectedId)
  if (!selected) return

  const previousSnap = state.snapEnabled
  if (precision) useEditorStore.setState({ snapEnabled: false })
  useEditorStore.getState().updatePosition(
    selected.id,
    {
      x: selected.position.x + x,
      z: selected.position.z + z,
    },
    true,
  )
  if (precision) useEditorStore.setState({ snapEnabled: previousSnap })
}

export function useEditorShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      const key = event.key.toLowerCase()
      const commandModifier = event.ctrlKey || event.metaKey
      const state = useEditorStore.getState()

      if (commandModifier && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) state.redo()
        else state.undo()
        return
      }

      if (key === 'v') {
        event.preventDefault()
        state.setViewMode(state.viewMode === 'room' ? 'plan' : 'room')
        return
      }
      if (key === 'w') {
        event.preventDefault()
        state.setTransformMode('move')
        return
      }
      if (key === 'r') {
        event.preventDefault()
        state.setTransformMode('rotate')
        return
      }
      if (key === 'escape') {
        event.preventDefault()
        state.setTouring(false)
        state.select(null)
        return
      }
      if (key === 'delete' || key === 'backspace') {
        if (!state.selectedId) return
        event.preventDefault()
        state.remove(state.selectedId)
        return
      }

      const nudge = event.shiftKey ? 0.01 : 0.05
      if (key === 'arrowleft') nudgeSelected(-nudge, 0, event.shiftKey)
      else if (key === 'arrowright') nudgeSelected(nudge, 0, event.shiftKey)
      else if (key === 'arrowup') nudgeSelected(0, -nudge, event.shiftKey)
      else if (key === 'arrowdown') nudgeSelected(0, nudge, event.shiftKey)
      else if ((key === '[' || key === ']') && state.selectedId) {
        const selected = state.furniture.find(
          (item) => item.id === state.selectedId,
        )
        if (selected) {
          state.updateRotation(
            selected.id,
            selected.rotation + (key === ']' ? Math.PI / 12 : -Math.PI / 12),
            true,
          )
        }
      } else return

      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}