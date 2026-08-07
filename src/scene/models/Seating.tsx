import { RoundedBox } from '@react-three/drei'
import { sceneMaterials } from '../materials'

export function LoungeModel() {
  return (
    <group>
      <RoundedBox
        args={[0.78, 0.18, 0.74]}
        position={[0, 0.34, 0]}
        radius={0.12}
        castShadow
        material={sceneMaterials.cobalt}
      />
      <RoundedBox
        args={[0.76, 0.58, 0.16]}
        position={[0, 0.68, 0.28]}
        rotation={[0.18, 0, 0]}
        radius={0.12}
        castShadow
        material={sceneMaterials.cobalt}
      />
      {[-0.37, 0.37].map((x) => (
        <RoundedBox
          key={x}
          args={[0.12, 0.28, 0.72]}
          position={[x, 0.48, 0]}
          radius={0.06}
          castShadow
          material={sceneMaterials.cobalt}
        />
      ))}
      <RoundedBox
        args={[0.52, 0.14, 0.16]}
        position={[0, 0.5, -0.2]}
        radius={0.07}
        castShadow
        material={sceneMaterials.vermilion}
      />
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.15, -0.22]} castShadow material={sceneMaterials.oak}>
          <cylinderGeometry args={[0.035, 0.045, 0.3, 10]} />
        </mesh>
      ))}
    </group>
  )
}

export function RugModel() {
  return (
    <RoundedBox
      args={[1.9, 0.026, 1.4]}
      position={[0, 0.018, 0]}
      radius={0.055}
      receiveShadow
      material={sceneMaterials.rug}
    />
  )
}