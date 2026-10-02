import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api.js'
import { getDataset } from '../data/demoData.js'
import { computeMetrics, greedyAllocate } from '../services/localAllocator.js'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

let noticeId = 0

export function AppProvider({ children }) {
  const [exams, setExams] = useState([])
  const [rooms, setRooms] = useState([])
  const [dataset, setDataset] = useState('normal')
  const [allocation, setAllocation] = useState(null) // { allocations, unallocated, metrics, decisions }
  const [runMode, setRunMode] = useState(null) // 'live' | 'demo' — how the last result was produced
  const [backendOnline, setBackendOnline] = useState(null) // null = checking
  const [running, setRunning] = useState(false)
  const [booting, setBooting] = useState(true)
  const [notice, setNotice] = useState(null) // { type, message }

  const pushNotice = useCallback((type, message) => {
    noticeId += 1
    setNotice({ id: noticeId, type, message })
  }, [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  // ---------------------------------------------------------------- bootstrap
  const bootstrap = useCallback(async () => {
    setBooting(true)
    try {
      await api.getHealth()
      setBackendOnline(true)
      const data = await api.getDemoData('normal')
      setExams(data.exams)
      setRooms(data.rooms)
      setDataset(data.dataset)
    } catch {
      // Backend is not reachable: fall back to clearly-labelled Demo Mode.
      setBackendOnline(false)
      const data = getDataset('normal')
      setExams(data.exams)
      setRooms(data.rooms)
      setDataset(data.dataset)
      pushNotice('warning', 'Backend unavailable — running in Demo Mode with local data.')
    } finally {
      setBooting(false)
    }
  }, [pushNotice])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // ---------------------------------------------------------------- datasets
  const loadDataset = useCallback(
    async (name) => {
      setAllocation(null)
      setRunMode(null)
      if (backendOnline) {
        try {
          const data = await api.getDemoData(name)
          setExams(data.exams)
          setRooms(data.rooms)
          setDataset(data.dataset)
          pushNotice('info', `Loaded the ${name} dataset (${data.exams.length} exams).`)
          return
        } catch {
          setBackendOnline(false)
          pushNotice('warning', 'Backend unavailable — switching to Demo Mode.')
        }
      }
      const data = getDataset(name)
      setExams(data.exams)
      setRooms(data.rooms)
      setDataset(data.dataset)
      pushNotice('info', `Loaded the ${name} dataset (local Demo Mode).`)
    },
    [backendOnline, pushNotice],
  )

  // ---------------------------------------------------------------- exams
  const addExam = useCallback(
    async (exam) => {
      const record = { ...exam, id: `E${Date.now().toString().slice(-4)}` }
      if (backendOnline) {
        try {
          await api.validateExam(exam)
        } catch (error) {
          pushNotice('error', error.message)
          return false
        }
      }
      setExams((prev) => [...prev, record])
      setAllocation(null)
      pushNotice('success', `Added exam "${record.subject}".`)
      return true
    },
    [backendOnline, pushNotice],
  )

  const deleteExam = useCallback(
    (id) => {
      setExams((prev) => prev.filter((e) => e.id !== id))
      setAllocation(null)
    },
    [],
  )

  // ---------------------------------------------------------------- rooms
  const addRoom = useCallback(
    async (room) => {
      const record = { ...room, id: `R${Date.now().toString().slice(-4)}` }
      if (backendOnline) {
        try {
          await api.validateRoom(room)
        } catch (error) {
          pushNotice('error', error.message)
          return false
        }
      }
      setRooms((prev) => [...prev, record])
      setAllocation(null)
      pushNotice('success', `Added room "${record.name}".`)
      return true
    },
    [backendOnline, pushNotice],
  )

  const deleteRoom = useCallback((id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id))
    setAllocation(null)
  }, [])

  // ---------------------------------------------------------------- allocation
  const runAllocation = useCallback(async () => {
    setRunning(true)
    setNotice(null)
    try {
      if (backendOnline) {
        const result = await api.allocate(exams, rooms)
        setAllocation(result)
        setRunMode('live')
        return result
      }
      // Demo Mode: compute locally and label the result as such.
      const result = greedyAllocate(exams, rooms)
      const metrics = computeMetrics(exams, result.allocations, result.unallocated, result.conflicts)
      const payload = { ...result, metrics }
      setAllocation(payload)
      setRunMode('demo')
      return payload
    } catch (error) {
      setBackendOnline(false)
      const result = greedyAllocate(exams, rooms)
      const metrics = computeMetrics(exams, result.allocations, result.unallocated, result.conflicts)
      const payload = { ...result, metrics }
      setAllocation(payload)
      setRunMode('demo')
      pushNotice('warning', `Backend unavailable (${error.message}) — result computed locally in Demo Mode.`)
      return payload
    } finally {
      setRunning(false)
    }
  }, [backendOnline, exams, rooms, pushNotice])

  const value = useMemo(
    () => ({
      exams,
      rooms,
      dataset,
      allocation,
      runMode,
      backendOnline,
      running,
      booting,
      notice,
      pushNotice,
      dismissNotice,
      bootstrap,
      loadDataset,
      addExam,
      deleteExam,
      addRoom,
      deleteRoom,
      runAllocation,
    }),
    [
      exams, rooms, dataset, allocation, runMode, backendOnline, running, booting,
      notice, pushNotice, dismissNotice, bootstrap, loadDataset, addExam, deleteExam,
      addRoom, deleteRoom, runAllocation,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
