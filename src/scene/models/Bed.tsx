import { RoundedBox } from '@react-three/drei'
import { sceneMaterials } from '../materials'

export function BedModel() {
  return (
    <group>
      <RoundedBox
        args={[1.5, 0.16, 1.94]}
        position={[0, 0.2, 0]}
        radius={0.045}
        castShadow
        receiveShadow
        material={sceneMaterials.darkOak}
      />
      <RoundedBox
        args={[1.42, 0.22, 1.84]}
        position={[0, 0.36, -0.01]}
        radius={0.08}
        castShadow
        receiveShadow
        material={sceneMaterials.textile}
      />
      <RoundedBox
        args={[1.35, 0.12, 1.2]}
        position={[0, 0.53, 0.26]}
        radius={0.075}
        castShadow
        material={sceneMaterials.warmTextile}
      />
      <RoundedBox
        args={[1.5, 0.72, 0.1]}
        position={[0, 0.57, -0.92]}
        radius={0.04}
        castShadow
        material={sceneMaterials.oak}
      />
      {[-0.34, 0.34].map((x) => (
        <RoundedBox
          key={x}
          args={[0.56, 0.13, 0.34]}
          position={[x, 0.59, -0.6]}
          rotation={[-0.04, x * 0.12, 0]}
          radius={0.08}
          castShadow
          material={sceneMaterials.textile}
        />
      ))}
    </group>
  )
}