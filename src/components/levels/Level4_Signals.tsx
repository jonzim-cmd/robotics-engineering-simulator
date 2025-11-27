'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { motion } from 'framer-motion';

const Level4_Signals: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; msg: string; count: number } | null>(null);

  const handleBack = () => {
    // Pop from global history
    popStateHistory();
    // Reset local state
    setSelectedOption(null);
    setSimulating(false);
    setResult(null);
  };

  const handleStart = () => {
    // Save state before advancing
    pushStateHistory();
    setLevelState('ACTIVE');
  };

  const handleSimulate = () => {
    if (!selectedOption) return;
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      // Simulation logic
      if (selectedOption === 'wait50') {
        setResult({ correct: true, msg: "Signal stabil! Das Prellen wird ignoriert.", count: 1 });
        setTimeout(() => setLevelState('SUCCESS'), 1500);
      } else if (selectedOption === 'wait1') {
        setResult({ correct: false, msg: "FEHLER: Wartezeit zu kurz. Prellen wird als neue Kiste erkannt.", count: 5 });
      } else {
        setResult({ correct: false, msg: "FEHLER: Spannungserhöhung ändert nichts am mechanischen Prellen.", count: 5 });
      }
      setSimulating(false);
    }, 1500);
  };

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={handleBack}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText 
            text="Ebene 3 Diagnostik: OK. Sensor-Kalibrierung erforderlich..." 
            speed={20}
          />
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">Unit-7 lädt die Fracht nun erfolgreich am Förderband ab. Dort soll ein Laser-Sensor die vorbeifahrenden Kisten für das Inventar zählen. Eine Kiste fährt vorbei &rarr; 'Klick'.</p>
            
            <strong className="text-red-400 block mb-2 mt-4">PROBLEM:</strong>
            <p className="mb-2">Der Zähler zeigt völligen Unsinn an. Eine Kiste kommt, aber der Zähler springt auf '5'. Das Inventar-System meldet Phantom-Bestände.</p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>Das ist kein sauberes Signal. Der mechanische Schalter am Band '<GlossaryTooltip term="Prellt" definition="Mikroskopisches Nachfedern von Kontakten beim Schalten." />' (vibriert). Der Computer ist so schnell, dass er jedes Vibrieren als neue Kiste zählt. Repariere das Signal per Code.</p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Code Editor öffnen
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={handleBack}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ SIGNAL SAUBER</div>
          <p>Der Zähler arbeitet präzise. Entprellung erfolgreich implementiert.</p>
          <button 
            onClick={() => advanceLevel(true)}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Nächstes Level
          </button>
        </div>
      </TerminalCard>
    );
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="LEVEL 4: SIGNALVERARBEITUNG" borderColor={result?.correct === false ? 'red' : 'cyan'} onBack={handleBack}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Code Puzzle */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded border border-slate-800 font-mono text-sm">
               <div className="text-slate-500 mb-4">// Sensor Interrupt Handler</div>
               <div className="text-purple-400">if <span className="text-slate-200">(Signal == HIGH)</span> {'{'}</div>
               <div className="pl-4 text-slate-300">
                  
                  {/* Drop Zone */}
                  <div className="my-2 border-2 border-dashed border-slate-700 bg-slate-800/50 p-2 rounded text-center">
                    {selectedOption ? (
                       <span className="text-yellow-400 font-bold">
                         {selectedOption === 'wait1' ? 'Wait(1 ms);' : selectedOption === 'wait50' ? 'Wait(50 ms);' : 'Voltage++;'}
                       </span>
                    ) : (
                       <span className="text-slate-600">[ Code hier einfügen ]</span>
                    )}
                  </div>

                  <div className="text-slate-300">Count = Count + 1;</div>

               </div>
               <div className="text-purple-400">{'}'}</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={() => setSelectedOption('wait1')}
                 className={`p-3 border rounded text-left font-mono transition-all ${selectedOption === 'wait1' ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                 Wait(1 ms); <span className="text-slate-500 text-xs ml-2">// Sehr kurz warten</span>
               </button>
               <button 
                 onClick={() => setSelectedOption('wait50')}
                 className={`p-3 border rounded text-left font-mono transition-all ${selectedOption === 'wait50' ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                 Wait(50 ms); <span className="text-slate-500 text-xs ml-2">// Lang warten</span>
               </button>
               <button 
                 onClick={() => setSelectedOption('volt')}
                 className={`p-3 border rounded text-left font-mono transition-all ${selectedOption === 'volt' ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                 Voltage++; <span className="text-slate-500 text-xs ml-2">// Spannung erhöhen</span>
               </button>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={!selectedOption || simulating}
              className={`w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                !selectedOption ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                simulating ? 'bg-yellow-600 text-white animate-pulse' :
                'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {simulating ? 'Kompiliere...' : 'Code Testen'}
            </button>
          </div>

          {/* Signal Visualizer */}
          <div className="bg-slate-950 rounded border border-slate-800 p-4 flex flex-col justify-center">
             <h4 className="text-xs text-slate-500 mb-4 font-mono text-center">OSZILLOSKOP: SENSOR INPUT (ZOOM)</h4>
             
             <div className="h-32 w-full relative flex items-center mb-8">
                {/* Noisy Signal SVG */}
                <svg viewBox="0 0 400 100" className="w-full h-full stroke-cyan-500 fill-none stroke-2">
                   {/* Base line */}
                   <path d="M0,90 L50,90" />
                   {/* Bounce */}
                   <path d="M50,90 L52,10 L55,80 L58,15 L60,70 L62,10 L65,50 L70,10 L400,10" className="animate-pulse" />
                </svg>
                <div className="absolute top-0 left-[60px] bottom-0 w-5 bg-red-500/20 border-l border-r border-red-500/50 flex items-end justify-center">
                   <span className="text-[10px] text-red-400 mb-1">BOUNCE</span>
                </div>
             </div>

             <div className="bg-slate-900 p-4 rounded border border-slate-800 text-center">
                <div className="text-slate-400 text-xs mb-2">ERGEBNIS: GEZÄHLTE KISTEN (1 ECHT)</div>
                <div className={`text-5xl font-black font-mono ${result ? (result.correct ? 'text-green-500' : 'text-red-500') : 'text-slate-600'}`}>
                   {result ? result.count : '0'}
                </div>
                {result && (
                   <div className={`text-sm mt-2 ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {result.msg}
                   </div>
                )}
             </div>
          </div>

        </div>
      </TerminalCard>
    </div>
  );
};

export default Level4_Signals;
