'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MaterialCardProps {
  name: string;
  density: number;
  stiffness: number;
  color: string;
  description: string;
  cost: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  name,
  density,
  stiffness,
  color,
  description,
  cost
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-900/80 border border-slate-700 rounded p-4 hover:border-cyan-500/50 transition-all"
    >
      {/* Material indicator bar */}
      <div
        className="h-1 w-full rounded mb-3"
        style={{ backgroundColor: color }}
      />

      {/* Material name and cost */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-cyan-400 font-bold font-mono text-sm flex-1">
          {name}
        </h4>
        <div className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-400">
          {cost} CR
        </div>
      </div>

      {/* Technical specs */}
      <div className="space-y-1 mb-3 font-mono text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">DICHTE (ρ):</span>
          <span className="text-white font-bold">{density.toFixed(2)} g/cm³</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">E-MODUL (E):</span>
          <span className="text-white font-bold">{stiffness.toFixed(1)} GPa</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-xs leading-relaxed border-t border-slate-800 pt-2">
        {description}
      </p>
    </motion.div>
  );
};
