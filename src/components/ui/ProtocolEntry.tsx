import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TerminalCard } from './TerminalCard';
import { trackEvent } from '@/app/actions';
import { useGameStore } from '@/store/gameStore';

interface ProtocolEntryProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ProtocolEntry: React.FC<ProtocolEntryProps> = ({ onComplete, onBack }) => {
  const { userId, currentLevel } = useGameStore();
  
  const [actionInput, setActionInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!userId) return;
    
    // Track user input
    trackEvent(userId, currentLevel, 'REFLECTION_SUBMITTED', {
      question: 'PROTOCOL_ENTRY_LEVEL_5',
      action: actionInput,
      reason: reasonInput
    }).catch(console.error);

    setIsSubmitted(true);
  };

  return (
    <TerminalCard title="SYSTEM PROTOKOLLIERUNG" borderColor="cyan" onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="bg-cyan-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Änderungsprotokoll Unit-7</h2>
            <p className="text-slate-400 text-sm">Bitte dokumentieren Sie Ihre Änderungen für die Qualitätssicherung.</p>
          </div>
        </div>

        {/* Input Form */}
        {!isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-cyan-400 font-mono text-sm font-bold mb-2 uppercase">
                Durchgeführte Maßnahme
              </label>
              <textarea
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="z.B. Ich habe..."
                className="w-full bg-slate-950 border border-slate-700 rounded p-4 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all h-24"
              />
            </div>

            <div>
              <label className="block text-cyan-400 font-mono text-sm font-bold mb-2 uppercase">
                Technische Begründung
              </label>
              <div className="text-xs text-slate-500 mb-2">Warum hat diese Maßnahme das Problem gelöst?</div>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="z.B. Weil..."
                className="w-full bg-slate-950 border border-slate-700 rounded p-4 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all h-32"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!actionInput || !reasonInput}
              className={`w-full py-3 font-bold rounded uppercase tracking-widest transition-all ${
                actionInput && reasonInput
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Protokoll Speichern
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-green-400 border-b border-green-500/30 pb-3">
              <div className="bg-green-500/20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-mono font-bold text-lg">PROTOKOLL ÜBERNOMMEN</span>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white block mb-1">Offizielle Lösung:</strong>
                Das verrückte Verhalten des Roboters wurde durch <strong>Signalrauschen (Noise)</strong> verursacht. 
                Durch das Anheben des <strong>Schwellenwerts (Threshold)</strong> werden alle Signale unterhalb einer gewissen Spannung als Rauschen ignoriert.
                Nur noch starke Signale (echte Wände) lösen eine Reaktion aus.
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
            >
              Abschließen
            </button>
          </motion.div>
        )}

      </div>
    </TerminalCard>
  );
};
