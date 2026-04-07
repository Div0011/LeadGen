'use client';
import React, { useEffect, useRef, memo } from 'react';

// Memoized single logo component to prevent re-renders
const LogoDot = memo(function LogoDot() {
  return (
    <div style={{ 
      width: '45px', 
      height: '45px', 
      flexShrink: 0,
      background: 'var(--rust)',
      borderRadius: '50%',
      opacity: 0.08,
      transform: 'rotate(45deg)'
    }} />
  );
});

// Single row component
const LogoRow = memo(function LogoRow({ index }: { index: number }) {
  const cols = Array.from({ length: 20 });
  
  return (
    <div 
      className="watermark-row"
      data-index={index}
      style={{
        display: 'flex',
        gap: '6rem',
        marginBottom: '2rem',
        willChange: 'transform'
      }}
    >
      {cols.map((_, c) => (
        <LogoDot key={c} />
      ))}
    </div>
  );
});

export default function WatermarkBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const rows = document.querySelectorAll('.watermark-row') as NodeListOf<HTMLElement>;
    
    const updatePositions = () => {
      rows.forEach((row) => {
        const index = parseInt(row.dataset.index || '0', 10);
        const isOdd = index % 2 === 1;
        const direction = isOdd ? -1 : 1;
        
        const scrollMovement = scrollPosRef.current * 0.15;
        const mouseMovement = isOdd 
          ? -(mousePosRef.current.y * 0.03) 
          : (mousePosRef.current.y * 0.03);
        
        row.style.transform = `translateX(${(scrollMovement + mouseMovement) * direction}px)`;
      });
      
      animationRef.current = requestAnimationFrame(updatePositions);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(updatePositions);

    const handleScroll = () => {
      scrollPosRef.current = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    // Use passive listeners for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const rows = Array.from({ length: 25 });

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: '-50vh',
      left: '-50vw',
      width: '250vw',
      height: '250vh',
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'rotate(-30deg)',
      opacity: 1
    }}>
      <style jsx>{`
        .watermark-container {
          background: linear-gradient(135deg, 
            rgba(139, 74, 47, 0.03) 0%, 
            rgba(196, 148, 58, 0.02) 50%,
            rgba(139, 74, 47, 0.03) 100%
          );
        }
      `}</style>
      {rows.map((_, r) => (
        <LogoRow key={r} index={r} />
      ))}
    </div>
  );
}
