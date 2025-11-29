'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ELECTRONIC_COMPONENTS,
  BatteryType,
  CapacitorType
} from '@/lib/physicsEngine';
import { GlossaryTooltip } from './GlossaryTooltip';

interface CircuitConfiguratorProps {
  selectedBattery: BatteryType;
  selectedCapacitor: CapacitorType;
  onBatteryChange: (battery: BatteryType) => void;
  onCapacitorChange: (capacitor: CapacitorType) => void;
  disabled?: boolean;
}

export const CircuitConfigurator: React.FC<CircuitConfiguratorProps> = ({
  selectedBattery,
  selectedCapacitor,
  onBatteryChange,
  onCapacitorChange,
  disabled = false
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batteriewahl */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 h-full">
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
                            position="right"
                          />: <span className="text-slate-300">{battery.internalResistance}Ω</span>
                        </span>
                        <span className="text-slate-500">
                          Spannung: <span className="text-slate-300">{battery.voltage}V</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {battery.cost} CR
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Kondensatorwahl */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 h-full">
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
                    <div className="text-sm font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {capacitor.cost === 0 ? 'FREI' : `${capacitor.cost} CR`}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
