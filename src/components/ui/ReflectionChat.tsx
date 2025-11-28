'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReflectionChatProps {
  senderName: string;
  senderTitle: string;
  message: string;
  correctAnswer: string;
  onComplete: () => void;
  // New optional props for modularity
  title?: string;
  contextDescription?: string;
  avatarIcon?: string;
  continueButtonText?: string;
  onBack?: () => void;
}

export const ReflectionChat: React.FC<ReflectionChatProps> = ({
  senderName,
  senderTitle,
  message,
  correctAnswer,
  onComplete,
  title,
  contextDescription,
  avatarIcon = '👩‍💼',
  continueButtonText = 'Weiter',
  onBack
}) => {
  const [messageOpened, setMessageOpened] = useState(false);
  const [isVibrating, setIsVibrating] = useState(true);
  const [input, setInput] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Stop vibration after message is opened
  useEffect(() => {
    if (messageOpened) {
      setIsVibrating(false);
    }
  }, [messageOpened]);

  // Simulate typing indicator before showing correct answer
  useEffect(() => {
    if (isSent) {
      setShowTypingIndicator(true);
      const timer = setTimeout(() => {
        setShowTypingIndicator(false);
        setShowCorrectAnswer(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSent]);

  const handleOpenMessage = () => {
    setMessageOpened(true);
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
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-4 top-4 text-sm text-slate-300 hover:text-white bg-slate-800/70 border border-slate-700 px-3 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">←</span>
          Zurück
        </button>
      )}
      <AnimatePresence mode="wait">
        {!messageOpened ? (
          // Phase 1: Incoming Message Notification
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: isVibrating ? [0, -1, 1, -1, 1, 0] : 0,
              x: isVibrating ? [0, -2, 2, -2, 2, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              rotate: { duration: 0.4, repeat: Infinity, repeatDelay: 0.2 },
              x: { duration: 0.4, repeat: Infinity, repeatDelay: 0.2 }
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

                {/* Lock Screen with Notification */}
                <div className="relative h-full flex flex-col items-center justify-between py-16 px-6 bg-linear-to-br from-cyan-950/40 via-slate-900 to-slate-900">

                  {/* Time Display */}
                  <div className="text-white text-5xl font-thin tracking-wider">
                    {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Message Notification Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    onClick={handleOpenMessage}
                    className="w-full cursor-pointer"
                  >
                    <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
                      {/* Notification Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                          {avatarIcon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">{senderName}</div>
                          <div className="text-slate-400 text-xs">{senderTitle}</div>
                        </div>
                        {title && (
                          <div className="bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{title}</span>
                          </div>
                        )}
                      </div>

                      {/* Message Preview */}
                      <div className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                        {message}
                      </div>
                    </div>

                    {/* Glow Effect */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.98, 1, 0.98]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                      className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl pointer-events-none"
                    />
                  </motion.div>

                  {/* Tap to Open Hint */}
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-slate-400 text-sm font-light flex items-center gap-2"
                  >
                    <span>📱</span>
                    <span>Tippen zum Öffnen</span>
                  </motion.div>
                </div>
              </div>

              {/* Phone Home Button */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </motion.div>
        ) : (
          // Phase 2: Chat Window
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="max-w-2xl w-full h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
          >
        {/* Chat Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-4 shadow-lg">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 flex items-center justify-center text-2xl shadow-lg">
              {avatarIcon}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>

          {/* Sender Info */}
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{senderName}</h3>
            <p className="text-xs text-slate-400">{senderTitle}</p>
          </div>

          {/* Optional Title Badge */}
          {title && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
              <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider">{title}</span>
            </div>
          )}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

          {/* Optional Context Description */}
          {contextDescription && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/10 border-l-4 border-blue-500/50 p-3 rounded-r-lg"
            >
              <p className="text-slate-300 text-sm italic">{contextDescription}</p>
            </motion.div>
          )}

          {/* Incoming Message from Sender */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 items-start"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
              {avatarIcon}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-yellow-400">{senderName}</span>
                <span className="text-xs text-slate-500">jetzt</span>
              </div>
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-md p-4 shadow-lg">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{message}</p>
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
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                  {avatarIcon}
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

          {/* Correct Answer / Technical Explanation */}
          <AnimatePresence>
            {showCorrectAnswer && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
                  {avatarIcon}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-yellow-400">{senderName}</span>
                    <span className="text-xs text-slate-500">jetzt</span>
                  </div>
                  <div className="bg-linear-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/40 rounded-2xl rounded-tl-md p-4 shadow-xl">
                    <div className="flex items-start gap-3 mb-2">
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap ml-9">{correctAnswer}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area or Continue Button */}
        <div className="border-t border-slate-700 bg-slate-900 p-4">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pr-24 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none min-h-20 max-h-[150px] resize-none transition-all"
                    placeholder="Schreibe deine Antwort..."
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
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/30'
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
            ) : showCorrectAnswer ? (
              <motion.button
                key="continue"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
