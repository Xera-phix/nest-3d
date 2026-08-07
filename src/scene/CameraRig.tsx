import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  MathUtils,
  OrthographicCamera as ThreeOrthographicCamera,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useEditorStore } from '../store/editorStore'
import {
  focusTargetFor,
  getPlanFrustum,
  getRoomCamera,
  PLAN_CAMERA,
  ROOM_CAMERA,
  TOUR_KEYFRAMES,
} from './cameraMath'

const roomPosition = new Vector3(...ROOM_CAMERA.position)
const roomTarget = new Vector3(...ROOM_CAMERA.target)
const planPosition = new Vector3(...PLAN_CAMERA.position)
const planTarget = new Vector3(...PLAN_CAMERA.target)
const interpolatedPosition = new Vector3()
const interpolatedTarget = new Vector3()
const focusPosition = new Vector3()
const focusTarget = new Vector3()
const tourStartPosition = new Vector3()
const tourEndPosition = new Vector3()
const tourStartTarget = new Vector3()
const tourEndTarget = new Vector3()

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5)
}

export function CameraRig() {
  const perspectiveRef = useRef<ThreePerspectiveCamera>(null)
  const orthographicRef = useRef<ThreeOrthographicCamera>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const transitionProgress = useRef(0)
  const activeProjection = useRef<'room' | 'plan'>('room')
  const focusRequest = useRef<{ position: Vector3; target: Vector3 } | null>(null)
  const tourElapsed = useRef(0)
  const reducedMotion = useRef(false)
  const viewMode = useEditorStore((state) => state.viewMode)
  const isTouring = useEditorStore((state) => state.isTouring)
  const setTouring = useEditorStore((state) => state.setTouring)
  const setViewMode = useEditorStore((state) => state.setViewMode)
  const { set, size, invalidate } = useThree()
  const aspect = Math.max(size.width / Math.max(size.height, 1), 0.1)
  const planFrustum = getPlanFrustum(aspect)
  const roomCamera = getRoomCamera(aspect)
  roomPosition.fromArray(roomCamera.position)
  roomTarget.fromArray(roomCamera.target)

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  useEffect(() => {
    if (viewMode !== 'room' || isTouring) return
    const camera = perspectiveRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    const composition = getRoomCamera(aspect)
    camera.position.fromArray(composition.position)
    controls.target.fromArray(composition.target)
    camera.lookAt(controls.target)
    camera.updateProjectionMatrix()
    invalidate()
  }, [aspect, invalidate, isTouring, size.height, size.width, viewMode])

  useEffect(() => {
    const handleFocus = (event: Event) => {
      const furnitureId = (event as CustomEvent<{ id: string }>).detail.id
      const item = useEditorStore
        .getState()
        .furniture.find((entry) => entry.id === furnitureId)
      const camera = perspectiveRef.current
      if (!item || !camera) return

      const target = new Vector3(...focusTargetFor(item))
      const footprint = Math.max(item.footprint.width, item.footprint.depth)
      const position = target
        .clone()
        .add(new Vector3(2.3 + footprint, 1.7 + footprint * 0.4, 2.5))
      focusRequest.current = { position, target }
      setViewMode('room')
      setTouring(false)
      invalidate()
    }

    window.addEventListener('afterglow:focus', handleFocus)
    return () => window.removeEventListener('afterglow:focus', handleFocus)
  }, [invalidate, setTouring, setViewMode])

  useEffect(() => {
    invalidate()
  }, [viewMode, invalidate])

  useEffect(() => {
    if (!isTouring) return
    tourElapsed.current = 0
    focusRequest.current = null
    if (perspectiveRef.current) {
      set({ camera: perspectiveRef.current })
      activeProjection.current = 'room'
    }
    invalidate()
  }, [isTouring, invalidate, set])

  useFrame((_, delta) => {
    const perspective = perspectiveRef.current
    const orthographic = orthographicRef.current
    const controls = controlsRef.current
    if (!perspective || !orthographic || !controls) return
    const frameDelta = Math.min(delta, 0.1)

    if (isTouring) {
      tourElapsed.current += frameDelta
      const elapsed = tourElapsed.current
      const finalKeyframe = TOUR_KEYFRAMES.at(-1)
      if (!finalKeyframe) return

      if (elapsed >= finalKeyframe.time) {
        perspective.position.fromArray(finalKeyframe.position)
        controls.target.fromArray(finalKeyframe.target)
        perspective.lookAt(controls.target)
        setTouring(false)
        setViewMode('plan')
        invalidate()
        return
      }

      const endIndex = TOUR_KEYFRAMES.findIndex(({ time }) => time > elapsed)
      const start = TOUR_KEYFRAMES[Math.max(0, endIndex - 1)]
      const end = TOUR_KEYFRAMES[endIndex]
      const segmentProgress = MathUtils.clamp(
        (elapsed - start.time) / (end.time - start.time),
        0,
        1,
      )
      const eased = segmentProgress * segmentProgress * (3 - 2 * segmentProgress)
      tourStartPosition.fromArray(start.position)
      tourEndPosition.fromArray(end.position)
      tourStartTarget.fromArray(start.target)
      tourEndTarget.fromArray(end.target)
      perspective.position.lerpVectors(
        tourStartPosition,
        tourEndPosition,
        eased,
      )
      controls.target.lerpVectors(tourStartTarget, tourEndTarget, eased)
      perspective.lookAt(controls.target)
      perspective.updateProjectionMatrix()
      invalidate()
      return
    }

    const transitionTarget = viewMode === 'plan' ? 1 : 0
    if (transitionProgress.current !== transitionTarget) {
      if (reducedMotion.current) {
        transitionProgress.current = transitionTarget
      } else {
        const direction = Math.sign(transitionTarget - transitionProgress.current)
        transitionProgress.current = MathUtils.clamp(
          transitionProgress.current + direction * (frameDelta / 1.15),
          0,
          1,
        )
      }

      const easedProgress = easeOutQuint(transitionProgress.current)
      interpolatedPosition.lerpVectors(
        roomPosition,
        planPosition,
        easedProgress,
      )
      interpolatedTarget.lerpVectors(roomTarget, planTarget, easedProgress)
      perspective.position.copy(interpolatedPosition)
      perspective.lookAt(interpolatedTarget)
      orthographic.position.copy(interpolatedPosition)
      orthographic.lookAt(interpolatedTarget)
      controls.target.copy(interpolatedTarget)
      perspective.fov = MathUtils.lerp(38, 31, easedProgress)
      perspective.updateProjectionMatrix()
      orthographic.updateProjectionMatrix()

      if (
        transitionProgress.current >= 0.55 &&
        activeProjection.current !== 'plan'
      ) {
        set({ camera: orthographic })
        activeProjection.current = 'plan'
      } else if (
        transitionProgress.current < 0.55 &&
        activeProjection.current !== 'room'
      ) {
        set({ camera: perspective })
        activeProjection.current = 'room'
      }
      invalidate()
      return
    }

    if (focusRequest.current && activeProjection.current === 'room') {
      const smoothing = 1 - Math.exp(-frameDelta * 4.5)
      focusPosition.copy(focusRequest.current.position)
      focusTarget.copy(focusRequest.current.target)
      perspective.position.lerp(focusPosition, smoothing)
      controls.target.lerp(focusTarget, smoothing)
      perspective.lookAt(controls.target)
      if (
        perspective.position.distanceTo(focusPosition) < 0.015 &&
        controls.target.distanceTo(focusTarget) < 0.015
      ) {
        focusRequest.current = null
      } else {
        invalidate()
      }
    }
  })

  return (
    <>
      <PerspectiveCamera
        ref={perspectiveRef}
        makeDefault
        position={roomCamera.position}
        fov={38}
        near={0.1}
        far={100}
      />
      <OrthographicCamera
        ref={orthographicRef}
        position={PLAN_CAMERA.position}
        left={-planFrustum.width / 2}
        right={planFrustum.width / 2}
        top={planFrustum.height / 2}
        bottom={-planFrustum.height / 2}
        near={0.1}
        far={100}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.075}
        enableRotate={viewMode === 'room'}
        enablePan
        minDistance={4.6}
        maxDistance={aspect < 0.8 ? 14 : 11}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.06}
        target={ROOM_CAMERA.target}
        onStart={() => {
          focusRequest.current = null
          setTouring(false)
        }}
        onChange={() => {
          const camera =
            activeProjection.current === 'room'
              ? perspectiveRef.current
              : orthographicRef.current
          if (camera) {
            window.dispatchEvent(
              new CustomEvent('afterglow:camera-change', {
                detail: camera.position
                  .toArray()
                  .map((value) => value.toFixed(4))
                  .join(','),
              }),
            )
          }
          invalidate()
        }}
      />
    </>
  )
}