'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RobotArmVisualizationProps {
  deflection?: number; // in mm
  isSafeMass?: boolean;
  isSafeDeflection?: boolean;
  isSimulating?: boolean;
}

export const RobotArmVisualization: React.FC<RobotArmVisualizationProps> = ({
  deflection = 0,
  isSafeMass = true,
  isSafeDeflection = true,
  isSimulating = false
}) => {
  // Calculate rotation angle based on deflection (visual exaggeration for effect)
  // 2mm deflection = ~5 degrees rotation for visibility
  const rotationAngle = Math.min(deflection * 2.5, 30); // Cap at 30 degrees for extreme cases

  const motorColor = isSafeMass ? '#10b981' : '#ef4444'; // green or red
  const precisionColor = isSafeDeflection ? '#10b981' : '#ef4444';

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded border border-slate-800 p-6 overflow-hidden">
      {/* Title */}
      <div className="text-xs text-slate-500 font-mono mb-4 text-center uppercase tracking-widest">
        Roboterarm Simulation
      </div>

      {/* Status LEDs */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: motorColor }}
            animate={{ opacity: isSimulating ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isSimulating ? Infinity : 0 }}
          />
          <span className={isSafeMass ? 'text-green-400' : 'text-red-400'}>
            MOTOR TEMP
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: precisionColor }}
            animate={{ opacity: isSimulating ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isSimulating ? Infinity : 0 }}
          />
          <span className={isSafeDeflection ? 'text-green-400' : 'text-red-400'}>
            PRECISION
          </span>
        </div>
      </div>

      {/* Arm visualization */}
      <div className="flex items-end justify-center h-64 relative">
        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 bg-slate-700 border-2 border-slate-600 rounded-t-lg z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Arm with rotation origin at bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 origin-bottom"
          animate={{
            rotate: rotationAngle
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div
            className={`w-6 h-40 rounded-t-lg border-2 ${
              isSafeDeflection
                ? 'bg-gradient-to-t from-slate-600 to-slate-500 border-slate-400'
                : 'bg-gradient-to-t from-red-900 to-red-700 border-red-500'
            }`}
          >
            {/* Joint markers */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600" />
            <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600" />
          </div>

          {/* Gripper / End effector */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 border-2 border-slate-600 rounded-sm">
            {/* Load indicator */}
            {deflection > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-500 border-2 border-yellow-600 rounded"
              >
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-900">
                  5kg
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Deflection indicator (visual guide) */}
        {deflection > 0.1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <svg width="200" height="160" className="absolute bottom-0 left-0">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 5, 0 10"
                    fill={isSafeDeflection ? '#22d3ee' : '#ef4444'}
                  />
                </marker>
              </defs>
              <path
                d={`M 100 160 Q 100 80, ${100 + rotationAngle * 2} 20`}
                stroke={isSafeDeflection ? '#22d3ee' : '#ef4444'}
                strokeWidth="1"
                fill="none"
                strokeDasharray="3,3"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          </motion.div>
        )}

        {/* Grid background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#475569" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Deflection readout */}
      {deflection > 0.01 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="text-xs text-slate-400 font-mono">
            DURCHBIEGUNG: <span className={isSafeDeflection ? 'text-cyan-400' : 'text-red-400'}>
              {deflection.toFixed(2)} mm
            </span>
            {!isSafeDeflection && (
              <span className="text-red-400 ml-2">(Limit: 2.00 mm)</span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
