import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEditorStore } from '../store/editorStore'

export function TransformController() {
  const selectedId = useEditorStore((state) => state.selectedId)
  const transformMode = useEditorStore((state) => state.transformMode)
  const updatePosition = useEditorStore((state) => state.updatePosition)
  const updateRotation = useEditorStore((state) => state.updateRotation)
  const setTouring = useEditorStore((state) => state.setTouring)
  const scene = useThree((state) => state.scene)
  const invalidate = useThree((state) => state.invalidate)

  if (!selectedId || transformMode === 'select') return null
  const selectedObject = scene.getObjectByName(`furniture-${selectedId}`)
  if (!selectedObject) return null

  const updateFromObject = (commit: boolean) => {
    if (transformMode === 'move') {
      updatePosition(
        selectedId,
        { x: selectedObject.position.x, z: selectedObject.position.z },
        commit,
      )
    } else {
      updateRotation(selectedId, selectedObject.rotation.y, commit)
    }
    invalidate()
  }

  return (
    <TransformControls
      object={selectedObject}
      mode={transformMode === 'move' ? 'translate' : 'rotate'}
      translationSnap={0.05}
      rotationSnap={Math.PI / 12}
      showX={transformMode === 'move'}
      showY={transformMode === 'rotate'}
      showZ={transformMode === 'move'}
      size={0.78}
      onMouseDown={() => setTouring(false)}
      onObjectChange={() => updateFromObject(false)}
      onMouseUp={() => updateFromObject(true)}
    />
  )
}