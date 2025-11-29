'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  position?: 'top' | 'right'; // Added position prop
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, definition, position = 'top' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipClasses = position === 'right'
    ? "absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-3 bg-slate-900 border border-cyan-500/50 text-slate-200 text-xs rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none block"
    : "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-cyan-500/50 text-slate-200 text-xs rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none block";

  const pointerClasses = position === 'right'
    ? "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-t border-l border-cyan-500/50 rotate-45 block"
    : "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/50 rotate-45 block";

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
            initial={{ opacity: 0, [position === 'right' ? 'x' : 'y']: 10 }} // Conditional animation
            animate={{ opacity: 1, [position === 'right' ? 'x' : 'y']: 0 }}
            exit={{ opacity: 0, [position === 'right' ? 'x' : 'y']: 5 }}
            className={tooltipClasses}
          >
            <span className="block font-bold text-cyan-400 mb-1">{term}</span>
            {definition}
            <span className={pointerClasses}></span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
