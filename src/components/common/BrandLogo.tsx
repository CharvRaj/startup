import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'mark';
  className?: string;
  isLightMode?: boolean;
}

export function BrandLogo({ variant = 'full', className = '', isLightMode }: BrandLogoProps) {
  const goldId = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none group pr-2 ${className}`}>
      {/* Botanical Laurel Wreath Emblem */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          className="w-full h-full drop-shadow-xs"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`goldGrad-${goldId}`} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5D7A1" />
              <stop offset="35%" stopColor="#C5A059" />
              <stop offset="70%" stopColor="#9E7832" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <linearGradient id={`leafGrad-${goldId}`} x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E5BE76" />
              <stop offset="50%" stopColor="#BA9143" />
              <stop offset="100%" stopColor="#8A6623" />
            </linearGradient>
          </defs>

          {/* Left Laurel Branch */}
          <path
            d="M 32 52 C 20 52 12 43 12 31 C 12 19 21 12 30 10"
            stroke={`url(#goldGrad-${goldId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Leaves & Buds */}
          <path d="M 16 45 C 11 44 9 40 12 36 C 15 38 17 41 16 45 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 13 36 C 8 34 8 29 11 27 C 13 30 14 33 13 36 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 14 27 C 10 24 12 18 15 18 C 17 21 17 25 14 27 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 20 18 C 18 14 22 10 25 10 C 26 13 24 17 20 18 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 28 12 C 26 8 30 6 32 6 C 32 9 30 12 28 12 Z" fill={`url(#leafGrad-${goldId})`} />

          {/* Left Sprigs */}
          <path d="M 18 41 C 21 38 23 37 25 38" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="26" cy="38" r="1.1" fill={`url(#goldGrad-${goldId})`} />
          <path d="M 16 31 C 19 29 21 30 22 31" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="23" cy="31" r="1.1" fill={`url(#goldGrad-${goldId})`} />
          <path d="M 20 23 C 23 23 24 25 25 25" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="26" cy="25" r="1.1" fill={`url(#goldGrad-${goldId})`} />

          {/* Right Laurel Branch */}
          <path
            d="M 32 52 C 44 52 52 43 52 31 C 52 19 43 12 34 10"
            stroke={`url(#goldGrad-${goldId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Leaves & Buds */}
          <path d="M 48 45 C 53 44 55 40 52 36 C 49 38 47 41 48 45 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 51 36 C 56 34 56 29 53 27 C 51 30 50 33 51 36 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 50 27 C 54 24 52 18 49 18 C 47 21 47 25 50 27 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 44 18 C 46 14 42 10 39 10 C 38 13 40 17 44 18 Z" fill={`url(#leafGrad-${goldId})`} />
          <path d="M 36 12 C 38 8 34 6 32 6 C 32 9 34 12 36 12 Z" fill={`url(#leafGrad-${goldId})`} />

          {/* Right Sprigs */}
          <path d="M 46 41 C 43 38 41 37 39 38" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="38" cy="38" r="1.1" fill={`url(#goldGrad-${goldId})`} />
          <path d="M 48 31 C 45 29 43 30 42 31" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="41" cy="31" r="1.1" fill={`url(#goldGrad-${goldId})`} />
          <path d="M 44 23 C 41 23 40 25 39 25" stroke={`url(#goldGrad-${goldId})`} strokeWidth="0.9" fill="none" />
          <circle cx="38" cy="25" r="1.1" fill={`url(#goldGrad-${goldId})`} />

          {/* Center Sparkle Star */}
          <path
            d="M 32 24 L 33.2 28.5 L 37.5 29.5 L 33.5 32 L 34.5 36.5 L 32 34 L 29.5 36.5 L 30.5 32 L 26.5 29.5 L 30.8 28.5 Z"
            fill={`url(#goldGrad-${goldId})`}
            opacity="0.95"
          />

          {/* Stem Tie */}
          <path d="M 28 51 C 32 54 32 54 36 51" stroke={`url(#goldGrad-${goldId})`} strokeWidth="1.2" fill="none" />
          <path d="M 30 53 L 26 58" stroke={`url(#goldGrad-${goldId})`} strokeWidth="1.1" strokeLinecap="round" />
          <path d="M 34 53 L 38 58" stroke={`url(#goldGrad-${goldId})`} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'mark' && (
        <div className="flex flex-col text-left justify-center leading-none whitespace-nowrap">
          {/* Main Title: BLINDGLOW */}
          <span
            className="font-serif text-[1.05rem] sm:text-[1.18rem] font-bold tracking-[0.15em] uppercase transition-colors"
            style={{
              fontFamily: "'Playfair Display', 'Cinzel', 'Didot', 'Georgia', serif",
              letterSpacing: '0.15em',
              background: isLightMode
                ? 'linear-gradient(135deg, #8C6510 0%, #BA8E3A 40%, #7E5919 100%)'
                : 'linear-gradient(135deg, #F5D7A1 0%, #D4AF7A 50%, #C48E59 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BLINDGLOW
          </span>

          {/* Subtitle: BEAUTY AT YOUR DOORSTEP BY SATGURU */}
          <span
            className="text-[6.5px] sm:text-[7.2px] font-semibold tracking-[0.2em] uppercase transition-colors mt-0.5"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              letterSpacing: '0.2em',
              color: isLightMode ? '#7A6237' : 'rgba(235, 215, 178, 0.85)',
            }}
          >
            BEAUTY AT YOUR DOORSTEP BY SATGURU
          </span>
        </div>
      )}
    </div>
  );
}
