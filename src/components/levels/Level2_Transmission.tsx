'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { calculateTransmission } from '@/lib/physicsEngine';
import { motion } from 'framer-motion';

const Level2_Transmission: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory } = useGameStore();
  const [gearRatio, setGearRatio] = useState(1);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Motor stats (Constant input)
  const MOTOR_TORQUE = 2; // Nm
  const MOTOR_RPM = 3000; // RPM

  const { outputTorque, outputRPM } = calculateTransmission(MOTOR_TORQUE, MOTOR_RPM, gearRatio);

  // Wheel diameter approx 0.5m -> Circumference ~ 1.57m
  // Speed (m/min) = RPM * 1.57
  // Speed (km/h) = (RPM * 1.57 * 60) / 1000
  const speedKmh = (outputRPM * 1.57 * 60) / 1000;

  const handleBack = () => {
    // Pop from global history
    popStateHistory();
    // Reset local state
    setGearRatio(1);
    setSimulating(false);
    setResult(null);
  };

  const handleStart = () => {
    // Save state before advancing
    pushStateHistory();
    setLevelState('ACTIVE');
  };

  const handleSimulate = () => {
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      if (outputTorque > 15 && speedKmh > 2) {
        setResult({ success: true, msg: "Perfekt! Der Rover erklimmt den Hang mit guter Geschwindigkeit." });
        setTimeout(() => setLevelState('SUCCESS'), 1500);
      } else if (outputTorque <= 15) {
        setResult({ success: false, msg: `FEHLER: Zu wenig Kraft (${outputTorque.toFixed(1)} Nm < 15 Nm). Der Rover rollt rückwärts.` });
      } else {
        setResult({ success: false, msg: `FEHLER: Zu langsam (${speedKmh.toFixed(1)} km/h < 2 km/h). Timeout bevor Ziel erreicht.` });
      }
      setSimulating(false);
    }, 2000);
  };

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={handleBack}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText 
            text="Ebene 1 Diagnostik: OK. Lade Missionsparameter für Ebene 2..." 
            speed={20}
          />
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">
              Der Arm ist ausgetauscht. Gute Arbeit. Jetzt muss Unit-7 die Fracht zur Verladestation bringen.
              Der Weg führt über die steile Rampe zu Sektor 4. Steigung: 20 Grad.
            </p>

            <strong className="text-red-400 block mb-2 mt-4">PROBLEM:</strong>
            <p className="mb-2">
              Im aktuellen Zustand ist das Getriebe auf hohe Geschwindigkeit ausgelegt. Auf der Rampe reicht
              die Kraft aber nicht: Der Motor dreht, aber die Räder kommen nicht von der Stelle. Das{" "}
              <GlossaryTooltip
                term="Drehmoment"
                definition="Wie stark sich etwas drehen kann. Am Rad: wie kräftig das Rad den Boden nach hinten schiebt, damit der Transporter nach vorne gedrückt wird."
              />{" "}
              am Rad ist zu gering.
            </p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>
              Passe das Getriebe an. Wir brauchen mehr{" "}
              <GlossaryTooltip
                term="Drehmoment"
                definition="Drehmoment ist die Drehkraft. Je mehr Drehmoment am Rad ankommt, desto leichter kommt der Transporter eine Steigung hoch."
              />{" "}
              am Rad, damit der Transporter die 20°-Rampe hochfahren kann, ohne stehenzubleiben.
            </p>
            <p className="mt-2">
              Aber Achtung: Wenn du die{" "}
              <GlossaryTooltip
                term="Übersetzung"
                definition="Verhältnis: wie oft sich der Motor dreht, wenn sich das Rad einmal dreht. Größere Übersetzung = mehr Kraft am Rad, aber weniger Geschwindigkeit."
              />{" "}
              zu groß wählst, hat der Transporter zwar viel Kraft, fährt aber sehr langsam. Dann braucht er
              ewig für die Strecke und der Warenfluss gerät ins Stocken.
            </p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Getriebe konfigurieren
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={handleBack}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ ANTRIEB STABIL</div>
          <p>Der Rover hat die Rampe erfolgreich erklommen.</p>
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
      <TerminalCard title="LEVEL 2: GETRIEBE & ÜBERSETZUNG" borderColor={result?.success === false ? 'red' : 'cyan'} onBack={handleBack}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-6 rounded border border-slate-800">
              <h3 className="text-cyan-400 font-bold mb-6 border-b border-slate-700 pb-2">GETRIEBE-CONFIG</h3>
              
              <div className="mb-8">
                <label className="block text-sm text-slate-400 mb-2">Gear Ratio (Übersetzung) <span className="text-white font-mono text-lg ml-2">{gearRatio}:1</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1" 
                  value={gearRatio} 
                  onChange={(e) => setGearRatio(parseInt(e.target.value))}
                  disabled={simulating}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Speed (1:1)</span>
                  <span>Kraft (50:1)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                <div className="bg-slate-800 p-3 rounded">
                  <div className="text-slate-400 text-xs">OUTPUT TORQUE</div>
                  <div className={`text-xl font-bold ${outputTorque > 15 ? 'text-green-400' : 'text-red-400'}`}>
                    {outputTorque.toFixed(1)} Nm
                  </div>
                  <div className="text-xs text-slate-500">Ziel: {'>'} 15.0 Nm</div>
                </div>
                <div className="bg-slate-800 p-3 rounded">
                  <div className="text-slate-400 text-xs">SPEED</div>
                  <div className={`text-xl font-bold ${speedKmh > 2 ? 'text-green-400' : 'text-red-400'}`}>
                    {speedKmh.toFixed(1)} km/h
                  </div>
                  <div className="text-xs text-slate-500">Ziel: {'>'} 2.0 km/h</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={simulating}
              className={`w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                simulating ? 'bg-yellow-600 text-white animate-pulse' :
                'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {simulating ? 'Testfahrt...' : 'Simulation Starten'}
            </button>

            {result && !result.success && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-4 bg-red-900/20 border border-red-500 text-red-400 rounded"
               >
                 <strong>SIMULATION FEHLGESCHLAGEN:</strong><br/>
                 {result.msg}
               </motion.div>
            )}
          </div>

          {/* Visualizer */}
          <div className="flex flex-col justify-center items-center bg-slate-900 rounded border border-slate-800 p-8 relative overflow-hidden">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
             
             <div className="flex items-center gap-8 z-10">
                <div className="text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-4 border-slate-600 border-t-cyan-500 mx-auto mb-2 relative"
                  >
                     <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-500">M</div>
                  </motion.div>
                  <div className="text-xs text-slate-400">MOTOR</div>
                  <div className="text-xs text-slate-500">{MOTOR_RPM} RPM</div>
                </div>

                <div className="text-2xl text-slate-600">→</div>

                <div className="text-center relative">
                   {/* Gearbox visual */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-800/50 rounded-full -z-10"></div>
                   
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2 * gearRatio, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-8 border-slate-600 border-t-yellow-500 border-dashed mx-auto mb-2 flex items-center justify-center"
                  >
                     <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-2 left-1/2 -translate-x-1/2"></div>
                  </motion.div>
                  <div className="text-xs text-slate-400">WHEEL</div>
                  <div className="text-xs text-slate-500">{outputRPM.toFixed(0)} RPM</div>
                </div>
             </div>

             {simulating && (
               <div className="absolute bottom-4 left-0 right-0 text-center text-yellow-500 font-mono text-xs animate-pulse">
                 SIMULATING PHYSICS...
               </div>
             )}
          </div>

        </div>
      </TerminalCard>
    </div>
  );
};

export default Level2_Transmission;
