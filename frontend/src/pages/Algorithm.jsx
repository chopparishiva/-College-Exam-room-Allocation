import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'

const STEPS = [
  { n: '01', title: 'Sort examinations by student count', body: 'Largest exams first — they have the fewest room options, so they choose before the small ones.' },
  { n: '02', title: 'Sort rooms by capacity', body: 'Rooms are scanned from smallest to largest so the first room that fits is the tightest fit.' },
  { n: '03', title: 'Select the smallest room that fits', body: 'The first room whose capacity is >= the exam’s students is the greedy choice.' },
  { n: '04', title: 'Reserve the room for that time slot', body: 'The room is marked busy for the exam’s interval, so overlapping exams cannot reuse it.' },
  { n: '05', title: 'Repeat until every exam is processed', body: 'Any exam with no suitable free room is reported as unallocated, with a reason.' },
]

const CANDIDATES = [
  { room: 'A101', capacity: 50, status: 'insufficient' },
  { room: 'A102', capacity: 70, status: 'selected' },
  { room: 'A103', capacity: 100, status: 'not_needed' },
  { room: 'A104', capacity: 150, status: 'not_needed' },
]

const STATUS_META = {
  insufficient: { Icon: XCircle, cls: 'text-red-300', note: 'Too small' },
  selected: { Icon: CheckCircle2, cls: 'text-emerald-300', note: 'Selected' },
  not_needed: { Icon: MinusCircle, cls: 'text-muted', note: 'Not needed' },
}

export default function Algorithm() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">How the Greedy Algorithm Works</h2>
        <p className="text-sm text-muted">
          ExamOpt uses a best-fit greedy strategy: at every step it makes the locally best choice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STEPS.map((s) => (
          <div key={s.n} className="card card-pad">
            <div className="font-mono text-xs tracking-widest text-accent2">{s.n}</div>
            <h3 className="mt-2 text-sm font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="mb-2 text-sm font-medium text-ink">Time-Conflict Demo</h3>
        <p className="mb-4 text-sm text-muted">
          Load the Conflict Demo and generate an allocation to see this exact sequence. All four exams
          overlap from 09:00 to 12:00, and the greedy allocator processes the largest first.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-line bg-base/40 p-3 text-sm">
            <div className="font-medium text-ink">140 students → A203</div>
            <div className="mt-1 text-muted">The 150-seat room is the smallest fit.</div>
          </div>
          <div className="rounded-lg border border-line bg-base/40 p-3 text-sm">
            <div className="font-medium text-ink">100 students → A201</div>
            <div className="mt-1 text-muted">The 100-seat room is still free.</div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <div className="font-medium text-ink">90 students → A202</div>
            <div className="mt-1 text-muted">A201 is occupied; A202 is the next available fit.</div>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <div className="font-medium text-ink">80 students → Unallocated</div>
            <div className="mt-1 text-muted">All three suitable rooms are occupied.</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-1 text-sm font-medium text-ink">Worked Example</h3>
          <p className="mb-4 text-sm text-muted">
            Exam: <span className="text-ink">Data Structures</span> —{' '}
            <span className="font-mono text-ink">65 students</span>
          </p>

          <div className="space-y-2">
            {CANDIDATES.map((c) => {
              const meta = STATUS_META[c.status]
              const { Icon } = meta
              return (
                <div
                  key={c.room}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                    c.status === 'selected' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-line bg-base/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={meta.cls} />
                    <span className="font-mono text-ink">{c.room}</span>
                    <span className="font-mono text-muted">{c.capacity} seats</span>
                  </div>
                  <span className={`text-xs ${meta.cls}`}>{meta.note}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-indigo-100">
            The greedy choice is <strong>A102</strong> because it is the smallest available room that
            can accommodate 65 students. Choosing 100 or 150 would waste 35–85 seats.
          </div>
        </div>

        <div className="space-y-6">
          <div className="card card-pad">
            <h3 className="mb-3 text-sm font-medium text-ink">Why Greedy?</h3>
            <p className="text-sm text-muted">
              At every step we take the smallest room that can still seat the current examination.
              Keeping the large rooms free means the large exams that come later still have a home.
              Reservations prevent overlapping exams from sharing a room. If every suitable room is
              occupied, the exam is reported as unallocated rather than double-booked. This local
              rule avoids searching every possible combination — which is exactly the point of a
              greedy algorithm.
            </p>
          </div>

          <div className="card card-pad">
            <h3 className="mb-3 text-sm font-medium text-ink">Complexity Analysis</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <span className="text-ink">Sort exams:</span> O(E log E)
              </li>
              <li>
                <span className="text-ink">Sort rooms:</span> O(R log R)
              </li>
              <li>
                <span className="text-ink">Allocation loop:</span> for each of E exams we scan R
                rooms and check up to E existing reservations → O(E · (R + E)) = O(E·R + E²)
              </li>
              <li>
                <span className="text-ink">Total time:</span> O(E log E + R log R + E·R + E²)
              </li>
              <li>
                <span className="text-ink">Space:</span> O(E + R) for reservations and results
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              E = number of exams, R = number of rooms. The implementation is intentionally simple
              (linear scans) so the greedy logic is easy to read and explain.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
