'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { Level3_TerrainViewer } from './Level3_TerrainViewer';
import { motion } from 'framer-motion';
import { Cog, Snowflake, MousePointer2 } from 'lucide-react';

const Level3_Mechanisms: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory, setSubStep } = useGameStore();
  const [driveType, setDriveType] = useState<'wheels' | 'tracks' | 'legs' | null>(null);
  const [gripperType, setGripperType] = useState<'claw' | 'vacuum' | 'magnetic' | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleBack = () => {
    popStateHistory();
    setDriveType(null);
    setGripperType(null);
    setSimulating(false);
    setResult(null);
  };

  const handleStart = () => {
    pushStateHistory();
    setLevelState('ACTIVE');
    setSubStep(0);
  };

  const handleSimulate = () => {
    if (!driveType || !gripperType) return;
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      // Logic:
      // Mission: Rough Terrain (Schlamm/Steine) + Heavy Ferromagnetic Crates
      // Best Drive: Tracks (Kettenantrieb) - Wheels get stuck, Legs are unstable/slow
      // Best Gripper: Magnetic (Magnet) - Claw is ok but maybe weak for heavy stuff? Or Claw is good. 
      // Let's say:
      // Drive: Tracks (Mandatory)
      // Gripper: Magnetic (Best) or Claw (Good). Vacuum fails on rough dirt or heavy porous stuff.
      
      let success = false;
      let msg = "";

      if (driveType !== 'tracks') {
         msg += "FEHLER: Antrieb versagt. ";
         if (driveType === 'wheels') msg += "Räder drehen im Schlamm durch. ";
         if (driveType === 'legs') msg += "Bein-Mechanik verliert Balance auf Geröll. ";
      }

      if (gripperType === 'vacuum') {
         msg += "FEHLER: Vakuum-Greifer kann auf verbeulten Kisten kein Siegel bilden. ";
      }

      if (driveType === 'tracks' && gripperType !== 'vacuum') {
         success = true;
         msg = "Erfolg! Kettenantrieb meistert das Gelände. ";
         if (gripperType === 'magnetic') msg += "Magnet hält die Last sicher.";
         if (gripperType === 'claw') msg += "Mechanische Klaue greift fest zu.";
      }

      setResult({ success, msg });
      
      if (success) {
        setTimeout(() => {
          setLevelState('SUCCESS');
        }, 2000);
      }
      
      setSimulating(false);
    }, 1500);
  };

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={handleBack}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText
            text="Ebene 2 Diagnostik: OK. Lade Missionsparameter..."
            speed={20}
          />

          {/* 3D Terrain Preview - Emotionalisierung */}
          <div className="relative h-80 rounded-lg overflow-hidden border border-cyan-900/50 bg-slate-950">
            <Level3_TerrainViewer autoRotate={true} className="w-full h-full" />
            <div className="absolute bottom-2 right-2 text-xs text-cyan-400/60 bg-slate-900/80 px-2 py-1 rounded">
              🖱️ Ziehen zum Drehen, Scrollen zum Zoomen
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">Das Getriebe ist optimiert. Jetzt muss Unit-7 in die Außenwelt. Das Zielgebiet ist eine alte Deponie. Die Aufgabe: Container bergen.</p>

            <strong className="text-red-400 block mb-2 mt-4">ANFORDERUNG:</strong>
            <p className="mb-2">Der Standard-Radantrieb sowie Standard-Greifvorrichtungen werden für diese Aufgaben nicht ausreichen.</p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>Wähle die korrekte <GlossaryTooltip term="Kinematik" definition="Lehre der Bewegung von Körpern (hier: Wie sich der Roboter bewegt)." />. Konfiguriere Antrieb und Greifer für <strong>schweres Gelände</strong> und <strong>schwere Lasten</strong>.</p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Konfigurator starten
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="MISSION COMPLETE" borderColor="green" onBack={handleBack}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ MISSION ERFOLGREICH</div>
          <p>Unit-7 hat das Zielgebiet erreicht und die Fracht gesichert.</p>
          <button 
            onClick={() => advanceLevel()}
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
      <TerminalCard title="LEVEL 3: MECHANISMEN & AKTUATOREN" borderColor={result && !result.success ? 'red' : 'cyan'} onBack={handleBack}>
        {/* 3D Terrain Viewer - Analyse */}
        <div className="relative h-64 rounded-lg overflow-hidden border border-cyan-900/50 bg-slate-950 mb-6">
          <Level3_TerrainViewer autoRotate={false} className="w-full h-full" />
          <div className="absolute top-2 left-2 text-xs text-cyan-400 bg-slate-900/80 px-2 py-1 rounded">
            💡 Analysiere das Gelände und wähle passende Mechanismen
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Drive Selection */}
          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold border-b border-slate-700 pb-2 flex items-center gap-2">
               <Cog className="animate-spin-slow" size={20}/> ANTRIEBSSYSTEM
            </h3>
            
            <button 
               onClick={() => setDriveType('wheels')}
               className={`w-full p-4 rounded border text-left transition-all ${driveType === 'wheels' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">4x4 Radantrieb</div>
               <div className="text-sm text-slate-400">Hohe Geschwindigkeit auf Asphalt. Geringe Traktion im Schlamm.</div>
            </button>

            <button 
               onClick={() => setDriveType('tracks')}
               className={`w-full p-4 rounded border text-left transition-all ${driveType === 'tracks' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">Kettenantrieb (Caterpillar)</div>
               <div className="text-sm text-slate-400">Maximale Auflagefläche. Exzellent für Schlamm & Geröll. Langsam.</div>
            </button>

            <button 
               onClick={() => setDriveType('legs')}
               className={`w-full p-4 rounded border text-left transition-all ${driveType === 'legs' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">Hexapod-Beine</div>
               <div className="text-sm text-slate-400">Überwindet hohe Hindernisse. Komplex zu steuern. Instabil bei hoher Last.</div>
            </button>
          </div>

          {/* Gripper Selection */}
          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold border-b border-slate-700 pb-2 flex items-center gap-2">
               <MousePointer2 size={20}/> GREIF-MECHANIK
            </h3>
            
            <button 
               onClick={() => setGripperType('claw')}
               className={`w-full p-4 rounded border text-left transition-all ${gripperType === 'claw' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">Servo-Klaue</div>
               <div className="text-sm text-slate-400">Universell einsetzbar. Benötigt hohe Klemmkraft für schwere Objekte.</div>
            </button>

            <button 
               onClick={() => setGripperType('vacuum')}
               className={`w-full p-4 rounded border text-left transition-all ${gripperType === 'vacuum' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">Vakuum-Sauger</div>
               <div className="text-sm text-slate-400">Perfekt für glatte, luftdichte Oberflächen (Glas, Blech). Versagt bei Staub/Rost.</div>
            </button>

            <button 
               onClick={() => setGripperType('magnetic')}
               className={`w-full p-4 rounded border text-left transition-all ${gripperType === 'magnetic' ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
               <div className="font-bold text-lg mb-1">Elektromagnet</div>
               <div className="text-sm text-slate-400">Sehr hohe Haltekraft für Eisenmetalle. Energieintensiv.</div>
            </button>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <button 
                onClick={handleSimulate}
                disabled={!driveType || !gripperType || simulating}
                className={`flex-1 w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                  (!driveType || !gripperType) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                  simulating ? 'bg-yellow-600 text-white animate-pulse' :
                  'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
             >
                {simulating ? 'Simulation läuft...' : 'Konfiguration testen'}
             </button>
          </div>

          {result && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`mt-4 p-4 rounded border text-center font-mono ${result.success ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-red-900/20 border-red-500 text-red-400'}`}
             >
                {result.msg}
             </motion.div>
          )}
        </div>

      </TerminalCard>
    </div>
  );
};

export default Level3_Mechanisms;
