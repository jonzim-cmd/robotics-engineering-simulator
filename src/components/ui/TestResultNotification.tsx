'use client';

import React from 'react';
import { motion } from 'framer-motion';

type TestResultType = 'STALLED' | 'TIMEOUT' | 'SUCCESS';

interface TestResultNotificationProps {
  resultType: TestResultType;
  message: string;
  onClose?: () => void;
}

export const TestResultNotification: React.FC<TestResultNotificationProps> = ({
  resultType,
  message,
  onClose
}) => {
  // Configure appearance based on result type
  const getResultConfig = () => {
    switch (resultType) {
      case 'STALLED':
        return {
          icon: '⚠️',
          title: 'ALARM',
          borderColor: 'border-red-500',
          bgColor: 'bg-red-900/30',
          textColor: 'text-red-400',
          glowColor: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
        };
      case 'TIMEOUT':
        return {
          icon: '🐌',
          title: 'ALARM',
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-900/30',
          textColor: 'text-yellow-400',
          glowColor: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]'
        };
      case 'SUCCESS':
        return {
          icon: '✓',
          title: 'ERFOLG',
          borderColor: 'border-green-500',
          bgColor: 'bg-green-900/30',
          textColor: 'text-green-400',
          glowColor: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]'
        };
    }
  };

  const config = getResultConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-6 ${config.glowColor}`}
    >
      {/* Pulsing glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(255,255,255,0.1)',
            '0 0 40px rgba(255,255,255,0.2)',
            '0 0 20px rgba(255,255,255,0.1)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-lg pointer-events-none"
      />

      {/* Content */}
      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">{config.icon}</div>
          <div>
            <h3 className={`text-xl font-bold ${config.textColor}`}>
              {config.title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-white leading-relaxed mb-4">
          {message}
        </p>

        {/* Close button (optional) */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`w-full py-2 ${config.borderColor} border ${config.bgColor} ${config.textColor} font-semibold rounded hover:opacity-80 transition-opacity`}
          >
            Verstanden
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
