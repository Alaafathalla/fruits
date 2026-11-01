'use client';

import React, { useState, useEffect } from 'react';
import FruitCuttingCanvas from './FruitCuttingCanvas';
import { FruitKind, BladeStyle, GameMode, ColorTheme, JuiceRecipe } from '@/types';
import { sound } from '@/utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Palette,
  Sliders,
  GlassWater,
  CheckCircle,
  Gamepad2,
} from 'lucide-react';

const PRESET_BLADES: BladeStyle[] = [
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    color: '#00f0ff',
    trailColor: '#0284c7',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    description: 'Electric Tron edge',
  },
  {
    id: 'laser',
    name: 'Hot Magenta',
    color: '#ff007f',
    trailColor: '#be185d',
    glowColor: 'rgba(255, 0, 127, 0.6)',
    description: 'Hyper dragonfruit glow',
  },
  {
    id: 'solar',
    name: 'Solar Amber',
    color: '#ffaa00',
    trailColor: '#b45309',
    glowColor: 'rgba(255, 170, 0, 0.6)',
    description: 'Sunburst citrus blaze',
  },
  {
    id: 'emerald',
    name: 'Toxic Lime',
    color: '#39ff14',
    trailColor: '#4d7c0f',
    glowColor: 'rgba(57, 255, 20, 0.6)',
    description: 'Radiant kiwi laser',
  },
  {
    id: 'violet',
    name: 'Amethyst Neon',
    color: '#b026ff',
    trailColor: '#7e22ce',
    glowColor: 'rgba(176, 38, 255, 0.6)',
    description: 'Cosmic purple aura',
  },
];

const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'cyber',
    name: 'Cyberpunk 2088',
    accent: '#00f0ff',
    gradientText: 'from-cyan-400 via-fuchsia-400 to-indigo-400',
    backgroundGlow: 'rgba(0, 240, 255, 0.28)',
    ambientLightHex: 0x180b38,
    dirLightHex: 0x00f0ff,
  },
  {
    id: 'synthwave',
    name: 'Synthwave Night',
    accent: '#ff007f',
    gradientText: 'from-fuchsia-400 via-pink-400 to-amber-300',
    backgroundGlow: 'rgba(255, 0, 127, 0.28)',
    ambientLightHex: 0x3b0730,
    dirLightHex: 0xff007f,
  },
  {
    id: 'solar',
    name: 'Solar Overdrive',
    accent: '#ffaa00',
    gradientText: 'from-amber-400 via-orange-400 to-rose-500',
    backgroundGlow: 'rgba(255, 170, 0, 0.28)',
    ambientLightHex: 0x3d1700,
    dirLightHex: 0xffaa00,
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    accent: '#39ff14',
    gradientText: 'from-lime-400 via-emerald-300 to-teal-400',
    backgroundGlow: 'rgba(57, 255, 20, 0.28)',
    ambientLightHex: 0x052e16,
    dirLightHex: 0x39ff14,
  },
];

const QUICK_COLORS = [
  { name: 'Cyan', hex: '#00F0FF' },
  { name: 'Magenta', hex: '#FF007F' },
  { name: 'Lime', hex: '#39FF14' },
  { name: 'Amber', hex: '#FFAA00' },
  { name: 'Purple', hex: '#B026FF' },
  { name: 'Scarlet', hex: '#FF1744' },
];

const JUICE_RECIPES: JuiceRecipe[] = [
  {
    id: 'dragon-cooler',
    name: 'Dragonfruit Elixir',
    tagline: 'Fuchsia punch with dragonfruit & apple',
    requiredFruits: { dragonfruit: 3, apple: 2 },
    color: '#ff007f',
    accentGradient: 'from-pink-500 to-rose-600',
    icon: '🐉',
  },
  {
    id: 'watermelon-breeze',
    name: 'Watermelon Splash',
    tagline: 'Crimson watermelon & lemon zing',
    requiredFruits: { watermelon: 4, lemon: 2 },
    color: '#ef4444',
    accentGradient: 'from-red-500 to-emerald-600',
    icon: '🍉',
  },
  {
    id: 'citrus-sunrise',
    name: 'Solar Sunrise',
    tagline: 'Orange citrus & kiwi boost',
    requiredFruits: { orange: 3, kiwi: 3 },
    color: '#ffaa00',
    accentGradient: 'from-amber-400 to-orange-500',
    icon: '🍊',
  },
];

