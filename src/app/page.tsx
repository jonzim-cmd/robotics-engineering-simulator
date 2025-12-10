'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import Level1_Mechanics from '@/components/levels/Level1_Mechanics';
import Level2_Transmission from '@/components/levels/Level2_Transmission';
import Level3_Mechanisms from '@/components/levels/Level3_Mechanisms';
import Level4_Electronics from '@/components/levels/Level4_Electronics';
import Level5_Signals from '@/components/levels/Level5_Signals';
import Level6_Ethics from '@/components/levels/Level6_Ethics';
import Level0_Intro from '@/components/levels/Level0_Intro';
import { Lock, Home as HomeIcon, RotateCcw, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { GameTracker } from '@/components/GameTracker';

export default function Home() {
  const { currentLevel, credits, setLevel, levelState, subStep, popStateHistory, stateHistory, resetGame } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  // Scroll to top when level or level state changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentLevel, levelState, subStep]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        if (e.key === 'ArrowRight') {
          // Secret fast forward: Next level
          setLevel(Math.min(currentLevel + 1, 7));
        } else if (e.key === 'ArrowLeft') {
          // Secret rewind: Previous level
          setLevel(Math.max(currentLevel - 1, 0));
        }
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let initialTouches = 0;

    const handleTouchStart = (e: TouchEvent) => {
      initialTouches = e.touches.length;
      if (e.touches.length === 3) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only trigger if we started with 3 fingers and still have 3 fingers
      if (initialTouches === 3 && e.touches.length === 3) {
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Check if horizontal swipe is dominant (not vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          e.preventDefault();

          if (deltaX > 0) {
            // Swipe right: Next level
            setLevel(Math.min(currentLevel + 1, 7));
          } else {
            // Swipe left: Previous level
            setLevel(Math.max(currentLevel - 1, 0));
          }

          // Reset to prevent multiple triggers
          touchStartX = touchEndX;
          touchStartY = touchEndY;
        }
      }
    };

    const handleTouchEnd = () => {
      initialTouches = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentLevel, setLevel]);

  const handleGlobalBack = () => {
    popStateHistory();
  };

  const renderLevel = () => {
    switch (currentLevel) {
      case 0: return <Level0_Intro />;
      case 1: return <Level1_Mechanics />;
      case 2: return <Level2_Transmission />;
      case 3: return <Level3_Mechanisms />;
      case 4: return <Level4_Electronics />;
      case 5: return <Level5_Signals />;
      case 6: return <Level6_Ethics />;
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
      <GameTracker />
      <header className="border-b border-slate-800 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ROBOTICS ENGINEERING SIMULATOR
            </h1>
            <div className="text-xs text-slate-500 font-mono">INDUSTRIAL TRAINING MODULE v2.0</div>
          </div>
          <div className="flex gap-4 font-mono text-sm">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-cyan-400">
              LEVEL: <span className="text-white">{currentLevel}/6</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-yellow-400">
              CREDITS: <span className="text-white">{credits}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-3">
          {stateHistory.length > 0 && (
            <button
              onClick={popStateHistory}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
              Zurück
            </button>
          )}
          {currentLevel > 0 && (
            <button
              onClick={() => setLevel(0)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 hover:text-white transition-colors"
            >
              <HomeIcon size={16} />
              Startseite
            </button>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-red-900/50 border border-slate-700 hover:border-red-700 rounded text-sm text-slate-300 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={16} />
            Neu starten
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-3">Spiel neu starten?</h2>
            <p className="text-slate-400 mb-6">
              Dein gesamter Fortschritt wird zurückgesetzt. Du beginnst wieder bei Level 0 mit 50 Credits.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
              >
                Ja, neu starten
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {renderLevel()}
      </main>
      
      <footer className="text-center text-slate-700 text-xs mt-12 font-mono flex justify-center items-center gap-2">
        <span>ARES CORP. SYSTEM TERMINAL // UNAUTHORIZED ACCESS PROHIBITED</span>
        <Link href="/admin" className="opacity-10 hover:opacity-50 transition-opacity">
          <Lock size={12} />
        </Link>
      </footer>
    </div>
  );
}