import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, DoorOpen, GitBranch, ListOrdered } from 'lucide-react'

export const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exams', label: 'Examinations', icon: GraduationCap },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen },
  { to: '/allocation', label: 'Allocation', icon: GitBranch },
  { to: '/algorithm', label: 'Algorithm', icon: ListOrdered },
]

export default function Sidebar() {
  return (
    <aside className="z-20 flex w-full shrink-0 flex-col gap-1 border-b border-line bg-surface/95 px-3 py-3 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
      <div className="flex items-center gap-3 lg:px-2 lg:pb-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent font-bold text-white shadow-lg shadow-accent/30">
          EO
        </span>
        <div className="leading-tight">
          <div className="text-base font-semibold text-ink">ExamOpt</div>
          <div className="hidden text-[11px] text-muted sm:block">
            Greedy-Powered Examination Scheduling
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link whitespace-nowrap ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden border-t border-line px-3 pt-4 text-[11px] uppercase tracking-wider text-muted lg:block">
        DAA Hackathon Prototype
      </div>
    </aside>
  )
}
