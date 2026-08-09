import { Edges, Ring } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group, Plane, Vector3 } from 'three'
import type { FurnitureItem } from '../domain/types'
import { useEditorStore } from '../store/editorStore'
import { BedModel } from './models/Bed'
import { PlantModel, SideTableModel } from './models/Decor'
import { FloorLampModel } from './models/Lighting'
import { LoungeModel, RugModel } from './models/Seating'
import { BookcaseModel } from './models/Storage'
import { ChairModel, DeskModel } from './models/Workspace'
import { SCENE_COLORS } from './materials'

const dragPlane = new Plane(new Vector3(0, 1, 0), 0)
const dragPoint = new Vector3()

function setFurnitureDragActive(active: boolean) {
  window.dispatchEvent(
    new CustomEvent('afterglow:furniture-drag', { detail: active }),
  )
}

function Model({ item }: { item: FurnitureItem }) {
  switch (item.kind) {
    case 'bed':
      return <BedModel />
    case 'rug':
      return <RugModel />
    case 'desk':
      return <DeskModel />
    case 'chair':
      return <ChairModel />
    case 'bookcase':
      return <BookcaseModel />
    case 'lounge':
      return <LoungeModel />
    case 'side-table':
      return <SideTableModel />
    case 'floor-lamp':
      return <FloorLampModel />
    case 'plant':
      return <PlantModel />
  }
}

function FurniturePiece({ item }: { item: FurnitureItem }) {
  const groupRef = useRef<Group>(null)
  const dragOffset = useRef(new Vector3())
  const dragging = useRef(false)
  const [hovered, setHovered] = useState(false)
  const selected = useEditorStore((state) => state.selectedId === item.id)
  const transformMode = useEditorStore((state) => state.transformMode)
  const colliding = useEditorStore((state) => state.overlapIds.includes(item.id))
  const select = useEditorStore((state) => state.select)
  const updatePosition = useEditorStore((state) => state.updatePosition)
  const setTouring = useEditorStore((state) => state.setTouring)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    invalidate()
  }, [selected, hovered, colliding, invalidate])

  useEffect(
    () => () => {
      if (dragging.current) {
        setFurnitureDragActive(false)
        document.body.style.cursor = ''
      }
    },
    [],
  )

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    select(item.id)
    setTouring(false)
    if (transformMode === 'rotate') return
    if (!event.ray.intersectPlane(dragPlane, dragPoint)) return

    dragging.current = true
  setFurnitureDragActive(true)
    dragOffset.current.set(
      item.position.x - dragPoint.x,
      0,
      item.position.z - dragPoint.z,
    )
    const pointerTarget = event.nativeEvent.target as Element | null
    pointerTarget?.setPointerCapture(event.pointerId)
    document.body.style.cursor = 'grabbing'
  }

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    event.stopPropagation()
    if (!event.ray.intersectPlane(dragPlane, dragPoint)) return

    updatePosition(
      item.id,
      {
        x: dragPoint.x + dragOffset.current.x,
        z: dragPoint.z + dragOffset.current.z,
      },
      false,
    )
    invalidate()
  }

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    dragging.current = false
    setFurnitureDragActive(false)
    event.stopPropagation()
    const pointerTarget = event.nativeEvent.target as Element | null
    if (pointerTarget?.hasPointerCapture(event.pointerId)) {
      pointerTarget.releasePointerCapture(event.pointerId)
    }
    document.body.style.cursor = hovered ? 'grab' : ''
    const latestItem = useEditorStore
      .getState()
      .furniture.find((entry) => entry.id === item.id)
    if (latestItem) updatePosition(item.id, latestItem.position, true)
    invalidate()
  }

  const outlineColor = colliding
    ? SCENE_COLORS.vermilion
    : SCENE_COLORS.cobalt

  return (
    <group
      ref={groupRef}
      name={`furniture-${item.id}`}
      userData={{ furnitureId: item.id }}
      position={[item.position.x, 0, item.position.z]}
      rotation={[0, item.rotation, 0]}
      scale={item.scale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        if (!dragging.current) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        setHovered(false)
        if (!dragging.current) document.body.style.cursor = ''
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        window.dispatchEvent(
          new CustomEvent('afterglow:focus', { detail: { id: item.id } }),
        )
      }}
    >
      <Model item={item} />
      {(selected || hovered || colliding) && (
        <>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry
              args={[
                item.footprint.width + 0.08,
                item.footprint.depth + 0.08,
              ]}
            />
            <meshBasicMaterial
              color={outlineColor}
              transparent
              opacity={colliding ? 0.14 : selected ? 0.09 : 0.04}
              depthWrite={false}
            />
            <Edges color={outlineColor} lineWidth={selected ? 2 : 1} />
          </mesh>
          {selected && (
            <Ring
              args={[0.12, 0.16, 40]}
              position={[0, 0.055, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshBasicMaterial
                color={outlineColor}
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </Ring>
          )}
        </>
      )}
    </group>
  )
}

export function Furniture() {
  const furniture = useEditorStore((state) => state.furniture)

  return (
    <group>
      {furniture.map((item) => (
        <FurniturePiece key={item.id} item={item} />
      ))}
    </group>
  )
}