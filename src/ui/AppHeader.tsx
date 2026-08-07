import {
  Camera,
  Cuboid,
  Redo2,
  RotateCcw,
  Undo2,
} from 'lucide-react'
import { downloadCanvas } from '../lib/exportImage'
import { useEditorStore } from '../store/editorStore'

export function AppHeader() {
  const canUndo = useEditorStore((state) => state.canUndo)
  const canRedo = useEditorStore((state) => state.canRedo)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const reset = useEditorStore((state) => state.reset)
  const setStatus = useEditorStore((state) => state.setStatus)

  const exportRoom = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '.room-canvas canvas, canvas.room-canvas',
    )
    if (!canvas) {
      setStatus({ tone: 'error', message: 'The 3D canvas is not ready yet.' })
      return
    }

    try {
      await downloadCanvas(canvas)
      setStatus({ tone: 'success', message: 'Room image exported.' })
    } catch {
      setStatus({ tone: 'error', message: 'The room image could not be created.' })
    }
  }

  return (
    <header className="app-header">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <Cuboid size={20} strokeWidth={1.8} />
        </span>
        <span className="brand-name">Afterglow</span>
      </div>

      <div className="project-title">
        <span>Marlow studio</span>
        <span className="project-measure">4.20 × 3.40 m</span>
      </div>

      <div className="header-actions" aria-label="Project actions">
        <button
          className="icon-button"
          type="button"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 size={18} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 size={18} />
        </button>
        <span className="header-divider" aria-hidden="true" />
        <button
          className="text-button reset-button"
          type="button"
          aria-label="Reset layout"
          title="Restore the curated layout"
          onClick={reset}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
        <button
          className="text-button export-button"
          type="button"
          aria-label="Export image"
          title="Export room image"
          onClick={exportRoom}
        >
          <Camera size={17} />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}