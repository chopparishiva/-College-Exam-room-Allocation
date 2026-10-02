// Frontend demo data — mirrors backend/app/data/demo_data.py so that
// "Demo Mode" (backend offline) shows exactly the same dataset.

export const DATE = '2025-11-10'

export const ROOMS = [
  { id: 'R01', name: 'A101', capacity: 50 },
  { id: 'R02', name: 'B101', capacity: 60 },
  { id: 'R03', name: 'A102', capacity: 70 },
  { id: 'R04', name: 'B102', capacity: 80 },
  { id: 'R05', name: 'C101', capacity: 90 },
  { id: 'R06', name: 'A103', capacity: 100 },
  { id: 'R07', name: 'B103', capacity: 120 },
  { id: 'R08', name: 'A104', capacity: 150 },
  { id: 'R09', name: 'C102', capacity: 160 },
  { id: 'R10', name: 'A105', capacity: 200 },
]

export const NORMAL_EXAMS = [
  { id: 'E01', subject: 'Machine Learning', students: 130, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E02', subject: 'Mathematics', students: 120, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E03', subject: 'Artificial Intelligence', students: 110, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E04', subject: 'Operating Systems', students: 95, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E05', subject: 'Computer Networks', students: 75, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E06', subject: 'Physics', students: 80, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E07', subject: 'Discrete Mathematics', students: 100, date: DATE, start_time: '14:00', end_time: '17:00' },
  { id: 'E08', subject: 'Thermodynamics', students: 88, date: DATE, start_time: '14:00', end_time: '17:00' },
  { id: 'E09', subject: 'Data Structures', students: 65, date: DATE, start_time: '14:00', end_time: '17:00' },
  { id: 'E10', subject: 'Digital Electronics', students: 55, date: DATE, start_time: '14:00', end_time: '17:00' },
  { id: 'E11', subject: 'Signals and Systems', students: 45, date: DATE, start_time: '14:00', end_time: '17:00' },
  { id: 'E12', subject: 'DBMS', students: 40, date: DATE, start_time: '14:00', end_time: '17:00' },
]

export const STRESS_EXAMS = NORMAL_EXAMS.concat([
  { id: 'E13', subject: 'Quantum Computing', students: 190, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'E14', subject: 'Advanced Cryptography', students: 500, date: DATE, start_time: '09:00', end_time: '12:00' },
])

export const STRESS_ROOMS = ROOMS.concat([{ id: 'R11', name: 'D101', capacity: 250 }])

export const CONFLICT_EXAMS = [
  { id: 'C01', subject: 'Advanced Mathematics', students: 140, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'C02', subject: 'Computer Science', students: 100, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'C03', subject: 'Database Systems', students: 90, date: DATE, start_time: '09:00', end_time: '12:00' },
  { id: 'C04', subject: 'Statistics', students: 80, date: DATE, start_time: '09:00', end_time: '12:00' },
]

export const CONFLICT_ROOMS = [
  { id: 'C-R01', name: 'A201', capacity: 100 },
  { id: 'C-R02', name: 'A202', capacity: 120 },
  { id: 'C-R03', name: 'A203', capacity: 150 },
]

export function getDataset(name = 'normal') {
  if (name === 'stress') {
    return { dataset: 'stress', exams: STRESS_EXAMS, rooms: STRESS_ROOMS }
  }
  if (name === 'conflict') {
    return { dataset: 'conflict', exams: CONFLICT_EXAMS, rooms: CONFLICT_ROOMS }
  }
  return { dataset: 'normal', exams: NORMAL_EXAMS, rooms: ROOMS }
}
