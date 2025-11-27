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
  const { advanceLevel, setLevelState, levelState, returnToDashboard, credits, removeCredits } = useGameStore();

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
    isSuccess: boolean;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);

  const handleStart = () => {
    setLevelState('ACTIVE');
  };

  const handleBack = () => {
    if (levelState === 'INTRO') {
      returnToDashboard();
    } else {
      setLevelState('INTRO');
      setShowText(false);
      setSimulationResult(null);
      setErrorMsg(null);
      setInputDensity('');
      setInputStiffness('');
    }
  };

  const handleShowText = () => {
    setShowText(true);
  };

  const handleSimulate = () => {
    // Validate inputs
    const density = parseFloat(inputDensity);
    const stiffness = parseFloat(inputStiffness);

    if (isNaN(density) || density <= 0) {
      setErrorMsg('FEHLER: Ungültige Dichte-Eingabe. Bitte Zahl > 0 eingeben.');
      return;
    }

    if (isNaN(stiffness) || stiffness <= 0) {
      setErrorMsg('FEHLER: Ungültiger E-Modul. Bitte Zahl > 0 eingeben.');
      return;
    }

    setSimulating(true);
    setErrorMsg(null);

    // Simulate processing delay
    setTimeout(() => {
      const result = calculateArmPhysics(density, stiffness);
      setSimulationResult(result);

      // Find matching material to check cost
      const matchingMaterial = Object.values(MATERIALS).find(
        m => Math.abs(m.density - density) < 0.01 && Math.abs(m.stiffness - stiffness) < 0.1
      );

      // Check if values are from database
      if (!matchingMaterial) {
        setErrorMsg(
          `FEHLER: Die eingegebenen Werte stimmen nicht mit einem Material aus der Datenbank überein. Bitte trage die Werte exakt aus der Materialdatenbank ein.`
        );
        setLevelState('FAIL');
        setSimulating(false);
        return;
      }

      const materialCost = matchingMaterial.cost;

      if (!result.isSafeMass) {
        setErrorMsg(
          `WARNUNG: Der Arm ist zu schwer (${result.mass.toFixed(0)}g statt max. 1000g). Die Motoren werden durchbrennen!`
        );
        setLevelState('FAIL');
      } else if (!result.isSafeDeflection) {
        setErrorMsg(
          `WARNUNG: Das Material verbiegt sich zu sehr (${result.deflection.toFixed(2)}mm statt max. 2.00mm). Ein erneuter Unfall ist sehr wahrscheinlich!`
        );
        setLevelState('FAIL');
      } else if (materialCost > credits) {
        setErrorMsg(
          `WARNUNG: Dieses Material ist zu teuer! (${materialCost} Credits, du hast nur ${credits}). Wähle ein günstigeres Material.`
        );
        setLevelState('FAIL');
      } else {
        // Deduct credits
        removeCredits(materialCost);
        setErrorMsg(
          `ERFOLG: Der Arm ist leicht genug (${result.mass.toFixed(0)}g) und stabil (${result.deflection.toFixed(2)}mm Durchbiegung). Konfiguration genehmigt! (Kosten: ${materialCost} Credits)`
        );
        setLevelState('SUCCESS');
      }

      setSimulating(false);
    }, 2000);
  };

  const handleRetry = () => {
    setLevelState('ACTIVE');
    setSimulationResult(null);
    setErrorMsg(null);
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
                Unit-7 hat versucht, einen 5kg schweren Industrie-Container zu heben.
                Dabei ist der Greifarm gebrochen. Das alte Material war zu schwach für diese Last.
              </p>

              <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
              <p>
                Konstruiere einen neuen Arm aus der Materialdatenbank. Bei einer Last von <strong>5kg</strong> darf er sich höchstens <strong>2mm</strong> durchbiegen.
                Außerdem darf der Arm nicht schwerer als <strong>1000g</strong> sein, sonst brennen die Schultermotoren durch.
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

  // Define state flags at component level to avoid TypeScript control flow issues
  const isSuccess = levelState === 'SUCCESS';
  const isFail = levelState === 'FAIL';

  return (
    <div className="space-y-6">
      <TerminalCard
        title="LEVEL 1: MATERIALKUNDE - KONFIGURATIONSKONSOLE"
        borderColor={isFail ? 'red' : 'cyan'}
        onBack={handleBack}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE: Material Database (Read-Only) */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
              <h3 className="text-cyan-400 font-bold font-mono text-sm mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                Material-Datenbank
              </h3>
              <div className="text-xs text-slate-400 mb-4 font-mono">
                [ READ-ONLY ] Industrielle Materialien - Technische Kennwerte
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
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
          <div className="space-y-4">
            {/* Configuration Panel */}
            <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
              <h3 className="text-cyan-400 font-bold font-mono text-sm mb-4 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                Konfigurations-Panel
              </h3>

              <div className="space-y-4">
                {/* Input Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Density Input */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">
                      <GlossaryTooltip
                        term="Dichte"
                        definition="Wie schwer das Material pro Volumen ist. Bestimmt das Gesamtgewicht des Arms."
                      />
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={inputDensity}
                        onChange={(e) => setInputDensity(e.target.value)}
                        placeholder="1.70"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-slate-500 text-[10px] font-mono whitespace-nowrap">g/cm³</span>
                    </div>
                  </div>

                  {/* Stiffness Input */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">
                      <GlossaryTooltip
                        term="E-Modul"
                        definition="Je höher dieser Wert, desto weniger biegt sich das Material unter Last."
                      />
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={inputStiffness}
                        onChange={(e) => setInputStiffness(e.target.value)}
                        placeholder="119"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-slate-500 text-[10px] font-mono whitespace-nowrap">GPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulate Button */}
              <button
                onClick={handleSimulate}
                disabled={simulating || !inputDensity || !inputStiffness}
                className={`w-full py-3 mt-4 font-bold font-mono text-sm rounded uppercase tracking-widest transition-all ${
                  simulating
                    ? 'bg-yellow-600 text-white animate-pulse'
                    : !inputDensity || !inputStiffness
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                }`}
              >
                {simulating ? '[ SIMULATION LÄUFT... ]' : '[ SIMULATION INITIALISIEREN ]'}
              </button>
            </div>

            {/* Visualization Window */}
            <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
              <h3 className="text-cyan-400 font-bold font-mono text-sm mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                Visualisierung
              </h3>
              <RobotArmVisualization
                deflection={simulationResult?.deflection || 0}
                isSafeMass={simulationResult?.isSafeMass ?? true}
                isSafeDeflection={simulationResult?.isSafeDeflection ?? true}
                isSimulating={simulating}
              />
            </div>

            {/* Error/Success Message */}
            {errorMsg && !isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded border font-mono text-sm bg-red-900/20 border-red-500 text-red-400"
              >
                <div className="font-bold mb-2">⚠ SYSTEMSTATUS: FEHLER</div>
                <div className="text-xs leading-relaxed">{errorMsg}</div>

                {isFail && (
                  <button
                    onClick={handleRetry}
                    className="mt-3 text-xs underline hover:text-red-300 transition-colors"
                  >
                    » Parameter korrigieren
                  </button>
                )}
              </motion.div>
            )}

            {errorMsg && isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded border font-mono text-sm bg-green-900/20 border-green-500 text-green-400"
              >
                <div className="font-bold mb-2">✓ SYSTEMSTATUS: OPTIMAL</div>
                <div className="text-xs leading-relaxed">{errorMsg}</div>
              </motion.div>
            )}
          </div>
        </div>
      </TerminalCard>

      {/* SUCCESS Overlay */}
      {isSuccess && simulationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <TerminalCard title="MISSION COMPLETE" borderColor="green">
            <div className="text-center space-y-6 py-8 px-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-green-400 text-6xl mb-4"
              >
                ✓
              </motion.div>
              <p className="text-xl text-green-400 font-bold">ERFOLG</p>
              <p className="text-lg">Der Arm hält der Belastung stand und die Motoren laufen stabil.</p>

              <div className="bg-slate-900/50 border border-green-500/30 rounded p-4 font-mono text-sm">
                <div className="text-slate-400 mb-2">Finale Konfiguration:</div>
                <div className="space-y-1">
                  <div>Dichte: <span className="text-green-400">{inputDensity} g/cm³</span></div>
                  <div>E-Modul: <span className="text-green-400">{inputStiffness} GPa</span></div>
                  <div className="border-t border-slate-700 mt-2 pt-2">
                    <div>Masse: <span className="text-green-400">{simulationResult.mass.toFixed(0)}g</span> / 1000g</div>
                    <div>Durchbiegung: <span className="text-green-400">{simulationResult.deflection.toFixed(2)}mm</span> / 2.00mm</div>
                  </div>
                </div>
              </div>

              <button
                onClick={advanceLevel}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
              >
                Nächstes Level
              </button>
            </div>
          </TerminalCard>
        </motion.div>
      )}
    </div>
  );
};

export default Level1_Mechanics;
