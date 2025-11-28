'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { Level3_TerrainViewer } from './Level3_TerrainViewer';
import { Level3_ComponentPreview } from './Level3_ComponentPreview';
import { ReflectionDialog } from '@/components/ui/ReflectionDialog';
import { motion } from 'framer-motion';
import { Cog, MousePointer2 } from 'lucide-react';

// Define types for components
type DriveType = 'wheels' | 'tracks' | 'legs' | 'mecanum' | 'hover';
type GripperType = 'claw' | 'vacuum' | 'magnetic' | 'soft' | 'needle';

interface SelectionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  type: DriveType | GripperType;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ selected, onSelect, title, description, type }) => (
  <button
    onClick={onSelect}
    className={`relative w-full rounded-lg border text-left transition-all overflow-hidden group ${
      selected 
        ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
        : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
    }`}
  >
    {/* 3D Preview Header */}
    <div className="h-32 w-full bg-slate-950 border-b border-slate-800 relative">
      <Level3_ComponentPreview type={type} className="w-full h-full" />
      {selected && (
        <div className="absolute top-2 right-2 bg-cyan-500 text-slate-950 text-xs font-bold px-2 py-1 rounded">
          SELECTED
        </div>
      )}
    </div>
    
    {/* Content */}
    <div className="p-4">
      <div className={`font-bold text-lg mb-1 ${selected ? 'text-cyan-400' : 'text-slate-200'}`}>{title}</div>
      <div className="text-sm text-slate-400 leading-relaxed">{description}</div>
    </div>
  </button>
);

