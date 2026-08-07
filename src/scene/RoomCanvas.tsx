import { ContactShadows, PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { ArchitecturalShell } from './ArchitecturalShell'
import { getRoomCamera } from './cameraMath'
import { CameraRig } from './CameraRig'
import { Furniture } from './Furniture'
import { SCENE_COLORS } from './materials'
import { TransformController } from './TransformController'

function RoomScene() {
  return (
    <>
      <color attach="background" args={[SCENE_COLORS.mist]} />
      <fog attach="fog" args={[SCENE_COLORS.mist, 10, 20]} />
      <hemisphereLight args={['#dfeeff', '#9b8871', 1.35]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[1.8, 7, -4.5]}
        color="#ffd9a3"
        intensity={3.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.00015}
      />
      <directionalLight
        position={[4, 5, 4]}
        color="#d6e9ff"
        intensity={0.85}
      />
      <CameraRig />
      <ArchitecturalShell />
      <Furniture />
      <TransformController />
      <ContactShadows
        position={[0, 0.008, 0]}
        scale={8}
        opacity={0.34}
        blur={2.4}
        far={3.5}
        resolution={512}
        color="#39434a"
      />
    </>
  )
}

export function RoomCanvas() {
  const [dpr, setDpr] = useState(1.5)
  const initialRoomCamera = getRoomCamera(
    window.innerWidth / Math.max(window.innerHeight, 1),
  )

  return (
    <Canvas
      aria-label="Interactive 3D model of the Afterglow studio"
      className="room-canvas"
      frameloop="demand"
      dpr={dpr}
      shadows="basic"
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, invalidate, size }) => {
        gl.setPixelRatio(dpr)
        gl.setSize(size.width, size.height, false)
        invalidate()
      }}
      camera={{
        position: initialRoomCamera.position,
        fov: 38,
        near: 0.1,
        far: 100,
      }}
      fallback={
        <div className="webgl-fallback">
          This device could not start the 3D room. Reload the page or enable
          hardware acceleration.
        </div>
      }
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.75))}
      />
      <Suspense fallback={null}>
        <RoomScene />
      </Suspense>
    </Canvas>
  )
}