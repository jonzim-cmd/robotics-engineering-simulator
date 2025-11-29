# Implementierungsplan: Level 4 – Elektronik & Spannungsversorgung

## Übersicht

| Aspekt | Details |
|--------|---------|
| **Level-Name** | "ELEKTRONIK & ENERGIEVERSORGUNG" |
| **Start-Credits** | 50 (vom vorherigen Level übernommen) |
| **Lernziele** | Innenwiderstand, Anlaufstrom, Kondensatoren, Systemstabilität |
| **Schwierigkeit** | Mittel – erfordert Verständnis für günstige Lösung |

---

## Dateien-Übersicht

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/components/levels/Level4_Electronics.tsx` | **ERSETZEN** | Komplette Neuimplementierung |
| `src/components/ui/BrownoutVisualization.tsx` | **NEU** | Intro-Animation: Container-Absturz |
| `src/components/ui/EnergyFlowDiagram.tsx` | **NEU** | Live-Visualisierung des Energieflusses |
| `src/components/ui/CircuitConfigurator.tsx` | **NEU** | Komponenten-Auswahl Interface |
| `src/lib/physicsEngine.ts` | **ERWEITERN** | Neue Funktionen für Elektronik-Berechnung |

---

## 1. Physics Engine Erweiterung

### Datei: `src/lib/physicsEngine.ts`

Füge am Ende der Datei hinzu:

```typescript
// ============================================
// LEVEL 4: ELEKTRONIK & SPANNUNGSVERSORGUNG
// ============================================

/**
 * Elektronik-Komponenten für Level 4
 */
export const ELECTRONIC_COMPONENTS = {
  batteries: {
    standard: {
      id: 'standard',
      name: 'Standard-Akku',
      cost: 10,
      voltage: 12, // Volt (Nennspannung)
      internalResistance: 2.0, // Ohm
      description: 'Hoher Innenwiderstand. Bei hohem Strombedarf bricht die Spannung ein.',
      icon: '🔋'
    },
    performance: {
      id: 'performance',
      name: 'Performance-Akku',
      cost: 60, // WICHTIG: Über 50 Credits, damit Harald eingreifen muss
      voltage: 12,
      internalResistance: 0.2, // Ohm
      description: 'Premium-Qualität mit niedrigem Innenwiderstand. Stabile Spannung auch unter Last.',
      icon: '⚡'
    }
  },
  capacitors: {
    none: {
      id: 'none',
      name: 'Kein Kondensator',
      cost: 0,
      capacitance: 0, // Farad
      description: 'Ohne Puffer ist die CPU direkt von der Batteriespannung abhängig.',
      icon: '❌'
    },
    small: {
      id: 'small',
      name: 'Stützkondensator',
      cost: 15,
      capacitance: 0.01, // 10mF - reicht für kurze Überbrückung
      description: 'Speichert Energie und gibt sie bei kurzen Spannungseinbrüchen ab.',
      icon: '⚡'
    },
    large: {
      id: 'large',
      name: 'Pufferkondensator (groß)',
      cost: 35,
      capacitance: 0.1, // 100mF
      description: 'Großer Energiespeicher für längere Überbrückung. Überdimensioniert für diesen Einsatz.',
      icon: '🔌'
    }
  }
} as const;

// Typen ableiten
export type BatteryType = keyof typeof ELECTRONIC_COMPONENTS.batteries;
export type CapacitorType = keyof typeof ELECTRONIC_COMPONENTS.capacitors;

/**
 * Systemkonstanten für die Simulation
 */
export const ELECTRONICS_CONSTANTS = {
  CPU_MIN_VOLTAGE: 5.0, // Volt - unter diesem Wert: Brownout/Reset
  MOTOR_RUNNING_CURRENT: 2.0, // Ampere - Normalbetrieb
  MOTOR_INRUSH_CURRENT: 10.0, // Ampere - Anlaufstrom (5x normal)
  INRUSH_DURATION_MS: 50, // Millisekunden - Dauer des Anlaufstroms
  SIMULATION_DURATION_MS: 200, // Millisekunden - Gesamte Simulationsdauer
  SIMULATION_STEPS: 100, // Anzahl der Datenpunkte
};

/**
 * Ergebnis eines einzelnen Simulationsschritts
 */
export interface ElectronicsDataPoint {
  time: number; // ms
  batteryVoltage: number; // V (nach Innenwiderstand)
  cpuVoltage: number; // V (nach Kondensator-Pufferung)
  motorCurrent: number; // A
  capacitorCharge: number; // 0-1 (relativ)
}

/**
 * Gesamtergebnis der Elektronik-Simulation
 */
export interface ElectronicsSimulationResult {
  dataPoints: ElectronicsDataPoint[];
  minCpuVoltage: number;
  maxMotorCurrent: number;
  brownoutOccurred: boolean;
  brownoutTime: number | null; // ms - wann der Brownout auftrat
  testResult: 'SUCCESS' | 'BROWNOUT';
  resultMessage: string;
}

/**
 * Berechnet den Spannungsverlauf bei Motorstart
 * 
 * Physik-Modell (vereinfacht aber korrekt):
 * 1. U_batterie_real = U_nenn - (I * R_innen)
 * 2. Kondensator puffert kurze Einbrüche
 * 3. CPU braucht mindestens 5V
 */
