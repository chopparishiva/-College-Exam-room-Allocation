import { CheckCircle2, GitBranch, Loader2, Play, TriangleAlert } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import StatCard from '../components/StatCard.jsx'
import AllocationTable from '../components/AllocationTable.jsx'
import GreedyExplanation from '../components/GreedyExplanation.jsx'
import EfficiencyChart from '../components/EfficiencyChart.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Allocation() {
  const { exams, rooms, allocation, runAllocation, running, runMode } = useApp()

  const metrics = allocation?.metrics
  const canRun = exams.length > 0 && rooms.length > 0 && !running
  const label = running ? 'Generating…' : allocation ? 'Allocation Generated ✓' : 'Generate Optimal Allocation'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Allocation</h2>
          <p className="text-sm text-muted">
            Run the greedy algorithm on {exams.length} exams and {rooms.length} rooms.
          </p>
        </div>
        <button className="btn-primary" onClick={runAllocation} disabled={!canRun}>
          {running ? <Loader2 size={16} className="animate-spin" /> : allocation ? <CheckCircle2 size={16} /> : <Play size={16} />}
          {label}
        </button>
      </div>

      {runMode === 'demo' && allocation && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Result computed locally in <strong>Demo Mode</strong> — the FastAPI backend was not used.
        </div>
      )}

      {running ? (
        <div className="card card-pad flex items-center gap-3 text-sm text-muted">
          <Loader2 size={18} className="animate-spin text-accent2" />
          Running the greedy allocation…
        </div>
      ) : !allocation ? (
        <EmptyState
          icon={GitBranch}
          title="No allocation yet"
          message='Click "Generate Optimal Allocation" to run the greedy algorithm and see the results.'
        />
      ) : (
        <>
          {metrics.unallocated_exams > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <TriangleAlert size={15} className="mr-1 inline" />
              {metrics.unallocated_exams}{' '}
              {metrics.unallocated_exams === 1 ? 'examination could not be allocated.' : 'examinations could not be allocated.'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Allocated" value={metrics.allocated_exams} tone="good" />
            <StatCard label="Unallocated" value={metrics.unallocated_exams} tone={metrics.unallocated_exams ? 'warn' : 'default'} />
            <StatCard label="Conflicts" value={metrics.conflicts} tone={metrics.conflicts ? 'bad' : 'default'} />
            <StatCard label="Seat Utilization" value={`${metrics.utilization_percentage}%`} tone="accent" />
            <StatCard label="Unused Seats" value={metrics.total_unused_seats} />
          </div>

          <div className="card card-pad">
            <h3 className="mb-4 text-sm font-medium text-ink">Allocation Result</h3>
            <AllocationTable allocations={allocation.allocations} unallocated={allocation.unallocated} />
          </div>

          {allocation.unallocated.length > 0 && (
            <div className="card card-pad">
              <h3 className="mb-4 text-sm font-medium text-ink">Unallocated Examinations</h3>
              <div className="space-y-2">
                {allocation.unallocated.map((u) => (
                  <div key={u.exam_id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-ink">{u.subject}</span>
                      <span className="font-mono text-muted">{u.students} students</span>
                    </div>
                    <p className="mt-1 text-amber-200">{u.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card card-pad">
            <h3 className="mb-4 text-sm font-medium text-ink">Greedy Decision Process</h3>
            <GreedyExplanation decisions={allocation.decisions} />
          </div>

          <div className="card card-pad">
            <h3 className="mb-4 text-sm font-medium text-ink">Room Utilization — Used vs Unused Seats</h3>
            <EfficiencyChart allocations={allocation.allocations} />
          </div>
        </>
      )}
    </div>
  )
}
