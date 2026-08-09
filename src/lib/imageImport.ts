const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_TEXTURE_EDGE = 1600
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function validateImage(blob: Blob) {
  if (!ACCEPTED_IMAGE_TYPES.has(blob.type)) {
    throw new Error('Choose a PNG, JPEG, or WebP image.')
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('Choose an image smaller than 5 MB.')
  }
}

async function optimizeImage(blob: Blob) {
  validateImage(blob)
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(
    1,
    MAX_TEXTURE_EDGE / Math.max(bitmap.width, bitmap.height),
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('This browser could not prepare the image.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.86)
}

export function importImageFile(file: File) {
  return optimizeImage(file)
}

export async function importImageUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Enter a valid image URL.')
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Use an HTTP or HTTPS image URL.')
  }

  let response: Response
  try {
    response = await fetch(url, { mode: 'cors' })
  } catch {
    throw new Error('That site does not allow this image to be imported.')
  }
  if (!response.ok) {
    throw new Error('The image could not be downloaded.')
  }

  return optimizeImage(await response.blob())
}
