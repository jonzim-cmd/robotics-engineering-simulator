'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TerminalCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  borderColor?: 'cyan' | 'red' | 'yellow' | 'green';
  onBack?: () => void;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({ 
  children, 
  title, 
  className,
  borderColor = 'cyan',
  onBack
}) => {
  const colors = {
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]',
    red: 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    yellow: 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]',
    green: 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]',
  };

  const titleColors = {
    cyan: 'bg-cyan-900/50 text-cyan-400 border-b-cyan-500/30',
    red: 'bg-red-900/50 text-red-400 border-b-red-500/30',
    yellow: 'bg-yellow-900/50 text-yellow-400 border-b-yellow-500/30',
    green: 'bg-green-900/50 text-green-400 border-b-green-500/30',
  };

  return (
    <div className={cn(
      "relative border bg-slate-950/80 backdrop-blur-sm rounded-sm overflow-hidden transition-all duration-300",
      colors[borderColor],
      className
    )}>
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-size-[100%_4px,3px_100%]" />
      
      {title && (
        <div className={cn(
          "px-4 py-1 text-xs font-mono uppercase tracking-widest border-b z-10 relative flex items-center justify-between",
          titleColors[borderColor]
        )}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
              borderColor === 'cyan' ? 'bg-cyan-400' : 
              borderColor === 'red' ? 'bg-red-400' : 
              borderColor === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            {title}
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="text-xs hover:underline opacity-70 hover:opacity-100 flex items-center"
            >
              <span className="mr-1">«</span> ZURÜCK
            </button>
          )}
        </div>
      )}
      <div className="p-6 relative z-10">
        {children}
      </div>

      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${borderColor === 'cyan' ? 'border-cyan-500' : borderColor === 'red' ? 'border-red-500' : 'border-gray-500'} `} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${borderColor === 'cyan' ? 'border-cyan-500' : borderColor === 'red' ? 'border-red-500' : 'border-gray-500'} `} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${borderColor === 'cyan' ? 'border-cyan-500' : borderColor === 'red' ? 'border-red-500' : 'border-gray-500'} `} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${borderColor === 'cyan' ? 'border-cyan-500' : borderColor === 'red' ? 'border-red-500' : 'border-gray-500'} `} />
    </div>
  );
};
