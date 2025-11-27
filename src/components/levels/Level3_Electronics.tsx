'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const Level3_Electronics: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory } = useGameStore();
  const [batteryType, setBatteryType] = useState<'cheap' | 'performance' | null>(null);
  const [capacitorAdded, setCapacitorAdded] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBack = () => {
    // Pop from global history
    popStateHistory();
    // Reset local state
    setBatteryType(null);
    setCapacitorAdded(false);
    setSimulating(false);
    setChartData([]);
    setErrorMsg(null);
  };

  const handleStart = () => {
    // Save state before advancing
    pushStateHistory();
    setLevelState('ACTIVE');
  };

  const generateData = () => {
    const data = [];
    const baseV = 12;
    let minV = 12;

    // Physics parameters
    // Internal Resistance: Cheap = 2.0 Ohm, Perf = 0.2 Ohm
    const R_int = batteryType === 'cheap' ? 2.0 : 0.2;
    // Inrush Current Profile: Spikes to 5A at t=50, decays
    
    for (let t = 0; t < 200; t++) {
      let current = 0.5; // Standby current
      if (t > 50 && t < 100) {
        // Inrush spike
        current = 5.0; 
        // Capacitor smoothing effect (simplified): Reduces peak current drawn from battery effectively
        if (capacitorAdded) current = 3.0; 
      } else if (t >= 100) {
        current = 1.0; // Running current
      }

      let voltage = baseV - (current * R_int);
      
      // Capacitor smoothing voltage curve directly
      if (capacitorAdded && t > 50 && t < 120) {
         voltage += 1.5; // Fake smoothing boost
      }
      
      if (voltage < 0) voltage = 0;
      if (voltage < minV) minV = voltage;

      data.push({ time: t, voltage, current });
    }
    return { data, minV };
  };

  const handleSimulate = () => {
    if (!batteryType) return;
    setSimulating(true);
    setErrorMsg(null);
    setChartData([]);

    setTimeout(() => {
      const { data, minV } = generateData();
      setChartData(data);
      
      // Logic: CPU needs > 3.3V (or 5V? Plan says "Computer brauchen konstant 3.3V oder 5V").
      // Plan example says "Dip geht runter bis 2V -> Reboot".
      // Let's say threshold is 5V.
      
      if (minV < 5.0) {
        setErrorMsg(`CRITICAL ALERT: Voltage Low (${minV.toFixed(2)}V). CPU Reset triggered. Brownout detected.`);
        setTimeout(() => setLevelState('FAIL'), 2000);
      } else {
        setTimeout(() => setLevelState('SUCCESS'), 1000);
      }
      setSimulating(false);
    }, 1000);
  };

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={handleBack}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText 
            text="Ebene 2 Diagnostik: OK. Analysiere Stromversorgung..." 
            speed={20}
          />
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">Mechanisch läuft alles. Aber wir haben ein elektronisches Phänomen. Jedes Mal, wenn der Transporter mit voller Beladung anfährt, startet der Bordcomputer neu und das System fällt aus.</p>
            
            <strong className="text-red-400 block mb-2 mt-4">ANALYSE:</strong>
            <p className="mb-2">Der <GlossaryTooltip term="Anlaufstrom" definition="Der hohe Strombedarf im Moment des Motor-Starts (Inrush Current)." /> ist unter Last riesig. Das zwingt die Batterie in die Knie. Die Systemspannung bricht kurzzeitig zusammen.</p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>Analysiere das Oszilloskop. Finde eine Stromquelle, die stabil bleibt, auch wenn der Motor plötzlich viel Strom zieht. Vermeide einen <GlossaryTooltip term="Brownout" definition="Kurzer Spannungsabfall, der Computer abstürzen lässt." />.</p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Oszilloskop starten
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={handleBack}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ SPANNUNG STABIL</div>
          <p>Keine Brownouts detektiert. CPU läuft durchgehend stabil.</p>
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
      <TerminalCard title="LEVEL 3: ELEKTRONIK & SPANNUNGSABFALL" borderColor={errorMsg ? 'red' : 'cyan'} onBack={handleBack}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Controls */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-4">
              <h3 className="text-cyan-400 font-bold border-b border-slate-700 pb-2">STROMQUELLE</h3>
              
              <label className={`flex items-center p-3 rounded border cursor-pointer transition-all ${batteryType === 'cheap' ? 'bg-cyan-900/30 border-cyan-500' : 'border-slate-700 hover:border-slate-500'}`}>
                <input 
                  type="radio" 
                  name="battery" 
                  className="mr-3"
                  checked={batteryType === 'cheap'}
                  onChange={() => setBatteryType('cheap')}
                />
                <div>
                  <div className="font-bold">Standard Akku</div>
                  <div className="text-xs text-slate-400">Hoher <GlossaryTooltip term="Innenwiderstand" definition="Der Widerstand innerhalb der Batterie." /> (2.0 Ω)</div>
                </div>
              </label>

              <label className={`flex items-center p-3 rounded border cursor-pointer transition-all ${batteryType === 'performance' ? 'bg-cyan-900/30 border-cyan-500' : 'border-slate-700 hover:border-slate-500'}`}>
                <input 
                  type="radio" 
                  name="battery" 
                  className="mr-3"
                  checked={batteryType === 'performance'}
                  onChange={() => setBatteryType('performance')}
                />
                <div>
                  <div className="font-bold">High-Perf. Akku</div>
                  <div className="text-xs text-slate-400">Niedriger Innenwiderstand (0.2 Ω)</div>
                </div>
              </label>

              <div className="pt-4 border-t border-slate-700">
                 <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={capacitorAdded} 
                      onChange={(e) => setCapacitorAdded(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Stützkondensator hinzufügen</span>
                 </label>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={!batteryType || simulating}
              className={`w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                !batteryType ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                simulating ? 'bg-yellow-600 text-white animate-pulse' :
                'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {simulating ? 'Start Motor...' : 'Motor Starten'}
            </button>

            {errorMsg && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-3 bg-red-900/20 border border-red-500 text-red-400 text-sm rounded"
               >
                 {errorMsg}
                 <button onClick={() => setLevelState('ACTIVE')} className="block mt-2 underline hover:text-red-300">
                   Reset System
                 </button>
               </motion.div>
            )}
          </div>

          {/* Oscilloscope */}
          <div className="md:col-span-2 bg-black rounded border border-slate-800 p-4 relative min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-xs text-green-500 font-mono">OSZILLOSKOP // CHANNEL 1: V_BUS</h4>
               <div className="text-xs text-slate-500 font-mono">TIME: 200ms / DIV</div>
            </div>
            
            <div className="flex-1 w-full relative overflow-hidden border border-green-900/30 bg-[linear-gradient(0deg,transparent_24%,rgba(34,197,94,.1)_25%,rgba(34,197,94,.1)_26%,transparent_27%,transparent_74%,rgba(34,197,94,.1)_75%,rgba(34,197,94,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(34,197,94,.1)_25%,rgba(34,197,94,.1)_26%,transparent_27%,transparent_74%,rgba(34,197,94,.1)_75%,rgba(34,197,94,.1)_76%,transparent_77%,transparent)] bg-[length:50px_50px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData.length > 0 ? chartData : [{time:0, voltage:12}, {time:200, voltage:12}]}>
                   <XAxis dataKey="time" hide domain={[0, 200]} />
                   <YAxis domain={[0, 15]} hide />
                   <ReferenceLine y={5} stroke="red" strokeDasharray="3 3" label={{ value: "CPU Reset (5V)", fill: 'red', fontSize: 10 }} />
                   <ReferenceLine y={12} stroke="#334155" strokeDasharray="3 3" />
                   <Line 
                     type="monotone" 
                     dataKey="voltage" 
                     stroke="#22c55e" 
                     strokeWidth={2} 
                     dot={false}
                     isAnimationActive={simulating}
                     animationDuration={1000}
                   />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </div>

        </div>
      </TerminalCard>
    </div>
  );
};

export default Level3_Electronics;
