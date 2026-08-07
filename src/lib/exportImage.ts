export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename = 'afterglow-layout.png',
) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The room image could not be created.'))
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}