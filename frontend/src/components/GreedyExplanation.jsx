import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, MinusCircle, XCircle } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

const STATUS = {
  selected: { Icon: CheckCircle2, label: 'Selected', cls: 'text-emerald-300', note: 'chosen' },
  not_needed: { Icon: MinusCircle, label: 'Not needed', cls: 'text-muted', note: 'a smaller room already fits' },
  insufficient: { Icon: XCircle, label: 'Insufficient capacity', cls: 'text-red-300', note: 'too small' },
  occupied: { Icon: CircleSlash, label: 'Occupied', cls: 'text-amber-300', note: 'busy in this time slot' },
}

// The Greedy Decision Process — walks through each exam and shows exactly why
// a room was (or was not) chosen. This makes the algorithm visible to judges.
export default function GreedyExplanation({ decisions }) {
  const [step, setStep] = useState(0)

  if (!decisions || decisions.length === 0) {
    return (
      <EmptyState
        title="No decisions to show"
        message='Run "Generate Optimal Allocation" to see the greedy decision process.'
      />
    )
  }

  const index = Math.min(step, decisions.length - 1)
  const d = decisions[index]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-muted">
          Step <span className="font-mono text-ink">{index + 1}</span> / {decisions.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost btn-sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={index === 0}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setStep((s) => Math.min(decisions.length - 1, s + 1))}
            disabled={index === decisions.length - 1}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface2/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-base font-semibold text-ink">{d.subject}</div>
          <div className="flex items-center gap-2">
            <span className="badge-neutral font-mono">{d.students} students</span>
            <span className="badge-neutral font-mono">
              {d.start_time}–{d.end_time}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted">Candidate rooms (smallest first)</div>
          {d.candidates.map((c) => {
            const meta = STATUS[c.status] || STATUS.not_needed
            const { Icon } = meta
            return (
              <div
                key={c.room}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  c.status === 'selected' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-line bg-base/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} className={meta.cls} />
                  <span className="font-mono text-ink">{c.room}</span>
                  <span className="font-mono text-muted">{c.capacity}</span>
                </div>
                <span className={`text-xs ${meta.cls}`}>
                  {meta.label}
                  {c.status !== 'selected' && <span className="text-muted"> · {meta.note}</span>}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-indigo-100">
          <span className="font-semibold">Decision: </span>
          {d.reason}
        </div>
      </div>
    </div>
  )
}
