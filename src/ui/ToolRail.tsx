import { MousePointer2, Move3D, Play, Rotate3D, Square } from 'lucide-react'
import type { TransformMode } from '../domain/types'
import { useEditorStore } from '../store/editorStore'

const tools: Array<{
  mode: TransformMode
  label: string
  shortcut: string
  icon: typeof MousePointer2
}> = [
  { mode: 'select', label: 'Select furniture', shortcut: 'Esc', icon: MousePointer2 },
  { mode: 'move', label: 'Move furniture', shortcut: 'W', icon: Move3D },
  { mode: 'rotate', label: 'Rotate furniture', shortcut: 'R', icon: Rotate3D },
]

export function ToolRail() {
  const transformMode = useEditorStore((state) => state.transformMode)
  const setTransformMode = useEditorStore((state) => state.setTransformMode)
  const isTouring = useEditorStore((state) => state.isTouring)
  const setTouring = useEditorStore((state) => state.setTouring)

  return (
    <nav className="tool-rail" aria-label="Room tools">
      {tools.map(({ mode, label, shortcut, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          className="tool-button"
          aria-label={label}
          aria-pressed={transformMode === mode}
          title={`${label} (${shortcut})`}
          onClick={() => setTransformMode(mode)}
        >
          <Icon size={19} strokeWidth={1.8} />
          <span className="tool-shortcut" aria-hidden="true">
            {shortcut === 'Esc' ? 'S' : shortcut}
          </span>
        </button>
      ))}
      <span className="tool-divider" aria-hidden="true" />
      <button
        type="button"
        className="tool-button tour-button"
        aria-label={isTouring ? 'Stop room tour' : 'Play room tour'}
        aria-pressed={isTouring}
        title={isTouring ? 'Stop room tour' : 'Play room tour'}
        onClick={() => setTouring(!isTouring)}
      >
        {isTouring ? <Square size={17} fill="currentColor" /> : <Play size={18} />}
      </button>
    </nav>
  )
}