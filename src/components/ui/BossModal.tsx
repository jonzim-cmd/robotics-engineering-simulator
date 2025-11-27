'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BossModalProps {
  onClose: () => void;
}

export const BossModal: React.FC<BossModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-slate-900 border-4 border-red-500 rounded-lg max-w-md w-full p-6 shadow-2xl"
      >
        {/* Angry Boss Icon */}
        <div className="text-center mb-4">
          <div className="text-7xl mb-2">😡</div>
          <h2 className="text-2xl font-bold text-red-400">Chefin Bazlin</h2>
          <div className="text-sm text-slate-400">Head of Engineering</div>
        </div>

        {/* Boss Message */}
        <div className="bg-slate-800 border border-red-500/30 rounded p-4 mb-6">
          <p className="text-white leading-relaxed mb-3">
            Wie viele unnötige Testfahrten wollen Sie noch machen?
          </p>
          <p className="text-red-300 font-semibold mb-3">
            Sie haben Ihre Credits verbraucht!
          </p>
          <p className="text-slate-300">
            Überlegen Sie sich Ihre Einstellungen besser, bevor Sie die nächste Testfahrt starten.
          </p>
        </div>

        {/* Credit Reset Info */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 mb-4 text-center">
          <p className="text-yellow-300 text-sm">
            💰 <strong className="text-yellow-400">15</strong> Credits wurden überwiesen
          </p>
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded uppercase tracking-wider transition-colors"
        >
          Verstanden
        </motion.button>
      </motion.div>
    </div>
  );
};
