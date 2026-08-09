import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { useEditorStore } from '../store/editorStore'

vi.mock('../scene/RoomCanvas', () => ({
  RoomCanvas: () => (
    <div aria-label="Interactive 3D model of the Afterglow studio" />
  ),
}))

describe('Afterglow editor shell', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('exposes stable editor tools and history boundaries', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Move furniture' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Export image' })).toBeEnabled()
  })

  it('switches between Room and Plan views', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Plan view' }))

    expect(useEditorStore.getState().viewMode).toBe('plan')
    expect(screen.getByRole('button', { name: 'Plan view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('edits room dimensions and updates the project measurement', async () => {
    const user = userEvent.setup()
    render(<App />)

    const width = screen.getByRole('spinbutton', { name: 'Room width' })
    await user.clear(width)
    await user.type(width, '5.5')
    await user.tab()

    expect(useEditorStore.getState().roomDimensions.width).toBe(5.5)
    expect(screen.getByText('5.50 × 3.40 m')).toBeInTheDocument()
  })

  it('selects furniture accessibly and exposes precise inspector controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Select Low platform bed' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Low platform bed' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Position X' })).toHaveValue(
      0.9,
    )
    expect(screen.getByRole('spinbutton', { name: 'Position Z' })).toHaveValue(
      0.35,
    )
    expect(screen.getByRole('spinbutton', { name: 'Rotation' })).toHaveValue(0)
  })

  it('duplicates, deletes, and resets selected furniture', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Select Task chair' }),
    )

    await user.click(screen.getByRole('button', { name: 'Duplicate Task chair' }))
    expect(useEditorStore.getState().furniture).toHaveLength(10)

    await user.click(screen.getByRole('button', { name: /Delete Task chair copy/ }))
    expect(useEditorStore.getState().furniture).toHaveLength(9)

    await user.click(screen.getByRole('button', { name: 'Reset layout' }))
    expect(useEditorStore.getState().selectedId).toBeNull()
    expect(useEditorStore.getState().furniture).toHaveLength(9)
  })
})