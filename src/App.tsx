import { lazy, Suspense, useState } from 'react'
import { useEditorShortcuts } from './hooks/useEditorShortcuts'
import { useEditorStore } from './store/editorStore'
import { AppHeader } from './ui/AppHeader'
import { FurnitureList } from './ui/FurnitureList'
import { Inspector } from './ui/Inspector'
import { ImportObjectDialog } from './ui/ImportObjectDialog'
import { StatusToast } from './ui/StatusToast'
import { ToolRail } from './ui/ToolRail'
import { ViewSwitch } from './ui/ViewSwitch'

const RoomCanvas = lazy(async () => {
  const module = await import('./scene/RoomCanvas')
  return { default: module.RoomCanvas }
})

export function App() {
  useEditorShortcuts()
  const [isImportOpen, setIsImportOpen] = useState(false)
  const hasSelection = useEditorStore((state) => state.selectedId !== null)
  const viewMode = useEditorStore((state) => state.viewMode)

  return (
    <main className="app-shell" data-has-selection={hasSelection}>
      <section
        className="scene-layer"
        aria-label="Room workspace"
        data-view-mode={viewMode}
      >
        <Suspense
          fallback={
            <div className="scene-loading" role="status">
              <span aria-hidden="true" />
              Preparing the room
            </div>
          }
        >
          <RoomCanvas />
        </Suspense>
      </section>
      <AppHeader />
      <ToolRail />
      <FurnitureList onAddObject={() => setIsImportOpen(true)} />
      <Inspector />
      <ViewSwitch />
      <StatusToast />
      <ImportObjectDialog
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </main>
  )
}