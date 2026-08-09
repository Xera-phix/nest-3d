import { ImagePlus, Link, Upload, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { importImageFile, importImageUrl } from '../lib/imageImport'
import { useEditorStore } from '../store/editorStore'

type ImportMode = 'upload' | 'url'

interface ImportObjectDialogProps {
  open: boolean
  onClose: () => void
}

const DEFAULT_DIMENSIONS = {
  width: '0.8',
  depth: '0.6',
  height: '1',
}

export function ImportObjectDialog({ open, onClose }: ImportObjectDialogProps) {
  const addImageObject = useEditorStore((state) => state.addImageObject)
  const setStatus = useEditorStore((state) => state.setStatus)
  const [mode, setMode] = useState<ImportMode>('upload')
  const [label, setLabel] = useState('Imported object')
  const [imageUrl, setImageUrl] = useState('')
  const [imageSource, setImageSource] = useState('')
  const [fileName, setFileName] = useState('')
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS)
  const [error, setError] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) return null

  const chooseMode = (nextMode: ImportMode) => {
    setMode(nextMode)
    setError('')
  }

  const chooseFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setIsImporting(true)
    try {
      setImageSource(await importImageFile(file))
      setFileName(file.name)
      if (label === 'Imported object') {
        setLabel(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
      }
    } catch (reason) {
      setImageSource('')
      setFileName('')
      setError(reason instanceof Error ? reason.message : 'The image could not be prepared.')
    } finally {
      setIsImporting(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsImporting(true)

    try {
      const source = mode === 'url' ? await importImageUrl(imageUrl) : imageSource
      if (!source) throw new Error('Choose an image to import.')

      addImageObject({
        label,
        imageSource: source,
        width: Number(dimensions.width),
        depth: Number(dimensions.depth),
        height: Number(dimensions.height),
      })
      setStatus({ tone: 'success', message: `${label || 'Object'} added to the room.` })
      setMode('upload')
      setLabel('Imported object')
      setImageUrl('')
      setImageSource('')
      setFileName('')
      setDimensions(DEFAULT_DIMENSIONS)
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The object could not be imported.')
    } finally {
      setIsImporting(false)
    }
  }

  const previewSource = mode === 'upload' ? imageSource : imageUrl

  return (
    <div
      className="dialog-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="import-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
      >
        <div className="import-dialog__heading">
          <div>
            <span className="inspector-kind">New object</span>
            <h2 id="import-dialog-title">Import image proxy</h2>
          </div>
          <button
            className="icon-button icon-button--small"
            type="button"
            aria-label="Close import dialog"
            title="Close"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="import-mode" aria-label="Image source">
            <button
              type="button"
              aria-pressed={mode === 'upload'}
              onClick={() => chooseMode('upload')}
            >
              <Upload size={16} />
              Upload
            </button>
            <button
              type="button"
              aria-pressed={mode === 'url'}
              onClick={() => chooseMode('url')}
            >
              <Link size={16} />
              Image URL
            </button>
          </div>

          <div className="import-source-row">
            <div className="import-preview" aria-label="Image preview">
              {previewSource ? (
                <img src={previewSource} alt="Object preview" />
              ) : (
                <ImagePlus size={28} aria-hidden="true" />
              )}
            </div>
            <div className="import-source-control">
              {mode === 'upload' ? (
                <label className="import-file-picker">
                  <Upload size={16} />
                  <span>{fileName || 'Choose image'}</span>
                  <input
                    aria-label="Object image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => void chooseFile(event.currentTarget.files?.[0])}
                  />
                </label>
              ) : (
                <label className="import-text-field">
                  <span>Public image URL</span>
                  <input
                    aria-label="Image URL"
                    type="url"
                    placeholder="https://"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.currentTarget.value)}
                  />
                </label>
              )}
              <label className="import-text-field">
                <span>Object name</span>
                <input
                  aria-label="Object name"
                  value={label}
                  onChange={(event) => setLabel(event.currentTarget.value)}
                />
              </label>
            </div>
          </div>

          <fieldset className="import-dimensions">
            <legend>Physical dimensions</legend>
            {(['width', 'depth', 'height'] as const).map((dimension) => (
              <label key={dimension}>
                <span>{dimension}</span>
                <span className="import-number-field">
                  <input
                    aria-label={`Object ${dimension}`}
                    type="number"
                    min="0.1"
                    max="12"
                    step="0.05"
                    required
                    value={dimensions[dimension]}
                    onChange={(event) =>
                      setDimensions((current) => ({
                        ...current,
                        [dimension]: event.currentTarget.value,
                      }))
                    }
                  />
                  <span>m</span>
                </span>
              </label>
            ))}
          </fieldset>

          {error && (
            <p className="import-error" role="alert">
              {error}
            </p>
          )}

          <div className="import-dialog__actions">
            <button type="button" className="dialog-button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-button dialog-button--primary"
              disabled={isImporting}
            >
              <ImagePlus size={16} />
              {isImporting ? 'Preparing' : 'Add to room'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
