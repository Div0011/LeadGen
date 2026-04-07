'use client';

import React from 'react';

interface InputProps {
  label?: string;
  error?: string;
  className?: string;
  [key: string]: any;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-white/60 backdrop-blur-md
            border border-white/70 text-slate-900
            placeholder-slate-400 placeholder-opacity-70
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-0
            focus:bg-white/80 focus:border-teal-300
            hover:bg-white/70 hover:border-white/80
            ${error ? 'border-red-500/50 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
