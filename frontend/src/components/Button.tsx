'use client';

import React, { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    const baseStyles = 'font-serif tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[#3D2E1E] text-[#F5F0E8] hover:bg-[#8B4A2F] hover:shadow-lg',
      secondary: 'bg-[#8B4A2F] text-[#F5F0E8] hover:bg-[#C4943A] hover:shadow-lg',
      tertiary: 'bg-transparent text-[#7A6A52] border border-[#B8A98A] hover:border-[#8B4A2F] hover:text-[#8B4A2F]',
      ghost: 'text-[#7A6A52] hover:text-[#8B4A2F] bg-transparent border-none',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant as ButtonVariant]} ${sizes[size as ButtonSize]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
