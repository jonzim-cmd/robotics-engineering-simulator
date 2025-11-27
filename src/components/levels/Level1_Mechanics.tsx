'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { BrokenArmVisualization } from '@/components/ui/BrokenArmVisualization';
import { RobotArmVisualization } from '@/components/ui/RobotArmVisualization';
import { MaterialCard } from '@/components/ui/MaterialCard';
import { MATERIALS, calculateArmPhysics } from '@/lib/physicsEngine';
import { motion } from 'framer-motion';

const Level1_Mechanics: React.FC = () => {
  const {
    advanceLevel,
    setLevelState,
    levelState,
    credits,
    removeCredits,
    pushStateHistory,
    popStateHistory,
  } = useGameStore();

  // Input states
  const [inputDensity, setInputDensity] = useState('');
  const [inputStiffness, setInputStiffness] = useState('');

  // Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    mass: number;
    deflection: number;
    isSafeMass: boolean;
    isSafeDeflection: boolean;
    status: 'SUCCESS' | 'FAIL_MASS' | 'FAIL_DEFLECTION' | 'FAIL_BOTH';
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);

  const handleStart = () => {
    // Save current state before advancing
    pushStateHistory();
    setLevelState('ACTIVE');
  };

  const handleBack = () => {
    // Simply pop from global history - it handles everything (including level transitions!)
    popStateHistory();

    // Reset local state when going back
    setShowText(false);
    setSimulationResult(null);
    setErrorMsg(null);
    setInputDensity('');
    setInputStiffness('');
  };

  const handleShowText = () => {
    setShowText(true);
  };

  const handleSimulate = () => {
    // Validate inputs
    // Allow comma as decimal separator for German users
    const densityStr = inputDensity.replace(',', '.');
    const stiffnessStr = inputStiffness.replace(',', '.');

    const density = parseFloat(densityStr);
    const stiffness = parseFloat(stiffnessStr);

    if (isNaN(density) || density <= 0) {
      setErrorMsg('FEHLER: Ungültige Dichte-Eingabe. Bitte Zahl > 0 eingeben.');
      return;
    }

    if (isNaN(stiffness) || stiffness <= 0) {
      setErrorMsg('FEHLER: Ungültiger E-Modul. Bitte Zahl > 0 eingeben.');
      return;
    }

    // CRITICAL: Save state BEFORE any simulation/credit changes
    // This ensures credits are restored when going back
    pushStateHistory();

    setSimulating(true);
    setErrorMsg(null);
    setSimulationResult(null); // Reset previous result

    // Simulate processing delay
    setTimeout(() => {
      const result = calculateArmPhysics(density, stiffness);
      setSimulationResult(result);

      // Find matching material to check cost (fuzzy match)
      const matchingMaterial = Object.values(MATERIALS).find(
        m => Math.abs(m.density - density) < 0.1 && Math.abs(m.stiffness - stiffness) < 5
      );

      // Check if values are reasonably close to a database material
      if (!matchingMaterial) {
        setErrorMsg(
          `FEHLER: Die eingegebenen Werte (${density} / ${stiffness}) stimmen nicht mit einem Material aus der Datenbank überein. Bitte trage die Werte exakt aus der Materialdatenbank ein.`
        );
        setLevelState('FAIL');
        setSimulating(false);
        return;
      }

      const materialCost = matchingMaterial.cost;

      if (result.status === 'FAIL_MASS' || result.status === 'FAIL_BOTH') {
        setErrorMsg(
          `WARNUNG: Der Arm ist zu schwer (${result.mass.toFixed(0)}g statt max. 1000g). Die Motoren werden durchbrennen! (Dichte zu hoch)`
        );
        setLevelState('FAIL');
      } else if (result.status === 'FAIL_DEFLECTION') {
        setErrorMsg(
          `WARNUNG: Das Material verbiegt sich zu sehr (${result.deflection.toFixed(2)}mm statt max. 2.00mm). Strukturversagen droht! (E-Modul zu niedrig)`
        );
        setLevelState('FAIL');
      } else if (materialCost > credits) {
        setErrorMsg(
          `WARNUNG: Budget überschritten! Das Material kostet ${materialCost} CR, du hast nur ${credits} CR. Wähle ein günstigeres Material.`
        );
        setLevelState('FAIL');
      } else {
        // Deduct credits on success
        removeCredits(materialCost);
        setErrorMsg(
          `ERFOLG: Der Arm ist leicht genug (${result.mass.toFixed(0)}g) und stabil (${result.deflection.toFixed(2)}mm Durchbiegung). Konfiguration genehmigt! (Kosten: ${materialCost} CR)`
        );
        setLevelState('SUCCESS');
      }

      setSimulating(false);
    }, 2500); // Longer delay for dramatic effect
  };

  // INTRO Screen
  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={handleBack}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText
            text="Verbindung hergestellt... Unit-7 Status: KRITISCH."
            speed={20}
          />

          <div className="mt-6">
            <BrokenArmVisualization />
          </div>

          {!showText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="text-center mt-4 text-slate-400 text-sm cursor-pointer"
              onClick={handleShowText}
            >
              [ Klicken um fortzufahren... ]
            </motion.div>
          )}

          {showText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded"
            >
              <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
              <p className="mb-2">
                Unit-7 hat versucht, einen schweren Industrie-Container zu heben.
                Dabei ist der Greifarm gebrochen. Das Material war zu schwach für diese Last.
              </p>

              <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
              <p>
                Der Roboterarm muss mit einem geeigneteren Material konstruiert werden. Es muss <GlossaryTooltip term="steif" definition="Widerstand gegen Verformung" /> genug sein, damit sich das Material bei 5 kg Last maximal 2 mm biegt.
              </p>
              <p className="mt-2">
                Aber Vorsicht: Wenn der Arm mehr als 1000 kg wiegt, brennen die Motoren durch.
              </p>
            </motion.div>
          )}

          {showText && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={handleStart}
              className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
            >
              Mission Starten
            </motion.button>
          )}
        </div>
      </TerminalCard>
    );
  }

  // Define state flags
  const isSuccess = levelState === 'SUCCESS';
  const isFail = levelState === 'FAIL';

  return (
    <div className="space-y-6">
      <TerminalCard
        title="LEVEL 1: MATERIALKUNDE - ENGINEERING TERMINAL"
        borderColor={isFail ? 'red' : 'cyan'}
        onBack={handleBack}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE: Material Database (Read-Only) */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded p-3 h-full">
              <h3 className="text-cyan-400 font-bold font-mono text-sm mb-3 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                Material-Datenbank
              </h3>
              <div className="text-xs text-slate-400 mb-4 font-mono">
                [ READ-ONLY ] Verfügbare Materialien. Finde ein Material, das die Anforderungen erfüllt.
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {Object.values(MATERIALS).map((material, idx) => (
                  <MaterialCard
                    key={idx}
                    name={material.name}
                    density={material.density}
                    stiffness={material.stiffness}
                    color={material.color}
                    description={material.description}
                    cost={material.cost}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Engineering Terminal (Input & Simulation) */}
          <div className="space-y-4 flex flex-col h-full">
            {/* Visualization Window */}
            <div className="bg-slate-900/50 border border-slate-700 rounded p-4 flex-1 min-h-[300px] relative">
              <div className="absolute top-4 left-4 z-10">
                <h3 className="text-cyan-400 font-bold font-mono text-sm uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                  Test-Kammer
                </h3>
              </div>
              
              <RobotArmVisualization
                deflection={simulationResult?.deflection || 0}
                isSafeMass={simulationResult?.isSafeMass ?? true}
                isSafeDeflection={simulationResult?.isSafeDeflection ?? true}
                isSimulating={simulating}
              />
            </div>

            {/* Configuration Panel */}
            <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
              <h3 className="text-cyan-400 font-bold font-mono text-sm mb-4 uppercase tracking-wider flex items-center">
                Konfiguration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Density Input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">
                    <GlossaryTooltip
                      term="Dichte"
                      definition="Masse pro Volumen. Bestimmt das Gewicht."
                    />
                  </label>
                  <div className="flex items-center relative">
                    <input
                      type="text"
                      value={inputDensity}
                      onChange={(e) => setInputDensity(e.target.value)}
                      placeholder="0.00"
                      disabled={simulating}
                      className={`w-full bg-slate-950 border rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                        isFail && simulationResult?.status.includes('MASS') ? 'border-red-500 text-red-300' : 'border-slate-700'
                      }`}
                    />
                    <span className="absolute right-3 text-slate-500 text-[10px] font-mono">g/cm³</span>
                  </div>
                </div>

                {/* Stiffness Input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">
                    <GlossaryTooltip
                      term="E-Modul"
                      definition="Steifigkeit des Materials. Bestimmt die Biegung."
                    />
                  </label>
                  <div className="flex items-center relative">
                    <input
                      type="text"
                      value={inputStiffness}
                      onChange={(e) => setInputStiffness(e.target.value)}
                      placeholder="000"
                      disabled={simulating}
                      className={`w-full bg-slate-950 border rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                        isFail && simulationResult?.status.includes('DEFLECTION') ? 'border-red-500 text-red-300' : 'border-slate-700'
                      }`}
                    />
                    <span className="absolute right-3 text-slate-500 text-[10px] font-mono">GPa</span>
                  </div>
                </div>
              </div>

              {/* Simulate Button */}
              <button
                onClick={handleSimulate}
                disabled={simulating || !inputDensity || !inputStiffness}
                className={`w-full py-3 mt-4 font-bold font-mono text-sm rounded uppercase tracking-widest transition-all ${
                  simulating
                    ? 'bg-yellow-600 text-white animate-pulse cursor-wait'
                    : !inputDensity || !inputStiffness
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)]'
                }`}
              >
                {simulating ? 'TEST LÄUFT...' : 'SIMULATION STARTEN'}
              </button>
            </div>

            {/* Error/Success Message */}
            <div className="min-h-[100px]">
              {errorMsg && !isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded border font-mono text-sm bg-red-900/20 border-red-500 text-red-400"
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <span className="text-lg">⚠</span> FEHLERPROTOKOLL
                  </div>
                  <div className="text-xs leading-relaxed opacity-90">{errorMsg}</div>
                </motion.div>
              )}

              {errorMsg && isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded border font-mono text-sm bg-green-900/20 border-green-500 text-green-400"
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <span className="text-lg">✓</span> SYSTEM OPTIMAL
                  </div>
                  <div className="text-xs leading-relaxed opacity-90">{errorMsg}</div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </TerminalCard>

      {/* SUCCESS Overlay */}
      {isSuccess && simulationResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <div className="max-w-lg w-full">
            <TerminalCard title="MISSION COMPLETE" borderColor="green">
              <div className="text-center space-y-6 py-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-black text-4xl font-bold shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                >
                  ✓
                </motion.div>
                
                <div>
                  <p className="text-2xl text-green-400 font-bold font-mono tracking-widest mb-2">ERFOLG</p>
                  <p className="text-slate-300">Der Arm ist stabil und innerhalb der Gewichtstoleranz.</p>
                </div>

                <div className="bg-slate-950 border border-green-500/30 rounded p-6 font-mono text-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50" />
                  <div className="text-slate-500 mb-4 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">Diagnose-Bericht</div>
                  
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">Material:</div>
                    <div className="text-green-400 font-bold text-right">Carbon Fiber</div>
                    
                    <div className="text-slate-400">Masse:</div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">{simulationResult.mass.toFixed(0)}g</span>
                      <span className="text-slate-600 text-xs ml-1">/ 1000g</span>
                    </div>
                    
                    <div className="text-slate-400">Biegung:</div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">{simulationResult.deflection.toFixed(2)}mm</span>
                      <span className="text-slate-600 text-xs ml-1">/ 2.00mm</span>
                    </div>

                    <div className="text-slate-400 pt-2 border-t border-slate-800 mt-2">Kosten:</div>
                    <div className="text-yellow-400 font-bold text-right pt-2 border-t border-slate-800 mt-2">
                      {Object.values(MATERIALS).find(m => Math.abs(m.density - parseFloat(inputDensity)) < 0.1)?.cost} CR
                    </div>
                  </div>
                </div>

                <button
                  onClick={advanceLevel}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)]"
                >
                  Nächstes Level Initialisieren
                </button>
              </div>
            </TerminalCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Level1_Mechanics;