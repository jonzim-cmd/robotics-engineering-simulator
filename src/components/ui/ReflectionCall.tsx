'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReflectionCallProps {
  // Caller info
  callerName: string;
  callerTitle: string;
  callerAvatar?: string;

  // Content
  question: string;
  correctAnswer: string;

  // Callbacks
  onComplete: () => void;

  // Optional customization
  continueButtonText?: string;
}

export const ReflectionCall: React.FC<ReflectionCallProps> = ({
  callerName,
  callerTitle,
  callerAvatar = '👩‍💼',
  question,
  correctAnswer,
  onComplete,
  continueButtonText = 'Weiter'
}) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [isRinging, setIsRinging] = useState(true);
  const [input, setInput] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  // Stop ringing after call is accepted
  useEffect(() => {
    if (callAccepted) {
      setIsRinging(false);
    }
  }, [callAccepted]);

  // Simulate typing indicator before showing reflection
  useEffect(() => {
    if (isSent) {
      setShowTypingIndicator(true);
      const timer = setTimeout(() => {
        setShowTypingIndicator(false);
        setShowReflection(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSent]);

  const handleAcceptCall = () => {
    setCallAccepted(true);
  };

  const handleSend = () => {
    if (input.trim().length > 0) {
      setIsSent(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        {!callAccepted ? (
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
                <div className="relative h-full flex flex-col items-center justify-between py-16 px-6 bg-linear-to-br from-green-950/40 via-slate-900 to-slate-900">
                  {/* Caller Info */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    {/* Caller Avatar with pulse */}
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
                      <div className="text-8xl mb-4 filter drop-shadow-2xl">{callerAvatar}</div>
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
                          className="absolute inset-0 bg-green-500 rounded-full blur-xl"
                        />
                      )}
                    </motion.div>

                    {/* Caller Name */}
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                        {callerName}
                      </h2>
                      <p className="text-green-400 text-sm font-medium tracking-wider">
                        {callerTitle}
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
                  <div className="flex items-center justify-center w-full px-4 pb-8">
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
                      <div className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/50 flex items-center justify-center transition-colors">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                      </div>
                      <div className="text-sm text-slate-300 mt-2 font-semibold">Annehmen</div>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Phone buttons/details */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-2xl w-full max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
          >
            {/* Call Header */}
            <div className="bg-linear-to-r from-green-800 to-green-900 border-b border-green-700 px-6 py-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center text-2xl shadow-lg">
                  {callerAvatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{callerName}</h3>
                  <div className="flex items-center gap-2 text-green-300 text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span>Anruf aktiv</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

              {/* Caller's Question */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                  {callerAvatar}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-green-400">{callerName}</span>
                    <span className="text-xs text-slate-500">jetzt</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-md p-4 shadow-lg">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{question}</p>
                  </div>
                </div>
              </motion.div>

              {/* User's Response */}
              <AnimatePresence>
                {isSent && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 items-start justify-end"
                  >
                    <div className="flex flex-col gap-1 max-w-[80%] items-end">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500">jetzt</span>
                        <span className="text-sm font-semibold text-cyan-400">Du</span>
                      </div>
                      <div className="bg-linear-to-br from-cyan-600 to-cyan-700 rounded-2xl rounded-tr-md p-4 shadow-lg">
                        <p className="text-white leading-relaxed whitespace-pre-wrap">{input}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {showTypingIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                      {callerAvatar}
                    </div>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-md p-4 px-6 shadow-lg">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-slate-500 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-slate-500 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-slate-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Caller's Reflection */}
              <AnimatePresence>
                {showReflection && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                      {callerAvatar}
                    </div>
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-green-400">{callerName}</span>
                        <span className="text-xs text-slate-500">jetzt</span>
                      </div>
                      <div className="bg-linear-to-br from-green-900/60 to-emerald-900/60 border-2 border-green-500/50 rounded-2xl rounded-tl-md p-4 shadow-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">✓</div>
                          <div className="font-bold text-green-300 text-sm uppercase tracking-wider">
                            Verstanden!
                          </div>
                        </div>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{correctAnswer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area or Continue Button */}
            <div className="border-t border-slate-700 bg-slate-900 p-4 shrink-0">
              <AnimatePresence mode="wait">
                {!isSent ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <textarea
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pr-24 text-white placeholder-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none min-h-20 max-h-[150px] resize-none transition-all"
                        placeholder="Erkläre, wie du es gemacht hast..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={input.trim().length === 0}
                        className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          input.trim().length > 0
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/30'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </motion.button>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">Enter</kbd>
                      zum Senden
                    </p>
                  </motion.div>
                ) : showReflection ? (
                  <motion.button
                    key="continue"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider shadow-lg shadow-green-900/30 transition-all"
                  >
                    {continueButtonText}
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
