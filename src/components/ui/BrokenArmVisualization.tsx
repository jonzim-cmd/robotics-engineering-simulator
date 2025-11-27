'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BrokenArmVisualization: React.FC = () => {
  const [crashInitiated, setCrashInitiated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCrashInitiated(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded border border-red-900/50 p-6 overflow-hidden">
      {/* Title */}
      <div className="text-lg text-red-500 font-mono mb-4 text-center uppercase tracking-widest font-bold">
        !!! CRITICAL SYSTEM FAILURE !!!
      </div>

      {/* GRID Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Main Scene */}
      <div className="flex items-center justify-center h-96 relative">

        {/* ROBOT BASE */}
        <div className="relative z-10 scale-125 -ml-64">
          {/* Base Stand */}
          <div className="w-24 h-32 bg-red-900/40 border-4 border-red-500 rounded-sm relative">
            {/* Base Details */}
            <div className="absolute inset-x-3 top-3 h-2 bg-slate-900/50" />
            <div className="absolute inset-x-6 bottom-6 h-12 border-2 border-red-700 bg-slate-900/50 flex items-center justify-center">
              <motion.div
                className="w-4 h-4 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            </div>

            {/* Massive Overheat Effect */}
            <motion.div
              className="absolute -inset-3 border-4 border-red-500/60 rounded-sm"
              animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </div>

          {/* Shoulder Joint */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-700 border-4 border-red-600 rounded-full z-20 flex items-center justify-center">
            <div className="w-6 h-6 bg-red-900 rounded-full" />

            {/* Joint Sparks */}
            {crashInitiated && (
              <motion.div
                className="absolute w-3 h-3 bg-yellow-400 rounded-full blur-sm"
                animate={{
                  x: [0, 20, 15],
                  y: [0, -20, -35],
                  opacity: [1, 0.6, 0]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
          </div>

          {/* BROKEN ARM - Upper Segment (Stump) */}
          <motion.div
            className="absolute top-2 left-1/2 origin-left z-10"
            animate={{ rotate: crashInitiated ? 20 : 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <div className="absolute left-0 top-0 w-32 h-10 bg-slate-700 border-4 border-red-600 origin-left -translate-y-1/2 rounded-r-none flex items-center">
              <div className="w-full h-2 bg-slate-500/30" />

              {/* Jagged Broken Edge */}
              <div className="absolute -right-4 top-0 bottom-0 w-4 bg-red-600/80" style={{
                clipPath: 'polygon(0 0, 100% 10%, 0 25%, 100% 40%, 0 55%, 100% 70%, 0 85%, 100% 100%)'
              }} />

              {/* Multiple Dramatic Sparks */}
              {crashInitiated && [...Array(5)].map((_, i) => (
                <motion.div
                  key={`spark-upper-${i}`}
                  className="absolute right-0 w-3 h-3 bg-yellow-300 rounded-full blur-sm"
                  animate={{
                    x: [0, 15 + i * 8, 10 + i * 5],
                    y: [0, -15 - i * 8, -30 - i * 15],
                    opacity: [1, 0.7, 0],
                    scale: [1, 1.5, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.3 + i * 0.08,
                    delay: i * 0.08
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* BROKEN ARM - Lower Segment (Falling) */}
          <motion.div
            className="absolute left-32 top-2 w-32 h-10 bg-slate-700 border-4 border-red-600 origin-left -translate-y-1/2 z-10"
            initial={{ rotate: 0, y: 0, x: 0 }}
            animate={{
              rotate: crashInitiated ? 85 : 0,
              y: crashInitiated ? 80 : 0,
              x: crashInitiated ? 20 : 0
            }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.5, delay: 0.15 }}
          >
            {/* Gripper */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-12 border-4 border-slate-500 bg-slate-700 rounded-sm flex flex-col justify-between py-2 px-1">
              <div className="w-full h-2 bg-slate-400" />
              <div className="w-full h-2 bg-slate-400" />
            </div>
          </motion.div>

          {/* CONTAINER - On arm then falling */}
          <motion.div
            className="absolute left-44 -top-16 z-15"
            initial={{ y: 0, rotate: 0 }}
            animate={{
              y: crashInitiated ? 200 : 0,
              rotate: crashInitiated ? -20 : 0
            }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.9, delay: 0.2 }}
          >
            <div className="w-24 h-20 bg-orange-800 border-4 border-orange-600 flex items-center justify-center relative shadow-2xl"
                 style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 95%)' }}>
              {/* Container details - heavily damaged */}
              <div className="absolute inset-3 border-2 border-orange-700"
                   style={{ clipPath: 'polygon(8% 5%, 95% 5%, 90% 90%, 5% 92%)' }} />

              {/* Danger stripes */}
              <div className="absolute inset-0 flex flex-col justify-around p-2">
                <div className="h-2 bg-yellow-500/50" />
                <div className="h-2 bg-yellow-500/50" />
                <div className="h-2 bg-yellow-500/50" />
              </div>

              {/* Dents and damage marks */}
              <div className="absolute top-3 right-3 w-6 h-6 bg-black/60 rounded-full" />
              <div className="absolute bottom-4 left-4 w-4 h-6 bg-black/50" />
              <div className="absolute top-1/2 right-2 w-3 h-10 bg-red-900/80"
                   style={{ transform: 'skewY(-20deg)' }} />
            </div>

            {/* MASSIVE Ground Impact Effect */}
            {crashInitiated && (
              <>
                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-600/50 blur-2xl rounded-full"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{
                    opacity: [0, 0.9, 0.5, 0],
                    scale: [0.3, 2.5, 3.5, 4]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Impact Warning Symbol */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-red-500 text-4xl font-bold"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0.7, 1],
                    scale: [0.5, 1.5, 1.3, 1.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  💥
                </motion.div>
              </>
            )}
          </motion.div>

        </div>

      </div>

      {/* CRITICAL Status Text Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border-2 border-red-700 p-4 rounded font-mono text-base"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-slate-400 block mb-1">MATERIAL STATUS</span>
              <motion.span
                className="text-red-500 font-bold text-lg"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                CRITICAL OVERLOAD
              </motion.span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block mb-1">STRUCTURAL INTEGRITY</span>
              <motion.span
                className="text-red-500 font-bold text-lg"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
              >
                CATASTROPHIC FAILURE
              </motion.span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Screen Shake/Flash Effect */}
      {crashInitiated && (
        <motion.div
          className="absolute inset-0 bg-red-900/20 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0, 0.4, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      )}
    </div>
  );
};