export function calculateElectronicsSimulation(
  batteryType: BatteryType,
  capacitorType: CapacitorType
): ElectronicsSimulationResult {
  const battery = ELECTRONIC_COMPONENTS.batteries[batteryType];
  const capacitor = ELECTRONIC_COMPONENTS.capacitors[capacitorType];
  const C = ELECTRONICS_CONSTANTS;

  const dataPoints: ElectronicsDataPoint[] = [];
  let minCpuVoltage = battery.voltage;
  let maxMotorCurrent = 0;
  let brownoutOccurred = false;
  let brownoutTime: number | null = null;

  // Kondensator-Ladezustand (startet voll geladen)
  let capacitorCharge = 1.0;

  // Zeitschritt
  const dt = C.SIMULATION_DURATION_MS / C.SIMULATION_STEPS;

  for (let step = 0; step <= C.SIMULATION_STEPS; step++) {
    const time = step * dt;

    // 1. Motorstrom bestimmen (Anlaufstrom vs. Normalbetrieb)
    let motorCurrent: number;
    if (time < C.INRUSH_DURATION_MS) {
      // Anlaufphase: exponentieller Abfall von Spitzenstrom
      const inrushProgress = time / C.INRUSH_DURATION_MS;
      const inrushFactor = Math.exp(-3 * inrushProgress); // Schneller Abfall
      motorCurrent = C.MOTOR_RUNNING_CURRENT + 
        (C.MOTOR_INRUSH_CURRENT - C.MOTOR_RUNNING_CURRENT) * inrushFactor;
    } else {
      // Normalbetrieb
      motorCurrent = C.MOTOR_RUNNING_CURRENT;
    }

    // 2. Batteriespannung nach Innenwiderstand (Ohmsches Gesetz)
    // U_real = U_nenn - I * R_innen
    const batteryVoltage = battery.voltage - (motorCurrent * battery.internalResistance);

    // 3. CPU-Spannung mit Kondensator-Pufferung
    let cpuVoltage: number;
    
    if (capacitor.capacitance === 0) {
      // Ohne Kondensator: CPU bekommt direkt die Batteriespannung
      cpuVoltage = batteryVoltage;
    } else {
      // Mit Kondensator: Pufferung bei Spannungseinbruch
      // Vereinfachtes Modell: Kondensator gleicht Differenz aus
      
      const targetVoltage = Math.max(batteryVoltage, C.CPU_MIN_VOLTAGE + 0.5);
      
      if (batteryVoltage < targetVoltage && capacitorCharge > 0) {
        // Kondensator gibt Energie ab
        const voltageDiff = targetVoltage - batteryVoltage;
        const energyNeeded = voltageDiff * 0.1; // Vereinfachte Energie-Berechnung
        const energyAvailable = capacitorCharge * capacitor.capacitance * 10;
        
        if (energyAvailable >= energyNeeded) {
          cpuVoltage = targetVoltage;
          capacitorCharge -= (energyNeeded / (capacitor.capacitance * 10)) * (dt / 10);
          capacitorCharge = Math.max(0, capacitorCharge);
        } else {
          // Kondensator leer, Spannung fällt
          cpuVoltage = batteryVoltage + (energyAvailable / 0.1);
          capacitorCharge = 0;
        }
      } else {
        // Batteriespannung OK oder Kondensator leer
        cpuVoltage = batteryVoltage;
        
        // Kondensator lädt sich wieder auf wenn Spannung OK
        if (batteryVoltage > C.CPU_MIN_VOLTAGE + 1) {
          capacitorCharge = Math.min(1, capacitorCharge + 0.05);
        }
      }
    }

    // 4. Tracking
    minCpuVoltage = Math.min(minCpuVoltage, cpuVoltage);
    maxMotorCurrent = Math.max(maxMotorCurrent, motorCurrent);

    if (cpuVoltage < C.CPU_MIN_VOLTAGE && !brownoutOccurred) {
      brownoutOccurred = true;
      brownoutTime = time;
    }

    // 5. Datenpunkt speichern
    dataPoints.push({
      time,
      batteryVoltage: Math.max(0, batteryVoltage),
      cpuVoltage: Math.max(0, cpuVoltage),
      motorCurrent,
      capacitorCharge
    });
  }

  // Ergebnis bestimmen
  const testResult: 'SUCCESS' | 'BROWNOUT' = brownoutOccurred ? 'BROWNOUT' : 'SUCCESS';
  
  let resultMessage: string;
  if (brownoutOccurred) {
    resultMessage = `SYSTEM FAILURE: CPU-Spannung fiel auf ${minCpuVoltage.toFixed(1)}V (Minimum: ${C.CPU_MIN_VOLTAGE}V). Neustart ausgelöst bei t=${brownoutTime?.toFixed(0)}ms.`;
  } else {
    resultMessage = `SYSTEM STABLE: CPU-Spannung blieb stabil bei mindestens ${minCpuVoltage.toFixed(1)}V. Motorstart erfolgreich.`;
  }

  return {
    dataPoints,
    minCpuVoltage,
    maxMotorCurrent,
    brownoutOccurred,
    brownoutTime,
    testResult,
    resultMessage
  };
}

/**
 * Berechnet die Gesamtkosten einer Konfiguration
 */
