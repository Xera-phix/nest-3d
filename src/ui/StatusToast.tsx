import { AlertTriangle, Check, Info, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

const icons = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: XCircle,
}

export function StatusToast() {
  const status = useEditorStore((state) => state.status)
  const setStatus = useEditorStore((state) => state.setStatus)

  useEffect(() => {
    if (!status) return
    const timeout = window.setTimeout(() => setStatus(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [status, setStatus])

  if (!status) return <div className="sr-status" aria-live="polite" />
  const Icon = icons[status.tone]

  return (
    <div
      className={`status-toast status-toast--${status.tone}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={17} />
      <span>{status.message}</span>
    </div>
  )
}