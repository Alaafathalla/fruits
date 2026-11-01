'use client';

import React from 'react';
import { Gamepad2, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070114]/85 backdrop-blur-xl border-b border-purple-500/25">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.4)] text-white font-black text-lg">
            🍉
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                FRUIT SLASH
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-1.5 py-0.5 rounded font-mono">
                3D HERO
              </span>
            </div>
          </div>
        </div>

        {/* Center Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/30 border border-purple-500/30 text-xs text-zinc-300 shadow-inner">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Three.js WebGL Ballistic Cleaving • Reactive Laser Studio</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-400 font-bold text-[11px]">60 FPS READY</span>
          </div>
        </div>
      </div>
    </header>
  );
}

