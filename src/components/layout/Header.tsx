import { Bell, HelpCircle } from 'lucide-react';

export default function Header() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
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
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">
            RK
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-slate-700">Rajesh Kumar</p>
            <p className="text-[11px] text-slate-400">Divisional Officer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
