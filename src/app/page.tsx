'use client';

import React, { useState, useEffect } from 'react';
import Footer from '@/components/common/Footer';
import FruitHero from '@/components/fruit/FruitHero';

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060212] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-sm tracking-wider uppercase text-cyan-400">
            Initializing Three.js Gaming Engine...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060212] text-zinc-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">
      {/* Hero Section includes the Unified Header, 3D Arena, and Command Decks */}
      <main className="flex-1 flex flex-col">
        <FruitHero />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
