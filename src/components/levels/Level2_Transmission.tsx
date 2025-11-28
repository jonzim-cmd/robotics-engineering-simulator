'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { StalledRampVisualization } from '@/components/ui/StalledRampVisualization';
import { SmartphoneResearch } from '@/components/ui/SmartphoneResearch';
import { Level2TuningCockpit } from '@/components/ui/Level2TuningCockpit';
import { ReflectionCall } from '@/components/ui/ReflectionCall';
import { motion } from 'framer-motion';

const Level2_Transmission: React.FC = () => {
  const {
    advanceLevel,
    setLevelState,
    levelState,
    pushStateHistory,
    popStateHistory,
    setCredits,
    subStep,
    setSubStep
  } = useGameStore();
  const [showText, setShowText] = useState(false);

  // Set initial credits when level starts
  useEffect(() => {
    // Players start Level 2 with 15 credits (as per requirements)
    setCredits(15);
  }, [setCredits]);

  const handleBack = () => {
    // Pop from global history
    popStateHistory();
    // Reset local state
    setShowText(false);
  };

  const handleStart = () => {
    setSubStep(1);
  };

  const handleResearchIntroComplete = () => {
    setSubStep(2);
  };

  const handleResearchComplete = () => {
    // Save state before advancing
    pushStateHistory();
    setLevelState('ACTIVE');
    setSubStep(0);
  };

  const handleShowText = () => {
    setShowText(true);
  };

  if (levelState === 'INTRO') {
    return (
      <>
        <TerminalCard title="SYSTEM STATUS: LIEFERENGPASS - SEKTOR 4" borderColor="yellow" onBack={handleBack}>
          <div className="space-y-4">
            <div className="text-yellow-400 font-bold">SYSTEM MELDUNG:</div>
            <TypewriterText
              text="Ebene 1 Diagnostik: OK. Kritische Situation in Sektor 4 erkannt..."
              speed={20}
            />

            <div className="mt-6">
              <StalledRampVisualization />
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
                  Unit-7 blockiert Sektor 4. Der Anstieg ist zu steil für das aktuelle Getriebe.
                  Motoren überhitzen bei 20° Steigung. Es entsteht Stau – andere Transportroboter mit Waren kommen nicht mehr vorbei.
                </p>

                <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
                <p>
                  Passe das Getriebe an. Wir brauchen mehr{" "}
                  <GlossaryTooltip
                    term="Drehmoment"
                    definition="Drehmoment ist die Drehkraft. Je mehr Drehmoment am Rad ankommt, desto leichter kommt der Transporter eine Steigung hoch."
                  />{" "}
                  am Rad, damit der Transporter die 20°-Rampe hochfahren kann.
                </p>
                <p className="mt-2">
                  Aber Achtung: Wenn du die{" "}
                  <GlossaryTooltip
                    term="Übersetzung"
                    definition="Verhältnis: wie oft sich der Motor dreht, wenn sich das Rad einmal dreht. Größere Übersetzung = mehr Kraft am Rad, aber weniger Geschwindigkeit."
                  />{" "}
                  zu groß wählst, hat der Transporter zwar viel Kraft, fährt aber sehr langsam. Dann braucht er
                  ewig für die Strecke und es kommt ebenfalls zu Stau.
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

        {/* Research Intro */}
        {subStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 20 }}
              className="max-w-2xl w-full"
            >
              <TerminalCard title="VORBEREITUNG" borderColor="cyan">
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded p-4 text-slate-300 leading-relaxed">
                    <p className="mb-4">
                      Bevor du das Getriebe konfigurierst, möchtest du dich absichern.
                    </p>
                    <p className="mb-4">
                      Nach dem letzten Vorfall mit dem Roboterarm hat Chefin Bazlin deutlich gemacht, dass sie sehr genau auf Fehler achtet.
                      Jede falsche Entscheidung könnte Konsequenzen haben.
                    </p>
                    <p className="text-cyan-400 font-medium">
                      Du holst dein Smartphone heraus und recherchierst die wichtigsten Begriffe, um eine fundierte Entscheidung zu treffen.
                    </p>
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleResearchIntroComplete}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]"
                  >
                    Recherche starten
                  </motion.button>
                </div>
              </TerminalCard>
            </motion.div>
          </motion.div>
        )}

        {/* Smartphone Research */}
        {subStep === 2 && (
          <SmartphoneResearch
            searchQuery="Getriebe Drehmoment"
            browserTitle="Suche - Getriebe"
            searchResults={[
              {
                title: "Was ist Drehmoment?",
                content: `Drehmoment beschreibt, wie stark eine Drehkraft ist.
Es geht nicht nur darum, dass sich etwas dreht, sondern wie kräftig.

Stell dir einen Schraubenschlüssel vor:
Wenn der Griff länger ist, kannst du dieselbe Schraube leichter lösen → mehr Drehmoment.

Beim Fahrrad:
Wenn du fest aufs Pedal drückst, übst du Drehmoment auf die Kurbel aus.

Merke:
Viel Drehmoment = Es ist leichter, etwas zu drehen (z.B. ein Rad oder eine Welle).`
              },
              {
                title: "Was ist ein Getriebe?",
                content: `Ein Getriebe besteht meistens aus Zahnrädern, die ineinandergreifen.
Es verbindet den Motor mit den Rädern.

Ein Getriebe kann:
• die Drehzahl ändern (wie schnell sich etwas dreht)
• das Drehmoment ändern (wie kräftig sich etwas dreht)

Beispiel Fahrrad:
Wenn du den Gang wechselst, ändert sich das Verhältnis zwischen kleinem und großem Zahnrad.

Das ist im Prinzip auch ein Getriebe.`
              },
              {
                title: "Was bedeutet Übersetzung?",
                content: `Die Übersetzung beschreibt das Verhältnis der Zahnräder im Getriebe.

Einfach gesagt:
Ein Zahnrad dreht sich schnell, das andere langsam.
Oder umgekehrt.

Beispiel:
Kleines Zahnrad treibt ein großes an →
Das große dreht sich langsamer, hat aber mehr Drehmoment.

Großes Zahnrad treibt ein kleines an →
Das kleine dreht sich schneller, hat aber weniger Drehmoment.

Merke:
Übersetzung bestimmt, wie viel Drehmoment und wie viel Geschwindigkeit an den Rädern ankommt.`
              },
              {
                title: "Kraft oder Geschwindigkeit? – der Tausch",
                content: `Bei Getrieben gibt es immer einen Tausch:
• Mehr Drehmoment am Rad → weniger Geschwindigkeit
• Mehr Geschwindigkeit am Rad → weniger Drehmoment

Beispiele:

Leichter Gang am Fahrrad:
Du kommst den Berg hoch (viel Drehmoment),
aber du bist langsam.

Schwerer Gang:
Du kannst schnell fahren (hohe Geschwindigkeit),
aber es ist schwer, einen Berg hochzukommen (wenig Drehmoment).

Merke:
In Maschinen ist es genauso:
Man kann nicht gleichzeitig maximale Kraft und maximale Geschwindigkeit haben.`
              }
            ]}
            onComplete={handleResearchComplete}
          />
        )}
      </>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <ReflectionCall
        callerName="Chefin Bazlin"
        callerTitle="Head of Engineering"
        callerAvatar="👩‍💼"
        question="Hervorragende Arbeit! Der Roboter schafft die Rampe nun schnell genug. Können Sie mir kurz erklären, welche Einstellungen Sie vorgenommen haben, damit der Roboter jetzt schnell genug hochkommt?"
        correctAnswer="Sie haben also die richtige Balance gefunden:

Das Getriebe musste so eingestellt werden, dass genug Drehmoment am Rad ankommt, um die 20°-Steigung zu bewältigen, aber die Übersetzung durfte nicht zu groß sein, sonst wäre der Transporter zu langsam gewesen.

Eine größere Übersetzung bedeutet mehr Kraft, aber weniger Geschwindigkeit. Sie haben den Sweet Spot gefunden, wo beides ausreichend ist. Genau so funktioniert es!"
        continueButtonText="Nächstes Level"
        onBack={() => {
          setLevelState('ACTIVE');
          setSubStep(0);
        }}
        onComplete={() => advanceLevel()}
      />
    );
  }

  return (
    <TerminalCard title="LEVEL 2: GETRIEBE & ÜBERSETZUNG" borderColor="cyan" onBack={handleBack}>
      <Level2TuningCockpit />
    </TerminalCard>
  );
};

export default Level2_Transmission;
