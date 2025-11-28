'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReflectionDialogProps {
  // Dialog participants
  senderName: string;
  senderTitle: string;
  senderAvatar?: string;
  recipientName?: string;
  recipientAvatar?: string;

  // Content
  message: string;
  correctAnswer: string;

  // Callbacks
  onComplete: () => void;

  // Optional customization
  title?: string;
  contextDescription?: string;
  continueButtonText?: string;
}

export const ReflectionDialog: React.FC<ReflectionDialogProps> = ({
  senderName,
  senderTitle,
  senderAvatar = '👷',
  recipientName = 'Du',
  recipientAvatar = '👨‍💼',
  message,
  correctAnswer,
  onComplete,
  title = 'DIALOG',
  contextDescription,
  continueButtonText = 'Weiter'
}) => {
  const [input, setInput] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Simulate typing indicator before showing correct answer
  useEffect(() => {
    if (isSent) {
      setShowTypingIndicator(true);
      const timer = setTimeout(() => {
        setShowTypingIndicator(false);
        setShowCorrectAnswer(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSent]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="max-w-3xl w-full max-h-[95vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-4 md:px-6 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-white truncate">{title}</h3>
              {contextDescription && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{contextDescription}</p>
              )}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 px-2 md:px-3 py-1 rounded-full shrink-0">
              <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider">Dialog</span>
            </div>
          </div>
        </div>

        {/* Dialog Scene - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

          {/* Characters Row - Smaller on mobile */}
          <div className="flex items-end justify-between mb-4 md:mb-6 gap-4">
            {/* Sender (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-1.5 md:gap-2 flex-1"
            >
              <div className="text-4xl md:text-6xl filter drop-shadow-lg">
                {senderAvatar}
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-400 text-xs md:text-sm">{senderName}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider hidden md:block">{senderTitle}</div>
              </div>
            </motion.div>

            {/* Recipient (Right) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-1.5 md:gap-2 flex-1"
            >
              <div className="text-4xl md:text-6xl filter drop-shadow-lg">
                {recipientAvatar}
              </div>
              <div className="text-center">
                <div className="font-bold text-cyan-400 text-xs md:text-sm">{recipientName}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider hidden md:block">Das bist Du</div>
              </div>
            </motion.div>
          </div>

          {/* Dialog Bubbles */}
          <div className="space-y-4 md:space-y-5 relative">

            {/* Sender's Question */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              {/* Speech bubble tail pointing to sender */}
              <div className="absolute -top-2 left-8 md:left-12 w-0 h-0 border-l-12 md:border-l-16 border-l-transparent border-r-12 md:border-r-16 border-r-transparent border-b-12 md:border-b-16 border-b-slate-700"></div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl md:rounded-3xl rounded-tl-none p-3 md:p-5 shadow-xl">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="text-lg md:text-xl shrink-0">{senderAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-yellow-400 font-semibold mb-1 text-sm md:text-base">{senderName}:</div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{message}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User's Response */}
            <AnimatePresence>
              {isSent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative ml-auto max-w-[90%]"
                >
                  {/* Speech bubble tail pointing to recipient */}
                  <div className="absolute -top-2 right-8 md:right-12 w-0 h-0 border-l-12 md:border-l-16 border-l-transparent border-r-12 md:border-r-16 border-r-transparent border-b-12 md:border-b-16 border-b-cyan-700"></div>

                  <div className="bg-linear-to-br from-cyan-700 to-cyan-800 border-2 border-cyan-600 rounded-2xl md:rounded-3xl rounded-tr-none p-3 md:p-5 shadow-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-cyan-200 font-semibold mb-1 text-sm md:text-base">{recipientName}:</div>
                        <p className="text-white leading-relaxed whitespace-pre-wrap text-sm md:text-base">{input}</p>
                      </div>
                      <div className="text-lg md:text-xl shrink-0">{recipientAvatar}</div>
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
                  exit={{ opacity: 0 }}
                  className="relative max-w-[75%]"
                >
                  <div className="absolute -top-2 left-8 md:left-10 w-0 h-0 border-l-12 md:border-l-14 border-l-transparent border-r-12 md:border-r-14 border-r-transparent border-b-12 md:border-b-14 border-b-slate-700"></div>

                  <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl md:rounded-3xl rounded-tl-none p-3 md:p-4 shadow-xl inline-flex items-center gap-2 md:gap-3">
                    <div className="text-lg md:text-xl">{senderAvatar}</div>
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sender's Explanation */}
            <AnimatePresence>
              {showCorrectAnswer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <div className="absolute -top-2 left-8 md:left-12 w-0 h-0 border-l-12 md:border-l-16 border-l-transparent border-r-12 md:border-r-16 border-r-transparent border-b-12 md:border-b-16 border-b-green-700"></div>

                  <div className="bg-linear-to-br from-green-900/60 to-emerald-900/60 border-2 border-green-500/50 rounded-2xl md:rounded-3xl rounded-tl-none p-3 md:p-5 shadow-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-lg md:text-xl shrink-0">{senderAvatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xl md:text-2xl">💡</div>
                          <div className="font-bold text-green-300 text-xs md:text-sm uppercase tracking-wider">
                            {senderName} erklärt:
                          </div>
                        </div>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{correctAnswer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area or Continue Button */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-700">
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2 md:space-y-3"
                >
                  <label className="block text-xs md:text-sm text-slate-400 font-semibold">
                    Deine Antwort:
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3 md:p-4 pr-16 md:pr-20 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none min-h-20 md:min-h-[100px] resize-none transition-all text-sm md:text-base"
                      placeholder="Erkläre, was du darüber weißt..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={input.trim().length === 0}
                      className={`absolute bottom-2 md:bottom-3 right-2 md:right-3 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        input.trim().length > 0
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/30'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">Enter</kbd>
                    zum Senden
                  </p>
                </motion.div>
              ) : showCorrectAnswer ? (
                <motion.button
                  key="continue"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  className="w-full py-4 md:py-5 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider shadow-lg shadow-green-900/30 transition-all text-base md:text-lg"
                >
                  {continueButtonText}
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
