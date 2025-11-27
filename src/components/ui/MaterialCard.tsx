'use client';

import React from 'react';

interface MaterialCardProps {
  name: string;
  density: number;
  stiffness: number;
  cost: number;
  color: string;
  description: string;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  name,
  density,
  stiffness,
  cost,
  color,
  description
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 p-3 rounded hover:border-slate-600 transition-colors group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full border border-slate-600 shadow-[0_0_5px_rgba(0,0,0,0.5)]" 
            style={{ backgroundColor: color }} 
          />
          <span className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
            {name}
          </span>
        </div>
        <div className="text-xs font-mono bg-slate-900 px-1.5 py-0.5 rounded text-yellow-500 border border-yellow-900/30">
          {cost} CR
        </div>
      </div>

      {/* Technical Data Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mb-2 bg-slate-900/30 p-2 rounded">
        <div className="flex justify-between">
          <span>Dichte:</span>
          <span className="text-slate-200">{density.toFixed(2)} <span className="text-[9px] text-slate-500">g/cm³</span></span>
        </div>
        <div className="flex justify-between">
          <span>E-Modul:</span>
          <span className="text-slate-200">{stiffness.toFixed(1)} <span className="text-[9px] text-slate-500">GPa</span></span>
        </div>
      </div>

      {/* Description */}
      <div className="text-[10px] text-slate-500 italic leading-tight border-t border-slate-800/50 pt-2">
        {description}
      </div>
    </div>
  );
};