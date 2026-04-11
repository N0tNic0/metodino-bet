import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-w-0 max-w-full rounded-xl border bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500',
            'transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-700 focus:border-violet-500 focus:ring-violet-500/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
