import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
      <Icon size={26} className="text-muted" />
      <h3 className="mt-4 text-base font-medium text-ink">{title}</h3>
      {message && <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
