import { RoundedBox, useTexture } from '@react-three/drei'
import type { FurnitureItem } from '../../domain/types'
import { sceneMaterials } from '../materials'

function dimensions(item: FurnitureItem) {
  return {
    width: item.footprint.width,
    depth: item.footprint.depth,
    height: item.modelHeight ?? 1,
  }
}

export function ImportedObjectPlaceholder({ item }: { item: FurnitureItem }) {
  const { width, depth, height } = dimensions(item)

  return (
    <RoundedBox
      args={[width, height, depth]}
      position={[0, height / 2, 0]}
      radius={Math.min(0.06, width / 8, depth / 8)}
      castShadow
      receiveShadow
      material={sceneMaterials.concrete}
    />
  )
}

export function ImportedObjectModel({ item }: { item: FurnitureItem }) {
  const { width, depth, height } = dimensions(item)
  const texture = useTexture(item.imageSource ?? '')
  const image = texture.image as { width?: number; height?: number } | undefined
  const imageAspect =
    image?.width && image?.height ? image.width / image.height : 1
  const availableWidth = width * 0.86
  const availableHeight = height * 0.76
  const displayWidth = Math.min(availableWidth, availableHeight * imageAspect)
  const displayHeight = displayWidth / imageAspect

  return (
    <group>
      <RoundedBox
        args={[width, height, depth]}
        position={[0, height / 2, 0]}
        radius={Math.min(0.06, width / 8, depth / 8)}
        castShadow
        receiveShadow
        material={sceneMaterials.concrete}
      />
      <mesh position={[0, height * 0.54, depth / 2 + 0.006]}>
        <planeGeometry args={[displayWidth, displayHeight]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
