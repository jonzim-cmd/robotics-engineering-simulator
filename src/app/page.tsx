'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import Level1_Mechanics from '@/components/levels/Level1_Mechanics';
import Level2_Transmission from '@/components/levels/Level2_Transmission';
import Level3_Electronics from '@/components/levels/Level3_Electronics';
import Level4_Signals from '@/components/levels/Level4_Signals';
import Level5_Ethics from '@/components/levels/Level5_Ethics';
import Level0_Intro from '@/components/levels/Level0_Intro';

export default function Home() {
  const { currentLevel, credits } = useGameStore();

  const renderLevel = () => {
    switch (currentLevel) {
      case 0: return <Level0_Intro />;
      case 1: return <Level1_Mechanics />;
      case 2: return <Level2_Transmission />;
      case 3: return <Level3_Electronics />;
      case 4: return <Level4_Signals />;
      case 5: return <Level5_Ethics />;
      default: return (
        <div className="text-center p-10 text-cyan-500">
          <h1 className="text-2xl font-bold mb-4">ALL SYSTEMS OPERATIONAL</h1>
          <p>Mission Complete. All modules initialized.</p>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ROBOTICS ENGINEERING SIMULATOR
          </h1>
          <div className="text-xs text-slate-500 font-mono">INDUSTRIAL TRAINING MODULE v2.0</div>
        </div>
        <div className="flex gap-4 font-mono text-sm">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-cyan-400">
            LEVEL: <span className="text-white">{currentLevel}/5</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-yellow-400">
            CREDITS: <span className="text-white">{credits}</span>
          </div>
        </div>
      </header>

      <main>
        {renderLevel()}
      </main>
      
      <footer className="text-center text-slate-700 text-xs mt-12 font-mono">
        ARES CORP. SYSTEM TERMINAL // UNAUTHORIZED ACCESS PROHIBITED
      </footer>
    </div>
  );
}