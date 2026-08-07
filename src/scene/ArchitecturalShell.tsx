import { Grid, Line, RoundedBox, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { ROOM } from '../domain/room'
import { useEditorStore } from '../store/editorStore'
import { sceneMaterials, SCENE_COLORS } from './materials'

function DimensionMarks() {
  const widthOffset = ROOM.depth / 2 + 0.25
  const depthOffset = ROOM.width / 2 + 0.25

  return (
    <group position={[0, 0.045, 0]}>
      <Line
        points={[
          [-ROOM.width / 2, 0, widthOffset],
          [ROOM.width / 2, 0, widthOffset],
        ]}
        color={SCENE_COLORS.cobalt}
        lineWidth={1.2}
      />
      <Text
        position={[0, 0.002, widthOffset]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        color="#244598"
      >
        4.20 m
      </Text>
      <Line
        points={[
          [depthOffset, 0, -ROOM.depth / 2],
          [depthOffset, 0, ROOM.depth / 2],
        ]}
        color={SCENE_COLORS.cobalt}
        lineWidth={1.2}
      />
      <Text
        position={[depthOffset, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.13}
        color="#244598"
      >
        3.40 m
      </Text>
      {[-ROOM.width / 2, ROOM.width / 2].map((x) => (
        <Line
          key={`width-${x}`}
          points={[
            [x, 0, widthOffset - 0.07],
            [x, 0, widthOffset + 0.07],
          ]}
          color={SCENE_COLORS.cobalt}
          lineWidth={1}
        />
      ))}
      {[-ROOM.depth / 2, ROOM.depth / 2].map((z) => (
        <Line
          key={`depth-${z}`}
          points={[
            [depthOffset - 0.07, 0, z],
            [depthOffset + 0.07, 0, z],
          ]}
          color={SCENE_COLORS.cobalt}
          lineWidth={1}
        />
      ))}
    </group>
  )
}

function Window() {
  return (
    <group position={[0.65, 1.55, -ROOM.depth / 2 + 0.01]}>
      <RoundedBox
        args={[1.64, 1.18, 0.045]}
        radius={0.025}
        material={sceneMaterials.glass}
      />
      <Line
        points={[
          [-0.82, -0.59, 0.03],
          [0.82, -0.59, 0.03],
          [0.82, 0.59, 0.03],
          [-0.82, 0.59, 0.03],
          [-0.82, -0.59, 0.03],
        ]}
        color={SCENE_COLORS.graphite}
        lineWidth={2}
      />
      <mesh position={[0, 0, 0.035]} material={sceneMaterials.graphite}>
        <boxGeometry args={[0.025, 1.16, 0.025]} />
      </mesh>
      <mesh position={[0, 0, 0.035]} material={sceneMaterials.graphite}>
        <boxGeometry args={[1.62, 0.025, 0.025]} />
      </mesh>
      <RoundedBox
        args={[1.76, 0.07, 0.16]}
        position={[0, -0.63, 0.05]}
        radius={0.022}
        material={sceneMaterials.concrete}
      />
    </group>
  )
}

function Door() {
  return (
    <group
      position={[-ROOM.width / 2 + 0.02, 1.03, -0.72]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <RoundedBox
        args={[0.86, 2.06, 0.055]}
        radius={0.018}
        castShadow
        material={sceneMaterials.oak}
      />
      <mesh position={[0.3, 0, 0.05]} material={sceneMaterials.graphite}>
        <sphereGeometry args={[0.038, 14, 10]} />
      </mesh>
    </group>
  )
}

export function ArchitecturalShell() {
  const wallGroup = useRef<Group>(null)
  const dimensionGroup = useRef<Group>(null)
  const initialized = useRef(false)
  const viewMode = useEditorStore((state) => state.viewMode)
  const select = useEditorStore((state) => state.select)
  const invalidate = useThree((state) => state.invalidate)
  const size = useThree((state) => state.size)
  const roomWallScale = size.width / Math.max(size.height, 1) < 0.8 ? 0.42 : 1

  useFrame((_, delta) => {
    if (!wallGroup.current || !dimensionGroup.current) return
    const wallTarget = viewMode === 'plan' ? 0.055 : roomWallScale
    const dimensionTarget = viewMode === 'plan' ? 1 : 0.001

    if (!initialized.current) {
      wallGroup.current.scale.y = wallTarget
      dimensionGroup.current.scale.setScalar(dimensionTarget)
      dimensionGroup.current.visible = dimensionTarget > 0.01
      initialized.current = true
      return
    }

    const smoothing = 1 - Math.exp(-delta * 8)

    wallGroup.current.scale.y +=
      (wallTarget - wallGroup.current.scale.y) * smoothing
    const dimensionScale =
      dimensionGroup.current.scale.x +
      (dimensionTarget - dimensionGroup.current.scale.x) * smoothing
    dimensionGroup.current.scale.setScalar(dimensionScale)
    dimensionGroup.current.visible = dimensionScale > 0.01

    if (
      Math.abs(wallGroup.current.scale.y - wallTarget) > 0.001 ||
      Math.abs(dimensionScale - dimensionTarget) > 0.001
    ) {
      invalidate()
    }
  })

  return (
    <group>
      <mesh
        receiveShadow
        position={[0, -0.065, 0]}
        material={sceneMaterials.concrete}
        onPointerDown={(event) => {
          event.stopPropagation()
          select(null)
        }}
      >
        <boxGeometry args={[ROOM.width + 0.16, 0.12, ROOM.depth + 0.16]} />
      </mesh>
      <Grid
        args={[ROOM.width, ROOM.depth]}
        position={[0, 0.003, 0]}
        cellSize={0.1}
        cellThickness={0.25}
        cellColor="#aab8bf"
        sectionSize={0.5}
        sectionThickness={0.6}
        sectionColor="#8fa1aa"
        fadeDistance={8}
        fadeStrength={1}
        infiniteGrid={false}
      />

      <group ref={wallGroup}>
        <mesh
          position={[0, ROOM.height / 2, -ROOM.depth / 2 - 0.06]}
          castShadow
          receiveShadow
          material={sceneMaterials.plaster}
        >
          <boxGeometry args={[ROOM.width + 0.12, ROOM.height, 0.12]} />
        </mesh>
        <mesh
          position={[-ROOM.width / 2 - 0.06, ROOM.height / 2, 0]}
          castShadow
          receiveShadow
          material={sceneMaterials.plaster}
        >
          <boxGeometry args={[0.12, ROOM.height, ROOM.depth + 0.12]} />
        </mesh>
        <Window />
        <Door />
        <mesh
          position={[0, 0.065, -ROOM.depth / 2 + 0.02]}
          material={sceneMaterials.concrete}
        >
          <boxGeometry args={[ROOM.width, 0.13, 0.035]} />
        </mesh>
        <mesh
          position={[-ROOM.width / 2 + 0.02, 0.065, 0]}
          material={sceneMaterials.concrete}
        >
          <boxGeometry args={[0.035, 0.13, ROOM.depth]} />
        </mesh>
      </group>

      <group ref={dimensionGroup} scale={0.001} visible={false}>
        <DimensionMarks />
      </group>
      <Line
        points={[
          [-ROOM.width / 2, 0.012, ROOM.depth / 2],
          [ROOM.width / 2, 0.012, ROOM.depth / 2],
          [ROOM.width / 2, 0.012, -ROOM.depth / 2],
        ]}
        color={SCENE_COLORS.graphite}
        opacity={0.5}
        transparent
        lineWidth={1}
      />
    </group>
  )
}