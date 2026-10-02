// Local mirror of the backend greedy allocator.
//
// IMPORTANT: this is used ONLY in Demo Mode, when the FastAPI backend is
// unreachable. The UI clearly labels results computed here so that a local
// result is never presented as a backend allocation.

function toMinutes(value) {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

function overlaps(reservation, exam) {
  if (reservation.date !== exam.date) return false
  const s = toMinutes(exam.start_time)
  const e = toMinutes(exam.end_time)
  return s < reservation.end && reservation.start < e
}

export function greedyAllocate(exams, rooms) {
  // 1. Largest exams first.
  const ordered = [...exams].sort((a, b) => b.students - a.students)
  // 2. Rooms smallest first.
  const roomsAsc = [...rooms].sort((a, b) => a.capacity - b.capacity)

  const reservations = []
  const allocations = []
  const unallocated = []
  const decisions = []
  let conflicts = 0

  ordered.forEach((exam, i) => {
    const examId = exam.id || `E${String(i + 1).padStart(2, '0')}`
    const busy = new Set(reservations.filter((r) => overlaps(r, exam)).map((r) => r.room_id))

    let chosen = null
    const candidates = []
    for (const room of roomsAsc) {
      let status
      if (room.capacity < exam.students) status = 'insufficient'
      else if (busy.has(room.id)) status = 'occupied'
      else if (chosen === null) {
        status = 'selected'
        chosen = room
      } else status = 'not_needed'
      candidates.push({ room: room.name, capacity: room.capacity, status })
    }

    let reason
    let chosenCandidate = null
    if (chosen) {
      reservations.push({
        room_id: chosen.id,
        date: exam.date,
        start: toMinutes(exam.start_time),
        end: toMinutes(exam.end_time),
      })
      const unused = chosen.capacity - exam.students
      allocations.push({
        exam_id: examId,
        subject: exam.subject,
        students: exam.students,
        date: exam.date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        room_id: chosen.id,
        room: chosen.name,
        capacity: chosen.capacity,
        utilization: chosen.capacity ? Math.round((exam.students / chosen.capacity) * 1000) / 10 : 0,
        unused_seats: unused,
        status: 'allocated',
      })
      const occupiedSmaller = candidates.filter(
        (candidate) => candidate.status === 'occupied' && candidate.capacity < chosen.capacity,
      )
      if (occupiedSmaller.length) {
        const blocked = occupiedSmaller
          .map((candidate) => `${candidate.room} (${candidate.capacity} seats)`)
          .join(', ')
        const verb = occupiedSmaller.length === 1 ? 'is' : 'are'
        reason = `${blocked} ${verb} occupied in this time slot; ${chosen.name} (${chosen.capacity} seats) is the smallest available room that can seat ${exam.students} students.`
      } else {
        reason = `${chosen.name} (${chosen.capacity} seats) is the smallest available room that can seat ${exam.students} students.`
      }
      chosenCandidate = { room: chosen.name, capacity: chosen.capacity, status: 'selected' }
    } else {
      const bigEnough = roomsAsc.filter((r) => r.capacity >= exam.students)
      if (bigEnough.length === 0) {
        reason = 'No room in the university is large enough for this exam.'
      } else if (bigEnough.every((r) => busy.has(r.id))) {
        reason = 'Every room large enough was already occupied by an overlapping exam.'
        conflicts += 1
      } else {
        reason = 'No suitable room was available for this exam.'
      }
      unallocated.push({
        exam_id: examId,
        subject: exam.subject,
        students: exam.students,
        date: exam.date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        status: 'unallocated',
        reason,
      })
    }

    decisions.push({
      exam_id: examId,
      subject: exam.subject,
      students: exam.students,
      date: exam.date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      candidates,
      chosen: chosenCandidate,
      reason,
    })
  })

  return { allocations, unallocated, decisions, conflicts }
}

export function computeMetrics(exams, allocations, unallocated, conflicts) {
  const totalStudents = exams.reduce((s, e) => s + e.students, 0)
  const studentsAllocated = allocations.reduce((s, a) => s + a.students, 0)
  const capacityUsed = allocations.reduce((s, a) => s + a.capacity, 0)
  return {
    total_exams: exams.length,
    allocated_exams: allocations.length,
    unallocated_exams: unallocated.length,
    total_rooms_used: new Set(allocations.map((a) => a.room_id)).size,
    total_students: totalStudents,
    students_allocated: studentsAllocated,
    total_capacity_used: capacityUsed,
    total_unused_seats: capacityUsed - studentsAllocated,
    utilization_percentage: capacityUsed
      ? Math.round((studentsAllocated / capacityUsed) * 10000) / 100
      : 0,
    conflicts,
  }
}
