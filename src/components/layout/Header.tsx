import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DropdownMenu from '@/components/ui/DropdownMenu';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shrink-0">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <p className="text-[13px] font-medium text-slate-400">{today}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="relative rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="h-8 w-px bg-slate-200" />

          <DropdownMenu
            align="right"
            trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-slate-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">
                  {user ? initials(user.name) : '—'}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[13px] font-medium text-slate-700">{user?.name ?? 'Guest'}</p>
                  <p className="text-[11px] text-slate-400">{user?.role ?? ''}</p>
                </div>
              </button>
            )}
            items={[{ label: 'Log out', icon: <LogOut className="h-3.5 w-3.5 text-slate-400" />, onClick: handleLogout }]}
          />
        </div>
      </header>
    </div>
  );
}
