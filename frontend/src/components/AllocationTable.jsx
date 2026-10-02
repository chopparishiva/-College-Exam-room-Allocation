import { CheckCircle2, CircleSlash } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

export default function AllocationTable({ allocations, unallocated = [] }) {
  if (!allocations.length && !unallocated.length) {
    return (
      <EmptyState
        title="No allocation yet"
        message='Click "Generate Optimal Allocation" to run the greedy algorithm.'
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Students</th>
            <th>Time</th>
            <th>Room</th>
            <th>Room Capacity</th>
            <th>Utilization</th>
            <th>Unused Seats</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr key={a.exam_id}>
              <td className="font-medium">{a.subject}</td>
              <td className="font-mono text-muted">{a.students}</td>
              <td className="font-mono text-muted">
                {a.start_time}–{a.end_time}
              </td>
              <td>
                <span className="badge-neutral font-mono">{a.room}</span>
              </td>
              <td className="font-mono text-muted">{a.capacity}</td>
              <td className="font-mono text-accent2">{a.utilization}%</td>
              <td className="font-mono text-muted">{a.unused_seats}</td>
              <td>
                <span className="badge-allocated">
                  <CheckCircle2 size={12} /> Allocated
                </span>
              </td>
            </tr>
          ))}

          {unallocated.map((u) => (
            <tr key={u.exam_id}>
              <td className="font-medium">{u.subject}</td>
              <td className="font-mono text-muted">{u.students}</td>
              <td className="font-mono text-muted">
                {u.start_time}–{u.end_time}
              </td>
              <td className="text-muted">—</td>
              <td className="text-muted">—</td>
              <td className="text-muted">—</td>
              <td className="text-muted">—</td>
              <td>
                <span className="badge-unallocated" title={u.reason}>
                  <CircleSlash size={12} /> Unallocated
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
