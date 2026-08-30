import React from 'react';

interface VinyasaLogoProps {
  variant?: 'full' | 'compact' | 'symbol-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDomain?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const VinyasaLogo: React.FC<VinyasaLogoProps> = ({
  variant = 'full',
  size = 'md',
  showDomain = false,
  className = '',
  theme = 'dark',
}) => {
  // Dimension scaling
  const sizeConfig = {
    sm: { symbol: 'h-7 w-7', text: 'text-base', sub: 'text-[9px]', tracking: 'tracking-[0.25em]' },
    md: { symbol: 'h-9 w-9', text: 'text-xl', sub: 'text-[10px]', tracking: 'tracking-[0.32em]' },
    lg: { symbol: 'h-12 w-12', text: 'text-2xl', sub: 'text-xs', tracking: 'tracking-[0.38em]' },
    xl: { symbol: 'h-16 w-16', text: 'text-3xl', sub: 'text-sm', tracking: 'tracking-[0.42em]' },
  }[size];

  // Precision SVG Circuit Building Emblem matching the uploaded 4K brand artifact
  const SymbolSVG = (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeConfig.symbol}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.45)]"
      >
        <defs>
          <linearGradient id="vinyasaGrad" x1="80" y1="10" x2="80" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#00E5FF" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          <linearGradient id="glowG" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Central High-Rise Tower Spine & Circuit Traces */}
        <g stroke="url(#vinyasaGrad)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Central Spire */}
          <path d="M80 20 L80 135" />
          {/* Top Spire Chevron */}
          <path d="M70 42 L80 22 L90 42" />
          <path d="M70 42 L70 120 L80 135 L90 120 L90 42" />
          {/* Inner Vertical Track Dividers */}
          <path d="M75 58 L75 108" />
          <path d="M85 58 L85 108" />

          {/* Left Wing Architectural Circuit Tracks */}
          <path d="M80 135 L52 82 L52 50" />
          <path d="M70 120 L40 68 L22 38" />
          <path d="M62 105 L30 48" />

          {/* Right Wing Architectural Circuit Tracks */}
          <path d="M80 135 L108 82 L108 50" />
          <path d="M90 120 L120 68 L138 38" />
          <path d="M98 105 L130 48" />
        </g>

        {/* Circuit Terminal Nodes / PCB Solder Pads */}
        {/* Summit Top Node */}
        <circle cx="80" cy="20" r="5" fill="#00E5FF" filter="url(#neonGlow)" />
        <circle cx="80" cy="20" r="2.5" fill="#FFFFFF" />

        {/* Outer Left Nodes */}
        <circle cx="22" cy="38" r="4" fill="#00E5FF" />
        <circle cx="22" cy="38" r="1.8" fill="#FFFFFF" />
        <circle cx="30" cy="48" r="3.2" fill="#00E5FF" />
        <circle cx="52" cy="50" r="3.6" fill="#00E5FF" />
        <circle cx="52" cy="50" r="1.6" fill="#FFFFFF" />
        <circle cx="40" cy="68" r="3" fill="#00B0FF" />

        {/* Outer Right Nodes */}
        <circle cx="138" cy="38" r="4" fill="#00E5FF" />
        <circle cx="138" cy="38" r="1.8" fill="#FFFFFF" />
        <circle cx="130" cy="48" r="3.2" fill="#00E5FF" />
        <circle cx="108" cy="50" r="3.6" fill="#00E5FF" />
        <circle cx="108" cy="50" r="1.6" fill="#FFFFFF" />
        <circle cx="120" cy="68" r="3" fill="#00B0FF" />

        {/* Base Bottom V Nodes */}
        <circle cx="68" cy="132" r="3.5" fill="#2563EB" />
        <circle cx="92" cy="132" r="3.5" fill="#2563EB" />
        <circle cx="80" cy="142" r="4.2" fill="#00E5FF" filter="url(#neonGlow)" />
        <circle cx="80" cy="142" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );

  if (variant === 'symbol-only') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolSVG}</div>;
  }

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const subColor = theme === 'light' ? 'text-slate-500' : 'text-slate-400';

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {SymbolSVG}
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-center justify-center tracking-[0.4em] font-extrabold text-2xl text-white font-['Outfit',sans-serif]">
            <span>VINY</span>
            <span className="relative">
              <span>A</span>
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]"></span>
            </span>
            <span>S</span>
            <span className="text-cyan-400">A</span>
          </div>
          <span className="text-[11px] font-medium tracking-[0.25em] text-slate-300 uppercase mt-2 font-sans">
            Building Compliance Intelligence
          </span>
          {showDomain && (
            <span className="text-[10px] text-cyan-400/90 font-mono tracking-wider mt-1 hover:underline">
              www.vinyasa.online
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {SymbolSVG}

      <div className="flex flex-col justify-center">
        {/* Brand Wordmark with precision glyphs & cyan accents */}
        <div
          className={`flex items-baseline font-black leading-none ${sizeConfig.text} ${sizeConfig.tracking} ${textColor} font-['Outfit',sans-serif]`}
        >
          <span className="tracking-[0.28em]">V</span>
          <span className="tracking-[0.28em]">I</span>
          <span className="tracking-[0.28em]">N</span>
          <span className="relative tracking-[0.28em]">
            <span>Y</span>
            <span className="absolute -bottom-1 left-0 right-1 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_6px_#00E5FF]"></span>
          </span>
          <span className="tracking-[0.28em]">A</span>
          <span className="tracking-[0.28em]">S</span>
          <span className="text-cyan-400 tracking-normal drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
            A
          </span>
        </div>

        {/* Descriptor Tagline */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`font-medium uppercase ${sizeConfig.sub} ${subColor} tracking-[0.24em] whitespace-nowrap`}
          >
            Building Compliance Intelligence
          </span>
          {showDomain && (
            <span className="hidden xl:inline-block text-[10px] text-cyan-400 font-mono tracking-normal bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
              www.vinyasa.online
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
