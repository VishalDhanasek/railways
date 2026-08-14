import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export default function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      className={clsx(
        'h-9 w-full rounded-md border bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2',
        invalid
          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
        className,
      )}
      {...rest}
    />
  );
}
