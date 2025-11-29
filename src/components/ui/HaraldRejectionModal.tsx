'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './TypewriterText';

interface HaraldRejectionModalProps {
  requestedCost: number;
  availableCredits: number;
  onClose: () => void;
  customText?: string;
}

const HARALD_REJECTION_TEXT = `Äh... nein.

Nein, nein, nein.

Sie kommen hier rein und wollen mir erzählen, Sie brauchen einen Premium-Akku für... *schaut auf Zettel* ...60 Credits?

Sie haben 50.

Das ist ein Defizit von 10 Credits. ZEHN.

Wissen Sie, was ich mit 10 Credits machen kann? Drei Kugelschreiber kaufen. Oder einen halben Bürostuhl. Oder GARNICHTS, weil ich diese 10 Credits NICHT HABE.

Ich habe Ihnen beim letzten Mal schon großzügig Mittel bewilligt. Meine Großzügigkeit hat Grenzen. Diese Grenze ist erreicht.

Finden Sie eine günstigere Lösung. Das ist Ingenieursarbeit. Improvisation. Kreativität unter Budgetdruck.

Sie werden mir später danken.

*Tür fällt ins Schloss*`;

export const HaraldRejectionModal: React.FC<HaraldRejectionModalProps> = ({
  requestedCost,
  availableCredits,
  onClose,
  customText
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

  const textToShow = customText || HARALD_REJECTION_TEXT;

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
          <div className="ml-auto bg-red-100 border-2 border-red-600 px-3 py-1 rounded-sm">
            <span className="text-xs font-mono text-red-900 font-bold">ABGELEHNT</span>
          </div>
        </div>

        {/* Budget-Info - Only show if no custom text (standard rejection mode) */}
        {!customText && (
          <div className="bg-red-50 border-b-2 border-stone-400 px-6 py-3 flex justify-between items-center">
            <div className="text-sm" style={{ fontFamily: 'serif' }}>
              <span className="text-stone-600">Angefordert:</span>
              <span className="ml-2 font-bold text-red-700">{requestedCost} CR</span>
            </div>
            <div className="text-sm" style={{ fontFamily: 'serif' }}>
              <span className="text-stone-600">Verfügbar:</span>
              <span className="ml-2 font-bold text-stone-800">{availableCredits} CR</span>
            </div>
            <div className="text-sm" style={{ fontFamily: 'serif' }}>
              <span className="text-stone-600">Defizit:</span>
              <span className="ml-2 font-bold text-red-700">-{requestedCost - availableCredits} CR</span>
            </div>
          </div>
        )}

        {/* Monolog */}
        <div className="p-6 h-80 overflow-y-auto bg-stone-100" style={{ fontFamily: 'serif' }}>
          {showFullText ? (
            <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
              {textToShow}
            </p>
          ) : (
            <TypewriterText
              text={textToShow}
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
