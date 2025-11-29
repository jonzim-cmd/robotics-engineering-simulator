'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { BrownoutVisualization } from '@/components/ui/BrownoutVisualization';
import { EnergyFlowDiagram } from '@/components/ui/EnergyFlowDiagram';
import { CircuitConfigurator } from '@/components/ui/CircuitConfigurator';
import { SmartphoneResearch } from '@/components/ui/SmartphoneResearch';
import { ReflectionCall } from '@/components/ui/ReflectionCall';
import { HaraldRefillModal } from '@/components/ui/HaraldRefillModal';
import { HaraldRejectionModal } from '@/components/ui/HaraldRejectionModal';
import {
  BatteryType,
  CapacitorType,
  calculateElectronicsSimulation,
  ELECTRONIC_COMPONENTS,
  ElectronicsSimulationResult
} from '@/lib/physicsEngine';
import { trackEvent } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

const RESEARCH_RESULTS = [
  {
    title: "Warum brauchen Computer stabile Spannung?",
    content: `Computer arbeiten mit präzisen elektrischen Signalen.
Diese Signale sind entweder "an" (z.B. 5 Volt) oder "aus" (0 Volt).

Wenn die Spannung unter einen bestimmten Wert fällt, kann der Prozessor die Signale nicht mehr richtig unterscheiden.

Das Ergebnis:
• Datenfehler
• Programmabstürze
• Automatischer Neustart (Schutzmechanismus)

Merke:
Computer brauchen KONSTANTE Spannung – nicht nur "genug" Spannung zu einem Zeitpunkt.`
  },
  {
    title: "Was ist Anlaufstrom?",
    content: `Wenn ein Motor startet, steht er still und muss erst beschleunigt werden.

In diesem Moment zieht er VIEL MEHR Strom als im normalen Betrieb.
Oft 5 bis 10 mal so viel!

Beispiel:
• Motor im Betrieb: 2 Ampere
• Motor beim Start: 10 Ampere (für wenige Millisekunden)

Das ist wie ein Auto, das anfährt:
Beim Anfahren braucht man viel Kraft, danach rollt es leichter.

Merke:
Der kritische Moment ist der START – danach wird alles entspannter.`
  },
  {
    title: "Was ist Innenwiderstand?",
    content: `Jede Batterie hat einen "versteckten" Widerstand in sich.

Je mehr Strom fließt, desto mehr Spannung geht an diesem Innenwiderstand verloren.

Beispiel:
• Batterie: 12V, Innenwiderstand 2Ω
• Bei 5A Strom: 12V - (5A × 2Ω) = 12V - 10V = nur 2V kommen an!

Billige Batterien = hoher Innenwiderstand = große Spannungseinbrüche
Teure Batterien = niedriger Innenwiderstand = stabile Spannung

Merke:
Nicht jede "12V-Batterie" liefert unter Last auch wirklich 12 Volt.`
  },
  {
    title: "Was ist ein Kondensator?",
    content: `Ein Kondensator ist wie ein kleiner Energie-Zwischenspeicher.

So funktioniert er:
• Er lädt sich auf, wenn genug Spannung da ist
• Er gibt Energie ab, wenn die Spannung kurz einbricht

Stell dir einen Wassertank vor:
Wenn der Wasserdruck kurz schwankt, liefert der Tank trotzdem gleichmäßig Wasser.

Kondensatoren können kurze Spannungseinbrüche "überbrücken" – aber nicht dauerhaft Energie liefern.

Merke:
Kondensatoren sind Puffer für KURZE Schwankungen, kein Ersatz für die Batterie.`
  }
];

const REFILL_CREDITS = 50;

