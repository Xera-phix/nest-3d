import { Box, PanelsTopLeft } from 'lucide-react'
import type { ViewMode } from '../domain/types'
import { useEditorStore } from '../store/editorStore'

const views: Array<{
  mode: ViewMode
  label: string
  icon: typeof Box
}> = [
  { mode: 'room', label: 'Room view', icon: Box },
  { mode: 'plan', label: 'Plan view', icon: PanelsTopLeft },
]

export function ViewSwitch() {
  const viewMode = useEditorStore((state) => state.viewMode)
  const setViewMode = useEditorStore((state) => state.setViewMode)

  return (
    <div className="view-switch" aria-label="Camera view">
      {views.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={viewMode === mode}
          title={`${label} (V)`}
          onClick={() => setViewMode(mode)}
        >
          <Icon size={16} strokeWidth={1.8} />
          <span>{mode === 'room' ? 'Room' : 'Plan'}</span>
        </button>
      ))}
    </div>
  )
}