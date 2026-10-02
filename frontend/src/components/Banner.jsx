import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

const STYLES = {
  error: { wrap: 'border-red-500/30 bg-red-500/10 text-red-200', Icon: XCircle },
  warning: { wrap: 'border-amber-500/30 bg-amber-500/10 text-amber-200', Icon: AlertTriangle },
  success: { wrap: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200', Icon: CheckCircle2 },
  info: { wrap: 'border-accent/30 bg-accent/10 text-indigo-100', Icon: Info },
}

export default function Banner({ notice, onDismiss }) {
  if (!notice) return null
  const { wrap, Icon } = STYLES[notice.type] || STYLES.info
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${wrap}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span className="flex-1">{notice.message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
