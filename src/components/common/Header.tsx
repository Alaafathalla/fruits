'use client';

import React from 'react';
import { GameMode } from '@/types';
import {
  Trophy,
  Flame,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  score?: number;
  scorePenalty?: number | null;
  combo?: number;
  frenzyLabel?: string;
  mode?: GameMode;
  timeLeft?: number;
  highScore?: number;
  isPaused?: boolean;
  isMuted?: boolean;
  isFullscreen?: boolean;
  onToggleMode?: (mode: GameMode) => void;
  onTogglePause?: () => void;
  onRestart?: () => void;
  onToggleSound?: () => void;
  onToggleFullscreen?: () => void;
  onOpenHelp?: () => void;
}

export default function Header({
  score = 0,
  scorePenalty = null,
  combo = 0,
  frenzyLabel = 'Warmup (1x)',
  mode = 'arcade',
  timeLeft = 60,
  highScore = 0,
  isPaused = false,
  isMuted = false,
  isFullscreen = false,
  onToggleMode,
  onTogglePause,
  onRestart,
  onToggleSound,
  onToggleFullscreen,
  onOpenHelp,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#060212]/90 backdrop-blur-2xl border-b border-purple-500/25 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(217,70,239,0.35)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-2xl bg-[#0c031e] flex items-center justify-center text-xl">
                🍉
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#060212] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                FRUIT SLASH 3D
              </span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-md font-mono shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                PRO STUDIO
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                {mode} MODE
              </span>
              {isPaused && (
                <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PAUSED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Combat Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Score Pill */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border transition-all duration-300 ${
              scorePenalty
                ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-black/55 border-purple-500/30 shadow-inner'
            }`}
          >
            <Trophy className={`w-3.5 h-3.5 ${scorePenalty ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <span className="text-[8px] text-zinc-400 block -mb-1 font-mono uppercase font-bold tracking-wider">
                SCORE
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm sm:text-base font-black font-mono tracking-tight transition-colors ${
                    scorePenalty ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {score}
                </span>
                {scorePenalty && (
                  <span className="text-[10px] font-black text-rose-400 animate-bounce font-mono">
                    -{scorePenalty}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Combo Multiplier */}
          <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-black/55 border border-purple-500/30 shadow-inner">
            <Flame className={`w-3.5 h-3.5 ${combo > 1 ? 'text-orange-400 animate-bounce' : 'text-zinc-500'}`} />
            <div>
              <span className="text-[8px] text-zinc-400 block -mb-1 font-mono uppercase font-bold tracking-wider">
                COMBO
              </span>
              <span
                className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                  combo > 1 ? 'text-orange-400' : 'text-zinc-300'
                }`}
              >
                {combo > 1 ? `x${combo}!` : 'x1'}
              </span>
            </div>
          </div>

          {/* Dynamic Frenzy Wave Meter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/55 border border-purple-500/30 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <div>
              <span className="text-[8px] text-zinc-400 block -mb-1 font-mono uppercase font-bold tracking-wider">
                FRENZY
              </span>
              <span className="text-[11px] font-bold text-cyan-300 font-mono">
                {frenzyLabel}
              </span>
            </div>
          </div>

          {/* Timer / High Score */}
          <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-black/55 border border-purple-500/30 shadow-inner">
            <Timer
              className={`w-3.5 h-3.5 ${
                mode === 'arcade' && timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
              }`}
            />
            <div>
              <span className="text-[8px] text-zinc-400 block -mb-1 font-mono uppercase font-bold tracking-wider">
                {mode === 'arcade' ? 'TIMER' : 'RECORD'}
              </span>
              <span
                className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                  mode === 'arcade' && timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}
              >
                {mode === 'arcade' ? `${timeLeft}s` : highScore}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mode Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Zen / Arcade Mode Switch */}
          {onToggleMode && (
            <div className="flex items-center p-1 rounded-xl bg-black/60 border border-purple-500/30 shadow-inner">
              <button
                onClick={() => onToggleMode('zen')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all ${
                  mode === 'zen'
                    ? 'bg-fuchsia-600 text-white shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ZEN
              </button>
              <button
                onClick={() => onToggleMode('arcade')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all ${
                  mode === 'arcade'
                    ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ARCADE
              </button>
            </div>
          )}

          {/* Pause Button */}
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              className="p-2 rounded-xl bg-black/55 hover:bg-purple-950/60 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-sm"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
          )}

          {/* Restart Button */}
          {onRestart && (
            <button
              onClick={onRestart}
              className="p-2 rounded-xl bg-black/55 hover:bg-purple-950/60 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-sm"
              title="Restart Round"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* Audio Mute/Unmute */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-black/55 hover:bg-purple-950/60 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-sm"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          )}

          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="hidden sm:flex p-2 rounded-xl bg-black/55 hover:bg-purple-950/60 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          )}

          {/* Help Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-cyan-400 hover:text-white transition shadow-sm"
              title="How to Play & Combos"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* 60 FPS Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300 font-bold text-[10px]">60 FPS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
