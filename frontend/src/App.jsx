import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Banner from './components/Banner.jsx'
import { useApp } from './context/AppContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Exams from './pages/Exams.jsx'
import Rooms from './pages/Rooms.jsx'
import Allocation from './pages/Allocation.jsx'
import Algorithm from './pages/Algorithm.jsx'

function Layout() {
  const { notice, dismissNotice } = useApp()
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-5 py-6 lg:px-7">
          {notice && (
            <div className="mb-5">
              <Banner notice={notice} onDismiss={dismissNotice} />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/algorithm" element={<Algorithm />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
