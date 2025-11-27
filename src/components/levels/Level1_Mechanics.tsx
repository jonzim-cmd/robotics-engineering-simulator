'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { MATERIALS, calculateBeamDeflection } from '@/lib/physicsEngine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const Level1_Mechanics: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, previousLevel } = useGameStore();
  const [selectedMaterial, setSelectedMaterial] = useState<keyof typeof MATERIALS | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStart = () => {
    setLevelState('ACTIVE');
  };

  const handleSimulate = () => {
    if (!selectedMaterial) return;
    setSimulating(true);
    setErrorMsg(null);

    setTimeout(() => {
      const material = MATERIALS[selectedMaterial];
      // Requirements: 5kg load, max 2mm bend. Max arm weight 1000g.
      // We need to estimate arm weight based on density.
      // Let's assume arm volume is constant, say 200 cm^3
      const armVolume = 200; 
      const armWeightG = material.density * armVolume;
      const deflectionAt5kg = calculateBeamDeflection(5, material.stiffness);

      if (armWeightG > 1000) {
        setErrorMsg(`WARNUNG: Motorstrom übersteigt 100%. Arm zu schwer! (${armWeightG.toFixed(0)}g > 1000g). Motoren überhitzen.`);
        setLevelState('FAIL');
      } else if (deflectionAt5kg > 2) {
        setErrorMsg(`WARNUNG: Präzisionsfehler. Der Arm biegt sich zu stark (${deflectionAt5kg.toFixed(2)}mm > 2.00mm). Ziel verfehlt.`);
        setLevelState('FAIL');
      } else {
        setLevelState('SUCCESS');
      }
      setSimulating(false);
    }, 1500);
  };

  const chartData = useMemo(() => {
    if (!selectedMaterial) return [];
    const data = [];
    const mat = MATERIALS[selectedMaterial];
    for (let i = 0; i <= 10; i++) {
      data.push({
        load: i,
        deflection: calculateBeamDeflection(i, mat.stiffness),
      });
    }
    return data;
  }, [selectedMaterial]);

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={previousLevel}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText 
            text="Verbindung hergestellt... Unit-7 Status: KRITISCH." 
            speed={20}
          />
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">Wir haben ein Problem, Rookie. Unit-7 hat versucht, einen schweren Industrie-Container zu heben. Dabei hat sich der Greifarm verbogen und ist nicht mehr in die Ausgangsposition zurückgefedert. Das alte Material war zu weich für diese Lasten.</p>
            
            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>Konstruiere einen neuen Arm. Er muss <GlossaryTooltip term="steif" definition="Widerstand gegen Verformung (E-Modul)." /> genug sein, um 5kg zu heben, ohne sich mehr als 2mm zu biegen. Aber Vorsicht: Wenn der Arm schwerer als 1000g ist, brennen die Schultermotoren durch.</p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Mission Starten
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={previousLevel}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ ERFOLG</div>
          <p>Der Arm hält der Belastung stand und die Motoren laufen stabil.</p>
          <button 
            onClick={advanceLevel}
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
      <TerminalCard title="LEVEL 1: MATERIALKUNDE" borderColor={errorMsg ? 'red' : 'cyan'} onBack={previousLevel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded border border-slate-800">
              <h3 className="text-cyan-400 font-bold mb-4 border-b border-slate-700 pb-2">MATERIALDATENBANK</h3>
              <div className="space-y-3">
                {(Object.entries(MATERIALS) as [keyof typeof MATERIALS, typeof MATERIALS['wood']][]).map(([key, mat]) => (
                  <label key={key} className={`flex items-center p-3 rounded border cursor-pointer transition-all ${selectedMaterial === key ? 'bg-cyan-900/30 border-cyan-500' : 'border-slate-700 hover:border-slate-500'}`}>
                    <input 
                      type="radio" 
                      name="material" 
                      className="mr-3"
                      checked={selectedMaterial === key}
                      onChange={() => setSelectedMaterial(key)}
                    />
                    <div className="flex-1">
                      <div className="font-bold">{mat.name}</div>
                      <div className="text-xs text-slate-400 flex gap-3">
                        <span><GlossaryTooltip term="Dichte" definition="Wie schwer das Material pro cm³ ist." />: {mat.density} g/cm³</span>
                        <span><GlossaryTooltip term="Steifigkeit" definition="Der Widerstand gegen Verformung (E-Modul)." />: {mat.stiffness} GPa</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={!selectedMaterial || simulating}
              className={`w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                !selectedMaterial ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                simulating ? 'bg-yellow-600 text-white animate-pulse' :
                'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {simulating ? 'Simuliere Belastung...' : 'Konfiguration Testen'}
            </button>

            {errorMsg && (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="p-4 bg-red-900/20 border border-red-500 text-red-400 rounded"
               >
                 {errorMsg}
                 <button onClick={() => setLevelState('ACTIVE')} className="block mt-2 text-xs underline hover:text-red-300">
                   Parameter korrigieren
                 </button>
               </motion.div>
            )}
          </div>

          {/* Visualization */}
          <div className="h-80 bg-slate-900 rounded border border-slate-800 p-4 relative">
            <h4 className="text-xs text-slate-500 mb-2 font-mono text-center">BELASTUNGS-DIAGRAMM</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="load" stroke="#475569" label={{ value: 'Last (kg)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" label={{ value: 'Durchbiegung (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <ReferenceLine y={2} stroke="red" strokeDasharray="3 3" label={{ value: "Max Toleranz", fill: 'red', fontSize: 10 }} />
                {selectedMaterial && (
                  <Line 
                    type="monotone" 
                    dataKey="deflection" 
                    stroke={MATERIALS[selectedMaterial].color} 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            {!selectedMaterial && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm pointer-events-none">
                [Warte auf Materialwahl...]
              </div>
            )}
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};

export default Level1_Mechanics;
