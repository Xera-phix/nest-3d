import { RoundedBox } from '@react-three/drei'
import { sceneMaterials } from '../materials'

export function DeskModel() {
  return (
    <group>
      <RoundedBox
        args={[1.32, 0.08, 0.58]}
        position={[0, 0.76, 0]}
        radius={0.035}
        castShadow
        receiveShadow
        material={sceneMaterials.oak}
      />
      {[-0.56, 0.56].flatMap((x) =>
        [-0.21, 0.21].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 0.37, z]}
            castShadow
            material={sceneMaterials.graphite}
          >
            <cylinderGeometry args={[0.022, 0.028, 0.72, 10]} />
          </mesh>
        )),
      )}
      <RoundedBox
        args={[0.38, 0.13, 0.44]}
        position={[0.39, 0.65, 0]}
        radius={0.025}
        castShadow
        material={sceneMaterials.darkOak}
      />
      <RoundedBox
        args={[0.5, 0.3, 0.035]}
        position={[-0.16, 1.01, -0.07]}
        radius={0.02}
        castShadow
        material={sceneMaterials.graphite}
      />
      <mesh
        position={[-0.16, 0.87, -0.07]}
        castShadow
        material={sceneMaterials.graphite}
      >
        <cylinderGeometry args={[0.018, 0.025, 0.2, 10]} />
      </mesh>
      <RoundedBox
        args={[0.27, 0.022, 0.15]}
        position={[-0.16, 0.81, 0.02]}
        radius={0.01}
        material={sceneMaterials.graphite}
      />
      <mesh position={[0.16, 0.84, 0]} castShadow material={sceneMaterials.vermilion}>
        <cylinderGeometry args={[0.045, 0.04, 0.12, 16]} />
      </mesh>
    </group>
  )
}

export function ChairModel() {
  return (
    <group>
      <RoundedBox
        args={[0.46, 0.09, 0.45]}
        position={[0, 0.48, 0]}
        radius={0.09}
        castShadow
        material={sceneMaterials.graphite}
      />
      <RoundedBox
        args={[0.44, 0.48, 0.08]}
        position={[0, 0.75, 0.18]}
        rotation={[0.12, 0, 0]}
        radius={0.07}
        castShadow
        material={sceneMaterials.cobalt}
      />
      <mesh position={[0, 0.27, 0]} castShadow material={sceneMaterials.graphite}>
        <cylinderGeometry args={[0.026, 0.036, 0.36, 10]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2
        return (
          <group key={index} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.1, 0.2]}
              rotation={[Math.PI / 2, 0, 0]}
              material={sceneMaterials.graphite}
            >
              <cylinderGeometry args={[0.014, 0.014, 0.38, 8]} />
            </mesh>
            <mesh position={[0, 0.06, 0.38]} material={sceneMaterials.graphite}>
              <sphereGeometry args={[0.036, 10, 8]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}