'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/common/Header';
import FruitCuttingCanvas from './FruitCuttingCanvas';
import { FruitKind, BladeStyle, GameMode, GamePace, ColorTheme, JuiceRecipe, ScoreTier } from '@/types';
import { sound } from '@/utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Timer,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  HelpCircle,
  X,
  TrendingUp,
} from 'lucide-react';

const PRESET_BLADES: BladeStyle[] = [
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    color: '#00f0ff',
    trailColor: '#0284c7',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    description: 'Electric Tron edge with intense light beam',
  },
  {
    id: 'laser',
    name: 'Hot Magenta',
    color: '#ff007f',
    trailColor: '#be185d',
    glowColor: 'rgba(255, 0, 127, 0.6)',
    description: 'Hyper dragonfruit neon pulse',
  },
  {
    id: 'solar',
    name: 'Solar Amber',
    color: '#ffaa00',
    trailColor: '#b45309',
    glowColor: 'rgba(255, 170, 0, 0.6)',
    description: 'Sunburst citrus overdrive blaze',
  },
  {
    id: 'emerald',
    name: 'Toxic Lime',
    color: '#39ff14',
    trailColor: '#4d7c0f',
    glowColor: 'rgba(57, 255, 20, 0.6)',
    description: 'Radiant kiwi ionizing laser',
  },
  {
    id: 'volt',
    name: 'Golden Volt',
    color: '#facc15',
    trailColor: '#ca8a04',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    description: 'High-voltage lightning strike beam',
  },
  {
    id: 'ruby',
    name: 'Ruby Laser',
    color: '#ef4444',
    trailColor: '#b91c1c',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    description: 'Surgical crimson precision blade',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Void',
    color: '#b026ff',
    trailColor: '#7e22ce',
    glowColor: 'rgba(176, 38, 255, 0.6)',
    description: 'Cosmic deep ultraviolet aura',
  },
  {
    id: 'frost',
    name: 'Glacial Frost',
    color: '#38bdf8',
    trailColor: '#0284c7',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    description: 'Sub-zero crystal plasma edge',
  },
];

const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'cyber',
    name: 'Cyberpunk 2088',
    accent: '#00f0ff',
    gradientText: 'from-cyan-400 via-fuchsia-400 to-indigo-400',
    backgroundGlow: 'rgba(0, 240, 255, 0.25)',
    ambientLightHex: 0x180b38,
    dirLightHex: 0x00f0ff,
  },
  {
    id: 'synthwave',
    name: 'Synthwave Sunset',
    accent: '#ff007f',
    gradientText: 'from-fuchsia-400 via-pink-400 to-amber-300',
    backgroundGlow: 'rgba(255, 0, 127, 0.25)',
    ambientLightHex: 0x3b0730,
    dirLightHex: 0xff007f,
  },
  {
    id: 'solar',
    name: 'Solar Overdrive',
    accent: '#ffaa00',
    gradientText: 'from-amber-400 via-orange-400 to-rose-500',
    backgroundGlow: 'rgba(255, 170, 0, 0.25)',
    ambientLightHex: 0x3d1700,
    dirLightHex: 0xffaa00,
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    accent: '#39ff14',
    gradientText: 'from-lime-400 via-emerald-300 to-teal-400',
    backgroundGlow: 'rgba(57, 255, 20, 0.25)',
    ambientLightHex: 0x052e16,
    dirLightHex: 0x39ff14,
  },
  {
    id: 'nebula',
    name: 'Cosmic Void',
    accent: '#a855f7',
    gradientText: 'from-purple-400 via-indigo-300 to-cyan-400',
    backgroundGlow: 'rgba(168, 85, 247, 0.25)',
    ambientLightHex: 0x1a0736,
    dirLightHex: 0xc084fc,
  },
];

const SCORE_TIERS: ScoreTier[] = [
  { rank: 1, title: 'Novice Slicer', minScore: 0, maxScore: 200, badgeColor: '#38bdf8', icon: '🗡️' },
  { rank: 2, title: 'Juice Hunter', minScore: 200, maxScore: 500, badgeColor: '#4ade80', icon: '🏹' },
  { rank: 3, title: 'Blade Virtuoso', minScore: 500, maxScore: 1000, badgeColor: '#facc15', icon: '⚡' },
  { rank: 4, title: 'Cyber Ronin', minScore: 1000, maxScore: 1800, badgeColor: '#f43f5e', icon: '🔥' },
  { rank: 5, title: 'Grandmaster Slasher', minScore: 1800, maxScore: 3000, badgeColor: '#c084fc', icon: '👑' },
  { rank: 6, title: 'Fruit Deity', minScore: 3000, maxScore: 5000, badgeColor: '#00f0ff', icon: '🌟' },
];

