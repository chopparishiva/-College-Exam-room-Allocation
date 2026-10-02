import { GraduationCap, Percent, Users, Armchair, AlertTriangle, DoorOpen } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import StatCard from '../components/StatCard.jsx'
import AllocationTable from '../components/AllocationTable.jsx'
import EfficiencyChart from '../components/EfficiencyChart.jsx'

export default function Dashboard() {
  const { exams, rooms, allocation, runMode, booting } = useApp()

  const metrics = allocation?.metrics
  const totalStudents = exams.reduce((s, e) => s + e.students, 0)

  const stats = [
    { label: 'Total Exams', value: exams.length, icon: GraduationCap, tone: 'accent' },
    { label: 'Rooms Available', value: rooms.length, icon: DoorOpen },
    {
      label: 'Students Scheduled',
      value: metrics ? metrics.students_allocated.toLocaleString() : totalStudents.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Room Utilization',
      value: metrics ? `${metrics.utilization_percentage}%` : '—',
      icon: Percent,
      tone: 'good',
    },
    { label: 'Unused Seats', value: metrics ? metrics.total_unused_seats : '—', icon: Armchair },
    {
      label: 'Conflicts',
      value: metrics ? metrics.conflicts : '—',
      icon: AlertTriangle,
      tone: metrics && metrics.conflicts > 0 ? 'bad' : 'default',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Dashboard</h2>
        <p className="text-sm text-muted">
          Greedy allocation overview. Click{' '}
          <span className="text-ink">Generate Optimal Allocation</span> in the header to run the
          algorithm.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {booting ? (
        <div className="card card-pad text-sm text-muted">Loading dataset…</div>
      ) : !allocation ? (
        <div className="card card-pad">
          <h3 className="text-sm font-medium text-ink">No allocation yet</h3>
          <p className="mt-1 text-sm text-muted">
            The current dataset has {exams.length} examinations and {rooms.length} rooms. Run the
            greedy algorithm to see allocations, utilization and the decision process.
          </p>
        </div>
      ) : (
        <>
          {runMode === 'demo' && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              This result was computed locally in <strong>Demo Mode</strong> (backend unavailable) —
              it was not produced by the FastAPI backend.
            </div>
          )}

          {metrics.unallocated_exams > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {metrics.unallocated_exams}{' '}
              {metrics.unallocated_exams === 1 ? 'examination' : 'examinations'} could not be
              allocated. See the Allocation page for details.
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="card card-pad xl:col-span-2">
              <h3 className="mb-4 text-sm font-medium text-ink">Allocation Result</h3>
              <AllocationTable allocations={allocation.allocations} unallocated={allocation.unallocated} />
            </div>

            <div className="space-y-6">
              <div className="card card-pad">
                <h3 className="mb-2 text-sm font-medium text-ink">Efficiency Score</h3>
                <div className="text-4xl font-semibold text-accent2">
                  {metrics.utilization_percentage}%
                </div>
                <div className="mt-1 text-xs text-muted">Greedy Allocation Efficiency · Seat Utilization</div>

                <div className="mt-5 space-y-2 text-sm">
                  <Row label="Allocated" value={metrics.allocated_exams} />
                  <Row label="Unallocated" value={metrics.unallocated_exams} />
                  <Row label="Conflicts" value={metrics.conflicts} />
                  <Row label="Rooms used" value={metrics.total_rooms_used} />
                  <Row label="Capacity used" value={metrics.total_capacity_used} />
                </div>
              </div>

              <div className="card card-pad">
                <h3 className="mb-4 text-sm font-medium text-ink">Room Utilization</h3>
                <EfficiencyChart allocations={allocation.allocations} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line/60 pb-2">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  )
}
