'use client';

import React, { ReactNode } from 'react';

type GlassCardIntensity = 'light' | 'medium' | 'dark' | 'subtle';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  intensity?: GlassCardIntensity;
  hover?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', intensity = 'light', hover = true, ...props }, ref) => {
    const baseStyles = 'rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-xl border';

    const intensities: Record<GlassCardIntensity, string> = {
      light: 'bg-[rgba(245,240,232,0.7)] border-[rgba(184,169,138,0.3)]',
      medium: 'bg-[rgba(237,229,208,0.5)] border-[rgba(184,169,138,0.25)]',
      dark: 'bg-[rgba(0,0,0,0.3)] border-[rgba(184,169,138,0.1)]',
      subtle: 'bg-[rgba(245,240,232,0.03)] border-[rgba(184,169,138,0.05)]',
    };

    const hoverClass = hover ? 'hover:border-[rgba(184,169,138,0.5)] hover:shadow-lg' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${intensities[intensity as GlassCardIntensity]} ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