interface SmoothieRecipeExtended extends JuiceRecipe {
  rewardPts: number;
}

const JUICE_RECIPES: SmoothieRecipeExtended[] = [
  {
    id: 'dragon-surge',
    name: 'Dragonfruit Neon Surge',
    tagline: 'Vivid magenta dragonfruit & kiwi jade ionizing blast',
    requiredFruits: { dragonfruit: 3, kiwi: 3 },
    color: '#ff007f',
    accentGradient: 'from-fuchsia-500 to-emerald-500',
    icon: '🐉',
    rewardPts: 120,
  },
  {
    id: 'ruby-berry-blast',
    name: 'Ruby Berry Overdrive',
    tagline: 'Sun-ripened 3D strawberry & crisp apple velvet crush',
    requiredFruits: { strawberry: 3, apple: 3 },
    color: '#ff2a6d',
    accentGradient: 'from-pink-500 to-rose-600',
    icon: '🍓',
    rewardPts: 115,
  },
  {
    id: 'crimson-splash',
    name: 'Crimson Citrus Cooler',
    tagline: 'Crimson watermelon pulp & sunburst orange squeeze',
    requiredFruits: { watermelon: 4, orange: 3 },
    color: '#ff1744',
    accentGradient: 'from-rose-500 to-amber-500',
    icon: '🍉',
    rewardPts: 100,
  },
  {
    id: 'golden-elixir',
    name: 'Golden Apple Elixir',
    tagline: 'Crisp scarlet apple flesh & electric volt lemon juice',
    requiredFruits: { apple: 3, lemon: 3 },
    color: '#facc15',
    accentGradient: 'from-amber-400 to-yellow-500',
    icon: '🍎',
    rewardPts: 100,
  },
  {
    id: 'galaxy-smoothie',
    name: 'Cosmic Galaxy Punch',
    tagline: 'All-star harvest: Dragonfruit, watermelon & orange blend',
    requiredFruits: { dragonfruit: 2, watermelon: 2, orange: 2 },
    color: '#a855f7',
    accentGradient: 'from-purple-500 via-pink-500 to-cyan-400',
    icon: '🌌',
    rewardPts: 160,
  },
];

