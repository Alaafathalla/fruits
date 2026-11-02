'use client';

import React from 'react';
import { Swords, Sparkles, Zap, Shield, Cpu, Terminal, Compass } from 'lucide-react';

export default function Footer() {
  return (
              <footer className="w-full bg-[#05010e]/95 border-t border-purple-500/20 py-10 text-zinc-400 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-purple-600/10 blur-[90px] pointer-events-none" />

                <div className="max-w-[1680px] mx-auto px-4 sm:px-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Col 1: Brand Info */}
                    <div className="space-y-3 md:col-span-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                          🍉
                        </div>
                        <span className="font-black text-white text-base tracking-tight">FRUIT SLASH 3D</span>
                      </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Hyper-responsive WebGL 3D fruit cleaving simulation powered by Three.js, React 19, and Next.js 16 with customizable laser physics and real-time color deck.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Next.js 16.4.3 Turbopack Engine</span>
                        </div>
                    </div>

                          {/* Col 2: Three.js Capabilities */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Three.js Engine</span>
                            </h5>
                            <ul className="text-xs space-y-1.5 text-zinc-400">
                              <li className="flex items-center gap-2">
                                <Swords className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Dual-pass Glowing Laser Blade Trails</span>
                              </li>
                                <li className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <span>Procedural 3D Fruit Pulp & Halves</span>
                                </li>
                                  <li className="flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                                    <span>Reactive Real-time Lighting Colors</span>
                                  </li>
                                </ul>
                              </div>

                                  {/* Col 3: Interactive Modes */}
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                      <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
                                      <span>Arcade Gameplay</span>
                                    </h5>
                                    <ul className="text-xs space-y-1.5 text-zinc-400">
                                      <li>• Zen Endless & Arcade 60s Modes</li>
                                      <li>• Multi-fruit Frenzy Storm Waves (Levels 1-4)</li>
                                      <li>• Web Audio API Procedural Synthesizer</li>
                                      <li>• Smoothie Alchemy Laboratory & Unlocks</li>
                                    </ul>
                                  </div>

                                        {/* Col 4: Engine Diagnostics */}
                                        <div className="space-y-2">
                                          <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                            <Terminal className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Hardware Specs</span>
                                          </h5>
                                          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/25 text-xs text-zinc-400 space-y-1.5">
                                            <div className="flex items-center justify-between text-emerald-400 font-semibold font-mono text-[11px]">
                                              <span className="flex items-center gap-1">
                                                <Shield className="w-3.5 h-3.5" />
                                                <span>Hardware Accelerated</span>
                                              </span>
                                              <span>60 FPS</span>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 leading-normal">
                                              ACES Filmic tone mapping, dynamic shadow rendering, and real-time sub-pixel collision physics.
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                          <div className="pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
                                            <p>© 2026 Fruit Slash 3D Pro. Designed for high performance.</p>
                                            <div className="flex items-center gap-3 font-mono text-[11px]">
                                              <span className="text-zinc-400">Three.js R187</span>
                                              <span className="text-purple-500">•</span>
                                              <span className="text-cyan-400">React 19</span>
                                              <span className="text-purple-500">•</span>
                                              <span className="text-fuchsia-400">Tailwind CSS 4</span>
                                            </div>
                                          </div>
                                        </div>
                                      </footer>
                                      );
}
