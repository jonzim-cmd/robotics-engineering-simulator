'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { trackEvent } from '@/app/actions';

interface InsuranceFormProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const InsuranceForm: React.FC<InsuranceFormProps> = ({
  onComplete,
  onBack
}) => {
  const { userId, currentLevel } = useGameStore();
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentId] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase());
  
  // Animation state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Solution state
  const [showSolution, setShowSolution] = useState(false);

  const solutionRef = useRef<HTMLDivElement>(null); // Ref for the solution section

  useEffect(() => {
    if (showSolution && solutionRef.current) {
      // Delay scrolling slightly to allow animation to complete
      setTimeout(() => {
        solutionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); 
    }
  }, [showSolution]);

  const handleSubmit = async () => {
    if (!explanation.trim()) return;

    setIsSubmitting(true);

    if (userId) {
      await trackEvent(userId, currentLevel, 'INSURANCE_FORM_SUBMITTED', {
        explanation: explanation
      });
    }

    // Simulate processing delay for realism
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSolution(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-4 top-4 text-sm text-slate-300 hover:text-white bg-slate-800/70 border border-slate-700 px-3 py-2 rounded flex items-center gap-2 transition-colors z-50"
        >
          <span className="text-lg">←</span>
          Zurück
        </button>
      )}

      <AnimatePresence mode="wait">
        {!isNotificationOpen ? (
          <motion.div
            key="email-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="relative cursor-pointer group w-96"
            onClick={() => setIsNotificationOpen(true)}
          >
            {/* Email Notification Card */}
            <div className="bg-slate-800 rounded-lg shadow-2xl border-2 border-blue-600/50 relative overflow-hidden p-6 text-white transform transition-transform group-hover:scale-105">
               {/* Header */}
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <span className="text-3xl text-blue-400">📧</span>
                   <h3 className="font-bold text-lg text-blue-200">NEUE NACHRICHT</h3>
                 </div>
                 <span className="text-xs text-slate-400">Jetzt</span>
               </div>
               
               {/* Sender and Subject */}
               <div className="mb-4">
                 <p className="text-sm text-slate-300">Von: <span className="font-semibold">Dr. Evelyn Togba (Versicherung)</span></p>
                 <p className="text-base font-semibold text-white mt-1">Wichtig: Schadenverhütungs-Protokoll</p>
               </div>
               
               {/* Call to Action Button */}
               <motion.button
                 whileHover={{ scale: 1.02, backgroundColor: '#3b82f6' }}
                 whileTap={{ scale: 0.98 }}
                 className="w-full bg-blue-700 text-white py-3 rounded-md font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-blue-500/30 transition-all"
               >
                 Nachricht öffnen
               </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-white text-slate-900 w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Form Header */}
            <div className="bg-slate-100 border-b-2 border-slate-300 p-8 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-wide text-slate-800 uppercase">
                  Schadenverhütungs-Protokoll
                </h1>
                <p className="text-sm text-slate-500 font-mono mt-1">
                  Formular V-204-B • Sektor 7 • Robotik-Abteilung
                </p>
              </div>
              <div className="border-2 border-slate-800 p-2 px-4 transform -rotate-2 opacity-80">
                <span className="font-bold text-red-700 text-sm uppercase block text-center leading-none">
                  Priorität
                </span>
                <span className="font-black text-2xl text-red-700 block text-center">
                  HOCH
                </span>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 overflow-y-auto flex-1 font-sans space-y-8">
              
              {/* Section 1: Incident */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1. Gemeldeter Vorfall
                </h2>
                <p className="text-slate-800 font-medium leading-relaxed">
                  Container erschlägt Hund, da Greifer aufgrund des Spannungsverlusts in der Steuereinheit versagt hat.
                </p>
              </div>

              {/* Section 2: Measure */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  2. Beschlossene Präventionsmaßnahme
                </h2>
                <div className="flex items-center gap-3 text-slate-800">
                  <div className="text-green-600 text-xl">☑</div>
                  <p className="font-medium">
                    Einsatz eines 12V-Akkus in Kombination mit einem Stützkondensator.
                  </p>
                </div>
              </div>

              {/* Section 3: Justification (Input) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  3. Technische Begründung (Pflichtfeld)
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Erklären Sie ausführlich, warum diese Kombination einen erneuten Spannungsabfall in der CPU-Einheit verhindert.
                </p>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  readOnly={showSolution}
                  placeholder="Technischen Sachverhalt hier eintragen..."
                  className={`w-full min-h-[150px] p-4 bg-white border-2 rounded-sm focus:ring-0 focus:outline-none text-slate-800 font-mono text-sm leading-relaxed resize-y transition-colors ${
                    showSolution 
                      ? 'border-green-500 bg-green-50/50 text-slate-600'
                      : 'border-slate-300 focus:border-blue-600 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Section 4: Solution (Conditional) */}
              <AnimatePresence>
                {showSolution && (
                  <motion.div
                    ref={solutionRef} // Attach ref here
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                     <div className="bg-green-50 border-2 border-green-200 p-6 rounded-sm">
                        <h3 className="text-green-800 font-bold uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                           <span className="text-xl">✓</span> Musterlösung der Fachabteilung
                        </h3>
                        <p className="text-green-900 font-medium leading-relaxed italic">
                           &quot;Wenn der Motor startet, wird kurz eine sehr hohe Stromstärke benötigt. Die wird aus dem Akku gezogen, aber auch aus der Steuereinheit (CPU), wenn kein Kondensator dazwischen ist. Der Kondensator stellt sicher, dass die CPU in diesem Moment immer genug Spannung hat, damit sie sich nicht abschaltet.&quot;
                        </p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Footer / Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end items-center gap-4">
              <div className="mr-auto text-xs text-slate-400 font-mono">
                Dokument ID: {documentId}
              </div>
              
              {!showSolution ? (
                <button
                  onClick={handleSubmit}
                  disabled={!explanation.trim() || isSubmitting}
                  className={`
                    px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm transition-all
                    ${!explanation.trim() || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:shadow-blue-900/20 transform hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isSubmitting ? 'Wird verarbeitet...' : 'Protokoll unterzeichnen'}
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-sm rounded-sm shadow-lg hover:shadow-green-900/20 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Bestätigen & Weiter <span className="text-lg">→</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
