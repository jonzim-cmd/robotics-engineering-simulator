'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './TypewriterText';

interface HaraldRefillModalProps {
  currentCredits: number;
  refillTo?: number;
  onClose: () => void;
}

const HARALD_REFILL_TEXT = `*Seufzt schwer*

Sie sind schon wieder hier.

Und lassen Sie mich raten: Sie haben keine Credits mehr und brauchen noch einen Test-Versuch.

*Setzt Brille ab und reibt sich die Nasenwurzel*

Wissen Sie, was das Problem ist? Sie TESTEN einfach wild drauflos. Versuch und Irrtum. Probieren geht über Studieren.

Das geht ins Geld.

JEDER Test kostet. Arbeitskraft. Ressourcen. Zeit. Geld.

In der echten Ingenieursarbeit sitzt man ERST am Schreibtisch und ÜBERLEGT. Man rechnet. Man plant. Und DANN testet man.

Einmal. Maximal zweimal.

Aber gut. Ich gebe Ihnen NOCH EINMAL 50 Credits. Ein letztes Mal.

Diesmal: ERST DENKEN. DANN TESTEN.

Und kommen Sie mir nicht nochmal damit.`;

export const HaraldRefillModal: React.FC<HaraldRefillModalProps> = ({
  currentCredits,
  refillTo = 50,
  onClose
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [rightArrowPresses, setRightArrowPresses] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      setRightArrowPresses(prev => prev + 1);
      if (rightArrowPresses >= 1) {
        setShowFullText(true);
        setTextComplete(true);
      }
    } else {
      setRightArrowPresses(0);
    }
  }, [rightArrowPresses]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-gradient-to-b from-stone-200 to-stone-300 rounded-sm shadow-2xl border-4 border-stone-400 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-400 via-stone-500 to-stone-400 border-b-2 border-stone-600 px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-600 border-2 border-stone-700 flex items-center justify-center text-stone-300 font-bold text-xs rounded">
            HS
          </div>
          <div>
            <h3 className="font-bold text-stone-800" style={{ fontFamily: 'serif' }}>
              Harald Schuldenbremse
            </h3>
            <p className="text-xs text-stone-600">Budgetkontrolle</p>
          </div>
          <div className="ml-auto bg-yellow-100 border-2 border-yellow-600 px-3 py-1 rounded-sm">
            <span className="text-xs font-mono text-yellow-900 font-bold">GENERVT</span>
          </div>
        </div>

        {/* Credits-Info */}
        <div className="bg-yellow-50 border-b-2 border-stone-400 px-6 py-3 flex justify-center items-center gap-8">
          <div className="text-sm" style={{ fontFamily: 'serif' }}>
            <span className="text-stone-600">Aktuell:</span>
            <span className="ml-2 font-bold text-red-700">{currentCredits} CR</span>
          </div>
          <div className="text-2xl text-stone-500">→</div>
          <div className="text-sm" style={{ fontFamily: 'serif' }}>
            <span className="text-stone-600">Aufgefüllt auf:</span>
            <span className="ml-2 font-bold text-green-700">{refillTo} CR</span>
          </div>
        </div>

        {/* Monolog */}
        <div className="p-6 h-80 overflow-y-auto bg-stone-100" style={{ fontFamily: 'serif' }}>
          {showFullText ? (
            <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
              {HARALD_REFILL_TEXT}
            </p>
          ) : (
            <TypewriterText
              text={HARALD_REFILL_TEXT}
              speed={25}
              onComplete={() => setTextComplete(true)}
              className="text-stone-800 leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-300 border-t-2 border-stone-400 px-6 py-4">
          {!showFullText && !textComplete && (
            <p className="text-xs text-stone-600 mb-2" style={{ fontFamily: 'serif' }}>
              <kbd className="px-2 py-0.5 bg-stone-400 border border-stone-500 rounded text-xs">→ →</kbd> zum Überspringen
            </p>
          )}
          <motion.button
            whileHover={{ scale: textComplete || showFullText ? 1.02 : 1 }}
            whileTap={{ scale: textComplete || showFullText ? 0.98 : 1 }}
            onClick={onClose}
            disabled={!textComplete && !showFullText}
            className={`w-full py-3 font-bold rounded-sm uppercase tracking-wide border-2 transition-all ${
              textComplete || showFullText
                ? 'bg-stone-600 hover:bg-stone-500 text-white border-stone-700'
                : 'bg-stone-400 text-stone-600 border-stone-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'serif' }}
          >
            {textComplete || showFullText ? 'Verstanden...' : 'Bitte warten...'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
