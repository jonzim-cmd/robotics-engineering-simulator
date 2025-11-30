'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossModalProps {
  onClose: () => void;
}

export const BossModal: React.FC<BossModalProps> = ({ onClose }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [isRinging, setIsRinging] = useState(true);
  const contentEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when call is accepted (and content appears)
  useEffect(() => {
    if (callAccepted && contentEndRef.current) {
       // Small delay to allow animation to start/layout to settle
       setTimeout(() => {
         contentEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
       }, 600); // Delay matching the button animation
    }
  }, [callAccepted]);

  const handleAcceptCall = () => {
    setCallAccepted(true);
    setIsRinging(false);
  };

  const handleDeclineCall = () => {
    // Do nothing - the call keeps ringing
    // This adds to the pressure/comedy
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        {!callAccepted ? (
          /* Incoming Call Screen */
          <motion.div
            key="incoming"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: isRinging ? [0, -2, 2, -2, 2, 0] : 0,
              x: isRinging ? [0, -3, 3, -3, 3, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 0.1 },
              x: { duration: 0.5, repeat: Infinity, repeatDelay: 0.1 }
            }}
            className="relative max-w-sm w-full"
          >
            {/* Smartphone Frame */}
            <div className="bg-slate-950 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800 relative overflow-hidden">
              {/* Screen */}
              <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-[2.5rem] overflow-hidden relative aspect-9/19">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-b-3xl z-10 flex items-center justify-center gap-2">
                  <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                </div>

                {/* Call Screen Content */}
                <div className="relative h-full flex flex-col items-center justify-between py-16 px-6 bg-linear-to-br from-red-950/40 via-slate-900 to-slate-900">
                  {/* Caller Info */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    {/* Angry Boss Avatar with pulse */}
                    <motion.div
                      animate={{
                        scale: isRinging ? [1, 1.05, 1] : 1
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="relative"
                    >
                      <div className="text-8xl mb-4 filter drop-shadow-2xl">😡</div>
                      {isRinging && (
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                          className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                        />
                      )}
                    </motion.div>

                    {/* Caller Name */}
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                        Chefin Bazlin
                      </h2>
                      <p className="text-red-400 text-sm font-medium tracking-wider">
                        Head of Engineering
                      </p>
                    </div>

                    {/* Incoming Call Text */}
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-slate-400 text-lg font-light"
                    >
                      Eingehender Anruf...
                    </motion.div>

                    {/* Ringing Icon Animation */}
                    {isRinging && (
                      <motion.div
                        animate={{
                          rotate: [0, -20, 20, -20, 20, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 0.4
                        }}
                        className="text-5xl"
                      >
                        📞
                      </motion.div>
                    )}
                  </div>

                  {/* Call Action Buttons */}
                  <div className="flex items-center justify-around w-full px-4 pb-8">
                    {/* Decline Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeclineCall}
                      className="relative group"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/50 flex items-center justify-center transition-colors">
                        <svg className="w-8 h-8 text-white transform rotate-135" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 group-hover:text-slate-300">Ablehnen</div>
                    </motion.button>

                    {/* Accept Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAcceptCall}
                      className="relative group"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(34, 197, 94, 0.3)',
                          '0 0 40px rgba(34, 197, 94, 0.5)',
                          '0 0 20px rgba(34, 197, 94, 0.3)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/50 flex items-center justify-center transition-colors">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 group-hover:text-slate-300">Annehmen</div>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Phone buttons/details */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </motion.div>
        ) : (
          /* Active Call Screen */
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-sm w-full"
          >
            {/* Smartphone Frame */}
            <div className="bg-slate-950 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800 relative overflow-hidden">
              {/* Screen */}
              <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-[2.5rem] overflow-hidden relative aspect-9/19">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-b-3xl z-10 flex items-center justify-center gap-2">
                  <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                </div>

                {/* Active Call Content */}
                <div className="relative h-full flex flex-col py-16 px-6 bg-linear-to-br from-red-950/40 via-slate-900 to-slate-900 overflow-y-auto">
                  {/* Call Active Header */}
                  <div className="text-center mb-6 space-y-3">
                    <div className="text-6xl mb-2">😡</div>
                    <h2 className="text-2xl font-bold text-white">Chefin Bazlin</h2>
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <span>Anruf aktiv</span>
                    </div>
                  </div>

                  {/* Boss Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 space-y-4 mb-6"
                  >
                    <div className="bg-slate-800/80 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-white leading-relaxed mb-3 text-sm">
                        Wie viele unnötige Testfahrten wollen Sie noch machen?
                      </p>
                      <p className="text-red-300 font-semibold mb-3 text-sm">
                        Sie haben Ihre Credits verbraucht!
                      </p>
                      <p className="text-slate-300 text-sm">
                        Überlegen Sie sich Ihre Einstellungen besser, bevor Sie die nächste Testfahrt starten.
                      </p>
                    </div>

                    {/* Credit Reset Info */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-yellow-900/30 border border-yellow-500/40 rounded-2xl p-3 text-center backdrop-blur-sm"
                    >
                      <p className="text-yellow-300 text-sm">
                        💰 <strong className="text-yellow-400">15</strong> Credits wurden überwiesen
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* End Call Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl uppercase tracking-wider transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 transform rotate-135" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                    Verstanden
                  </motion.button>
                  <div ref={contentEndRef} />
                </div>
              </div>

              {/* Phone buttons/details */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
