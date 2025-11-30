import React, { useState } from 'react';
import { TerminalCard } from './TerminalCard';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface ManualPage {
  title: string;
  content: React.ReactNode;
  image?: React.ReactNode;
}

interface ManualResearchProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ManualResearch: React.FC<ManualResearchProps> = ({ onComplete, onBack }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages: ManualPage[] = [
    {
      title: "Kapitel 1: Wie Roboter 'sehen'",
      content: (
        <div className="space-y-4">
          <p>
            Menschen denken digital: "Da ist eine Wand" (Ja) oder "Da ist keine Wand" (Nein).
          </p>
          <p>
            Sensoren arbeiten aber <strong>analog</strong>. Sie liefern keine klare "Ja/Nein"-Antwort, sondern eine Spannung (Volt), die schwankt.
          </p>
          <div className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-xs text-green-400">
            SENSOR_LOG:<br/>
            0.0V (Nichts)<br/>
            0.1V (Vielleicht Staub?)<br/>
            4.8V (WAND!)<br/>
            0.2V (Nichts)
          </div>
          <p>
            Der Computer muss entscheiden: Ab wie viel Volt ist es eine echte Wand?
          </p>
        </div>
      ),
      image: (
        <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-900 rounded border border-slate-800">
           <path d="M 10 80 L 50 80 L 50 20 L 90 20 L 90 80 L 190 80" stroke="#22c55e" strokeWidth="2" fill="none" />
           <text x="20" y="95" fill="#64748b" fontSize="10">Keine Wand</text>
           <text x="55" y="15" fill="#22c55e" fontSize="10">WAND (5V)</text>
        </svg>
      )
    },
    {
      title: "Kapitel 2: Der Feind - Rauschen (Noise)",
      content: (
        <div className="space-y-4">
          <p>
            In der echten Welt sind Signale nie perfekt. Elektrische Störungen, Vibrationen oder billige Bauteile erzeugen <strong>Rauschen</strong>.
          </p>
          <p>
            Das Signal ist nie genau 0 Volt. Es zittert immer ein bisschen (z.B. zwischen 0V und 0.5V).
          </p>
          <p className="text-yellow-400">
            Das Problem: Wenn der Computer denkt, alles über 0.1V ist eine Wand, dann hält er dieses "Zittern" für ein Hindernis!
          </p>
        </div>
      ),
      image: (
        <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-900 rounded border border-slate-800">
           <path d="M 10 80 L 20 78 L 30 82 L 40 75 L 50 85 L 60 79 L 70 81 L 80 20 L 100 22 L 120 18 L 130 80 L 190 82" stroke="#eab308" strokeWidth="2" fill="none" />
           <line x1="0" y1="70" x2="200" y2="70" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
           <text x="5" y="65" fill="#ef4444" fontSize="10">Falscher Alarm (zu empfindlich)</text>
        </svg>
      )
    },
    {
      title: "Kapitel 3: Die Lösung - Schwellenwert (Threshold)",
      content: (
        <div className="space-y-4">
            <p>
              Um das Rauschen zu ignorieren, definieren wir einen <strong>Schwellenwert (Threshold)</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-2 text-slate-300">
              <li>
                Alles <strong>unter</strong> dem Schwellenwert wird ignoriert (als "0" interpretiert).
              </li>
              <li>
                Alles <strong>über</strong> dem Schwellenwert zählt als Signal (als "1" interpretiert).
              </li>
            </ul>
        </div>
      ),
      image: (
        <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-900 rounded border border-slate-800">
            <path d="M 10 80 L 20 78 L 30 82 L 40 75 L 50 85 L 60 79 L 70 81 L 80 20 L 100 22 L 120 18 L 130 80 L 190 82" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.5"/>
            <line x1="0" y1="50" x2="200" y2="50" stroke="#06b6d4" strokeWidth="2" />
            <text x="5" y="45" fill="#06b6d4" fontSize="10">Guter Schwellenwert</text>
            
            <circle cx="40" cy="75" r="3" fill="gray" />
            <text x="35" y="95" fill="gray" fontSize="8">Ignoriert</text>
            
            <circle cx="100" cy="20" r="3" fill="#22c55e" />
            <text x="90" y="10" fill="#22c55e" fontSize="8">Erkannt!</text>
        </svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(curr => curr - 1);
    }
  };

  return (
    <TerminalCard title="HANDBUCH: UNIT-7 SENSORIK (v2.1)" borderColor="cyan" onBack={onBack}>
      <div className="flex flex-col h-[500px]">
        
        {/* Header / Progress */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <BookOpen size={20} />
            <span className="font-mono font-bold">SEITE {currentPage + 1} / {pages.length}</span>
          </div>
          <div className="flex gap-1">
            {pages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-8 rounded-full transition-colors ${idx === currentPage ? 'bg-cyan-400' : idx < currentPage ? 'bg-cyan-800' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">{pages[currentPage].title}</h2>
              
              {pages[currentPage].image && (
                <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-800/50">
                  {pages[currentPage].image}
                </div>
              )}
              
              <div className="text-slate-300 leading-relaxed text-lg">
                {pages[currentPage].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              currentPage === 0 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-cyan-400 hover:bg-cyan-900/20'
            }`}
          >
            <ArrowLeft size={18} />
            <span className="font-mono font-bold uppercase">Zurück</span>
          </button>

          <button
            onClick={handleNext}
            className={`flex items-center gap-3 px-6 py-3 rounded font-bold uppercase tracking-wider transition-all shadow-lg ${
              currentPage === pages.length - 1
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20'
            }`}
          >
            {currentPage === pages.length - 1 ? (
              <>
                <span>Verstanden</span>
                <CheckCircle size={20} />
              </>
            ) : (
              <>
                <span>Weiter</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

      </div>
    </TerminalCard>
  );
};
