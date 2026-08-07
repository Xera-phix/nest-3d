import {
  CanvasTexture,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'

export const SCENE_COLORS = {
  mist: '#edf2f3',
  chalk: '#f6f7f5',
  concrete: '#c8ced0',
  graphite: '#252d34',
  cobalt: '#315eca',
  vermilion: '#e85f39',
  oak: '#c78a47',
  leaf: '#477151',
} as const

function makeTexture(
  paint: (context: CanvasRenderingContext2D, size: number) => void,
) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null
  paint(context, size)

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

const oakTexture = makeTexture((context, size) => {
  context.fillStyle = SCENE_COLORS.oak
  context.fillRect(0, 0, size, size)
  for (let line = 0; line < 30; line += 1) {
    const y = line * 9
    context.strokeStyle = `rgba(83, 47, 25, ${0.07 + (line % 3) * 0.025})`
    context.lineWidth = line % 4 === 0 ? 2 : 1
    context.beginPath()
    context.moveTo(0, y)
    context.bezierCurveTo(65, y + 7, 165, y - 5, size, y + 2)
    context.stroke()
  }
})

const rugTexture = makeTexture((context, size) => {
  context.fillStyle = SCENE_COLORS.cobalt
  context.fillRect(0, 0, size, size)
  context.strokeStyle = 'rgba(224, 232, 250, 0.22)'
  context.lineWidth = 1
  for (let offset = 0; offset < size; offset += 8) {
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset, size)
    context.moveTo(0, offset)
    context.lineTo(size, offset)
    context.stroke()
  }
})

if (oakTexture) oakTexture.repeat.set(2, 2)
if (rugTexture) rugTexture.repeat.set(3, 2)

export const sceneMaterials = {
  plaster: new MeshStandardMaterial({
    color: SCENE_COLORS.chalk,
    roughness: 0.96,
  }),
  concrete: new MeshStandardMaterial({
    color: SCENE_COLORS.concrete,
    roughness: 0.9,
  }),
  oak: new MeshStandardMaterial({
    color: new Color(SCENE_COLORS.oak),
    map: oakTexture,
    roughness: 0.64,
  }),
  darkOak: new MeshStandardMaterial({
    color: '#82532d',
    map: oakTexture,
    roughness: 0.7,
  }),
  graphite: new MeshStandardMaterial({
    color: SCENE_COLORS.graphite,
    roughness: 0.36,
    metalness: 0.62,
  }),
  cobalt: new MeshStandardMaterial({
    color: SCENE_COLORS.cobalt,
    roughness: 0.92,
  }),
  vermilion: new MeshStandardMaterial({
    color: SCENE_COLORS.vermilion,
    roughness: 0.58,
  }),
  textile: new MeshStandardMaterial({
    color: '#e8e6df',
    roughness: 0.98,
  }),
  warmTextile: new MeshStandardMaterial({
    color: '#d8b39a',
    roughness: 0.98,
  }),
  rug: new MeshStandardMaterial({
    color: '#ffffff',
    map: rugTexture,
    roughness: 1,
  }),
  foliage: new MeshStandardMaterial({
    color: SCENE_COLORS.leaf,
    roughness: 0.86,
  }),
  ceramic: new MeshPhysicalMaterial({
    color: '#c7d8d5',
    roughness: 0.28,
    clearcoat: 0.32,
  }),
  glass: new MeshPhysicalMaterial({
    color: '#bad6df',
    transparent: true,
    opacity: 0.42,
    roughness: 0.12,
    transmission: 0.44,
  }),
  bulb: new MeshStandardMaterial({
    color: '#ffd99a',
    emissive: '#ffb75b',
    emissiveIntensity: 1.6,
  }),
}