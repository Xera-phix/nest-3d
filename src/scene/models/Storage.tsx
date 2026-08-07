import { RoundedBox } from '@react-three/drei'
import { sceneMaterials } from '../materials'

const bookColors = ['#e85f39', '#315eca', '#d2b267', '#55755b', '#d9d5c9']

export function BookcaseModel() {
  return (
    <group>
      {[-0.43, 0.43].map((x) => (
        <RoundedBox
          key={x}
          args={[0.07, 1.72, 0.34]}
          position={[x, 0.86, 0]}
          radius={0.025}
          castShadow
          material={sceneMaterials.darkOak}
        />
      ))}
      {[0.05, 0.47, 0.89, 1.31, 1.69].map((y) => (
        <RoundedBox
          key={y}
          args={[0.93, 0.055, 0.35]}
          position={[0, y, 0]}
          radius={0.018}
          castShadow
          receiveShadow
          material={sceneMaterials.oak}
        />
      ))}
      {Array.from({ length: 13 }, (_, index) => {
        const shelf = Math.floor(index / 5)
        const column = index % 5
        const height = 0.2 + (index % 3) * 0.04
        return (
          <RoundedBox
            key={index}
            args={[0.1, height, 0.21]}
            position={[
              -0.31 + column * 0.15,
              0.08 + shelf * 0.42 + height / 2,
              0.02,
            ]}
            radius={0.01}
            castShadow
          >
            <meshStandardMaterial
              color={bookColors[index % bookColors.length]}
              roughness={0.86}
            />
          </RoundedBox>
        )
      })}
      {[-0.22, 0.22].map((x, index) => (
        <RoundedBox
          key={x}
          args={[0.36, 0.24, 0.27]}
          position={[x, 1.43, 0.01]}
          radius={0.035}
          castShadow
          material={index ? sceneMaterials.ceramic : sceneMaterials.warmTextile}
        />
      ))}
    </group>
  )
}