export default function FruitHero() {
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [mode, setMode] = useState<GameMode>('zen');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [selectedBlade, setSelectedBlade] = useState<BladeStyle>(PRESET_BLADES[0]);
  const [customColor, setCustomColor] = useState<string>('#00f0ff');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bombFlash, setBombFlash] = useState<boolean>(false);

  const [slicedCounts, setSlicedCounts] = useState<Record<FruitKind, number>>({
    watermelon: 0,
    orange: 0,
    apple: 0,
    lemon: 0,
    kiwi: 0,
    dragonfruit: 0,
    bomb: 0,
  });

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('vortex_fruits_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const recordScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('vortex_fruits_highscore', newScore.toString());
    }
  };

  // Arcade Mode Timer
  useEffect(() => {
    if (mode !== 'arcade' || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          sound.playSuccess();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isGameOver]);

  // Handle Fruit Slice
  const handleSliceFruit = (kind: FruitKind, currentCombo: number) => {
    const basePoints = kind === 'dragonfruit' ? 25 : kind === 'watermelon' ? 15 : 10;
    const comboMultiplier = Math.max(1, currentCombo);
    const earned = basePoints * comboMultiplier;

    setScore((prev) => {
      const next = prev + earned;
      recordScore(next);
      return next;
    });

    setCombo(currentCombo);
    if (currentCombo > maxCombo) {
      setMaxCombo(currentCombo);
    }

    setSlicedCounts((prev) => ({
      ...prev,
      [kind]: (prev[kind] || 0) + 1,
    }));
  };

  // Handle Bomb Hit
  const handleBombHit = () => {
    setBombFlash(true);
    setTimeout(() => setBombFlash(false), 300);

    setCombo(0);
    setSlicedCounts((prev) => ({
      ...prev,
      bomb: prev.bomb + 1,
    }));

    if (mode === 'arcade') {
      setScore((prev) => Math.max(0, prev - 30));
    }
  };

  // Handle Restart
  const handleRestart = () => {
    sound.playClick();
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setSlicedCounts({
      watermelon: 0,
      orange: 0,
      apple: 0,
      lemon: 0,
      kiwi: 0,
      dragonfruit: 0,
      bomb: 0,
    });
  };

  const toggleSound = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  // Custom Color Handler
  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    setIsCustomMode(true);
    setSelectedBlade({
      id: 'custom',
      name: 'Custom Neon',
      color: hex,
      trailColor: hex,
      glowColor: `${hex}66`,
      description: 'Your custom gaming blade',
    });
  };

  const activeBladeToUse = isCustomMode
    ? {
        id: 'custom',
    name: 'Custom Neon',
      color: customColor,
        trailColor: customColor,
          glowColor: `${customColor}66`,
            description: 'Your custom gaming blade',
      }
    : selectedBlade;