export default function FruitHero() {
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [mode, setMode] = useState<GameMode>('arcade');
  const [gamePace, setGamePace] = useState<GamePace>('relaxed');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [selectedBlade, setSelectedBlade] = useState<BladeStyle>(PRESET_BLADES[0]);
  const [customColor, setCustomColor] = useState<string>('#00f0ff');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bombFlash, setBombFlash] = useState<boolean>(false);
  const [scorePenalty, setScorePenalty] = useState<number | null>(null);
  const [gameResetKey, setGameResetKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Difficulty & Frenzy state
  const [frenzyLevel, setFrenzyLevel] = useState<number>(1);
  const [frenzyLabel, setFrenzyLabel] = useState<string>('Warmup (Slow & Calm)');

  // Rank Notification State
  const [rankUpBanner, setRankUpBanner] = useState<string | null>(null);
  const prevRankRef = useRef<number>(1);

  // Sliced Counts for all real 3D models
  const [slicedCounts, setSlicedCounts] = useState<Record<FruitKind, number>>({
    watermelon: 0,
    orange: 0,
    apple: 0,
    lemon: 0,
    kiwi: 0,
    dragonfruit: 0,
    strawberry: 0,
    bomb: 0,
  });

  const arenaContainerRef = useRef<HTMLDivElement>(null);

  // Calculate Active Score Tier & Progress
  const currentTier =
    SCORE_TIERS.find((t) => score >= t.minScore && score < t.maxScore) ||
    SCORE_TIERS[SCORE_TIERS.length - 1];

  const nextTier = SCORE_TIERS.find((t) => t.rank === currentTier.rank + 1);

  let progressPct = 100;
  let ptsToNext = 0;
  if (nextTier) {
    const tierRange = nextTier.minScore - currentTier.minScore;
    const currentProgress = score - currentTier.minScore;
    progressPct = Math.min(100, Math.max(0, Math.round((currentProgress / tierRange) * 100)));
    ptsToNext = Math.max(0, nextTier.minScore - score);
  }

  // Load High Score from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fruit_slash_highscore');
      if (saved) {
        const parsed = Number(saved);
      if (Number.isFinite(parsed) && parsed >= 0) setHighScore(parsed);
      }
    } catch {
      // LocalStorage might be disabled
    }
  }, []);

  const recordScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem('fruit_slash_highscore', newScore.toString());
      } catch {
        // Ignore
      }
    }
  };

  // Check for Rank Promotion
  useEffect(() => {
    if (currentTier.rank > prevRankRef.current) {
      prevRankRef.current = currentTier.rank;
      sound.playSuccess();
      setRankUpBanner(`🏆 RANK UP! ${currentTier.title.toUpperCase()}`);
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#00f0ff', '#ff007f', '#facc15', '#39ff14'],
      });
      setTimeout(() => setRankUpBanner(null), 3000);
    }
  }, [currentTier]);

  // Arcade Mode Countdown
  useEffect(() => {
    if (mode !== 'arcade' || isGameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          sound.playSuccess();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isGameOver, isPaused]);

  // Handle Fruit Slice
  const handleSliceFruit = (kind: FruitKind, currentCombo: number) => {
    const basePoints =
      kind === 'dragonfruit'
        ? 25
        : kind === 'watermelon'
          ? 20
          : kind === 'strawberry'
            ? 18
            : kind === 'orange' || kind === 'apple'
              ? 15
              : 12;

    const comboMultiplier = Math.max(1, currentCombo);
    const earned = basePoints * comboMultiplier;

    setScore((prev) => {
      const nextScore = prev + earned;
      recordScore(nextScore);
      return nextScore;
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

  // Handle Bomb Hit (-25 pts penalty)
  const handleBombHit = () => {
    setBombFlash(true);
    setTimeout(() => setBombFlash(false), 400);

    setCombo(0);
    setSlicedCounts((prev) => ({
      ...prev,
      bomb: (prev.bomb || 0) + 1,
    }));

    setScore((prev) => {
      const updated = Math.max(0, prev - 25);
      recordScore(updated);
      return updated;
    });
    setScorePenalty(25);
    setTimeout(() => setScorePenalty(null), 1000);
  };

  // Restart Round
  const handleRestart = () => {
    sound.playClick();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(60);
    setIsPaused(false);
    setIsGameOver(false);
    prevRankRef.current = 1;
    setRankUpBanner(null);
    setGameResetKey((prev) => prev + 1);
    setSlicedCounts({
      watermelon: 0,
      orange: 0,
      apple: 0,
      lemon: 0,
      kiwi: 0,
      dragonfruit: 0,
      strawberry: 0,
      bomb: 0,
    });
  };

  // Craft Smoothie Action
  const handleCraftSmoothie = (recipe: SmoothieRecipeExtended) => {
    // Deduct fruits
    setSlicedCounts((prev) => {
      const nextCounts = { ...prev };
      Object.entries(recipe.requiredFruits).forEach(([fruitKey, req]) => {
        const k = fruitKey as FruitKind;
        nextCounts[k] = Math.max(0, (nextCounts[k] || 0) - (req || 0));
      });
      return nextCounts;
    });

    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: [recipe.color, '#ffffff', '#facc15'],
    });

    // Reward bonus score
    setScore((prev) => {
      const next = prev + recipe.rewardPts;
      recordScore(next);
      return next;
    });
  };

  // Audio Mute Toggle
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.isMuted = nextMuted;
  };

  // Fullscreen Arena Toggle
  const toggleFullscreen = () => {
    sound.playClick();
    if (!arenaContainerRef.current) return;
    if (!document.fullscreenElement) {
      arenaContainerRef.current.requestFullscreen().catch(() => setIsFullscreen(false));
    } else {
      document.exitFullscreen().catch(() => setIsFullscreen(true));
    }
  };

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === arenaContainerRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  // Custom Color Handler
  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    setIsCustomMode(true);
    setSelectedBlade({
      id: 'custom',
      name: 'Custom Laser',
      color: hex,
      trailColor: hex,
      glowColor: `${hex}66`,
      description: 'Your calibrated custom laser wavelength',
    });
  };

  const activeBladeToUse = isCustomMode
    ? {
      id: 'custom',
      name: 'Custom Laser',
      color: customColor,
      trailColor: customColor,
      glowColor: `${customColor}66`,
      description: 'Your calibrated custom laser wavelength',
    }
    : selectedBlade;

  // Grade evaluation for game over
  const getGrade = () => {
    if (score >= 2000) return { letter: 'S', title: 'LEGENDARY SLICER', color: '#00f0ff' };
    if (score >= 1200) return { letter: 'A', title: 'CYBER MASTER', color: '#a855f7' };
    if (score >= 600) return { letter: 'B', title: 'SKILLED JUICER', color: '#4ade80' };
    return { letter: 'C', title: 'ROOKIE CLEAVER', color: '#facc15' };
  };

  const grade = getGrade();

  return (
    <div className="relative w-full flex flex-col font-sans">
      {/* 1. SINGLE UNIFIED HEADER AT THE VERY TOP */}
      <Header
        score={score}
        scorePenalty={scorePenalty}
        combo={combo}
        frenzyLabel={frenzyLabel}
        mode={mode}
        pace={gamePace}
        timeLeft={timeLeft}
        highScore={highScore}
        isPaused={isPaused}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        onToggleMode={(newMode) => {
          sound.playClick();
          setMode(newMode);
          if (newMode === 'arcade') handleRestart();
          else setIsGameOver(false);
        }}
        onTogglePace={(newPace) => {
          sound.playClick();
          setGamePace(newPace);
        }}
        onTogglePause={() => {
          sound.playClick();
          setIsPaused(!isPaused);
        }}
        onRestart={handleRestart}
        onToggleSound={toggleSound}
        onToggleFullscreen={toggleFullscreen}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      <section className="relative w-full min-h-[calc(100dvh-72px)] lg:h-[calc(100dvh-72px)] overflow-visible lg:overflow-hidden bg-[#060212] text-white flex flex-col">
        {/* Background Animated Dynamic Atmosphere */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 gaming-grid opacity-30" />
          <div className="absolute inset-0 dot-matrix opacity-25" />
          <div
            style={{ background: selectedTheme.backgroundGlow }}
            className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[160px] pointer-events-none transition-all duration-1000"
          />
          <div
            style={{ background: activeBladeToUse.glowColor }}
            className="absolute -bottom-32 -right-32 w-[34rem] h-[34rem] rounded-full blur-[160px] pointer-events-none transition-all duration-1000"
          />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col gap-0 lg:overflow-hidden">
          {/* RANK PROGRESS BAR — full width top strip */}
          <div className="relative px-4 py-2 border-b border-purple-500/20 bg-black/40 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            {rankUpBanner && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 text-black text-xs font-black font-mono tracking-widest uppercase shadow-[0_0_25px_rgba(0,240,255,0.9)] animate-bounce z-30">
                {rankUpBanner}
              </div>
            )}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentTier.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white tracking-wide">{currentTier.title}</span>
                  <span style={{ backgroundColor: `${currentTier.badgeColor}22`, borderColor: `${currentTier.badgeColor}55`, color: currentTier.badgeColor }} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border">
                    RANK {currentTier.rank}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-xl mx-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-cyan-400" /><span>Progress</span></span>
                <span className="font-bold text-cyan-300">{progressPct}% · {score} pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 border border-purple-500/20 overflow-hidden">
                <div style={{ width: `${progressPct}%`, backgroundColor: currentTier.badgeColor }} className="h-full rounded-full transition-all duration-500 shadow-[0_0_12px_currentColor]" />
              </div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <span className="text-xs font-mono font-black text-amber-300">
                {nextTier ? `${ptsToNext} PTS TO ${nextTier.title.toUpperCase()}` : '👑 MAX RANK'}
              </span>
            </div>
          </div>

          {/* MAIN AREA — arena left, sidebar right */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 lg:overflow-hidden">

            {/* LEFT: 3D ARENA fills all remaining height */}
            <div className="flex-1 min-w-0 relative h-[60dvh] min-h-[350px] lg:h-auto">
              <div
                ref={arenaContainerRef}
                className="relative w-full h-full overflow-hidden bg-black/80"
              >
                {/* Bomb Hazard Flash */}
                {bombFlash && (
                  <div className="absolute inset-0 z-30 bg-rose-500/40 pointer-events-none animate-ping" />
                )}

                {/* Top-right overlay controls */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-2">
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="p-2 rounded-xl bg-black/75 backdrop-blur-md hover:bg-purple-950/70 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-lg"
                      title="How to Play"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-xl bg-black/75 backdrop-blur-md hover:bg-purple-950/70 border border-purple-500/30 text-zinc-300 hover:text-white transition shadow-lg"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Arena'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  </div>
                </div>

                {/* 3D WebGL Canvas — fills the entire arena div */}
                <FruitCuttingCanvas
                  bladeStyle={activeBladeToUse}
                  colorTheme={selectedTheme}
                  pace={gamePace}
                  isPaused={isGameOver || isPaused}
                  onSliceFruit={handleSliceFruit}
                  onBombHit={handleBombHit}
                  onFrenzyChange={(lvl, lbl) => {
                    setFrenzyLevel(lvl);
                    setFrenzyLabel(lbl);
                  }}
                  gameResetKey={gameResetKey}
                  className="absolute inset-0 w-full h-full select-none touch-none cursor-crosshair"
                />

                {/* Paused Overlay */}
                {isPaused && !isGameOver && (
                  <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-4 rounded-full bg-purple-950/50 border border-purple-500/40 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      <Pause className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">GAME PAUSED</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">Take a breath and jump back in.</p>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 transition"
                    >
                      <Play className="w-4 h-4" /><span>Resume</span>
                    </button>
                  </div>
                )}

                {/* Game Over Modal */}
                {isGameOver && (
                  <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="cyber-card border border-purple-500/40 rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(217,70,239,0.35)] flex flex-col items-center">
                      <div style={{ borderColor: grade.color, color: grade.color }} className="w-16 h-16 rounded-3xl bg-black/60 border-2 flex items-center justify-center text-3xl font-black font-mono shadow-[0_0_30px_currentColor] mb-3">
                        {grade.letter}
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-white uppercase">{grade.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Arcade 60-second combat finished.</p>
                      <div className="my-6 grid grid-cols-2 gap-3 w-full p-4 rounded-2xl bg-black/50 border border-purple-500/25">
                        <div className="p-2.5 rounded-xl bg-purple-950/20">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">FINAL SCORE</span>
                          <span className="text-2xl font-black font-mono text-cyan-400">{score}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-950/20">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">MAX COMBO</span>
                          <span className="text-2xl font-black font-mono text-orange-400">x{maxCombo}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-950/20">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">BEST RECORD</span>
                          <span className="text-lg font-black font-mono text-amber-300">{highScore}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-950/20">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">RANK TIER</span>
                          <span className="text-xs font-black font-mono text-fuchsia-300 flex items-center justify-center gap-1 mt-1">
                            <span>{currentTier.icon}</span><span>{currentTier.title}</span>
                          </span>
                        </div>
                      </div>
                      <button onClick={handleRestart} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 font-mono">
                        <RotateCcw className="w-4 h-4" /><span>Re-Enter Arena</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: SIDEBAR — fixed width, scrollable */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col lg:overflow-y-auto bg-black/30 border-t lg:border-t-0 lg:border-l border-purple-500/20 p-4 gap-4">
                {/* Live Fruit Harvest Counter */}
                <div className="cyber-card p-5 rounded-3xl flex flex-col gap-4 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center justify-between pb-2.5 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧺</span>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Fruit Harvest
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      Live Counts
                    </span>
                  </div>

                  {/* Sliced Fruit Counters for all real 3D models */}
                  <div className="grid grid-cols-2 gap-2.5 text-left">
                    {[
                      { label: 'Watermelon', count: slicedCounts.watermelon, color: '#ff1744', icon: '🍉' },
                      { label: 'Dragonfruit', count: slicedCounts.dragonfruit, color: '#ff007f', icon: '🐉' },
                      { label: 'Strawberry', count: slicedCounts.strawberry, color: '#ff2a6d', icon: '🍓' },
                      { label: 'Apple', count: slicedCounts.apple, color: '#ef4444', icon: '🍎' },
                      { label: 'Orange', count: slicedCounts.orange, color: '#ea580c', icon: '🍊' },
                      { label: 'Lemon', count: slicedCounts.lemon, color: '#facc15', icon: '🍋' },
                      { label: 'Kiwi', count: slicedCounts.kiwi, color: '#4ade80', icon: '🥝' },
                      { label: 'Hazard Bomb', count: slicedCounts.bomb, color: '#ef4444', icon: '💣' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-2xl bg-black/45 border border-purple-500/20 flex items-center justify-between hover:border-purple-500/40 transition"
                      >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{item.icon}</span>
                            <span className="text-xs font-bold text-zinc-200 block truncate leading-tight">
                              {item.label}
                            </span>
                          </div>
                          <span
                            style={{ color: item.color }}
                            className="text-base font-black font-mono shrink-0 pl-1"
                          >
                            {item.count}
                          </span>
                        </div>
                ))}
                      </div>
            </div>

                  {/* Unlockable Smoothie Alchemy Lab */}
                  <div className="cyber-card p-5 rounded-3xl flex flex-col gap-4 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
                    <div className="flex items-center justify-between pb-2.5 border-b border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍹</span>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            Smoothie Alchemy
                          </h3>
                          <p className="text-[10px] text-zinc-400">Slice required fruits to craft & claim bonus</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {JUICE_RECIPES.map((recipe) => {
                        let isReady = true;
                        const progressElements = Object.entries(recipe.requiredFruits).map(
                          ([fKind, required]) => {
                            const current = slicedCounts[fKind as FruitKind] || 0;
                            const req = required || 1;
                            const pct = Math.min(100, Math.round((current / req) * 100));
                            if (current < req) isReady = false;

                            return (
                              <div key={fKind} className="space-y-1">
                                <div className="flex justify-between text-[10px] text-zinc-400">
                                  <span className="capitalize">{fKind}</span>
                                  <span className="font-mono text-zinc-300 font-semibold">
                                    {current} / {req}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%`, backgroundColor: recipe.color }}
                                    className="h-full rounded-full transition-all duration-300 shadow-[0_0_6px_currentColor]"
                                  />
                                </div>
                              </div>
                            );
                          }
                        );

                        return (
                          <div
                            key={recipe.id}
                            className={`p-3.5 rounded-2xl border transition-all ${isReady
                                ? 'bg-purple-950/45 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                                : 'bg-black/45 border-purple-500/20'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{recipe.icon}</span>
                                <div>
                                  <h5 className="text-xs font-bold text-white">{recipe.name}</h5>
                                  <span className="text-[10px] text-zinc-400 block line-clamp-1">{recipe.tagline}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-purple-500/15">
                              {progressElements}
                            </div>

                            {isReady && (
                              <button
                                onClick={() => handleCraftSmoothie(recipe)}
                                className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-black font-black text-xs uppercase font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5 transition"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Craft (+{recipe.rewardPts} Pts)</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            {/* HOW TO PLAY & COMBOS MODAL */}
            {showHelpModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
                <div className="cyber-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                      🗡️
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        How To Play & Blade Combos
                      </h3>
                      <p className="text-xs text-zinc-400">Master the 3D WebGL fruit cutting mechanics</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs text-zinc-300">
                    <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/25 space-y-1">
                      <span className="font-bold text-cyan-300 uppercase tracking-wide block">
                        1. Cleaving Fruits
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        Hold left mouse button (or drag your finger on touchscreens) across flying fruits to cleave them into 3D halves and trigger explosive juice splatter particles.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/25 space-y-1">
                      <span className="font-bold text-orange-400 uppercase tracking-wide block">
                        2. Combo Multipliers
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        Slice multiple fruits in quick succession (under 450ms) to trigger multipliers: x2 Double, x3 Triple, x4 Ultra, and x5 Godlike multipliers!
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/25 space-y-1">
                      <span className="font-bold text-rose-400 uppercase tracking-wide block">
                        3. Hazard Bombs
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        Avoid metallic bombs 💣 with glowing fuses! Slicing a bomb detonates it, causing an instant 25-point penalty and resetting your active combo.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/25 space-y-1">
                      <span className="font-bold text-emerald-400 uppercase tracking-wide block">
                        4. Smoothie Alchemy
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        Harvest enough specific fruit kinds to craft legendary smoothie blends in the right sidebar for massive bonus score boosts!
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/25 space-y-1">
                      <span className="font-bold text-fuchsia-400 uppercase tracking-wide block">
                        5. Slow-Motion Pacing & 3D Depth
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        Fruits float up gracefully at relaxed speed with gentle gravity and organic rotation. Move your pointer around to experience real-time 3D camera parallax! Toggle between Slow (0.68x), Relaxed (0.85x), and Fast in the top bar.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-90 text-white font-bold text-xs uppercase font-mono tracking-wider transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  >
                    Got It, Return to Battle
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* end main area flex row */}
        {/* end z-10 wrapper */}
      </section>
    </div>
  );
}
