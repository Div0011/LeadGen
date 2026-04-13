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

    const intensities: Record<GlassCardIntensity, React.CSSProperties> = {
      light: { background: 'color-mix(in srgb, var(--ivory) 70%, transparent)', borderColor: 'color-mix(in srgb, var(--tan) 30%, transparent)' },
      medium: { background: 'color-mix(in srgb, var(--parchment) 50%, transparent)', borderColor: 'color-mix(in srgb, var(--tan) 25%, transparent)' },
      dark: { background: 'rgba(0,0,0,0.3)', borderColor: 'color-mix(in srgb, var(--tan) 10%, transparent)' },
      subtle: { background: 'color-mix(in srgb, var(--ivory) 3%, transparent)', borderColor: 'color-mix(in srgb, var(--tan) 5%, transparent)' },
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hover ? 'hover:shadow-lg' : ''} ${className}`}
        style={intensities[intensity as GlassCardIntensity]}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
