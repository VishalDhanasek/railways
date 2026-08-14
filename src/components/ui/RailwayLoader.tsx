import { TrainFront } from 'lucide-react';
import clsx from 'clsx';

interface RailwayLoaderProps {
  label?: string;
  className?: string;
}

/** A small train running along a track — the app's full-page/blocking loading state. */
export default function RailwayLoader({ label = 'Loading…', className }: RailwayLoaderProps) {
  return (
    <div className={clsx('flex flex-col items-center gap-4', className)}>
      <div className="relative h-8 w-48 overflow-hidden">
        <div className="rail-track absolute inset-x-0 bottom-0" />
        <TrainFront className="animate-train-travel absolute bottom-[3px] h-6 w-6 -translate-x-1/2 text-brand-600" />
      </div>
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}
