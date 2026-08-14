'use client';

import React from 'react';

interface SolarVisionLogoProps {
  variant?: 'full' | 'inline' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  onClick?: () => void;
}

export function SolarVisionLogo({
  variant = 'inline',
  size = 'md',
  className = '',
  theme = 'auto',
  onClick
}: SolarVisionLogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-24 h-24'
  };

  const isDark = theme === 'dark' || theme === 'auto';

  const Emblem = (
    <svg
      viewBox="0 0 200 200"
      className={`${iconSizes[size]} drop-shadow-[0_0_12px_rgba(250,204,21,0.25)] flex-shrink-0 transition-transform hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sunGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="panelGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        <filter id="glowGreenComp" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* TOP SUN RAYS */}
      <g>
        <polygon points="100,10 93,42 107,42" fill="url(#sunGradComp)" />
        <polygon points="72,20 74,49 87,44" fill="url(#sunGradComp)" />
        <polygon points="48,38 60,61 70,52" fill="url(#sunGradComp)" />
        <polygon points="128,20 113,44 126,49" fill="url(#sunGradComp)" />
        <polygon points="152,38 130,52 140,61" fill="url(#sunGradComp)" />
      </g>

      {/* CIRCUIT NODES (LEFT & RIGHT) */}
      <g stroke="#34D399" strokeWidth="1.5" opacity="0.85">
        <line x1="30" y1="55" x2="48" y2="70" />
        <line x1="48" y1="70" x2="35" y2="90" />
        <line x1="35" y1="90" x2="55" y2="105" />
        <line x1="55" y1="105" x2="25" y2="120" />
        <line x1="48" y1="70" x2="68" y2="75" />
        <line x1="35" y1="90" x2="65" y2="95" />
        <line x1="170" y1="55" x2="152" y2="70" />
        <line x1="152" y1="70" x2="165" y2="90" />
        <line x1="165" y1="90" x2="145" y2="105" />
        <line x1="145" y1="105" x2="175" y2="120" />
        <line x1="152" y1="70" x2="132" y2="75" />
      </g>

      <g fill="#10B981" filter="url(#glowGreenComp)">
        <circle cx="30" cy="55" r="4" />
        <circle cx="48" cy="70" r="3.5" />
        <circle cx="35" cy="90" r="4.5" />
        <circle cx="55" cy="105" r="3.5" />
        <circle cx="25" cy="120" r="4" />
        <circle cx="170" cy="55" r="4" />
        <circle cx="152" cy="70" r="3.5" />
        <circle cx="165" cy="90" r="4.5" />
        <circle cx="145" cy="105" r="3.5" />
        <circle cx="175" cy="120" r="4" />
      </g>

      {/* SOLAR PANEL GRID */}
      <g>
        <polygon points="25,145 80,110 95,140 40,175" fill="url(#panelGradComp)" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="43" y1="128" x2="60" y2="157" stroke="#93C5FD" strokeWidth="1" />
        <line x1="62" y1="117" x2="78" y2="146" stroke="#93C5FD" strokeWidth="1" />
        <line x1="33" y1="140" x2="88" y2="122" stroke="#93C5FD" strokeWidth="1" />
        <line x1="37" y1="155" x2="92" y2="132" stroke="#93C5FD" strokeWidth="1" />
      </g>

      {/* CENTER EYE LENS */}
      <path d="M 65 95 C 65 55, 145 55, 175 95 C 145 135, 65 135, 65 95 Z" fill="#0F172A" stroke="#1D4ED8" strokeWidth="6" />
      <circle cx="108" cy="95" r="34" fill="#1E293B" stroke="#3B82F6" strokeWidth="5" />
      <circle cx="108" cy="95" r="28" fill="url(#sunGradComp)" opacity="0.2" />

      <g stroke="#60A5FA" strokeWidth="1" opacity="0.6">
        <line x1="95" y1="80" x2="115" y2="80" />
        <line x1="95" y1="80" x2="108" y2="105" />
        <line x1="115" y1="80" x2="108" y2="105" />
        <line x1="90" y1="95" x2="126" y2="95" />
      </g>
      <circle cx="95" cy="80" r="2" fill="#FACC15" />
      <circle cx="115" cy="80" r="2" fill="#FACC15" />
      <circle cx="125" cy="95" r="2" fill="#38BDF8" />

      <path d="M 94 82 L 105 110 L 118 82" stroke="#1E40AF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 94 82 L 105 110 L 118 82" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="114" y="108" fill="#FACC15" fontSize="13" fontWeight="900" fontFamily="sans-serif">AI</text>

      {/* SUNBEAM CIRCUITS */}
      <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
        <line x1="125" y1="135" x2="140" y2="160" />
        <line x1="135" y1="130" x2="155" y2="155" />
        <line x1="145" y1="125" x2="168" y2="148" />
      </g>
      <circle cx="140" cy="160" r="2.5" fill="#34D399" />
      <circle cx="155" cy="155" r="2.5" fill="#34D399" />
      <circle cx="168" cy="148" r="2.5" fill="#34D399" />
    </svg>
  );

  if (variant === 'icon') {
    return Emblem;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="mb-2">{Emblem}</div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-2 uppercase font-sans">
          <span className={isDark ? 'text-zinc-100' : 'text-blue-950'}>SOLARVISION</span>
          <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]">AI</span>
        </h1>
        <div className="flex items-center justify-center gap-2 my-2 w-full max-w-xs">
          <div className="h-[1px] flex-1 bg-emerald-500/40" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-400 font-mono px-2">
            ENGINE v2.4
          </span>
          <div className="h-[1px] flex-1 bg-emerald-500/40" />
        </div>
        <p className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-zinc-400 font-bold max-w-md">
          PHYSICS SIMULATION & SOLAR RESOURCE INTELLIGENCE
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 ${onClick ? 'cursor-pointer hover:opacity-90 transition-all group select-none' : ''} ${className}`}
    >
      {Emblem}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-extrabold text-base sm:text-xl tracking-tight uppercase flex items-center gap-1 font-sans">
            <span className="text-[#56cd6f] group-hover:text-emerald-300 transition-colors" style={{ color: '#56cd6f' }}>SOLARVISION</span>
            <span className="text-amber-400">AI</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            ENGINE v2.4
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase hidden md:block">
          PHYSICS SIMULATION & SOLAR RESOURCE INTELLIGENCE
        </p>
      </div>
    </div>
  );
}

