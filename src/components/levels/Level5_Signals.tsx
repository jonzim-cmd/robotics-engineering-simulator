'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { motion } from 'framer-motion';
import { LogTerminal } from '@/components/ui/LogTerminal';
import CrazyRobotSceneWrapper from '@/components/ui/CrazyRobotScene';

const Level5_Signals: React.FC = () => {
  const {
    advanceLevel,
    levelState,
    popStateHistory,
  } = useGameStore();

  const [showText, setShowText] = useState(false);
  const introTextRef = useRef<HTMLDivElement>(null);

  // Scroll to text when shown
  useEffect(() => {
    if (showText && introTextRef.current) {
      setTimeout(() => {
        introTextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showText]);

  const handleBack = () => {
    popStateHistory();
    setShowText(false);
  };

  const handleShowText = () => {
    setShowText(true);
  };

  const handleStartMission = () => {
     // Placeholder for next step
     console.log("Mission Start - Not implemented yet");
  };

  // === RENDER: INTRO ===
  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="SECURITY ALERT - UNIT 7" borderColor="red" onBack={handleBack}>
        <div className="space-y-6">
            
          {/* SPLIT VIEW: TERMINAL & 3D SCENE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
            {/* Left: Logs */}
            <div className="h-full overflow-hidden">
                <LogTerminal isRunning={true} />
            </div>
            
            {/* Right: 3D Scene */}
            <div className="h-full overflow-hidden">
                <CrazyRobotSceneWrapper />
            </div>
          </div>

          <div className="text-red-400 font-bold mt-4">INCIDENT REPORT:</div>
          <TypewriterText
            text="Verbindung zu Sektor 7 hergestellt. Unit-7 zeigt erratisches Verhalten. Kollisionswarnsystem spielt verrückt."
            speed={20}
          />

          {!showText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="text-center mt-4 text-slate-400 text-sm cursor-pointer"
              onClick={handleShowText}
            >
              [ Klicken um Details zu laden... ]
            </motion.div>
          )}

          {showText && (
            <motion.div
              ref={introTextRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded"
            >
              <strong className="text-red-400 block mb-2">WAS IST PASSIERT?</strong>
              <p className="mb-4 text-slate-300 leading-relaxed">
                Die Nachtschicht ist in Panik. Unit-7 stoppt ständig grundlos, weicht unsichtbaren Hindernissen aus und dreht sich im Kreis. 
                Die Mitarbeiter glauben, der Roboter sei "besessen". Die Produktion steht still.
              </p>

              <strong className="text-cyan-400 block mb-2 mt-6">AUFTRAG:</strong>
              <p className="text-slate-300 leading-relaxed">
                Das ist natürlich Unsinn. Roboter sehen keine Geister. <br/>
                Verbinde dich mit dem Sensorkontrollsystem. Analysiere die eingehenden Signale und finde heraus, warum die Sensoren Hindernisse melden, wo nur leere Luft ist.
              </p>
            </motion.div>
          )}

          {showText && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={handleStartMission}
              className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Diagnose Starten (Coming Soon)
            </motion.button>
          )}
        </div>
      </TerminalCard>
    );
  }

  return <div>Level 5 Active Content Placeholder</div>;
};

export default Level5_Signals;