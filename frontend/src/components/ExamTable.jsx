import { Trash2 } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

export default function ExamTable({ exams, onDelete }) {
  if (!exams.length) {
    return (
      <EmptyState
        title="No examinations yet"
        message="Add an examination above, or load the demo dataset from the header."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Students</th>
            <th>Date</th>
            <th>Time</th>
            {onDelete && <th className="text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td className="font-medium">{exam.subject}</td>
              <td className="font-mono text-muted">{exam.students}</td>
              <td className="font-mono text-muted">{exam.date}</td>
              <td className="font-mono text-muted">
                {exam.start_time}–{exam.end_time}
              </td>
              {onDelete && (
                <td className="text-right">
                  <button className="btn-danger btn-sm" onClick={() => onDelete(exam.id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
