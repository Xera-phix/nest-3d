import { sceneMaterials } from '../materials'

export function SideTableModel() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow material={sceneMaterials.oak}>
        <cylinderGeometry args={[0.21, 0.21, 0.055, 32]} />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow material={sceneMaterials.graphite}>
        <cylinderGeometry args={[0.025, 0.035, 0.48, 12]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow material={sceneMaterials.graphite}>
        <cylinderGeometry args={[0.14, 0.17, 0.04, 24]} />
      </mesh>
      <mesh position={[0.08, 0.58, 0]} castShadow material={sceneMaterials.ceramic}>
        <cylinderGeometry args={[0.04, 0.055, 0.13, 18]} />
      </mesh>
    </group>
  )
}

export function PlantModel() {
  return (
    <group>
      <mesh position={[0, 0.23, 0]} castShadow material={sceneMaterials.ceramic}>
        <cylinderGeometry args={[0.16, 0.2, 0.42, 20]} />
      </mesh>
      {[0, 1, 2].map((stem) => (
        <group key={stem} rotation={[0, (stem / 3) * Math.PI * 2, 0]}>
          <mesh
            position={[0, 0.77 + stem * 0.08, 0]}
            rotation={[0.08, 0, -0.05]}
            castShadow
            material={sceneMaterials.foliage}
          >
            <cylinderGeometry args={[0.012, 0.018, 0.88 + stem * 0.08, 8]} />
          </mesh>
          {[0.65, 0.9, 1.12].map((y, leaf) => (
            <mesh
              key={leaf}
              position={[leaf % 2 ? -0.11 : 0.11, y + stem * 0.08, 0]}
              scale={[1.25, 0.55, 0.3]}
              castShadow
              material={sceneMaterials.foliage}
            >
              <sphereGeometry args={[0.16, 12, 8]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}