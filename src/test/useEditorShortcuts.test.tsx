import { fireEvent, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'
import { useEditorStore } from '../store/editorStore'

function bedPosition() {
  const bed = useEditorStore
    .getState()
    .furniture.find((item) => item.id === 'bed')
  if (!bed) throw new Error('Bed fixture is missing')
  return bed.position
}

describe('useEditorShortcuts', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
    document.body.innerHTML = ''
  })

  it('switches view and transform modes with literal commands', () => {
    renderHook(() => useEditorShortcuts())

    fireEvent.keyDown(window, { key: 'v' })
    expect(useEditorStore.getState().viewMode).toBe('plan')
    fireEvent.keyDown(window, { key: 'w' })
    expect(useEditorStore.getState().transformMode).toBe('move')
    fireEvent.keyDown(window, { key: 'r' })
    expect(useEditorStore.getState().transformMode).toBe('rotate')
  })

  it('nudges the selected item by five centimeters with arrow keys', () => {
    renderHook(() => useEditorShortcuts())
    useEditorStore.getState().select('bed')
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })

    expect(bedPosition()).toEqual({ x: 0.95, z: 0.3 })
  })

  it('uses one-centimeter precision while Shift is held', () => {
    renderHook(() => useEditorShortcuts())
    useEditorStore.getState().select('bed')
    const before = bedPosition()

    fireEvent.keyDown(window, { key: 'ArrowLeft', shiftKey: true })

    expect(bedPosition().x).toBeCloseTo(before.x - 0.01)
  })

  it('rotates, removes, clears, undoes, and redoes the selection', () => {
    renderHook(() => useEditorShortcuts())
    useEditorStore.getState().select('bed')

    fireEvent.keyDown(window, { key: ']' })
    expect(
      useEditorStore.getState().furniture.find((item) => item.id === 'bed')
        ?.rotation,
    ).toBeCloseTo(Math.PI / 12)

    fireEvent.keyDown(window, { key: 'Delete' })
    expect(
      useEditorStore.getState().furniture.some((item) => item.id === 'bed'),
    ).toBe(false)

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(
      useEditorStore.getState().furniture.some((item) => item.id === 'bed'),
    ).toBe(true)

    fireEvent.keyDown(window, {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
    })
    expect(
      useEditorStore.getState().furniture.some((item) => item.id === 'bed'),
    ).toBe(false)

    useEditorStore.getState().select('desk')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useEditorStore.getState().selectedId).toBeNull()
  })

  it('does not intercept commands from editable fields', () => {
    renderHook(() => useEditorShortcuts())
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()

    fireEvent.keyDown(input, { key: 'v' })
    fireEvent.keyDown(input, { key: 'Delete' })

    expect(useEditorStore.getState().viewMode).toBe('room')
    expect(useEditorStore.getState().furniture).toHaveLength(9)
  })
})