export default function StatCard({ icon: Icon, label, value, tone = 'default', hint }) {
  const tones = {
    default: 'text-ink',
    accent: 'text-accent2',
    good: 'text-emerald-300',
    warn: 'text-amber-300',
    bad: 'text-red-300',
  }
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
        {Icon && <Icon size={16} className="text-muted" />}
      </div>
      <div className={`mt-3 text-3xl font-semibold tracking-tight ${tones[tone] || tones.default}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  )
}
