import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ExamTable from '../components/ExamTable.jsx'

const EMPTY = { subject: '', students: '', date: '2025-11-10', start_time: '09:00', end_time: '12:00' }

function validate(form) {
  const errors = {}
  if (!form.subject.trim()) errors.subject = 'Subject name is required.'
  if (form.students === '' || Number.isNaN(Number(form.students))) errors.students = 'Students is required.'
  else if (Number(form.students) < 0) errors.students = 'Students cannot be negative.'
  if (!form.date) errors.date = 'Date is required.'
  if (!form.start_time || !form.end_time) errors.times = 'Start and end time are required.'
  else if (form.end_time <= form.start_time) errors.times = 'End time must be after start time.'
  return errors
}

export default function Exams() {
  const { exams, addExam, deleteExam } = useApp()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setSubmitting(true)
    const ok = await addExam({ ...form, students: Number(form.students) })
    setSubmitting(false)
    if (ok) setForm(EMPTY)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Examinations</h2>
        <p className="text-sm text-muted">Add, review and remove examinations in the current dataset.</p>
      </div>

      <form onSubmit={submit} className="card card-pad space-y-4">
        <h3 className="text-sm font-medium text-ink">Add Examination</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="field-label">Subject Name</label>
            <input className="input" value={form.subject} onChange={set('subject')} placeholder="Data Structures" />
            {errors.subject && <p className="mt-1 text-xs text-red-300">{errors.subject}</p>}
          </div>
          <div>
            <label className="field-label">Students</label>
            <input className="input" type="number" min="0" value={form.students} onChange={set('students')} placeholder="65" />
            {errors.students && <p className="mt-1 text-xs text-red-300">{errors.students}</p>}
          </div>
          <div>
            <label className="field-label">Date</label>
            <input className="input" type="date" value={form.date} onChange={set('date')} />
            {errors.date && <p className="mt-1 text-xs text-red-300">{errors.date}</p>}
          </div>
          <div>
            <label className="field-label">Start Time</label>
            <input className="input" type="time" value={form.start_time} onChange={set('start_time')} />
          </div>
          <div>
            <label className="field-label">End Time</label>
            <input className="input" type="time" value={form.end_time} onChange={set('end_time')} />
          </div>
        </div>
        {errors.times && <p className="text-xs text-red-300">{errors.times}</p>}
        <button className="btn-primary" disabled={submitting}>
          <Plus size={16} /> {submitting ? 'Adding…' : 'Add Examination'}
        </button>
      </form>

      <div className="card card-pad">
        <h3 className="mb-4 text-sm font-medium text-ink">
          Exam List <span className="text-muted">({exams.length})</span>
        </h3>
        <ExamTable exams={exams} onDelete={deleteExam} />
      </div>
    </div>
  )
}
