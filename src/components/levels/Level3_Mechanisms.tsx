'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { Level3_TerrainViewer } from './Level3_TerrainViewer';
import { Level3_ComponentPreview } from './Level3_ComponentPreview';
import { ReflectionDialog } from '@/components/ui/ReflectionDialog';
import { HaraldDialog } from '@/components/ui/HaraldDialog';
import { motion } from 'framer-motion';
import { Cog, MousePointer2 } from 'lucide-react';

// Define types for components
type DriveType = 'wheels' | 'tracks' | 'legs' | 'mecanum' | 'hover';
type GripperType = 'claw' | 'vacuum' | 'magnetic' | 'soft' | 'needle';

// Cost definitions
const DRIVE_COSTS: Record<DriveType, number> = {
  wheels: 120,
  tracks: 350, // Expensive but correct
  mecanum: 200,
  legs: 500,
  hover: 800
};

const GRIPPER_COSTS: Record<GripperType, number> = {
  claw: 150,
  vacuum: 180,
  magnetic: 300, // Expensive but correct
  soft: 250,
  needle: 120
};

interface SelectionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  type: DriveType | GripperType;
  cost?: number;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ selected, onSelect, title, description, type, cost }) => (
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
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className={`font-bold text-lg ${selected ? 'text-cyan-400' : 'text-slate-200'}`}>{title}</div>
        {cost !== undefined && (
          <div className={`text-xs font-mono px-2 py-1 rounded ${selected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
            {cost} CR
          </div>
        )}
      </div>
      <div className="text-sm text-slate-400 leading-relaxed">{description}</div>
    </div>
  </button>
);

const Level3_Mechanisms: React.FC = () => {
  const { advanceLevel, setLevelState, levelState, pushStateHistory, popStateHistory, setSubStep, credits, addCredits, removeCredits } = useGameStore();
  const [driveType, setDriveType] = useState<DriveType | null>(null);
  const [gripperType, setGripperType] = useState<GripperType | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string; needsFunding?: boolean } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showHaraldDialog, setShowHaraldDialog] = useState(false);

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
    // Smooth transition to top of configurator
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSimulate = () => {
    if (!driveType || !gripperType) return;
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      // Mission: Rough Terrain (Mud/Rocks) + Heavy Ferromagnetic Crates
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

      // Calculate total cost
      const totalCost = DRIVE_COSTS[driveType] + GRIPPER_COSTS[gripperType];
      const canAfford = credits >= totalCost;

      if (!driveOk || !gripperOk) {
        // Scenario A: Incorrect Selection
        msg = "MISSION GESCHEITERT: " + msg;
        setResult({ success: false, msg });
      } else if (canAfford) {
        // Scenario B: Correct Selection + Can Afford
        msg = "MISSION ERFOLGREICH! " + msg;
        removeCredits(totalCost);
        setResult({ success: true, msg });
        setTimeout(() => {
          setLevelState('SUCCESS');
        }, 2500);
      } else {
        // Scenario C: Correct Selection + Cannot Afford
        // Create a detailed justification for why this configuration is optimal
        let justification = "";
        if (driveType === 'tracks') {
          justification += "Der Kettenantrieb sorgt dafür, dass der Roboter auch auf schlammigem und unebenem Boden gut fährt und nicht so leicht rutscht. ";
        }
        if (gripperType === 'magnetic') {
          justification += "Der Elektromagnet kann schwere Stahlcontainer aus Metall sicher anheben.";
        } else if (gripperType === 'claw') {
          justification += "Die mechanische Klaue kann viele verschiedene schwere Lasten sicher festhalten.";
        }

        msg = "OPTIMAL|KONFIGURATION OPTIMAL. SYSTEM BEREIT.\n\n" + justification + "\n\nERROR: INSUFFICIENT CREDITS.\n\nBenötigt: " + totalCost + " CR | Verfügbar: " + credits + " CR";
        setResult({ success: false, msg, needsFunding: true });
      }

      setSimulating(false);
    }, 1500);
  };

  const handleHaraldApproval = () => {
    setShowHaraldDialog(false);

    // Calculate shortfall and grant only what's needed + small buffer
    if (driveType && gripperType) {
      const totalCost = DRIVE_COSTS[driveType] + GRIPPER_COSTS[gripperType];
      const shortfall = totalCost - credits;

      // Grant shortfall + 50 credits buffer
      if (shortfall > 0) {
        addCredits(shortfall + 50);
      }

      // Now purchase the parts
      removeCredits(totalCost);
    }

    // Set success
    setLevelState('SUCCESS');
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
                description="Standard (z.B. Auto). Optimiert für hohe Endgeschwindigkeit und ruhigen Lauf bei direkter Kraftübertragung."
                selected={driveType === 'wheels'} onSelect={() => setDriveType('wheels')}
                cost={DRIVE_COSTS.wheels}
              />
              <SelectionCard
                type="tracks" title="Kettenantrieb"
                description="Große Kontaktfläche. Optimiert für weiche und anspruchsvolle Oberflächen. Langsam."
                selected={driveType === 'tracks'} onSelect={() => setDriveType('tracks')}
                cost={DRIVE_COSTS.tracks}
              />
              <SelectionCard
                type="mecanum" title="Mecanum-Räder"
                description="Ermöglicht Seitwärtsbewegungen. Benötigt zwingend gleichmäßigen Bodenkontakt. Die offene Rollenmechanik verstopft leicht."
                selected={driveType === 'mecanum'} onSelect={() => setDriveType('mecanum')}
                cost={DRIVE_COSTS.mecanum}
              />
              <SelectionCard
                type="legs" title="Hexapod-Beine"
                description="Klettert über hohe Hindernisse. Instabil bei Belastung. Komplex."
                selected={driveType === 'legs'} onSelect={() => setDriveType('legs')}
                cost={DRIVE_COSTS.legs}
              />
              <SelectionCard
                type="hover" title="Hover-Turbine"
                description="Schwebt über Hindernisse. Hoher Energieverbrauch. Instabil bei Belastung."
                selected={driveType === 'hover'} onSelect={() => setDriveType('hover')}
                cost={DRIVE_COSTS.hover}
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
                cost={GRIPPER_COSTS.claw}
              />
              <SelectionCard
                type="magnetic" title="Elektromagnet"
                description="Maximale Haltekraft für magnetische Stoffe. Keine beweglichen Teile."
                selected={gripperType === 'magnetic'} onSelect={() => setGripperType('magnetic')}
                cost={GRIPPER_COSTS.magnetic}
              />
              <SelectionCard
                type="vacuum" title="Vakuum-Sauger"
                description="Für glatte Flächen. Versagt bei Staub, Rost oder Beulen."
                selected={gripperType === 'vacuum'} onSelect={() => setGripperType('vacuum')}
                cost={GRIPPER_COSTS.vacuum}
              />
              <SelectionCard
                type="soft" title="Soft-Gripper"
                description="Flexible Finger für empfindliche Objekte. Hohe Kräfte nicht möglich."
                selected={gripperType === 'soft'} onSelect={() => setGripperType('soft')}
                cost={GRIPPER_COSTS.soft}
              />
              <SelectionCard
                type="needle" title="Nadel-Greifer"
                description="Dringt in Stoffe ein. Zerstört harte Oberflächen oder bricht."
                selected={gripperType === 'needle'} onSelect={() => setGripperType('needle')}
                cost={GRIPPER_COSTS.needle}
              />
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-950/90 p-4 backdrop-blur-sm border-t-cyan-900/50 z-10">
          {/* Budget Display */}
          <div className="mb-4 flex items-center justify-between gap-4 p-3 bg-slate-900/70 border border-slate-700 rounded">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">Verfügbare Credits:</div>
              <div className="text-xl font-bold font-mono text-cyan-400">{credits} CR</div>
            </div>
            {driveType && gripperType && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-400">Gesamtkosten:</div>
                <div className={`text-xl font-bold font-mono ${credits >= (DRIVE_COSTS[driveType] + GRIPPER_COSTS[gripperType]) ? 'text-green-400' : 'text-red-400'}`}>
                  {DRIVE_COSTS[driveType] + GRIPPER_COSTS[gripperType]} CR
                </div>
              </div>
            )}
          </div>

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
                <div className="whitespace-pre-wrap">
                  {result.msg.includes('OPTIMAL|') ? (
                    // Split message into optimal part (green) and error part (red)
                    <>
                      {result.msg.split('OPTIMAL|')[1].split('\n\nERROR:')[0].split('\n').map((line, idx) => (
                        <div key={idx} className={idx === 0 ? 'text-green-400 font-bold' : 'text-slate-300 text-sm mt-2'}>
                          {line}
                        </div>
                      ))}
                      <div className="text-red-400 font-bold mt-4">
                        ERROR: INSUFFICIENT CREDITS.
                      </div>
                      <div className="text-red-400 text-sm mt-2">
                        {result.msg.split('ERROR: INSUFFICIENT CREDITS.\n\n')[1]}
                      </div>
                    </>
                  ) : (
                    result.msg
                  )}
                </div>
                {result.needsFunding && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setShowHaraldDialog(true)}
                    className="mt-4 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded uppercase tracking-wide transition-colors"
                  >
                    Termin mit Finanzbuchhalter Harald Schuldenbremse vereinbaren
                  </motion.button>
                )}
             </motion.div>
          )}
        </div>

      </TerminalCard>

      {/* Harald Dialog */}
      {showHaraldDialog && (
        <HaraldDialog
          onApproved={handleHaraldApproval}
          onCancel={() => setShowHaraldDialog(false)}
          totalCost={driveType && gripperType ? DRIVE_COSTS[driveType] + GRIPPER_COSTS[gripperType] : 0}
        />
      )}
    </div>
  );
};

export default Level3_Mechanisms;