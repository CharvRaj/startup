import React, { useState, useEffect } from 'react';

interface VelvetCurtainRevealProps {
  children?: React.ReactNode;
  triggerScrollY?: number;
  className?: string;
}

export function VelvetCurtainReveal({
  children,
  triggerScrollY = 120,
  className = '',
}: VelvetCurtainRevealProps) {
  const [curtainsOpen, setCurtainsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > triggerScrollY) {
        setCurtainsOpen(true);
      } else {
        setCurtainsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerScrollY]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <style>{`
        .curtain-drape {
          background: linear-gradient(90deg, #3d050d 0%, #610916 25%, #7a0c1c 50%, #520611 75%, #3d050d 100%);
          box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.7);
        }
      `}</style>

      {/* Main Content Revealed Inside the Royal Hall */}
      {children}

      {/* LEFT VELVET CURTAIN */}
      <div
        className="curtain-drape absolute top-0 bottom-0 left-0 w-1/2 pointer-events-none z-20 transition-transform duration-1000 ease-out"
        style={{
          transform: curtainsOpen ? 'translateX(-92%)' : 'translateX(0%)',
          borderRight: '4px solid #d4af37',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Vertical Velvet Folds */}
        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,rgba(0,0,0,0.6)_20px,transparent_40px)]" />
        {/* Golden Tassel Tieback */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-16 rounded-l-full bg-gradient-to-l from-[#d4af37] to-[#8c6b1b] shadow-md border-l border-amber-200" />
      </div>

      {/* RIGHT VELVET CURTAIN */}
      <div
        className="curtain-drape absolute top-0 bottom-0 right-0 w-1/2 pointer-events-none z-20 transition-transform duration-1000 ease-out"
        style={{
          transform: curtainsOpen ? 'translateX(92%)' : 'translateX(0%)',
          borderLeft: '4px solid #d4af37',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Vertical Velvet Folds */}
        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,rgba(0,0,0,0.6)_20px,transparent_40px)]" />
        {/* Golden Tassel Tieback */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-16 rounded-r-full bg-gradient-to-r from-[#d4af37] to-[#8c6b1b] shadow-md border-r border-amber-200" />
      </div>
    </div>
  );
}
