# Fruit Slash 3D — Gaming Hero Experience

A fast, interactive 3D WebGL fruit cutting hero experience built with **Next.js 16 (App Router)**, **React 19**, **Three.js (v0.187)**, and **Tailwind CSS**.

Everything is unified inside a high-octane **Arcade Gaming Hero Section** featuring dynamic gaming colors, retro-futuristic grid backgrounds, real-time reactive lighting, and an all-in-one command deck.

---

## What's in the Gaming Hero Viewport

### 1. Unified Hero Command Deck ("All-in-One")
* **Top Hero Battle HUD**:
  - Live Score counter (`SCORE: 2,450`), Active Combo multiplier (`x4!`), and High Score tracker.
  - Quick game mode switcher: **Zen Mode** (Relaxed infinite slicing) vs. **Arcade Mode** (60s timer with bombs).
  - Procedural Web Audio API toggle (synthesized whooshes, slicing squelches, and fanfare).
* **Left Gaming Deck — Blade & Color Studio**:
  - **Gaming Lighting Themes**: *Cyberpunk 2088* (Cyan/Fuchsia), *Synthwave Night* (Hot Pink/Amber), *Solar Overdrive* (Solar Orange/Rose), *Matrix Emerald* (Toxic Lime/Teal).
  - **Blade Trail Presets**: Cyber Cyan, Hot Magenta, Solar Amber, Toxic Lime, Amethyst Neon.
  - **Interactive Custom Color Handle**: Instant reactive color picker that updates the blade laser, trail glow, and background aura in real time.
* **Center Stage — 3D Fruit Cutting Arena**:
  - Ballistic 3D fruit launching (Watermelons, Dragonfruits, Oranges, Apples, Lemons, Kiwis, Bombs).
  - Dual-half mesh cleaving along the slice plane with opposing angular and lateral velocity.
  - 35+ 3D juice particles bursting outward with gravity and decay.
  - Neon corner brackets and glowing cybernetic borders.
* **Right Gaming Deck — Smoothie Bar & Sliced Fruit Inventory**:
  - Live tally of every sliced fruit species.
  - Unlocks legendary tropical smoothie blends (*Dragonfruit Elixir*, *Watermelon Splash*, *Solar Sunrise*) with animated progress bars.

---

### 2. Gaming Background Aesthetics
* Multi-layer gaming color backdrop:
  - Deep cybernetic purple & obsidian night base (`#09021a` to `#10052a`).
  - Animated glowing gaming radial spots (Neon Magenta, Cyber Cyan, and player-selected reactive aura).
  - Perspective retro-futuristic laser grid pattern (`.gaming-grid`).
  - Glassmorphism HUD cards with glowing neon borders (`border-purple-500/30`, `shadow-[0_0_25px_rgba(139,92,246,0.15)]`).

---

## Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```
