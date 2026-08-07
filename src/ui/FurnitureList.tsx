import { Armchair, BedDouble, LampFloor, Library, Monitor, Sprout } from 'lucide-react'
import type { FurnitureKind } from '../domain/types'
import { useEditorStore } from '../store/editorStore'

const iconForKind: Partial<Record<FurnitureKind, typeof Armchair>> = {
  bed: BedDouble,
  desk: Monitor,
  chair: Armchair,
  bookcase: Library,
  lounge: Armchair,
  'floor-lamp': LampFloor,
  plant: Sprout,
}

export function FurnitureList() {
  const furniture = useEditorStore((state) => state.furniture)
  const selectedId = useEditorStore((state) => state.selectedId)
  const select = useEditorStore((state) => state.select)

  return (
    <aside className="furniture-list" aria-label="Furniture in room">
      <div className="furniture-list__header">
        <span>Objects</span>
        <span>{furniture.length}</span>
      </div>
      <ul>
        {furniture.map((item) => {
          const Icon = iconForKind[item.kind] ?? Armchair
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`Select ${item.label}`}
                aria-current={selectedId === item.id ? 'true' : undefined}
                onClick={() => select(item.id)}
              >
                <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}