const Level3_Mechanisms: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory, setSubStep } = useGameStore();
  const [driveType, setDriveType] = useState<DriveType | null>(null);
  const [gripperType, setGripperType] = useState<GripperType | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleBack = () => {
    popStateHistory();
    setDriveType(null);
    setGripperType(null);
    setSimulating(false);
    setResult(null);
    setShowDialog(false);
  };

  const handleStart = () => {
    pushStateHistory();
    setShowDialog(true);
  };

  const handleDialogComplete = () => {
    setShowDialog(false);
    setLevelState('ACTIVE');
    setSubStep(0);
  };

  const handleSimulate = () => {
    if (!driveType || !gripperType) return;
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      // Mission: Rough Terrain (Mud/Rocks) + Heavy Ferromagnetic Crates
      let success = false;
      let msg = "";
      let driveOk = false;
      let gripperOk = false;

      // --- Drive Logic ---
      if (driveType === 'wheels') {
        msg += "FEHLER: Räder drehen im tiefen Schlamm durch. ";
      } else if (driveType === 'mecanum') {
        msg += "KRITISCH: Mecanum-Rollen durch Schlamm blockiert. Antrieb ausgefallen. ";
      } else if (driveType === 'hover') {
        msg += "WARNUNG: Instabilität beim Anheben der schweren Last. Energieverbrauch kritisch. ";
      } else if (driveType === 'legs') {
        msg += "FEHLER: Bein-Mechanik verliert Balance auf losem Geröll. ";
      } else if (driveType === 'tracks') {
        driveOk = true;
        msg += "ANTRIEB: Kettenantrieb meistert Schlamm und Geröll souverän. ";
      }

      // --- Gripper Logic ---
      if (gripperType === 'vacuum') {
        msg += "FEHLER: Kein Vakuum auf verbeulten/dreckigen Oberflächen. ";
      } else if (gripperType === 'soft') {
        msg += "FEHLER: Soft-Gripper zu schwach für das Gewicht der Container. ";
      } else if (gripperType === 'needle') {
        msg += "KRITISCH: Nadeln beim Kontakt mit Stahlhülle abgebrochen. ";
      } else if (gripperType === 'claw') {
        // Claw is acceptable but Magnetic is better for pure steel
        gripperOk = true;
        msg += "GREIFER: Mechanische Klaue greift fest zu. ";
      } else if (gripperType === 'magnetic') {
        gripperOk = true;
        msg += "GREIFER: Magnet hält die ferromagnetische Last absolut sicher. ";
      }

      if (driveOk && gripperOk) {
        success = true;
        msg = "MISSION ERFOLGREICH! " + msg;
      } else {
        msg = "MISSION GESCHEITERT: " + msg;
      }

      setResult({ success, msg });
      
      if (success) {
        setTimeout(() => {
          setLevelState('SUCCESS');
        }, 2500);
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
            <p className="mb-2">
              Das Getriebe ist optimiert. Jetzt muss Unit-7 in den Außenbereich. 
              Das Einsatzgebiet ist ein altes Depot. Die Aufgabe: Schwere Stahlcontainer sichern und bergen.
            </p>

            <strong className="text-red-400 block mb-2 mt-4">ANFORDERUNG:</strong>
            <p className="mb-2">
              Es ist unklar, ob der Standard-Radantrieb und die Standard-Greifvorrichtungen 
              für diesen Einsatz ausreichen. Bevor eine Konfiguration festgelegt wird, müssen 
              Umgebung und Einsatzbedingungen genau analysiert werden.
            </p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>
              Analysiere das Depot und leite daraus die Anforderungen an Bewegung und Lastaufnahme ab. 
              Wähle anschließend die passende{" "}
              <GlossaryTooltip
                term="Kinematik"
                definition="Lehre der Bewegung von Körpern (hier: Wie sich der Roboter bewegt)."
              />{" "}
              und begründe, wie Antrieb und Greifer auf Basis deiner Analyse angepasst werden sollten.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Konfigurator starten
          </button>
        </div>

        {showDialog && (
          <ReflectionDialog
            senderName="Chefin Bazlen"
            senderTitle="Projektleiterin"
            senderAvatar="👩‍💼"
            recipientName="Du"
            recipientAvatar="👨‍💼"
            message="Sehr gut, dass Sie so schnell hier sind. Sie haben sich die Videoaufnahmen des Depots angesehen. Welche Bedingungen sind dort vorzufinden? Was fällt Ihnen auf?"
            correctAnswer="Vielen Dank für die Einschätzung. Bitte konfigurieren Sie nun den Roboter entsprechend den Anforderungen. Nutzen Sie die Konfigurator-Oberfläche."
            onComplete={handleDialogComplete}
            onBack={() => setShowDialog(false)}
            title="MISSION BRIEFING"
            contextDescription="Analyse des Einsatzgebiets"
            continueButtonText="Zur Konfiguration"
            introType="door-knock"
          />
        )}
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

        <div className="space-y-8">
          
          {/* Drive Selection */}
          <div>
            <h3 className="text-cyan-400 font-bold border-b border-slate-700 pb-2 flex items-center gap-2 mb-4">
               <Cog className="animate-spin-slow" size={20}/> ANTRIEBSSYSTEM
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectionCard 
                type="wheels" title="4x4 Radantrieb" 
                description="Standard. Schnell auf Asphalt, aber geringe Traktion im Schlamm."
                selected={driveType === 'wheels'} onSelect={() => setDriveType('wheels')} 
              />
              <SelectionCard 
                type="tracks" title="Kettenantrieb" 
                description="Hohe Auflagefläche. Ideal für Schlamm & unebenes Gelände. Langsam."
                selected={driveType === 'tracks'} onSelect={() => setDriveType('tracks')} 
              />
              <SelectionCard 
                type="mecanum" title="Mecanum-Räder" 
                description="Omnidirektional (Seitwärtsfahren). Rollen verstopfen leicht bei Schmutz."
                selected={driveType === 'mecanum'} onSelect={() => setDriveType('mecanum')} 
              />
              <SelectionCard 
                type="legs" title="Hexapod-Beine" 
                description="Klettert über hohe Hindernisse. Instabil bei hoher Last. Komplex."
                selected={driveType === 'legs'} onSelect={() => setDriveType('legs')} 
              />
              <SelectionCard 
                type="hover" title="Hover-Turbine" 
                description="Schwebt über Hindernisse. Hoher Energieverbrauch. Instabil bei Last."
                selected={driveType === 'hover'} onSelect={() => setDriveType('hover')} 
              />
            </div>
          </div>

          {/* Gripper Selection */}
          <div>
            <h3 className="text-cyan-400 font-bold border-b border-slate-700 pb-2 flex items-center gap-2 mb-4">
               <MousePointer2 size={20}/> GREIF-MECHANIK
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectionCard 
                type="claw" title="Servo-Klaue" 
                description="Universell. Greift fast alles. Benötigt hohe Kraft für schwere Objekte."
                selected={gripperType === 'claw'} onSelect={() => setGripperType('claw')} 
              />
              <SelectionCard 
                type="magnetic" title="Elektromagnet" 
                description="Maximale Haltekraft für Eisenmetalle. Keine beweglichen Teile."
                selected={gripperType === 'magnetic'} onSelect={() => setGripperType('magnetic')} 
              />
              <SelectionCard 
                type="vacuum" title="Vakuum-Sauger" 
                description="Für glatte Flächen (Glas). Versagt bei Staub, Rost oder Beulen."
                selected={gripperType === 'vacuum'} onSelect={() => setGripperType('vacuum')} 
              />
              <SelectionCard 
                type="soft" title="Soft-Gripper" 
                description="Flexible Finger für empfindliche Objekte (Obst). Zu schwach für Schwerlast."
                selected={gripperType === 'soft'} onSelect={() => setGripperType('soft')} 
              />
              <SelectionCard 
                type="needle" title="Nadel-Greifer" 
                description="Dringt in Stoffe/Schaum ein. Zerstört harte Oberflächen oder bricht."
                selected={gripperType === 'needle'} onSelect={() => setGripperType('needle')} 
              />
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-950/90 p-4 backdrop-blur-sm border-t-cyan-900/50 z-10">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <button 
                onClick={handleSimulate}
                disabled={!driveType || !gripperType || simulating}
                className={`flex-1 w-full py-4 font-bold text-lg rounded uppercase tracking-widest transition-colors ${
                  (!driveType || !gripperType) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                  simulating ? 'bg-yellow-600 text-white animate-pulse' :
                  'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
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