export function calculateElectronicsCost(
  batteryType: BatteryType,
  capacitorType: CapacitorType
): number {
  return ELECTRONIC_COMPONENTS.batteries[batteryType].cost + 
         ELECTRONIC_COMPONENTS.capacitors[capacitorType].cost;
}
```

---

## 2. Intro-Visualisierung: Container-Absturz

### Datei: `src/components/ui/BrownoutVisualization.tsx`

**Zweck:** Dramatische Animation, die zeigt, wie ein Brownout zum Container-Absturz führt.

**Phasen der Animation:**
1. `positioning` (0-1.5s): Unit-7 positioniert Container
2. `motor_start` (1.5-2s): Feinpositionierungsmotor startet
3. `brownout` (2-2.5s): Bildschirm flackert, Glitch-Effekte
4. `drop` (2.5-4s): Container fällt, Impact
5. `error` (4s+): Fehlermeldung

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrownoutVisualizationProps {
  onAnimationComplete?: () => void;
}

type AnimationPhase = 'positioning' | 'motor_start' | 'brownout' | 'drop' | 'error';

export const BrownoutVisualization: React.FC<BrownoutVisualizationProps> = ({
  onAnimationComplete
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('positioning');
  const [key, setKey] = useState(0);

  const restartAnimation = () => {
    setPhase('positioning');
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    const timeline: { delay: number; nextPhase: AnimationPhase }[] = [
      { delay: 1500, nextPhase: 'motor_start' },
      { delay: 2000, nextPhase: 'brownout' },
      { delay: 2500, nextPhase: 'drop' },
      { delay: 4000, nextPhase: 'error' },
    ];

    const timers = timeline.map(({ delay, nextPhase }) =>
      setTimeout(() => {
        setPhase(nextPhase);
        if (nextPhase === 'error' && onAnimationComplete) {
          setTimeout(onAnimationComplete, 500);
        }
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [key, onAnimationComplete]);

  const isBrownout = phase === 'brownout' || phase === 'drop' || phase === 'error';
  const isDropped = phase === 'drop' || phase === 'error';

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded border border-red-900/50 p-6 overflow-hidden">
      {/* Titel mit Restart-Button */}
      <div className="text-lg text-red-500 font-mono mb-4 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-4">
        <span>!!! INCIDENT REPLAY !!!</span>
        <button
          onClick={restartAnimation}
          className="ml-auto text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800/50 rounded"
          title="Animation neu starten"
        >
          {/* Restart Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Hauptszene */}
      <div className="flex items-end justify-center h-64 relative">
        
        {/* Boden/Palette */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-800 border-t-2 border-slate-600">
          <div className="absolute inset-x-1/4 top-0 h-full bg-yellow-900/30 border-x border-yellow-700">
            <div className="text-center text-yellow-600 text-xs font-mono mt-1">ZIELZONE</div>
          </div>
        </div>

        {/* Unit-7 Roboter (vereinfacht, von oben hängend) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          {/* Schiene */}
          <div className="w-48 h-3 bg-slate-700 border border-slate-600 rounded" />
          
          {/* Greifer-Arm */}
          <motion.div
            className="relative mx-auto w-4"
            animate={{
              x: phase === 'positioning' ? [-20, 0] : 0
            }}
            transition={{ duration: 1 }}
          >
            {/* Vertikaler Arm */}
            <div className="w-4 h-24 bg-slate-600 border border-slate-500 mx-auto" />
            
            {/* Greifer */}
            <motion.div 
              className="relative"
              animate={{
                scaleX: isDropped ? 1.5 : 1 // Greifer öffnet sich
              }}
            >
              <div className="w-16 h-4 bg-cyan-800 border border-cyan-600 -ml-6 flex justify-between px-1">
                <motion.div 
                  className="w-2 h-8 bg-cyan-700 border border-cyan-500 -mb-4"
                  animate={{ rotate: isDropped ? -30 : 0 }}
                  style={{ originY: 0 }}
                />
                <motion.div 
                  className="w-2 h-8 bg-cyan-700 border border-cyan-500 -mb-4"
                  animate={{ rotate: isDropped ? 30 : 0 }}
                  style={{ originY: 0 }}
                />
              </div>
            </motion.div>
            
            {/* Status-LED */}
            <motion.div
              className={`absolute -right-8 top-0 w-3 h-3 rounded-full ${
                isBrownout ? 'bg-red-500' : 'bg-green-500'
              }`}
              animate={isBrownout ? { opacity: [1, 0, 1, 0, 1] } : {}}
              transition={{ duration: 0.3, repeat: isBrownout ? 3 : 0 }}
            />
          </motion.div>
        </div>

        {/* Container */}
        <motion.div
          key={`container-${key}`}
          className="absolute left-1/2 -translate-x-1/2"
          initial={{ top: 120 }}
          animate={{
            top: isDropped ? 200 : 120,
            rotate: isDropped ? -8 : 0
          }}
          transition={{ 
            type: isDropped ? "spring" : "tween",
            bounce: 0.3,
            duration: isDropped ? 0.5 : 0.3
          }}
        >
          <div className="w-20 h-16 bg-orange-800 border-2 border-orange-600 flex items-center justify-center relative">
            <div className="text-orange-400 font-mono text-xs font-bold">200kg</div>
            {/* Danger stripes */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 10px)'
            }} />
          </div>
          
          {/* Impact-Effekt */}
          {isDropped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.8, 0], scale: 2 }}
              transition={{ duration: 0.8 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 rounded-full blur-xl"
            />
          )}
        </motion.div>

        {/* Glitch-Overlay bei Brownout */}
        <AnimatePresence>
          {phase === 'brownout' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0.5, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cyan-500/20 z-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status-Terminal unten */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border-2 border-slate-700 p-3 rounded font-mono text-sm"
        animate={{
          borderColor: isBrownout ? '#ef4444' : '#334155'
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 block mb-1">SYSTEM STATUS</span>
            <motion.span
              className={`font-bold ${isBrownout ? 'text-red-500' : 'text-green-400'}`}
              animate={phase === 'brownout' ? { opacity: [1, 0, 1] } : {}}
              transition={{ duration: 0.2, repeat: phase === 'brownout' ? 5 : 0 }}
            >
              {phase === 'positioning' && 'POSITIONING...'}
              {phase === 'motor_start' && 'FINE MOTOR START'}
              {phase === 'brownout' && '!!! VOLTAGE DROP !!!'}
              {phase === 'drop' && 'CPU RESET'}
              {phase === 'error' && 'INCIDENT LOGGED'}
            </motion.span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block mb-1">VOLTAGE</span>
            <motion.span
              className={`font-bold font-mono ${isBrownout ? 'text-red-500' : 'text-cyan-400'}`}
            >
              {phase === 'positioning' && '12.0V'}
              {phase === 'motor_start' && '11.8V'}
              {phase === 'brownout' && '3.2V !!!'}
              {(phase === 'drop' || phase === 'error') && '---'}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Roter Flash bei Drop */}
      {phase === 'drop' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-red-900/40 pointer-events-none z-40"
        />
      )}
    </div>
  );
};
```

