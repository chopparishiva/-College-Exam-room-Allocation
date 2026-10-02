import { CheckCircle2, Loader2, Play, RefreshCw, TriangleAlert } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Header() {
  const { running, runAllocation, loadDataset, dataset, backendOnline, allocation, exams, rooms } = useApp()

  const buttonLabel = running ? 'Generating…' : allocation ? 'Allocation Generated ✓' : 'Generate Optimal Allocation'
  const canRun = exams.length > 0 && rooms.length > 0 && !running

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-7">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-ink">ExamOpt</h1>
            <span className="badge-neutral uppercase">Demo Data</span>
            {backendOnline === false && (
              <span className="badge bg-amber-500/10 text-amber-300 border-amber-500/30">
                <TriangleAlert size={12} /> Demo Mode
              </span>
            )}
          </div>
          <p className="text-sm text-muted">Smart Examination Room Allocation</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-ghost btn-sm"
            onClick={() => loadDataset('normal')}
            disabled={running}
            title="Load the normal demo dataset"
          >
            <RefreshCw size={14} /> Load Demo Dataset
          </button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => loadDataset('stress')}
            disabled={running}
            title="Load the stress-test dataset"
          >
            <TriangleAlert size={14} /> Load Stress Test
          </button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => loadDataset('conflict')}
            disabled={running}
            title="Load a same-time room-conflict scenario"
          >
            <TriangleAlert size={14} /> Load Conflict Demo
          </button>
          <button className="btn-primary" onClick={runAllocation} disabled={!canRun}>
            {running ? (
              <Loader2 size={16} className="animate-spin" />
            ) : allocation ? (
              <CheckCircle2 size={16} />
            ) : (
              <Play size={16} />
            )}
            {buttonLabel}
          </button>
        </div>
      </div>

      <div className="px-5 pb-3 text-xs text-muted lg:px-7">
        Current dataset: <span className="text-ink capitalize">{dataset}</span> · {exams.length} exams ·{' '}
        {rooms.length} rooms
      </div>
    </header>
  )
}
