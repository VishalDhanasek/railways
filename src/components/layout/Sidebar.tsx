import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Wrench,
  TrainFront,
  Boxes,
  Package,
  ChevronDown,
  TicketCheck,
} from 'lucide-react';

const linkBase =
  'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors';
const linkInactive = 'text-slate-300 hover:bg-white/5 hover:text-white';
const linkActive = 'bg-brand-600 text-white shadow-sm';

export default function Sidebar() {
  const location = useLocation();
  const [alterationOpen, setAlterationOpen] = useState(location.pathname.startsWith('/alteration'));

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-slate-900">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
          <TrainFront className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold tracking-wide text-white">NOMENCLATURE</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <NavLink to="/" end className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <div>
          <button
            type="button"
            onClick={() => setAlterationOpen((v) => !v)}
            className={clsx(
              linkBase,
              'w-full justify-between',
              location.pathname.startsWith('/alteration') ? 'text-white' : linkInactive,
            )}
          >
            <span className="flex items-center gap-2.5">
              <Wrench className="h-4 w-4" />
              Nomenclature Alteration
            </span>
            <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', alterationOpen && 'rotate-180')} />
          </button>

          {alterationOpen && (
            <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
              <NavLink
                to="/alteration/coach"
                className={({ isActive }) => clsx(linkBase, 'py-1.5', isActive ? linkActive : linkInactive)}
              >
                <TrainFront className="h-3.5 w-3.5" />
                Coach
              </NavLink>
              <NavLink
                to="/alteration/wagon"
                className={({ isActive }) => clsx(linkBase, 'py-1.5', isActive ? linkActive : linkInactive)}
              >
                <Package className="h-3.5 w-3.5" />
                Wagon
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/stocking" className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
          <Boxes className="h-4 w-4" />
          Stocking Application
        </NavLink>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <TicketCheck className="h-3.5 w-3.5" />
          <span>v1.0.0 · Mock Data Mode</span>
        </div>
      </div>
    </aside>
  );
}