return (
      <section className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-[#09021a] via-[#10052a] to-[#060114] gaming-grid flex flex-col justify-between py-4 sm:py-5">
        {/* POWERFUL GAMING AURA LIGHTS */}
        {/* Top Left Neon Magenta Gaming Spot */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Top Right Cyan Cyber Gaming Spot */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-cyan-500/25 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Center Dynamic Reactive Player Aura Spot */}
        <div
          style={{
            background: `radial-gradient(circle, ${activeBladeToUse.color}44 0%, transparent 65%)`,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none blur-[150px] -z-10 transition-all duration-700"
        />

        {/* Bottom Violet Accent Spot */}
        <div className="absolute -bottom-32 left-1/3 w-[650px] h-[450px] bg-purple-700/25 rounded-full blur-[150px] pointer-events-none -z-10" />

                    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-5 lg:px-6 flex flex-col gap-4">
                      {/* TOP HERO HUD CONTROL BAR */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-purple-500/35 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
                        {/* Left Title & Status */}
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500/25 to-purple-600/35 border border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.3)]">
                            <Gamepad2 className="w-5 h-5" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                                <span>FRUIT SLASH</span>
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedTheme.gradientText}`}>
                                  3D
                                </span>
                          </h1>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase hidden sm:inline-block">
                            Arcade Edition
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 hidden md:block">
                          Three.js Ballistic Mesh Cleaving & Real-Time Laser Physics
                        </p>
                      </div>
                    </div>

                        {/* Center Battle Metrics */}
                        <div className="flex items-center gap-2 sm:gap-4">
                          {/* Score Pill */}
                          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/35 shadow-inner">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <div>
                              <span className="text-[10px] text-zinc-400 block -mb-1 font-semibold uppercase">SCORE</span>
                              <span className="text-base sm:text-lg font-black text-white font-mono">{score}</span>
                            </div>
                          </div>

                            {/* Combo Pill */}
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-950/50 border border-orange-500/35 shadow-inner">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <div>
                                <span className="text-[10px] text-zinc-400 block -mb-1 font-semibold uppercase">COMBO</span>
                                <span
                                  style={{ color: activeBladeToUse.color }}
                                  className="text-base sm:text-lg font-black font-mono"
                                >
                                  {combo > 1 ? `x${combo}!` : 'x1'}
                                </span>
                              </div>
                            </div>

                            {/* Timer / High Score */}
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/35 shadow-inner">
                              <Timer className="w-4 h-4 text-cyan-400" />
                              <div>
                                <span className="text-[10px] text-zinc-400 block -mb-1 font-semibold uppercase">
                                  {mode === 'arcade' ? 'TIMER' : 'RECORD'}
                                </span>
                                <span
                                  className={`text-base sm:text-lg font-black font-mono ${mode === 'arcade' && timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
                                    }`}
                                >
                                  {mode === 'arcade' ? `${timeLeft}s` : highScore}
                                </span>
                              </div>
                            </div>
                          </div>

          {/* Right Mode Toggle & Audio */}
          <div className="flex items-center gap-2">
                                {/* Mode Switcher */}
                                <div className="flex items-center p-1 rounded-xl bg-black/60 border border-zinc-800">
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setMode('zen');
                                      setIsGameOver(false);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${mode === 'zen'
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                      }`}
                                        >
                                        Zen
              </button>
                                <button
                                  onClick={() => {
                                    sound.playClick();
                                    setMode('arcade');
                                    handleRestart();
                                  }}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${mode === 'arcade'
                                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                                      : 'text-zinc-400 hover:text-white'
                                    }`}
              >
                              Arcade
                            </button>
                          </div>

                      {/* Audio Toggle */}
                      <button
                        onClick={toggleSound}
                        className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    </div>
                </div>

                          {/* MAIN GAME STAGE: ARENA (DOMINANT) + HARVEST SIDEBAR */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* CENTER & LEFT: 3D ARENA + COLOR CONTROLS UNDER THAT */}
                            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
                              {/* THE 3D FRUIT CUTTING ARENA */}
                              <div className="relative">
                                {/* Bomb Flash Screen Shake Overlay */}
                                {bombFlash && (
                                  <div className="absolute inset-0 z-30 bg-rose-600/40 rounded-3xl pointer-events-none animate-ping" />
                                )}

                                  {/* Interactive 3D Cutting Canvas */}
                                  <FruitCuttingCanvas
                                    bladeStyle={activeBladeToUse}
                                    colorTheme={selectedTheme}
                                    isPaused={isGameOver}
                                    onSliceFruit={handleSliceFruit}
                                    onBombHit={handleBombHit}
                                    className="relative w-full h-[450px] sm:h-[500px] lg:h-[540px] xl:h-[570px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#14062c]/80 via-[#0a021c]/95 to-black border select-none touch-none cursor-crosshair transition-all duration-300"
                                  />

              {/* Game Over Modal (Arcade Mode) */}
              {isGameOver && (
                <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">ARCADE ROUND COMPLETE!</h3>
                  <p className="text-zinc-400 mt-1 text-xs max-w-xs">
                    Outstanding fruit slicing precision and blade control.
                  </p>

                  <div className="my-5 p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 grid grid-cols-2 gap-4 w-full max-w-xs shadow-xl">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">FINAL SCORE</span>
                      <span className="text-2xl font-black text-white font-mono">{score}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">MAX COMBO</span>
                      <span className="text-2xl font-black text-orange-400 font-mono">x{maxCombo}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 active:scale-95 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                </div>
              )}
                              </div>

                                  {/* POWERFUL GAMING COLOR DECK (MOVED UNDER THE GAME ARENA) */}
                                  <div className="p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-xl border border-purple-500/35 shadow-[0_0_30px_rgba(139,92,246,0.18)] flex flex-col gap-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-purple-500/20">
                                      <div className="flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-cyan-400" />
                                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                          Powerful Gaming Color Deck
                                        </h2>
                                      </div>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                                        REACTIVE 3D LIGHTING & LASER AURA
                                      </span>
                                    </div>

                                            {/* Grid of Color Controls Under the Arena */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                              {/* 1. Theme Presets (4 cols) */}
                                              <div className="md:col-span-4 space-y-1.5">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                                                  1. Arena Lighting Themes:
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                  {COLOR_THEMES.map((theme) => {
                                                    const isSelected = selectedTheme.id === theme.id;
                                                    return (
                                                      <button
                                                        key={theme.id}
                                                        onClick={() => {
                                                          sound.playClick();
                                                          setSelectedTheme(theme);
                                                        }}
                                                        className={`p-2 rounded-xl border text-left transition-all ${isSelected
                                                            ? 'bg-purple-900/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-[1.02]'
                                                            : 'bg-black/40 hover:bg-zinc-900/60 border-zinc-800 text-zinc-400'
                                                          }`}
                                                      >
                                                        <div className="flex items-center gap-1.5">
                                                          <span
                                                            style={{ backgroundColor: theme.accent }}
                                                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                                          />
                                                          <span className="text-[11px] font-bold text-zinc-200 truncate">{theme.name}</span>
                                                        </div>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>

                                        {/* 2. Blade Laser Presets (4 cols) */}
                                        <div className="md:col-span-4 space-y-1.5">
                                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                                            2. Equip Blade Laser:
                                          </span>
                                          <div className="flex flex-wrap gap-1.5">
                                            {PRESET_BLADES.map((b) => {
                                              const isSelected = !isCustomMode && selectedBlade.id === b.id;
                                              return (
                                                <button
                                                  key={b.id}
                                                  onClick={() => {
                                                    sound.playClick();
                                                    setIsCustomMode(false);
                                                    setSelectedBlade(b);
                                                  }}
                                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                                                      ? 'bg-purple-900/60 text-white ring-1 ring-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                                                      : 'bg-black/50 hover:bg-zinc-900 text-zinc-400 border border-zinc-800'
                                                    }`}
                                                >
                                                  <span
                                                    style={{ backgroundColor: b.color }}
                                                    className="w-2.5 h-2.5 rounded-full shadow"
                                                  />
                                                  <span className="text-[11px]">{b.name}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                            {/* 3. Reactive Custom Color Engine & Quick Neon Swatches (4 cols) */}
                                            <div className="md:col-span-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                                                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                                                    Color Handle & Swatches
                                                  </span>
                                                </div>
                                                <span
                                                  style={{ backgroundColor: activeBladeToUse.color }}
                                                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                                                />
                                              </div>

                                              {/* Picker + Hex */}
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="color"
                                                  value={customColor}
                                                  onChange={(e) => handleCustomColorChange(e.target.value)}
                                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                                  title="Choose any custom color"
                                                />
                                                <input
                                                  type="text"
                                                  value={customColor.toUpperCase()}
                                                  onChange={(e) => handleCustomColorChange(e.target.value)}
                                                  className="flex-1 px-2 py-1 rounded-lg bg-black/60 border border-purple-500/40 text-xs font-mono text-cyan-300 text-center uppercase"
                                                />
                                              </div>

                  {/* 1-Click Powerful Neon Palette */}
                                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-purple-500/20">
                                                {QUICK_COLORS.map((qc) => (
                                                  <button
                                                    key={qc.hex}
                                                    onClick={() => handleCustomColorChange(qc.hex)}
                                                    title={qc.name}
                                                    style={{ backgroundColor: qc.hex }}
                                                    className="w-5 h-5 rounded-md border border-white/40 shadow-sm hover:scale-125 transition-transform"
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                          {/* RIGHT SIDEBAR: FRUIT HARVEST & TROPICAL SMOOTHIE BAR */}
                                          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3.5 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-purple-500/35 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
                                            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                                              <div className="flex items-center gap-2">
                                                <GlassWater className="w-4 h-4 text-emerald-400" />
                                                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                                                  Smoothie Bar & Harvest
                                                </h2>
                                              </div>
                                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                                RECIPES
                                              </span>
                                            </div>

                                            {/* Sliced Fruit Harvest Counters Grid */}
                                            <div>
                                              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                                                Sliced Fruit Tally:
                                              </span>
                                              <div className="grid grid-cols-3 gap-1.5 text-center">
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🍉</span>
                                                  <span className="text-[10px] text-zinc-400 block">Melon</span>
                                                  <span className="text-xs font-mono font-bold text-white">{slicedCounts.watermelon}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🐉</span>
                                                  <span className="text-[10px] text-zinc-400 block">Dragon</span>
                                                  <span className="text-xs font-mono font-bold text-pink-400">{slicedCounts.dragonfruit}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🍊</span>
                                                  <span className="text-[10px] text-zinc-400 block">Orange</span>
                                                  <span className="text-xs font-mono font-bold text-orange-400">{slicedCounts.orange}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🍎</span>
                                                  <span className="text-[10px] text-zinc-400 block">Apple</span>
                                                  <span className="text-xs font-mono font-bold text-red-400">{slicedCounts.apple}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🍋</span>
                                                  <span className="text-[10px] text-zinc-400 block">Lemon</span>
                                                  <span className="text-xs font-mono font-bold text-yellow-400">{slicedCounts.lemon}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-black/45 border border-purple-500/20">
                                                  <span className="text-lg block">🥝</span>
                                                  <span className="text-[10px] text-zinc-400 block">Kiwi</span>
                                                  <span className="text-xs font-mono font-bold text-emerald-400">{slicedCounts.kiwi}</span>
                                                </div>
                                              </div>
                                            </div>

                                                        {/* Smoothie Recipes */ }
                                                        <div className="flex-1 flex flex-col gap-2 mt-1">
                                                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                                                            Unlockable Smoothie Blends:
                                                          </span>
                                                          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
                                                            {JUICE_RECIPES.map((recipe) => {
                                                              let isReady = true;
                                                              const progressElements = Object.entries(recipe.requiredFruits).map(
                                                                ([fKind, required]) => {
                                                                  const current = slicedCounts[fKind as FruitKind] || 0;
                                                                  const pct = Math.min(100, Math.round((current / (required || 1)) * 100));
                                                                  if (current < (required || 1)) isReady = false;

                                                              return (
                                                                <div key={fKind} className="space-y-0.5">
                                                                  <div className="flex justify-between text-[10px] text-zinc-400">
                                                                    <span className="capitalize">{fKind}</span>
                                                                    <span className="font-mono text-zinc-300">
                                                                      {current} / {required}
                                                                    </span>
                                                                  </div>
                                                                  <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                                                                    <div
                                                                      style={{ width: `${pct}%`, backgroundColor: recipe.color }}
                                                                      className="h-full rounded-full transition-all duration-300"
                                                                    />
                                                                  </div>
                                                                </div>
                                                              );
                                                            }
                                                            );

                                                              return (
                                                              <div
                                                                key={recipe.id}
                                                                className={`p-2.5 rounded-xl border transition-all ${isReady
                                                                    ? 'bg-purple-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                                                                    : 'bg-black/45 border-zinc-800/80'
                                                                  }`}
                                                              >
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span className="text-base">{recipe.icon}</span>
                                                                    <div>
                                                                      <h5 className="text-[11px] font-bold text-white">{recipe.name}</h5>
                                                                    </div>
                                                                  </div>
                                                                  {isReady && (
                                                                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                                                                      <CheckCircle className="w-3 h-3" />
                                                                      <span>READY!</span>
                                                                    </div>
                                                                  )}
                                                                </div>

                                            <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                                              {progressElements}
                                            </div>
                                          </div>
                                          );
                })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </section>
                              );
}
