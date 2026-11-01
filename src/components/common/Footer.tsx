'use client';

import React from 'react';
import { Swords, Sparkles, Zap, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#05010e] border-t border-purple-500/20 py-10 text-zinc-400">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍉</span>
              <span className="font-bold text-white text-base">FRUIT SLASH 3D</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Hyper-responsive WebGL 3D fruit slicing playground built with Three.js, React 19, and Next.js 16.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Three.js Engine</h5>
            <ul className="text-xs space-y-1.5 text-zinc-500">
              <li className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                <span>Raycast Plane Mesh Cleaving</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explosive 3D Juice Particles</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Custom Laser Blade Glows</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Interactive Features</h5>
            <ul className="text-xs space-y-1.5 text-zinc-500">
              <li>• Zen Endless & Arcade 60s Modes</li>
              <li>• Reactive Color Deck Under Arena</li>
              <li>• Procedural Web Audio API Synthesizer</li>
              <li>• Tropical Smoothie Recipe Unlocks</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Performance</h5>
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Hardware Accelerated</span>
              </div>
              <span>60 FPS requestAnimationFrame physics loop with ACES Filmic tone mapping.</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Fruit Slash 3D. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Crafted with Three.js & Next.js 16</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">React 19</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