---

## 3. Energie-Flow-Diagramm

### Datei: `src/components/ui/EnergyFlowDiagram.tsx`

**Zweck:** Visualisiert in Echtzeit, wohin der Strom fließt und warum die CPU zu wenig bekommt.

**Design-Prinzip:**
- Sankey-Diagramm-Stil
- Animierte "Partikel" fließen durch die Leitungen
- Dicke der Leitungen = Stromstärke
- Farben zeigen Spannungsniveau (grün = OK, gelb = grenzwertig, rot = kritisch)

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElectronicsDataPoint, ELECTRONICS_CONSTANTS } from '@/lib/physicsEngine';

interface EnergyFlowDiagramProps {
  dataPoints: ElectronicsDataPoint[];
  isSimulating: boolean;
  currentStep: number;
  showCapacitor: boolean;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  dataPoints,
  isSimulating,
  currentStep,
  showCapacitor
}) => {
  const currentData = dataPoints[currentStep] || {
    time: 0,
    batteryVoltage: 12,
    cpuVoltage: 12,
    motorCurrent: 0,
    capacitorCharge: 1
  };

  // Farbe basierend auf Spannung
  const getVoltageColor = (voltage: number): string => {
    if (voltage >= 8) return '#22c55e'; // Grün
    if (voltage >= 5) return '#eab308'; // Gelb
    return '#ef4444'; // Rot
  };

  // Breite der Fluss-Linie basierend auf Strom
  const getFlowWidth = (current: number): number => {
    return Math.min(24, Math.max(4, current * 2.5));
  };

  const batteryColor = getVoltageColor(currentData.batteryVoltage);
  const cpuColor = getVoltageColor(currentData.cpuVoltage);
  const motorFlowWidth = getFlowWidth(currentData.motorCurrent);
  const isCritical = currentData.cpuVoltage < ELECTRONICS_CONSTANTS.CPU_MIN_VOLTAGE;

  return (
    <div className="relative w-full h-80 bg-slate-950 rounded-lg border border-slate-700 p-4 overflow-hidden">
      {/* Titel */}
      <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
        Energie-Fluss Diagramm
      </div>

      {/* Zeit-Anzeige */}
      <div className="absolute top-2 right-2 text-xs font-mono text-slate-400">
        t = {currentData.time.toFixed(0)}ms
      </div>

      {/* SVG Diagramm */}
      <svg viewBox="0 0 400 220" className="w-full h-full">
        
        {/* === BATTERIE === */}
        <g transform="translate(30, 80)">
          {/* Batterie-Gehäuse */}
          <rect x="0" y="0" width="60" height="80" rx="4" 
                fill="#1e293b" stroke={batteryColor} strokeWidth="3" />
          {/* Batterie-Pol */}
          <rect x="20" y="-8" width="20" height="8" fill={batteryColor} />
          {/* Batterie-Füllstand */}
          <rect x="5" y="10" width="50" height="60" fill={batteryColor} opacity="0.3" />
          {/* Label */}
          <text x="30" y="50" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">
            {currentData.batteryVoltage.toFixed(1)}V
          </text>
          <text x="30" y="100" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
            AKKU
          </text>
        </g>

        {/* === VERZWEIGUNG === */}
        <g transform="translate(120, 70)">
          <circle cx="0" cy="50" r="8" fill="#334155" stroke="#64748b" strokeWidth="2" />
        </g>

        {/* === FLUSS: Batterie → Verzweigung === */}
        <motion.line
          x1="90" y1="120" x2="112" y2="120"
          stroke={batteryColor}
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Animierte Partikel auf Hauptleitung */}
        {isSimulating && (
          <motion.circle
            r="4"
            fill="white"
            animate={{
              cx: [90, 112],
              opacity: [0.8, 0.3]
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}

        {/* === MOTOR (oben) === */}
        <g transform="translate(180, 20)">
          {/* Motor-Gehäuse */}
          <rect x="0" y="0" width="70" height="50" rx="4" 
                fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          {/* Motor-Welle */}
          <rect x="70" y="20" width="15" height="10" fill="#f59e0b" />
          {/* Rotor-Symbol */}
          <motion.g
            animate={{ rotate: isSimulating ? 360 : 0 }}
            transition={{ duration: 0.5, repeat: isSimulating ? Infinity : 0, ease: "linear" }}
            style={{ transformOrigin: '35px 25px' }}
          >
            <line x1="25" y1="25" x2="45" y2="25" stroke="#f59e0b" strokeWidth="2" />
            <line x1="35" y1="15" x2="35" y2="35" stroke="#f59e0b" strokeWidth="2" />
          </motion.g>
          {/* Label */}
          <text x="35" y="65" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
            MOTOR
          </text>
          <text x="35" y="75" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">
            {currentData.motorCurrent.toFixed(1)}A
          </text>
        </g>

        {/* === FLUSS: Verzweigung → Motor === */}
        <motion.path
          d="M 120 120 L 120 45 L 180 45"
          fill="none"
          stroke="#f59e0b"
          strokeWidth={motorFlowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeWidth: 4 }}
          animate={{ strokeWidth: motorFlowWidth }}
        />
        
        {/* Animierte Partikel zum Motor */}
        {isSimulating && (
          <motion.circle
            r="3"
            fill="#fbbf24"
            animate={{
              cx: [120, 120, 180],
              cy: [120, 45, 45],
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}

        {/* === KONDENSATOR (optional, mittig) === */}
        {showCapacitor && (
          <g transform="translate(140, 110)">
            {/* Kondensator-Symbol */}
            <rect x="0" y="0" width="40" height="30" rx="2" 
                  fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
            {/* Platten */}
            <line x1="10" y1="8" x2="10" y2="22" stroke="#8b5cf6" strokeWidth="3" />
            <line x1="30" y1="8" x2="30" y2="22" stroke="#8b5cf6" strokeWidth="3" />
            {/* Ladezustand */}
            <rect x="12" y="10" width="16" height="10" 
                  fill="#8b5cf6" 
                  opacity={currentData.capacitorCharge * 0.8} />
            {/* Label */}
            <text x="20" y="45" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
              PUFFER
            </text>
            <text x="20" y="55" textAnchor="middle" fill="#8b5cf6" fontSize="8" fontFamily="monospace">
              {(currentData.capacitorCharge * 100).toFixed(0)}%
            </text>
          </g>
        )}

        {/* === CPU (rechts) === */}
        <g transform="translate(280, 90)">
          {/* CPU-Gehäuse */}
          <motion.rect 
            x="0" y="0" width="80" height="60" rx="4" 
            fill="#1e293b" 
            stroke={cpuColor} 
            strokeWidth="3"
            animate={isCritical ? { 
              stroke: ['#ef4444', '#1e293b', '#ef4444'],
            } : {}}
            transition={{ duration: 0.3, repeat: isCritical ? Infinity : 0 }}
          />
          {/* Chip-Pins */}
          {[0, 1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <rect x={15 + i * 15} y="-5" width="6" height="5" fill="#64748b" />
              <rect x={15 + i * 15} y="60" width="6" height="5" fill="#64748b" />
            </React.Fragment>
          ))}
          {/* Status-LED */}
          <motion.circle 
            cx="65" cy="15" r="5" 
            fill={isCritical ? '#ef4444' : '#22c55e'}
            animate={isCritical ? { opacity: [1, 0, 1] } : {}}
            transition={{ duration: 0.2, repeat: isCritical ? Infinity : 0 }}
          />
          {/* Label */}
          <text x="40" y="35" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">
            {currentData.cpuVoltage.toFixed(1)}V
          </text>
          <text x="40" y="80" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
            STEUERUNG
          </text>
          
          {/* Warnung bei kritischer Spannung */}
          {isCritical && (
            <text x="40" y="95" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">
              !!! BROWNOUT !!!
            </text>
          )}
        </g>

        {/* === FLUSS: Verzweigung → CPU === */}
        <motion.path
          d={showCapacitor 
            ? "M 120 120 L 160 120 L 160 125 M 160 125 L 160 120 L 280 120"
            : "M 120 120 L 280 120"
          }
          fill="none"
          stroke={cpuColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Animierte Partikel zur CPU */}
        {isSimulating && (
          <motion.circle
            r="3"
            fill={cpuColor}
            animate={{
              cx: [120, 200, 280],
              cy: [120, 120, 120],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* === LEGENDE === */}
        <g transform="translate(10, 200)">
          <circle cx="5" cy="5" r="4" fill="#22c55e" />
          <text x="15" y="8" fill="#64748b" fontSize="8">OK (≥8V)</text>
          
          <circle cx="80" cy="5" r="4" fill="#eab308" />
          <text x="90" y="8" fill="#64748b" fontSize="8">Grenzwertig</text>
          
          <circle cx="170" cy="5" r="4" fill="#ef4444" />
          <text x="180" y="8" fill="#64748b" fontSize="8">Kritisch (&lt;5V)</text>
        </g>
      </svg>
    </div>
  );
};
```

---

## 4. Komponenten-Auswahl Interface

### Datei: `src/components/ui/CircuitConfigurator.tsx`

**Zweck:** Ermöglicht die Auswahl von Batterie und Kondensator.

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ELECTRONIC_COMPONENTS, 
  BatteryType, 
  CapacitorType,
  calculateElectronicsCost 
} from '@/lib/physicsEngine';
import { GlossaryTooltip } from './GlossaryTooltip';

interface CircuitConfiguratorProps {
  selectedBattery: BatteryType;
  selectedCapacitor: CapacitorType;
  onBatteryChange: (battery: BatteryType) => void;
  onCapacitorChange: (capacitor: CapacitorType) => void;
  credits: number;
  disabled?: boolean;
}

export const CircuitConfigurator: React.FC<CircuitConfiguratorProps> = ({
  selectedBattery,
  selectedCapacitor,
  onBatteryChange,
  onCapacitorChange,
  credits,
  disabled = false
}) => {
  const totalCost = calculateElectronicsCost(selectedBattery, selectedCapacitor);
  const canAfford = credits >= totalCost;

  return (
    <div className="space-y-6">
      {/* Batteriewahl */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          <GlossaryTooltip 
            term="Stromquelle" 
            definition="Die Batterie/der Akku liefert die elektrische Energie für alle Komponenten."
          />
        </h3>
        
        <div className="space-y-2">
          {Object.entries(ELECTRONIC_COMPONENTS.batteries).map(([key, battery]) => {
            const isSelected = selectedBattery === key;
            const isAffordable = credits >= battery.cost;
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: disabled ? 1 : 1.01 }}
                whileTap={{ scale: disabled ? 1 : 0.99 }}
                onClick={() => !disabled && onBatteryChange(key as BatteryType)}
                disabled={disabled}
                className={`w-full p-3 rounded border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{battery.icon}</span>
                      <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {battery.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {battery.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs font-mono">
                      <span className="text-slate-500">
                        <GlossaryTooltip 
                          term="Innenwiderstand" 
                          definition="Je höher der Innenwiderstand, desto mehr Spannung geht bei hohem Strombedarf verloren."
                        />: <span className="text-slate-300">{battery.internalResistance}Ω</span>
                      </span>
                      <span className="text-slate-500">
                        Spannung: <span className="text-slate-300">{battery.voltage}V</span>
                      </span>
                    </div>
                  </div>
                  <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${
                    isAffordable ? 'bg-slate-800 text-yellow-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {battery.cost} CR
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Kondensatorwahl */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          <GlossaryTooltip 
            term="Puffer-Kondensator" 
            definition="Ein Kondensator speichert elektrische Energie und kann kurze Spannungseinbrüche ausgleichen."
          />
        </h3>
        
        <div className="space-y-2">
          {Object.entries(ELECTRONIC_COMPONENTS.capacitors).map(([key, capacitor]) => {
            const isSelected = selectedCapacitor === key;
            const isAffordable = credits >= (ELECTRONIC_COMPONENTS.batteries[selectedBattery].cost + capacitor.cost);
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: disabled ? 1 : 1.01 }}
                whileTap={{ scale: disabled ? 1 : 0.99 }}
                onClick={() => !disabled && onCapacitorChange(key as CapacitorType)}
                disabled={disabled}
                className={`w-full p-3 rounded border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{capacitor.icon}</span>
                      <span className={`font-bold ${isSelected ? 'text-purple-400' : 'text-slate-200'}`}>
                        {capacitor.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {capacitor.description}
                    </p>
                  </div>
                  <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${
                    capacitor.cost === 0 
                      ? 'bg-slate-800 text-slate-400' 
                      : isAffordable 
                        ? 'bg-slate-800 text-yellow-400' 
                        : 'bg-red-900/30 text-red-400'
                  }`}>
                    {capacitor.cost === 0 ? 'FREI' : `${capacitor.cost} CR`}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Kosten-Übersicht */}
      <div className={`p-4 rounded-lg border ${
        canAfford 
          ? 'bg-slate-900/50 border-slate-700' 
          : 'bg-red-900/20 border-red-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-sm">Gesamtkosten:</span>
            <span className={`ml-2 font-mono font-bold text-lg ${
              canAfford ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {totalCost} CR
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Verfügbar:</span>
            <span className="ml-2 font-mono font-bold text-lg text-cyan-400">
              {credits} CR
            </span>
          </div>
        </div>
        
        {!canAfford && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-2 font-semibold"
          >
            ⚠ Nicht genug Credits für diese Konfiguration!
          </motion.p>
        )}
      </div>
    </div>
  );
};
```

---

## 5. Harald Schuldenbremse Dialog (Ablehnung)

### Datei: `src/components/ui/HaraldRejectionModal.tsx`

**Zweck:** Wird angezeigt, wenn der Spieler den Performance-Akku wählt, den er sich nicht leisten kann.

```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from './TypewriterText';

interface HaraldRejectionModalProps {
  requestedCost: number;
  availableCredits: number;
  onClose: () => void;
}

const HARALD_REJECTION_TEXT = `Äh... nein.

Nein, nein, nein.

Sie kommen hier rein und wollen mir erzählen, Sie brauchen einen Premium-Akku für... *schaut auf Zettel* ...60 Credits?

Sie haben 50.

Das ist ein Defizit von 10 Credits. ZEHN.

Wissen Sie, was ich mit 10 Credits machen kann? Drei Kugelschreiber kaufen. Oder einen halben Bürostuhl. Oder GARNICHTS, weil ich diese 10 Credits NICHT HABE.

Ich habe Ihnen beim letzten Mal schon großzügig Mittel bewilligt. Meine Großzügigkeit hat Grenzen. Diese Grenze ist erreicht.

Finden Sie eine günstigere Lösung. Das ist Ingenieursarbeit. Improvisation. Kreativität unter Budgetdruck.

Sie werden mir später danken.

*Tür fällt ins Schloss*`;

export const HaraldRejectionModal: React.FC<HaraldRejectionModalProps> = ({
  requestedCost,
  availableCredits,
  onClose
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [rightArrowPresses, setRightArrowPresses] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      setRightArrowPresses(prev => prev + 1);
      if (rightArrowPresses >= 1) {
        setShowFullText(true);
        setTextComplete(true);
      }
    } else {
      setRightArrowPresses(0);
    }
  }, [rightArrowPresses]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-linear-to-b from-stone-200 to-stone-300 rounded-sm shadow-2xl border-4 border-stone-400 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-stone-400 via-stone-500 to-stone-400 border-b-2 border-stone-600 px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-600 border-2 border-stone-700 flex items-center justify-center text-stone-300 font-bold text-xs rounded">
            HS
          </div>
          <div>
            <h3 className="font-bold text-stone-800" style={{ fontFamily: 'serif' }}>
              Harald Schuldenbremse
            </h3>
            <p className="text-xs text-stone-600">Budgetkontrolle</p>
          </div>
          <div className="ml-auto bg-red-100 border-2 border-red-600 px-3 py-1 rounded-sm">
            <span className="text-xs font-mono text-red-900 font-bold">ABGELEHNT</span>
          </div>
        </div>

        {/* Budget-Info */}
        <div className="bg-red-50 border-b-2 border-stone-400 px-6 py-3 flex justify-between items-center">
          <div className="text-sm" style={{ fontFamily: 'serif' }}>
            <span className="text-stone-600">Angefordert:</span>
            <span className="ml-2 font-bold text-red-700">{requestedCost} CR</span>
          </div>
          <div className="text-sm" style={{ fontFamily: 'serif' }}>
            <span className="text-stone-600">Verfügbar:</span>
            <span className="ml-2 font-bold text-stone-800">{availableCredits} CR</span>
          </div>
          <div className="text-sm" style={{ fontFamily: 'serif' }}>
            <span className="text-stone-600">Defizit:</span>
            <span className="ml-2 font-bold text-red-700">-{requestedCost - availableCredits} CR</span>
          </div>
        </div>

        {/* Monolog */}
        <div className="p-6 h-80 overflow-y-auto bg-stone-100" style={{ fontFamily: 'serif' }}>
          {showFullText ? (
            <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
              {HARALD_REJECTION_TEXT}
            </p>
          ) : (
            <TypewriterText 
              text={HARALD_REJECTION_TEXT} 
              speed={25} 
              onComplete={() => setTextComplete(true)}
              className="text-stone-800 leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-300 border-t-2 border-stone-400 px-6 py-4">
          {!showFullText && !textComplete && (
            <p className="text-xs text-stone-600 mb-2" style={{ fontFamily: 'serif' }}>
              <kbd className="px-2 py-0.5 bg-stone-400 border border-stone-500 rounded text-xs">→ →</kbd> zum Überspringen
            </p>
          )}
          <motion.button
            whileHover={{ scale: textComplete || showFullText ? 1.02 : 1 }}
            whileTap={{ scale: textComplete || showFullText ? 0.98 : 1 }}
            onClick={onClose}
            disabled={!textComplete && !showFullText}
            className={`w-full py-3 font-bold rounded-sm uppercase tracking-wide border-2 transition-all ${
              textComplete || showFullText
                ? 'bg-stone-600 hover:bg-stone-500 text-white border-stone-700'
                : 'bg-stone-400 text-stone-600 border-stone-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'serif' }}
          >
            {textComplete || showFullText ? 'Verstanden...' : 'Bitte warten...'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
```

---

## 6. Hauptkomponente: Level4_Electronics.tsx

### Datei: `src/components/levels/Level4_Electronics.tsx`

**Komplette Neuimplementierung:**

```typescript
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
import { HaraldRejectionModal } from '@/components/ui/HaraldRejectionModal';
import { 
  BatteryType, 
  CapacitorType, 
  calculateElectronicsSimulation,
  calculateElectronicsCost,
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
    removeCredits,
    userId,
    currentLevel
  } = useGameStore();

  // State
  const [showText, setShowText] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<BatteryType>('standard');
  const [selectedCapacitor, setSelectedCapacitor] = useState<CapacitorType>('none');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ElectronicsSimulationResult | null>(null);
  const [currentSimStep, setCurrentSimStep] = useState(0);
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

  // Navigation
  const handleBack = () => {
    popStateHistory();
    setShowText(false);
    setSimulationResult(null);
    setIsSimulating(false);
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
    const newCost = calculateElectronicsCost(battery, selectedCapacitor);
    
    // Wenn Performance-Akku und zu teuer → Harald-Dialog
    if (battery === 'performance' && newCost > credits) {
      logEvent('LEVEL4_HARALD_TRIGGERED', {
        requestedBattery: battery,
        requestedCost: newCost,
        availableCredits: credits
      });
      setShowHaraldRejection(true);
      return;
    }
    
    setSelectedBattery(battery);
    setSimulationResult(null);
  };

  const handleCapacitorChange = (capacitor: CapacitorType) => {
    setSelectedCapacitor(capacitor);
    setSimulationResult(null);
  };

  // Simulation starten
  const handleStartSimulation = () => {
    const totalCost = calculateElectronicsCost(selectedBattery, selectedCapacitor);
    
    if (totalCost > credits) {
      logEvent('LEVEL4_SIMULATION_DENIED', {
        reason: 'insufficient_credits',
        battery: selectedBattery,
        capacitor: selectedCapacitor,
        cost: totalCost,
        credits
      });
      return;
    }

    // State vor Änderung speichern
    pushStateHistory();

    logEvent('LEVEL4_SIMULATION_STARTED', {
      battery: selectedBattery,
      capacitor: selectedCapacitor,
      cost: totalCost,
      creditsBefore: credits
    });

    // Credits abziehen
    removeCredits(totalCost);

    // Simulation berechnen
    const result = calculateElectronicsSimulation(selectedBattery, selectedCapacitor);
    setSimulationResult(result);
    setIsSimulating(true);
    setCurrentSimStep(0);

    // Animation durchlaufen
    let step = 0;
    simulationIntervalRef.current = setInterval(() => {
      step++;
      setCurrentSimStep(step);
      
      if (step >= result.dataPoints.length - 1) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        setIsSimulating(false);

        logEvent('LEVEL4_SIMULATION_RESULT', {
          battery: selectedBattery,
          capacitor: selectedCapacitor,
          result: result.testResult,
          minVoltage: result.minCpuVoltage,
          brownoutOccurred: result.brownoutOccurred
        });

        // Bei Erfolg → Reflection
        if (result.testResult === 'SUCCESS') {
          setTimeout(() => {
            setSubStep(2); // Zur Reflection
          }, 1500);
        }
      }
    }, 30); // 30ms pro Step für flüssige Animation
  };

  // Reset nach Fehlschlag
  const handleReset = () => {
    setSimulationResult(null);
    setCurrentSimStep(0);
    setSelectedBattery('standard');
    setSelectedCapacitor('none');
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
  if (levelState === 'SUCCESS') {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LINKS: Konfiguration */}
          <div className="space-y-4">
            <CircuitConfigurator
              selectedBattery={selectedBattery}
              selectedCapacitor={selectedCapacitor}
              onBatteryChange={handleBatteryChange}
              onCapacitorChange={handleCapacitorChange}
              credits={credits}
              disabled={isSimulating}
            />
          </div>

          {/* RECHTS: Visualisierung */}
          <div className="space-y-4">
            <EnergyFlowDiagram
              dataPoints={simulationResult?.dataPoints || []}
              isSimulating={isSimulating}
              currentStep={currentSimStep}
              showCapacitor={selectedCapacitor !== 'none'}
            />

            {/* Ergebnis-Anzeige */}
            <AnimatePresence>
              {simulationResult && !isSimulating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg border ${
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex gap-4">
          {simulationResult?.brownoutOccurred && !isSimulating && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReset}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded uppercase tracking-widest transition-colors"
            >
              Neu konfigurieren
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: isSimulating ? 1 : 1.01 }}
            whileTap={{ scale: isSimulating ? 1 : 0.99 }}
            onClick={handleStartSimulation}
            disabled={isSimulating || (simulationResult?.testResult === 'SUCCESS')}
            className={`flex-1 py-4 font-bold text-lg rounded uppercase tracking-widest transition-all ${
              isSimulating
                ? 'bg-yellow-600 text-white animate-pulse cursor-wait'
                : simulationResult?.testResult === 'SUCCESS'
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isSimulating 
              ? 'Simulation läuft...' 
              : simulationResult?.testResult === 'SUCCESS'
                ? 'Erfolgreich!'
                : `Motor starten (${calculateElectronicsCost(selectedBattery, selectedCapacitor)} CR)`
            }
          </motion.button>
        </div>
      </TerminalCard>

      {/* Harald Rejection Modal */}
      {showHaraldRejection && (
        <HaraldRejectionModal
          requestedCost={ELECTRONIC_COMPONENTS.batteries.performance.cost}
          availableCredits={credits}
          onClose={() => setShowHaraldRejection(false)}
        />
      )}
    </div>
  );
};

export default Level4_Electronics;
```

---

## 7. Event-Tracking Übersicht

| Event Type | Payload | Auslöser |
|------------|---------|----------|
| `LEVEL4_HARALD_TRIGGERED` | `{ requestedBattery, requestedCost, availableCredits }` | Performance-Akku gewählt ohne Credits |
| `LEVEL4_SIMULATION_DENIED` | `{ reason, battery, capacitor, cost, credits }` | Test ohne genug Credits |
| `LEVEL4_SIMULATION_STARTED` | `{ battery, capacitor, cost, creditsBefore }` | Simulation gestartet |
| `LEVEL4_SIMULATION_RESULT` | `{ battery, capacitor, result, minVoltage, brownoutOccurred }` | Simulation beendet |
| `REFLECTION_CALL` | `{ question, answer, caller }` | Reflection abgeschlossen |

---

## 8. Lösungsmatrix

| Batterie | Kondensator | Kosten | Ergebnis | Hinweis |
|----------|-------------|--------|----------|---------|
| Standard | Keiner | 10 CR | ❌ BROWNOUT | Spannung fällt auf ~2V |
| Standard | Klein | **25 CR** | ✅ SUCCESS | **Günstigste Lösung** |
| Standard | Groß | 45 CR | ✅ SUCCESS | Überdimensioniert |
| Performance | Keiner | 60 CR | ✅ SUCCESS | Zu teuer (Harald!) |
| Performance | Klein | 75 CR | ✅ SUCCESS | Zu teuer (Harald!) |

---

## 9. Implementierungsreihenfolge

1. **`src/lib/physicsEngine.ts`** erweitern (Elektronik-Konstanten und Berechnung)
2. **`src/components/ui/BrownoutVisualization.tsx`** erstellen
3. **`src/components/ui/EnergyFlowDiagram.tsx`** erstellen
4. **`src/components/ui/CircuitConfigurator.tsx`** erstellen
5. **`src/components/ui/HaraldRejectionModal.tsx`** erstellen
6. **`src/components/levels/Level4_Electronics.tsx`** komplett ersetzen
7. Testen: Alle Pfade durchspielen (Erfolg, Fehlschlag, Harald-Dialog)

---

## 10. Testszenarien

### Szenario A: Optimaler Pfad
1. Intro ansehen
2. Recherche durchlesen
3. Standard-Akku + Stützkondensator wählen (25 CR)
4. Test starten → Erfolg
5. Reflection beantworten → Level 5

### Szenario B: Zu günstig
1. Standard-Akku ohne Kondensator (10 CR)
2. Test starten → Brownout
3. "Neu konfigurieren" → Kondensator hinzufügen
4. Erneut testen → Erfolg

### Szenario C: Harald-Ablehnung
1. Performance-Akku auswählen
2. → Harald-Dialog erscheint
3. Schließen → zurück zur Auswahl
4. Günstigere Option wählen

---

## 11. CSS/Styling-Hinweise

Keine neuen globalen Styles nötig. Alle Komponenten nutzen:
- Tailwind CSS Klassen
- Bestehende Farbpalette (cyan, red, yellow, green, slate)
- Framer Motion für Animationen
- Bestehende `TerminalCard`, `GlossaryTooltip` etc.

---

## 12. Wichtige Hinweise für die Implementierung

1. **Physics-Korrektheit:** Die Berechnungen in `calculateElectronicsSimulation` sind vereinfacht aber physikalisch plausibel. Der Kondensator-Puffer-Effekt ist approximiert.

2. **Budget-Balance:** Performance-Akku kostet 60 CR, Spieler hat 50 CR → Harald muss kommen. Dies ist **kritisch** für das Lernziel.

3. **Animation-Timing:** Das EnergyFlowDiagram aktualisiert alle 30ms für flüssige Animation (≈33 FPS).

4. **Zustandsmanagement:** `pushStateHistory()` wird VOR jeder kreditsverändernden Aktion aufgerufen für korrektes "Zurück".

5. **Reflection-Inhalt:** Die Frage und Antwort in `ReflectionCall` erklären das "Warum" des Kondensators – dies ist das eigentliche Lernziel.