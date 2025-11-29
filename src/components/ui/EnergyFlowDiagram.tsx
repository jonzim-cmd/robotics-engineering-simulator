'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ElectronicsDataPoint, ELECTRONICS_CONSTANTS } from '@/lib/physicsEngine';

interface EnergyFlowDiagramProps {
  dataPoints: ElectronicsDataPoint[];
  isSimulating: boolean;
  currentStep: number;
  showCapacitor: boolean;
  onTriggerStart?: () => void;
  isTestActive?: boolean;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  dataPoints,
  isSimulating,
  currentStep,
  showCapacitor,
  onTriggerStart,
  isTestActive
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
    <div className="relative w-full h-[450px] bg-slate-950 rounded-lg border border-slate-700 p-4 overflow-hidden">
      {/* Titel */}
      <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
        Energie-Fluss Diagramm
      </div>

      {/* Zeit-Anzeige */}
      <div className="absolute top-2 right-2 text-xs font-mono text-slate-400">
        t = {currentData.time.toFixed(0)}ms
      </div>

      {/* ZEITLUPE Indikator */}
      {(isSimulating || isTestActive) && (
        <div className="absolute bottom-2 right-2 text-xs font-mono font-bold text-cyan-500/80 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded border border-cyan-900/50">
          [ ZEITLUPE AKTIV ]
        </div>
      )}

      {/* SVG Diagramm */}
      <svg viewBox="0 0 500 250" className="w-full h-full">

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
          {/* Motor-Gehäuse - NEUTRAL BLAU */}
          <rect x="0" y="0" width="70" height="50" rx="4"
                fill="#1e293b" stroke="#60a5fa" strokeWidth="3" />
          
          {/* Motor-Welle - NEUTRAL GRAU */}
          <rect x="70" y="20" width="15" height="10" fill="#94a3b8" />
          
          {/* Rotor-Symbol - NEUTRAL GRAU */}
          {(!isTestActive || isSimulating) && (
             <motion.g
                animate={{ rotate: isSimulating ? 360 : 0 }}
                transition={{ duration: 0.5, repeat: isSimulating ? Infinity : 0, ease: "linear" }}
                style={{ transformOrigin: '35px 25px' }}
             >
                <line x1="25" y1="25" x2="45" y2="25" stroke="#94a3b8" strokeWidth="2" />
                <line x1="35" y1="15" x2="35" y2="35" stroke="#94a3b8" strokeWidth="2" />
             </motion.g>
          )}

          {/* INTERAKTIVER START-BUTTON */}
          {isTestActive && !isSimulating && (
            <motion.g
              onClick={(e) => { e.stopPropagation(); onTriggerStart && onTriggerStart(); }}
              className="cursor-pointer"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '35px 25px' }}
            >
               <circle cx="35" cy="25" r="18" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
               <text x="35" y="29" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                 START
               </text>
            </motion.g>
          )}

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
          stroke={batteryColor}
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
          {/* CPU-Gehäuse - DYNAMISCHE FARBE */}
          <motion.rect
            x="0" y="0" width="80" height="60" rx="4"
            fill="#1e293b"
            stroke={cpuColor}
            strokeWidth="3"
            animate={isCritical ? {
              stroke: ['#ef4444', '#1e293b', '#ef4444'],
            } : {
              stroke: cpuColor
            }}
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
            STEUERUNG (CPU)
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

        {/* === LEGENDE (RECHTS NEBEN CPU) === */}
        <g transform="translate(380, 85)">
          <text x="0" y="0" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">LEGENDE</text>
          
          {/* Item 1 */}
          <g transform="translate(0, 15)">
            <circle cx="5" cy="5" r="4" fill="#22c55e" />
            <text x="15" y="8" fill="#64748b" fontSize="8">OK (&gt;8V)</text>
          </g>

          {/* Item 2 */}
          <g transform="translate(0, 30)">
            <circle cx="5" cy="5" r="4" fill="#eab308" />
            <text x="15" y="8" fill="#64748b" fontSize="8">Grenzwertig</text>
          </g>

           {/* Item 3 */}
           <g transform="translate(0, 45)">
            <circle cx="5" cy="5" r="4" fill="#ef4444" />
            <text x="15" y="8" fill="#64748b" fontSize="8">Kritisch</text>
          </g>
        </g>

      </svg>
      {/* Erklärung des Diagramms */}
      <div className="absolute bottom-2 left-2 right-2 text-xs text-slate-400 text-left bg-slate-900/50 p-1 rounded">
        Das Diagramm zeigt den Energiefluss. Der Akku (links) versorgt den Motor (oben) und die Steuerung (CPU, rechts).
        Bei Motorstart steigt der Strom stark an, das hat Einfluss auf die Spannung des Akkus und die CPU-Spannung.
        Wenn die CPU-Spannung kritisch ist, schaltet sie ab und startet neu.
      </div>

    </div>
  );
};