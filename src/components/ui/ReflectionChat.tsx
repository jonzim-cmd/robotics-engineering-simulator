'use client';

import React, { useState } from 'react';
import { TerminalCard } from './TerminalCard';
import { motion } from 'framer-motion';

interface ReflectionChatProps {
  senderName: string;
  senderTitle: string;
  message: string;
  correctAnswer: string;
  onComplete: () => void;
}

export const ReflectionChat: React.FC<ReflectionChatProps> = ({
  senderName,
  senderTitle,
  message,
  correctAnswer,
  onComplete
}) => {
  const [input, setInput] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    if (input.trim().length > 0) {
      setIsSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="max-w-2xl w-full">
        <TerminalCard title={`NACHRICHT VON: ${senderName.toUpperCase()}`} borderColor="yellow">
          <div className="space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 pr-2">
            {/* Sender Info */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 text-xl">
                👩‍💼
              </div>
              <div>
                <div className="font-bold text-yellow-400">{senderName}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{senderTitle}</div>
              </div>
            </div>

            {/* Message Bubble */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg rounded-tl-none p-4 text-slate-200 relative ml-4">
              {/* Speech bubble arrow */}
              <div className="absolute top-0 left-[-10px] w-0 h-0 border-t-[10px] border-t-slate-700 border-l-[10px] border-l-transparent rotate-0"></div>
              <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
            </div>

            {/* User Input Area */}
            {!isSent ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-4"
              >
                <label className="block text-xs text-slate-400 font-mono uppercase">Deine Antwort:</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 focus:outline-none min-h-[100px] font-mono text-sm resize-none"
                  placeholder="Schreiben Sie hier Ihre Erklärung..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  disabled={input.trim().length === 0}
                  className={`w-full py-3 rounded font-bold uppercase tracking-widest transition-all ${
                    input.trim().length > 0 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Senden
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* User's sent message */}
                <div className="flex justify-end">
                   <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg rounded-tr-none p-4 text-cyan-100 max-w-[80%] relative mr-2">
                     <p className="whitespace-pre-wrap">{input}</p>
                   </div>
                </div>

                {/* Correct Answer / Feedback */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-900/20 border border-green-500/30 rounded p-4 relative"
                >
                  <div className="flex items-start gap-3">
                     <div className="text-2xl">💡</div>
                     <div className="space-y-2">
                       <div className="font-bold text-green-400 text-sm uppercase tracking-wider">Technische Erklärung</div>
                       <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{correctAnswer}</p>
                     </div>
                  </div>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  onClick={onComplete}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                >
                  Weiter zu Level 2
                </motion.button>
              </motion.div>
            )}
          </div>
        </TerminalCard>
      </div>
    </div>
  );
};
