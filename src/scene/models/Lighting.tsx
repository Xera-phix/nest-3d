import { sceneMaterials } from '../materials'

export function FloorLampModel() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} castShadow material={sceneMaterials.graphite}>
        <cylinderGeometry args={[0.15, 0.18, 0.07, 24]} />
      </mesh>
      <mesh position={[0, 0.84, 0]} castShadow material={sceneMaterials.graphite}>
        <cylinderGeometry args={[0.014, 0.018, 1.62, 10]} />
      </mesh>
      <mesh
        position={[0.13, 1.62, 0]}
        rotation={[0, 0, -Math.PI / 4]}
        castShadow
        material={sceneMaterials.graphite}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.4, 10]} />
      </mesh>
      <mesh
        position={[0.28, 1.78, 0]}
        rotation={[0, 0, Math.PI]}
        castShadow
        material={sceneMaterials.vermilion}
      >
        <coneGeometry args={[0.16, 0.25, 24, 1, true]} />
      </mesh>
      <mesh position={[0.28, 1.66, 0]} material={sceneMaterials.bulb}>
        <sphereGeometry args={[0.055, 16, 12]} />
      </mesh>
      <pointLight
        position={[0.28, 1.65, 0]}
        color="#ffd49a"
        intensity={0.65}
        distance={2.4}
      />
    </group>
  )
}