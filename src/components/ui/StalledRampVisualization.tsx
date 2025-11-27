'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StalledRampVisualization: React.FC = () => {
  const [phase, setPhase] = React.useState<'move' | 'climb' | 'stall' | 'overheat'>('move');
  const [key, setKey] = React.useState(0);

  const restartAnimation = () => {
    setPhase('move');
    setKey(prev => prev + 1);
  };

  React.useEffect(() => {
    const timeline = [
      { delay: 500, nextPhase: 'climb' as const },
      { delay: 2000, nextPhase: 'stall' as const },
      { delay: 3500, nextPhase: 'overheat' as const },
    ];

    const timers = timeline.map(({ delay, nextPhase }) =>
      setTimeout(() => setPhase(nextPhase), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [key]);

  const isStalled = phase === 'stall' || phase === 'overheat';
  const isOverheating = phase === 'overheat';

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded border border-yellow-900/50 p-6 overflow-hidden">
      {/* Title */}
      <div className="text-lg text-yellow-500 font-mono mb-4 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-4">
        <span>!!! TRAFFIC JAM - SECTOR 4 !!!</span>
        <button
          onClick={restartAnimation}
          className="ml-auto text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800/50 rounded"
          title="Animation neu starten"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* GRID Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Main Scene */}
      <div className="flex items-end justify-center h-64 relative mb-20">
        {/* RAMP - Steep incline */}
        <div className="absolute bottom-0 left-0 right-0 h-56 z-0">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Flat ground on left */}
            <rect x="0" y="385" width="200" height="20" fill="rgb(71, 85, 105)" />
            {/* Ramp */}
            <polygon
              points="200,400 800,400 800,100"
              fill="rgb(71, 85, 105)"
              stroke="rgb(100, 116, 139)"
              strokeWidth="3"
            />
            {/* Ramp texture lines */}
            <line x1="300" y1="400" x2="800" y2="175" stroke="rgb(100, 116, 139)" strokeWidth="1" opacity="0.3" />
            <line x1="400" y1="400" x2="800" y2="250" stroke="rgb(100, 116, 139)" strokeWidth="1" opacity="0.3" />
            <line x1="500" y1="400" x2="800" y2="325" stroke="rgb(100, 116, 139)" strokeWidth="1" opacity="0.3" />
          </svg>

          {/* Slope indicator */}
          <div className="absolute top-32 right-16 text-slate-500 font-mono text-xs transform rotate-[-20deg]">
            <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
              20° STEIGUNG
            </div>
          </div>
        </div>

        {/* UNIT-7 HERO ROBOT */}
        <motion.div
          key={key}
          className="absolute bottom-12 z-20"
          initial={{ x: -200 }}
          animate={{
            x: phase === 'move' ? 0 : phase === 'climb' ? 120 : 120,
            y: phase === 'move' ? 0 : phase === 'climb' ? -50 : -50,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Chassis - Main body */}
          <div className="relative">
            <div
              className={`w-32 h-20 rounded-sm relative ${
                isOverheating ? 'bg-red-900/60 border-red-500' : 'bg-cyan-900/60 border-cyan-500'
              } border-4 transition-colors duration-500`}
            >
              {/* Details on chassis */}
              <div className="absolute inset-x-4 top-3 h-2 bg-slate-900/50 rounded" />
              <div className="absolute left-4 bottom-3 w-8 h-8 border-2 border-cyan-600 bg-slate-900/50 flex items-center justify-center">
                <div className="text-xs font-mono text-cyan-400">U7</div>
              </div>

              {/* Overheat pulsing effect */}
              {isOverheating && (
                <motion.div
                  className="absolute -inset-2 border-4 border-red-500/60 rounded-sm"
                  animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}

              {/* Robotic Arm (horizontal - like from Level 1) */}
              <div className="absolute -top-8 right-8 z-30">
                {/* Shoulder Joint */}
                <div className="w-6 h-6 bg-slate-800 border-2 border-cyan-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                </div>

                {/* Upper Arm - horizontal */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-12 bg-slate-700 border-2 border-cyan-600 rounded-sm">
                  <div className="h-full w-1 bg-cyan-600/30 ml-2" />
                </div>

                {/* Elbow Joint */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-800 border-2 border-cyan-600 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                </div>

                {/* Lower Arm - horizontal */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 h-2.5 w-8 bg-slate-700 border-2 border-cyan-600 rounded-sm">
                  <div className="h-full w-0.5 bg-cyan-600/30 ml-1" />
                </div>

                {/* Gripper - horizontal */}
                <div className="absolute left-24 top-1/2 -translate-y-1/2 -mt-1">
                  <div className="h-4 w-6 border-2 border-cyan-600 bg-slate-800 rounded-sm flex flex-row justify-between px-1 py-0.5">
                    <div className="h-full w-1 bg-cyan-500" />
                    <div className="h-full w-1 bg-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Warning symbol */}
              {isStalled && (
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 text-4xl"
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.3, scale: { repeat: Infinity, duration: 1 } }}
                >
                  ⚠
                </motion.div>
              )}

              {/* Smoke particles when overheating */}
              {isOverheating &&
                [...Array(3)].map((_, i) => (
                  <motion.div
                    key={`smoke-${i}`}
                    className="absolute top-0 left-1/2 w-4 h-4 bg-slate-400/40 rounded-full blur-sm"
                    animate={{
                      y: [0, -40, -60],
                      x: [0, (i - 1) * 10, (i - 1) * 15],
                      opacity: [0.6, 0.3, 0],
                      scale: [0.5, 1.5, 2],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.4,
                    }}
                  />
                ))}
            </div>

            {/* Front Wheel */}
            <motion.div
              className="absolute -bottom-4 right-6 w-12 h-12 rounded-full border-4 border-slate-600 bg-slate-800 z-10"
              animate={{
                rotate: isStalled ? [0, 360] : phase === 'move' ? 360 : 180,
              }}
              transition={{
                rotate: isStalled
                  ? { repeat: Infinity, duration: 0.3, ease: 'linear' }
                  : { duration: 1.5, ease: 'linear' },
              }}
            >
              <div className="w-2 h-2 bg-slate-600 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
              <div className="absolute inset-2 border-2 border-slate-700 rounded-full" />

              {/* Overheat glow on wheels */}
              {isOverheating && (
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-orange-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Rear Wheel */}
            <motion.div
              className="absolute -bottom-4 left-6 w-12 h-12 rounded-full border-4 border-slate-600 bg-slate-800 z-10"
              animate={{
                rotate: isStalled ? [0, 360] : phase === 'move' ? 360 : 180,
              }}
              transition={{
                rotate: isStalled
                  ? { repeat: Infinity, duration: 0.3, ease: 'linear' }
                  : { duration: 1.5, ease: 'linear' },
              }}
            >
              <div className="w-2 h-2 bg-slate-600 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
              <div className="absolute inset-2 border-2 border-slate-700 rounded-full" />

              {isOverheating && (
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-orange-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* FOLLOWER BOTS - Coming from behind */}
        <AnimatePresence>
          {isStalled && (
            <>
              {/* Bot 1 */}
              <motion.div
                key={`bot1-${key}`}
                className="absolute bottom-4 z-15"
                initial={{ x: -300 }}
                animate={{ x: -60 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="w-16 h-12 bg-slate-700 border-2 border-yellow-500 rounded relative">
                  <div className="absolute inset-2 border border-yellow-600 rounded-sm" />

                  {/* Frustrated indicator */}
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    !
                  </motion.div>

                  {/* Wheels */}
                  <div className="absolute -bottom-2 left-2 w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800" />
                  <div className="absolute -bottom-2 right-2 w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800" />
                </div>
              </motion.div>

              {/* Bot 2 */}
              <motion.div
                key={`bot2-${key}`}
                className="absolute bottom-4 z-14"
                initial={{ x: -350 }}
                animate={{ x: -130 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="w-14 h-10 bg-slate-700 border-2 border-blue-500 rounded relative">
                  <div className="absolute inset-2 border border-blue-600 rounded-sm" />

                  {/* Question mark */}
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ?
                  </motion.div>

                  {/* Wheels */}
                  <div className="absolute -bottom-2 left-2 w-5 h-5 rounded-full border-2 border-slate-600 bg-slate-800" />
                  <div className="absolute -bottom-2 right-2 w-5 h-5 rounded-full border-2 border-slate-600 bg-slate-800" />
                </div>
              </motion.div>

              {/* Bot 3 - Further back */}
              <motion.div
                key={`bot3-${key}`}
                className="absolute bottom-4 z-13"
                initial={{ x: -400 }}
                animate={{ x: -190 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              >
                <div className="w-12 h-9 bg-slate-700 border-2 border-green-500 rounded relative">
                  <div className="absolute inset-1.5 border border-green-600 rounded-sm" />

                  {/* Frustrated indicator */}
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    !
                  </motion.div>

                  {/* Wheels */}
                  <div className="absolute -bottom-2 left-1.5 w-4 h-4 rounded-full border-2 border-slate-600 bg-slate-800" />
                  <div className="absolute -bottom-2 right-1.5 w-4 h-4 rounded-full border-2 border-slate-600 bg-slate-800" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* CRITICAL Status Text Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-4 right-4 bg-slate-900/90 border-2 border-yellow-700 p-3 rounded font-mono text-sm z-50"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-slate-400 block mb-1">MOTOR STATUS</span>
              <motion.span
                className={`font-bold text-base ${
                  isOverheating ? 'text-red-500' : isStalled ? 'text-yellow-500' : 'text-cyan-400'
                }`}
                animate={
                  isOverheating || isStalled ? { opacity: [1, 0.5, 1] } : {}
                }
                transition={
                  isOverheating || isStalled
                    ? { duration: 0.5, repeat: Infinity }
                    : {}
                }
              >
                {isOverheating
                  ? 'OVERHEATING'
                  : isStalled
                  ? 'STALLED'
                  : phase === 'climb'
                  ? 'STRAINING'
                  : 'NOMINAL'}
              </motion.span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block mb-1">SECTOR STATUS</span>
              <motion.span
                className={`font-bold text-base ${
                  isStalled ? 'text-red-500' : 'text-green-500'
                }`}
                animate={isStalled ? { opacity: [1, 0.5, 1] } : {}}
                transition={
                  isStalled
                    ? { duration: 0.5, repeat: Infinity, delay: 0.25 }
                    : {}
                }
              >
                {isStalled ? 'BLOCKED' : 'CLEAR'}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Flash Effect on overheat */}
      {isOverheating && (
        <motion.div
          className="absolute inset-0 bg-red-900/20 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </div>
  );
};
