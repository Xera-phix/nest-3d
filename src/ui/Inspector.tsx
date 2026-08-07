import { Copy, Trash2, X } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

function rounded(value: number) {
  return Number(value.toFixed(2))
}

export function Inspector() {
  const furniture = useEditorStore((state) => state.furniture)
  const selectedId = useEditorStore((state) => state.selectedId)
  const overlapIds = useEditorStore((state) => state.overlapIds)
  const select = useEditorStore((state) => state.select)
  const updatePosition = useEditorStore((state) => state.updatePosition)
  const updateRotation = useEditorStore((state) => state.updateRotation)
  const duplicate = useEditorStore((state) => state.duplicate)
  const remove = useEditorStore((state) => state.remove)
  const item = furniture.find((entry) => entry.id === selectedId)

  if (!item) {
    return (
      <aside className="inspector inspector--empty" aria-label="Selection inspector">
        <div className="empty-selection-mark" aria-hidden="true" />
        <p>Select an object</p>
        <span>Click furniture in the room or choose it from Objects.</span>
      </aside>
    )
  }

  const colliding = overlapIds.includes(item.id)

  return (
    <aside className="inspector" aria-label={`${item.label} inspector`}>
      <div className="inspector-heading">
        <div>
          <span className="inspector-kind">{item.kind.replace('-', ' ')}</span>
          <h2>{item.label}</h2>
        </div>
        <button
          className="icon-button icon-button--small"
          type="button"
          aria-label="Close inspector"
          title="Clear selection"
          onClick={() => select(null)}
        >
          <X size={16} />
        </button>
      </div>

      <div className="object-size" aria-label="Furniture dimensions">
        <span>{item.footprint.width.toFixed(2)} m</span>
        <span aria-hidden="true">×</span>
        <span>{item.footprint.depth.toFixed(2)} m</span>
      </div>

      <div className="inspector-section">
        <span className="section-label">Position</span>
        <div className="field-grid">
          <label>
            <span>X</span>
            <input
              aria-label="Position X"
              type="number"
              step="0.05"
              value={rounded(item.position.x)}
              onChange={(event) =>
                updatePosition(
                  item.id,
                  { x: event.currentTarget.valueAsNumber, z: item.position.z },
                  true,
                )
              }
            />
            <span className="field-unit">m</span>
          </label>
          <label>
            <span>Z</span>
            <input
              aria-label="Position Z"
              type="number"
              step="0.05"
              value={rounded(item.position.z)}
              onChange={(event) =>
                updatePosition(
                  item.id,
                  { x: item.position.x, z: event.currentTarget.valueAsNumber },
                  true,
                )
              }
            />
            <span className="field-unit">m</span>
          </label>
        </div>
      </div>

      <div className="inspector-section">
        <span className="section-label">Rotation</span>
        <label className="rotation-field">
          <input
            aria-label="Rotation"
            type="number"
            step="15"
            value={Math.round((item.rotation * 180) / Math.PI)}
            onChange={(event) =>
              updateRotation(
                item.id,
                (event.currentTarget.valueAsNumber * Math.PI) / 180,
                true,
              )
            }
          />
          <span className="field-unit">°</span>
        </label>
      </div>

      {colliding && (
        <p className="collision-warning" role="status">
          This object overlaps another footprint.
        </p>
      )}

      <div className="inspector-actions">
        <button
          type="button"
          className="inspector-action"
          aria-label={`Duplicate ${item.label}`}
          onClick={() => duplicate(item.id)}
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <button
          type="button"
          className="inspector-action inspector-action--danger"
          aria-label={`Delete ${item.label}`}
          onClick={() => remove(item.id)}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </aside>
  )
}