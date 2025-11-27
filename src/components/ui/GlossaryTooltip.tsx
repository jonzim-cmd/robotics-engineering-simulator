'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTooltipProps {
  term: string;
  definition: string;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, definition }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span 
      className="relative inline-block cursor-help text-cyan-400 border-b border-cyan-400/50 border-dotted hover:text-cyan-300 hover:border-cyan-300 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {term}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-cyan-500/50 text-slate-200 text-xs rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none block"
          >
            <span className="block font-bold text-cyan-400 mb-1">{term}</span>
            {definition}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/50 transform rotate-45 block"></span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
