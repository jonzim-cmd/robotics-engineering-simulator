import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { motion } from 'framer-motion';
import { LogTerminal } from '@/components/ui/LogTerminal';
import CrazyRobotSceneWrapper from '@/components/ui/CrazyRobotScene';
import { ManualResearch } from '@/components/ui/ManualResearch';
import { SignalVisualizer } from '@/components/ui/SignalVisualizer';
import { ProtocolEntry } from '@/components/ui/ProtocolEntry';

const Level5_Signals: React.FC = () => {
  const {
    levelState,
    setLevelState,
    popStateHistory,
    subStep,
    setSubStep,
    advanceLevel,
  } = useGameStore();

  const [showText, setShowText] = useState(false);
  const introTextRef = useRef<HTMLDivElement>(null);

  // GAMEPLAY STATE
  const [threshold, setThreshold] = useState(0.1); // Start bad (too sensitive)
  const [systemStatus, setSystemStatus] = useState<'CRITICAL' | 'STABLE'>('CRITICAL');
  const [timeStable, setTimeStable] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Threshold Logic
  // Noise Max: ~0.45
  // Wall Min: ~0.8
  // Good Zone: 0.5 - 0.75
  const isThresholdGood = threshold > 0.5 && threshold < 0.78;

  // Scroll to text when shown
  useEffect(() => {
    if (showText && introTextRef.current) {
      setTimeout(() => {
        introTextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showText]);

  // Game Loop for Success Detection
  useEffect(() => {
    if (levelState !== 'ACTIVE' || isSuccess) return;

    const interval = setInterval(() => {
      if (isThresholdGood) {
        setTimeStable(prev => Math.min(prev + 100, 2000)); // Cap at 2000 (2s)
        setSystemStatus('STABLE');
      } else {
        setTimeStable(0);
        setSystemStatus('CRITICAL');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [levelState, isThresholdGood, isSuccess]);

  const handleBack = () => {
    popStateHistory();
    setShowText(false);
    setSubStep(0);
  };

  const handleShowText = () => {
    setShowText(true);
  };

  const handleStartMission = () => {
     setSubStep(1);
  };
  
  const handleResearchComplete = () => {
    setLevelState('ACTIVE');
    setSubStep(0);
  };
  
  const handleSaveCalibration = () => {
      if (timeStable >= 2000) {
          setIsSuccess(true);
          setSubStep(2); // Go to Protocol Entry
      }
  };

  // === RENDER: RESEARCH (Handbuch) ===
  if (levelState === 'INTRO' && subStep === 1) {
    return (
        <ManualResearch 
            onComplete={handleResearchComplete}
            onBack={() => setSubStep(0)}
        />
    );
  }

  // === RENDER: PROTOCOL ENTRY (Reflexion) ===
  if (levelState === 'ACTIVE' && subStep === 2) {
    return (
        <ProtocolEntry
            onComplete={() => setLevelState('SUCCESS')}
            onBack={() => {
              popStateHistory();
              setSubStep(0);
            }}
        />
    );
  }

  // === RENDER: SUCCESS ===
  if (levelState === 'SUCCESS') {
      return (
        <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={handleBack}>
            <div className="text-center space-y-6 py-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                  <span className="text-4xl">✓</span>
              </motion.div>
              
              <div>
                  <h2 className="text-3xl font-bold text-green-400 mb-2">SYSTEM STABILISIERT</h2>
                  <p className="text-slate-300 max-w-md mx-auto">
                      Der Schwellenwert wurde korrekt kalibriert. Das Sensorrauschen wird ignoriert, aber echte Hindernisse werden zuverlässig erkannt.
                  </p>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded border border-slate-800 max-w-sm mx-auto text-left font-mono text-sm">
                  <div className="flex justify-between mb-2">
                      <span className="text-slate-400">NOISE FLOOR:</span>
                      <span className="text-red-400">~0.45V</span>
                  </div>
                  <div className="flex justify-between mb-2">
                      <span className="text-slate-400">SIGNAL PEAK:</span>
                      <span className="text-green-400">~0.85V</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-2">
                      <span className="text-slate-400">THRESHOLD:</span>
                      <span className="text-yellow-400 font-bold">{(threshold * 5).toFixed(2)}V</span>
                  </div>
              </div>

              <button 
                onClick={() => advanceLevel()}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:scale-105"
              >
                Nächstes Level
              </button>
            </div>
        </TerminalCard>
      );
  }

  // === RENDER: INTRO ===
  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="SECURITY ALERT - UNIT 7" borderColor="red" onBack={handleBack}>
        <div className="space-y-6">

          {/* INCIDENT REPORT */}
          <div className="text-red-400 font-bold">INCIDENT REPORT:</div>
          <TypewriterText
            text="Ebene 5: Verbindung zu Sektor 7 hergestellt. Unit-7 zeigt wahnsinniges Verhalten. Sensoren spielen verrückt."
            speed={20}
          />

          {/* SPLIT VIEW: TERMINAL & 3D SCENE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] mt-6">
            {/* Left: Logs */}
            <div className="h-full overflow-hidden">
                <LogTerminal isRunning={true} />
            </div>

            {/* Right: 3D Scene */}
            <div className="h-full overflow-hidden">
                <CrazyRobotSceneWrapper />
            </div>
          </div>

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
              Handbuch öffnen & Diagnose starten
            </motion.button>
          )}
        </div>
      </TerminalCard>
    );
  }

  // === RENDER: ACTIVE GAMEPLAY ===
  return (
    <TerminalCard
        title="SENSOR DIAGNOSTIC TOOL v4.0"
        borderColor={systemStatus === 'STABLE' ? 'green' : 'red'}
        onBack={handleBack}
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[500px]">
            
            {/* LEFT: SIGNAL VISUALIZER */}
            <div className="flex flex-col gap-4 min-h-[300px]">
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex justify-between items-center">
                    <h3 className="text-cyan-400 font-bold font-mono">OSZILLOSKOP (SENSOR_01)</h3>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${systemStatus === 'STABLE' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400 animate-pulse'}`}>
                        STATUS: {systemStatus}
                    </div>
                </div>
                
                <div className="flex-1 relative">
                    <SignalVisualizer 
                        threshold={threshold}
                        onThresholdChange={setThreshold}
                        isSimulating={true}
                    />
                </div>
                
                <div className="text-xs text-slate-500 font-mono">
                    ANWEISUNG: Verschiebe den gelben Schwellenwert (Threshold), bis das Rauschen ("Geister") unterhalb der Linie liegt, aber echte Signale (große Ausschläge) noch erkannt werden.
                </div>
            </div>

            {/* RIGHT: LIVE PREVIEW */}
            <div className="flex flex-col gap-4 relative min-h-[350px]">
                <div className="bg-slate-900 border border-slate-700 p-3 rounded">
                    <h3 className="text-cyan-400 font-bold font-mono">LIVE FEED (CAM_04)</h3>
                </div>
                
                <div className="flex-1 overflow-hidden rounded border border-slate-800 relative">
                     {/* Show success progress bar overlay if stable */}
                     {isThresholdGood && !isSuccess && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur px-4 py-2 rounded border border-green-500">
                            <div className="text-green-400 text-xs font-bold mb-1 text-center">KALIBRIERUNG...</div>
                            <div className="w-32 h-2 bg-slate-800 rounded overflow-hidden">
                                <motion.div 
                                    className="h-full bg-green-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((timeStable / 2000) * 100, 100)}%` }}
                                    transition={{ type: 'tween', ease: 'linear' }}
                                />
                            </div>
                        </div>
                     )}

                    <CrazyRobotSceneWrapper isFixed={isThresholdGood} />
                </div>
                
                {/* Save Button Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleSaveCalibration}
                        disabled={timeStable < 2000}
                        className={`w-full py-3 font-bold rounded uppercase tracking-widest transition-all shadow-lg ${
                            timeStable >= 2000
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40 hover:scale-[1.02]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {timeStable >= 2000 ? 'KALIBRIERUNG SPEICHERN' : 'WARTE AUF STABILES SIGNAL...'}
                    </button>
                </div>
            </div>
        </div>
    </TerminalCard>
  );
};

export default Level5_Signals;