import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import RoomTable from '../components/RoomTable.jsx'

const EMPTY = { name: '', capacity: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Room name is required.'
  if (form.capacity === '' || Number.isNaN(Number(form.capacity))) errors.capacity = 'Capacity is required.'
  else if (Number(form.capacity) < 0) errors.capacity = 'Capacity cannot be negative.'
  return errors
}

export default function Rooms() {
  const { rooms, addRoom, deleteRoom } = useApp()
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
    const ok = await addRoom({ name: form.name, capacity: Number(form.capacity) })
    setSubmitting(false)
    if (ok) setForm(EMPTY)
  }

  const totalSeats = rooms.reduce((s, r) => s + r.capacity, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Rooms</h2>
        <p className="text-sm text-muted">
          {rooms.length} rooms · {totalSeats.toLocaleString()} total seats available.
        </p>
      </div>

      <form onSubmit={submit} className="card card-pad space-y-4">
        <h3 className="text-sm font-medium text-ink">Add Room</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="field-label">Room Name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="A101" />
            {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
          </div>
          <div>
            <label className="field-label">Capacity</label>
            <input className="input" type="number" min="0" value={form.capacity} onChange={set('capacity')} placeholder="70" />
            {errors.capacity && <p className="mt-1 text-xs text-red-300">{errors.capacity}</p>}
          </div>
        </div>
        <button className="btn-primary" disabled={submitting}>
          <Plus size={16} /> {submitting ? 'Adding…' : 'Add Room'}
        </button>
      </form>

      <div className="card card-pad">
        <h3 className="mb-4 text-sm font-medium text-ink">
          Room List <span className="text-muted">({rooms.length})</span>
        </h3>
        <RoomTable rooms={rooms} onDelete={deleteRoom} />
      </div>
    </div>
  )
}
