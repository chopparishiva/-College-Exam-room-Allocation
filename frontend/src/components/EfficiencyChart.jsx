import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Room utilisation: for every allocated room, how many seats were used
// (students) versus left unused.
export default function EfficiencyChart({ allocations }) {
  if (!allocations || allocations.length === 0) return null

  const data = allocations.map((a) => ({
    name: a.room,
    Used: a.students,
    Unused: a.unused_seats,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#232838" vertical={false} />
          <XAxis dataKey="name" stroke="#8b93ab" fontSize={12} tickLine={false} />
          <YAxis stroke="#8b93ab" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#12141d',
              border: '1px solid #232838',
              borderRadius: 10,
              color: '#e7e9f2',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#8b93ab' }} />
          <Bar dataKey="Used" stackId="seats" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Unused" stackId="seats" fill="#2b3040" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
