'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              'placeholder:text-[var(--text-muted)]',
              'transition-all',
              Icon && 'pl-10',
              error && 'border-[var(--error)] focus:ring-[var(--error)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
