'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      onComplete();
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white text-slate-900 w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Form Header - Looks like a paper header */}
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
              placeholder="Technischen Sachverhalt hier eintragen..."
              className="w-full min-h-[150px] p-4 bg-white border-2 border-slate-300 rounded-sm focus:border-blue-600 focus:ring-0 focus:outline-none text-slate-800 placeholder-slate-400 font-mono text-sm leading-relaxed resize-y transition-colors"
            />
          </div>

        </div>

        {/* Footer / Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end items-center gap-4">
          <div className="mr-auto text-xs text-slate-400 font-mono">
            Dokument ID: {documentId}
          </div>
          
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
        </div>
      </motion.div>
    </div>
  );
};