const Level4_Electronics: React.FC = () => {
  const {
    advanceLevel,
    setLevelState,
    levelState,
    pushStateHistory,
    popStateHistory,
    subStep,
    setSubStep,
    credits,
    setCredits,
    removeCredits,
    userId,
    currentLevel
  } = useGameStore();

  // State
  const [showText, setShowText] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<BatteryType>('standard');
  const [selectedCapacitor, setSelectedCapacitor] = useState<CapacitorType>('none');
  
  // Simulation State
  const [isTestActive, setIsTestActive] = useState(false); // Testaufbau bezahlt & bereit
  const [isSimulating, setIsSimulating] = useState(false); // Animation läuft
  const [hasRunOnce, setHasRunOnce] = useState(false); // Mindestens einmal gestartet
  const [simulationResult, setSimulationResult] = useState<ElectronicsSimulationResult | null>(null);
  const [currentSimStep, setCurrentSimStep] = useState(0);
  
  // Modals
  const [showHaraldRefill, setShowHaraldRefill] = useState(false);
  const [showHaraldRejection, setShowHaraldRejection] = useState(false);
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Event Tracking Helper
  const logEvent = (eventType: string, payload: Record<string, unknown>) => {
    if (!userId) return;
    trackEvent(userId, currentLevel, eventType, payload).catch(err =>
      console.error('Tracking error', err)
    );
  };

  // Cleanup simulation interval
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Reset wenn Level verlassen wird
  useEffect(() => {
    return () => {
      setIsTestActive(false);
      setIsSimulating(false);
    };
  }, []);

  // Navigation
  const handleBack = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    popStateHistory();
    setShowText(false);
    setSimulationResult(null);
    setIsSimulating(false);
    setIsTestActive(false);
    setCurrentSimStep(0);
  };

  const handleShowText = () => {
    setShowText(true);
  };

  const handleStartResearch = () => {
    pushStateHistory();
    setSubStep(1); // Zur Smartphone-Recherche
  };

  const handleResearchComplete = () => {
    pushStateHistory();
    setLevelState('ACTIVE');
    setSubStep(0);
  };

  // Batterie-Auswahl mit Harald-Check
  const handleBatteryChange = (battery: BatteryType) => {
    // Wir lassen die Auswahl zu, auch wenn es zu teuer ist
    // Der "Fehler" passiert dann im Ergebnis oder Harald meldet sich danach
    
    setSelectedBattery(battery);
    setSimulationResult(null);
    setHasRunOnce(false);
  };

  const handleCapacitorChange = (capacitor: CapacitorType) => {
    setSelectedCapacitor(capacitor);
    setSimulationResult(null);
    setHasRunOnce(false);
  };

  // 1. Testaufbau aktivieren (Bezahlen & Bereitmachen)
  const handleActivateTest = () => {
    const TEST_RUN_COST = 50;
    
    // Immer prüfen ob genug Credits für den Testlauf da sind (50 CR)
    if (credits < TEST_RUN_COST) {
      logEvent('LEVEL4_SIMULATION_DENIED', {
        reason: 'insufficient_credits',
        battery: selectedBattery,
        capacitor: selectedCapacitor,
        cost: TEST_RUN_COST,
        credits
      });
      setShowHaraldRefill(true);
      return;
    }

    // State vor Änderung speichern
    pushStateHistory();

    logEvent('LEVEL4_TEST_ACTIVATED', {
      battery: selectedBattery,
      capacitor: selectedCapacitor,
      cost: TEST_RUN_COST,
      creditsBefore: credits
    });

    // Credits abziehen (immer 50)
    removeCredits(TEST_RUN_COST);

    // Nur Testmodus aktivieren - noch keine Berechnung
    setIsTestActive(true);
    setIsSimulating(false);
    setCurrentSimStep(0);
    setHasRunOnce(false);
    setSimulationResult(null);
  };

  // 2. Trigger am Motor (Berechnen & Animation abspielen)
  const handleTriggerStart = () => {
    if (isSimulating) return;

    // Jetzt erst berechnen
    const result = calculateElectronicsSimulation(selectedBattery, selectedCapacitor);
    setSimulationResult(result);

    setIsSimulating(true);
    setHasRunOnce(true);
    setCurrentSimStep(0);

    logEvent('LEVEL4_SIMULATION_STARTED', {
      battery: selectedBattery,
      capacitor: selectedCapacitor
    });

    // Animation durchlaufen (Zeitlupe: 3s für 300 Schritte)
    let step = 0;
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    simulationIntervalRef.current = setInterval(() => {
      step++;
      setCurrentSimStep(step);

      if (step >= result.dataPoints.length - 1) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        setIsSimulating(false);
        setCurrentSimStep(0); // Reset to initial state after animation
        
        // Wenn Performance Akku: Harald beschwert sich NACH DEM ENDE der Simulation zeitverzögert
        if (selectedBattery === 'performance') {
            setTimeout(() => {
                setShowHaraldRejection(true);
            }, 2000);
        }
        
        logEvent('LEVEL4_SIMULATION_RESULT', {
            battery: selectedBattery,
            capacitor: selectedCapacitor,
            result: result.testResult,
            minVoltage: result.minCpuVoltage,
            brownoutOccurred: result.brownoutOccurred
        });
      }
    }, 10); // 10ms * 300 Schritte = 3000ms (3 Sekunden)
  };

  // 3. Test beenden / Reset
  const handleStopTest = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setIsTestActive(false);
    setIsSimulating(false);
    setCurrentSimStep(0);
    
    // Wenn erfolgreich, könnte man hier direkt weiterleiten, aber wir lassen den User entscheiden
    if (simulationResult?.testResult === 'SUCCESS' && selectedBattery !== 'performance') {
         setTimeout(() => {
            setSubStep(2); // Zur Reflection
          }, 500);
    }
  };
  
  const handleResetConfig = () => {
    handleStopTest();
    setSimulationResult(null);
    setSelectedBattery('standard');
    setSelectedCapacitor('none');
  }

  const handleHaraldRefillClose = () => {
    const refillCredits = Math.max(credits, REFILL_CREDITS);
    setCredits(refillCredits);
    logEvent('LEVEL4_CREDITS_REFILLED', {
      from: credits,
      refillTo: refillCredits
    });
    setShowHaraldRefill(false);
  };

  // === RENDER: INTRO ===
  if (levelState === 'INTRO') {
    return (
      <>
        <TerminalCard title="INCIDENT REPORT - SEKTOR 7" borderColor="red" onBack={handleBack}>
          <div className="space-y-4">
            <div className="text-red-400 font-bold">KRITISCHER VORFALL:</div>
            <TypewriterText
              text="Sicherheitsrelevanter Zwischenfall aufgezeichnet. Wiedergabe läuft..."
              speed={20}
            />

            <div className="mt-6">
              <BrownoutVisualization />
            </div>

            {!showText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4, duration: 1, repeat: Infinity, repeatType: "reverse" }}
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
                <strong className="text-red-400 block mb-2">WAS IST PASSIERT?</strong>
                <p className="mb-2">
                  Als der Präzisionsmotor startete, brach die Spannung zusammen. Der{" "}
                  <GlossaryTooltip 
                    term="Anlaufstrom" 
                    definition="Der hohe Strombedarf beim Motorstart – oft 5-10x höher als im Normalbetrieb."
                  />{" "}
                  war so hoch, dass die CPU einen{" "}
                  <GlossaryTooltip 
                    term="Brownout" 
                    definition="Kurzzeitiger Spannungsabfall, der Computer zum Neustart zwingt."
                  />{" "}
                  erlitt und neu startete. Der Greifer verlor dabei seine Kontrolle.
                </p>

                <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
                <p>
                  Analysiere das Energiesystem und finde eine Konfiguration, die auch bei hohem{" "}
                  <GlossaryTooltip 
                    term="Anlaufstrom" 
                    definition="Der hohe Strombedarf beim Motorstart – oft 5-10x höher als im Normalbetrieb."
                  />{" "}
                  stabil bleibt. Die CPU braucht mindestens <span className="text-cyan-400 font-bold">5 Volt</span>.
                </p>
              </motion.div>
            )}

            {showText && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                onClick={handleStartResearch}
                className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded uppercase tracking-widest transition-colors"
              >
                Recherche starten
              </motion.button>
            )}
          </div>
        </TerminalCard>

        {/* Smartphone Research */}
        {subStep === 1 && (
          <SmartphoneResearch
            searchQuery="Elektronik Spannung Batterie"
            browserTitle="Elektrotechnik Basics"
            searchResults={RESEARCH_RESULTS}
            onComplete={handleResearchComplete}
          />
        )}
      </>
    );
  }

  // === RENDER: SUCCESS ===
  if (levelState === 'SUCCESS' || subStep === 2) {
    return (
      <ReflectionCall
        callerName="Elena Stromberg"
        callerTitle="Elektrotechnikerin"
        callerAvatar="👩‍🔧"
        question={`Sehr gut gelöst! Ich habe gesehen, dass Sie ${
          selectedCapacitor !== 'none' ? 'einen Stützkondensator' : 'eine clevere Lösung'
        } verwendet haben.

Können Sie mir erklären, warum ein kleiner Kondensator ausreicht, obwohl der Motor so viel Strom zieht? Das scheint auf den ersten Blick nicht zu passen.`}
        correctAnswer={`Genau richtig! Der Kondensator muss nicht den ganzen Motor versorgen – er muss nur die CPU für die kurze Zeit des Anlaufstroms stabil halten.

Der Spannungseinbruch dauert nur etwa 50 Millisekunden. In dieser kurzen Zeit gibt der Kondensator seine gespeicherte Energie ab und hält die CPU-Spannung über 5 Volt.

Danach ist der Motor auf Betriebsdrehzahl und braucht viel weniger Strom – dann reicht die Batterie wieder aus.

Es ist wie ein Sprinter, der nur 10 Sekunden durchhalten muss, nicht einen Marathon. Clever und kostengünstig!`}
        continueButtonText="Nächstes Level"
        onBack={() => {
          setLevelState('ACTIVE');
          setSubStep(0);
        }}
        onComplete={() => advanceLevel()}
      />
    );
  }

  // === RENDER: ACTIVE (Hauptspiel) ===
  return (
    <div className="space-y-6">
      <TerminalCard
        title="LEVEL 4: ENERGIEVERSORGUNG KONFIGURIEREN"
        borderColor={simulationResult?.brownoutOccurred ? 'red' : 'cyan'}
        onBack={handleBack}
      >
        {/* OBEN: Energie-Fluss-Diagramm in voller Breite */}
        <div className="w-full mb-6">
          <EnergyFlowDiagram
            dataPoints={simulationResult?.dataPoints || []}
            isSimulating={isSimulating}
            currentStep={currentSimStep}
            showCapacitor={selectedCapacitor !== 'none'}
            onTriggerStart={handleTriggerStart}
            isTestActive={isTestActive}
          />
        </div>

        {/* Ergebnis-Anzeige (nur nach erstem Lauf sichtbar) */}
        <AnimatePresence>
          {hasRunOnce && simulationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-lg border ${
                simulationResult.brownoutOccurred
                  ? 'bg-red-900/30 border-red-500 text-red-300'
                  : 'bg-green-900/30 border-green-500 text-green-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {simulationResult.brownoutOccurred ? '⚠️' : '✓'}
                </span>
                <span className="font-bold text-lg">
                  {simulationResult.brownoutOccurred ? 'BROWNOUT DETEKTIERT' : 'SYSTEM STABIL'}
                </span>
              </div>
              <p className="text-sm opacity-90">
                {simulationResult.resultMessage}
              </p>
              <div className="mt-3 flex gap-4 text-xs font-mono">
                <span>Min. CPU: {simulationResult.minCpuVoltage.toFixed(1)}V</span>
                <span>Max. Strom: {simulationResult.maxMotorCurrent.toFixed(1)}A</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UNTEN: Konfiguration in zwei Spalten */}
        <div className="w-full mb-6">
          <CircuitConfigurator
            selectedBattery={selectedBattery}
            selectedCapacitor={selectedCapacitor}
            onBatteryChange={handleBatteryChange}
            onCapacitorChange={handleCapacitorChange}
            disabled={isTestActive}
          />
        </div>



        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-700 flex gap-4">
          {isTestActive ? (
             // Wenn Test aktiv: Button beendet den Testmodus
             <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={(simulationResult?.testResult === 'SUCCESS' && selectedBattery !== 'performance') ? handleStopTest : handleResetConfig}
                className={`flex-1 py-4 font-bold text-lg rounded uppercase tracking-widest transition-all ${
                   (simulationResult?.testResult === 'SUCCESS' && selectedBattery !== 'performance')
                   ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                   : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
             >
                {(simulationResult?.testResult === 'SUCCESS' && selectedBattery !== 'performance') ? 'Erfolgreich! Weiter...' : 'Test beenden & Korrigieren'}
             </motion.button>
          ) : (
             // Wenn Test inaktiv: Button startet den Testmodus
             <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleActivateTest}
                className="flex-1 py-4 font-bold text-lg rounded uppercase tracking-widest transition-all bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
             >
               Testaufbau aktivieren (50 CR)
             </motion.button>
          )}
        </div>
      </TerminalCard>

      {/* Harald Refill Modal */}
      {showHaraldRefill && (
        <HaraldRefillModal
          currentCredits={credits}
          refillTo={Math.max(REFILL_CREDITS, credits)}
          onClose={handleHaraldRefillClose}
        />
      )}
      
      {/* Harald Rejection Modal */}
      {showHaraldRejection && (
        <HaraldRejectionModal
          requestedCost={ELECTRONIC_COMPONENTS.batteries.performance.cost}
          availableCredits={credits}
          onClose={() => setShowHaraldRejection(false)}
          customText={selectedBattery === 'performance' ? "Dieser Performance-Akku ist viel zu teuer! Diese Anzahl an Credits? Für eine einfache Spannungsversorgung? \n\nDas ist pure Verschwendung von Steuergeldern. \n\nIch habe Ihnen doch gesagt: Wir müssen sparen. Finden Sie eine kosteneffizientere Lösung. \n\nAntrag abgelehnt. Bauen Sie das um!" : undefined}
        />
      )}
    </div>
  );
};

export default Level4_Electronics;