import { Trash2 } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

export default function RoomTable({ rooms, onDelete }) {
  if (!rooms.length) {
    return (
      <EmptyState
        title="No rooms yet"
        message="Add a room above, or load the demo dataset from the header."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Capacity</th>
            {onDelete && <th className="text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="font-medium">{room.name}</td>
              <td className="font-mono text-muted">{room.capacity}</td>
              {onDelete && (
                <td className="text-right">
                  <button className="btn-danger btn-sm" onClick={() => onDelete(room.id)}>
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
