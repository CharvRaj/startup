import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'mark';
  className?: string;
  isLightMode?: boolean;
}

export function BrandLogo({ variant = 'full', className = '', isLightMode }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Luxury Crest / Emblem */}
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-60 blur-[6px] transition-opacity group-hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, rgba(201,149,108,0.4), rgba(190,24,93,0.3))',
          }}
        />

        {/* Outer crest border & background */}
        <div
          className="relative w-full h-full rounded-2xl flex items-center justify-center shadow-md overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2A1D27 0%, #1A121A 50%, #301E28 100%)',
            border: '1px solid rgba(212,175,122,0.45)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.2)',
          }}
        >
          {/* Subtle gold decorative ring */}
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background subtle starburst */}
            <circle cx="20" cy="20" r="16" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />

            {/* Lotus petal / crown arcs */}
            <path
              d="M20 7C22.5 11 25.5 13.5 29 14C27.5 17.5 25 20 20 21C15 20 12.5 17.5 11 14C14.5 13.5 17.5 11 20 7Z"
              fill="url(#goldGrad)"
              opacity="0.25"
            />
            {/* Stylized S and M Monogram lines */}
            <path
              d="M14 16.5C14.5 14.5 16.5 13.5 19 13.5C21.8 13.5 23.5 15 23 17C22.5 19 17 19.5 16.5 22C16 24.5 18 26 21 26C23 26 24.5 25 25 23.5"
              stroke="url(#goldGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tiny sparkle diamond at top */}
            <path
              d="M20 6.5L21.2 9L23.7 10.2L21.2 11.4L20 13.9L18.8 11.4L16.3 10.2L18.8 9L20 6.5Z"
              fill="url(#sparkleGrad)"
            />

            <defs>
              <linearGradient id="goldGrad" x1="10" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5D7A1" />
                <stop offset="0.4" stopColor="#D4AF7A" />
                <stop offset="0.7" stopColor="#C48E59" />
                <stop offset="1" stopColor="#E6C594" />
              </linearGradient>
              <linearGradient id="sparkleGrad" x1="16" y1="6" x2="24" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF2D6" />
                <stop offset="1" stopColor="#D4AF7A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {variant !== 'mark' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className="font-display text-lg sm:text-[1.28rem] font-bold tracking-[0.14em] uppercase transition-colors"
              style={{
                background: 'linear-gradient(135deg, #9C3D5A 0%, #B86B77 35%, #9E475A 65%, #C27E5A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Satguru
            </span>
            <span
              className="text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-widest uppercase ml-0.5"
              style={{
                background: 'rgba(201,149,108,0.12)',
                border: '1px solid rgba(201,149,108,0.25)',
                color: '#B07542',
              }}
            >
              Art
            </span>
          </div>
          <span
            className="text-[9px] sm:text-[9.5px] font-medium tracking-[0.24em] uppercase transition-colors"
            style={{
              color: isLightMode ? '#7D7571' : 'rgba(255,255,255,0.65)',
            }}
          >
            Makeup & Beauty Studio
          </span>
        </div>
      )}
    </div>
  );
}
