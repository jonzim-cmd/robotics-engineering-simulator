'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrownoutVisualizationProps {
  onAnimationComplete?: () => void;
}

type AnimationPhase = 'positioning' | 'motor_start' | 'voltage_drop_1' | 'voltage_drop_2' | 'voltage_drop_3' | 'voltage_drop_4' | 'brownout' | 'drop' | 'error';

export const BrownoutVisualization: React.FC<BrownoutVisualizationProps> = ({
  onAnimationComplete
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('positioning');
  const [key, setKey] = useState(0);

  const restartAnimation = () => {
    setPhase('positioning');
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    const timeline: { delay: number; nextPhase: AnimationPhase }[] = [
      { delay: 1500, nextPhase: 'motor_start' },      // 1.5s: Motor startet
      { delay: 2000, nextPhase: 'voltage_drop_1' },   // 2.0s: 11.8V
      { delay: 2500, nextPhase: 'voltage_drop_2' },   // 2.5s: 11.4V
      { delay: 3000, nextPhase: 'voltage_drop_3' },   // 3.0s: 11.2V
      { delay: 3500, nextPhase: 'voltage_drop_4' },   // 3.5s: 10.9V
      { delay: 4000, nextPhase: 'brownout' },         // 4.0s: 3.6V CRASH
      { delay: 4500, nextPhase: 'drop' },             // 4.5s: Drop
      { delay: 6000, nextPhase: 'error' },            // 6.0s: Error logged
    ];

    const timers = timeline.map(({ delay, nextPhase }) =>
      setTimeout(() => {
        setPhase(nextPhase);
        if (nextPhase === 'error' && onAnimationComplete) {
          setTimeout(onAnimationComplete, 500);
        }
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [key, onAnimationComplete]);

  const isBrownout = phase === 'brownout' || phase === 'drop' || phase === 'error';
  const isDropped = phase === 'drop' || phase === 'error';
  const isVoltageDropPhase = phase === 'voltage_drop_1' || phase === 'voltage_drop_2' || phase === 'voltage_drop_3' || phase === 'voltage_drop_4';
  const isSevereVoltageDrop = phase === 'voltage_drop_3' || phase === 'voltage_drop_4';
  const isNormalPhase = phase === 'positioning' || phase === 'motor_start';

  // Roboter-Position beim Fahren
  const robotXOffset = phase === 'positioning' ? -20 : 0;

  return (
    <div className="relative w-full bg-slate-950/50 rounded border border-red-900/50 p-6 overflow-hidden" style={{ minHeight: '400px' }}>
      {/* Titel mit Restart-Button */}
      <div className="text-lg text-red-500 font-mono mb-4 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-4">
        <span>!!! VORFALL REPLAY !!!</span>
        <button
          onClick={restartAnimation}
          className="ml-auto text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800/50 rounded"
          title="Animation neu starten"
        >
          {/* Restart Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Hauptszene */}
      <div className="flex items-end justify-center relative" style={{ height: '280px' }}>

        {/* Boden/Palette */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-800 border-t-2 border-slate-600">
          <div className="absolute inset-x-1/4 top-0 h-full bg-yellow-900/30 border-x border-yellow-700">
            <div className="text-center text-yellow-600 text-xs font-mono mt-1">ENTLADEZONE</div>
          </div>
        </div>

        {/* Hund der Chefin (wird erschlagen) */}
        <motion.div
          key={`dog-${key}`}
          className="absolute bottom-8 text-4xl"
          initial={{ left: '50%', x: '-50%' }}
          animate={{
            scale: isDropped ? 0 : 1,
            opacity: isDropped ? 0 : 1,
            y: isDropped ? 10 : 0
          }}
          transition={{
            duration: 0.3,
            delay: isDropped ? 0.2 : 0
          }}
        >
          🐕
        </motion.div>

        {/* Hund flach (erschlagen) - erscheint nach Impact */}
        {isDropped && (
          <motion.div
            initial={{ opacity: 0, scaleY: 1 }}
            animate={{ opacity: 1, scaleY: 0.3 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl"
          >
            🐕
          </motion.div>
        )}

        {/* Unit-7 Roboter (vereinfacht, von oben hängend) */}
        <motion.div
          className="absolute top-4"
          initial={{ left: '50%', x: '-50%' }}
          animate={{
            x: `calc(-50% + ${robotXOffset}px)`
          }}
          transition={{ duration: 1 }}
        >
          {/* Schiene */}
          <div className="w-48 h-3 bg-slate-700 border border-slate-600 rounded" />

          {/* Greifer-Arm-Container (bewegt sich mit dem Roboter) */}
          <div className="relative mx-auto w-4">
            {/* Vertikaler Arm - kürzer */}
            <div className="w-4 h-16 bg-slate-600 border border-slate-500 mx-auto" />

            {/* Greifer */}
            <motion.div
              className="relative"
              animate={{
                scaleX: isDropped ? 1.5 : 1 // Greifer öffnet sich
              }}
            >
              <div className="w-16 h-4 bg-cyan-800 border border-cyan-600 -ml-6 flex justify-between px-1">
                <motion.div
                  className="w-2 h-8 bg-cyan-700 border border-cyan-500 -mb-4"
                  animate={{ rotate: isDropped ? -30 : 0 }}
                  style={{ originY: 0 }}
                />
                <motion.div
                  className="w-2 h-8 bg-cyan-700 border border-cyan-500 -mb-4"
                  animate={{ rotate: isDropped ? 30 : 0 }}
                  style={{ originY: 0 }}
                />
              </div>

              {/* Container (hängt distal am Greifer, direkt unter den Greiferfingern) */}
              <motion.div
                key={`container-${key}`}
                className="absolute left-1/2 -translate-x-1/2"
                initial={{ top: -4 }}
                animate={{
                  top: isDropped ? 160 : -4,
                  rotate: isDropped ? -8 : 0
                }}
                transition={{
                  type: isDropped ? "spring" : "tween",
                  bounce: 0.3,
                  duration: isDropped ? 0.5 : 0.3
                }}
              >
                <div className="w-20 h-16 bg-orange-800 border-2 border-orange-600 flex items-center justify-center relative">
                  <div className="text-orange-400 font-mono text-xs font-bold">200kg</div>
                  {/* Danger stripes */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 10px)'
                  }} />
                </div>

                {/* Impact-Effekt */}
                {isDropped && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0.8, 0], scale: 2 }}
                    transition={{ duration: 0.8 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 rounded-full blur-xl"
                  />
                )}
              </motion.div>
            </motion.div>

            {/* Status-LED */}
            <motion.div
              className={`absolute -right-8 top-0 w-3 h-3 rounded-full ${
                isBrownout ? 'bg-red-500' : 'bg-green-500'
              }`}
              animate={isBrownout ? { opacity: [1, 0, 1, 0, 1] } : {}}
              transition={{ duration: 0.3, repeat: isBrownout ? 3 : 0 }}
            />
          </div>
        </motion.div>

        {/* Glitch-Overlay bei Brownout */}
        <AnimatePresence>
          {phase === 'brownout' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0.5, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cyan-500/20 z-30 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status-Terminal unten - TIEFER PLATZIERT */}
      <motion.div
        className="relative z-50 mt-6 bg-slate-800 border-2 border-slate-600 p-4 rounded font-mono text-sm shadow-lg"
        animate={{
          borderColor: isBrownout ? '#ef4444' : isVoltageDropPhase ? '#fbbf24' : '#475569',
          backgroundColor: isBrownout ? '#1e1b1b' : isVoltageDropPhase ? '#1e1a13' : '#1e293b'
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/50 p-3 rounded border border-slate-600">
            <span className="text-slate-400 block mb-2 text-xs uppercase tracking-wider">SYSTEM STATUS</span>
            <motion.div
              className={`font-bold text-xl px-3 py-2 rounded shadow-lg ${
                isBrownout ? 'bg-red-800 text-red-50 ring-1 ring-red-400/70' :
                isSevereVoltageDrop ? 'bg-amber-800 text-amber-50 ring-1 ring-amber-400/70' :
                'bg-cyan-900 text-cyan-50 ring-1 ring-cyan-400/60'
              }`}
              animate={phase === 'brownout' ? { opacity: [1, 0, 1] } : { opacity: 1 }}
              transition={{ duration: 0.2, repeat: phase === 'brownout' ? Infinity : 0 }}
              style={{
                textShadow: isSevereVoltageDrop
                  ? '0 0 18px rgba(251, 191, 36, 0.85), 0 0 6px rgba(251, 191, 36, 0.6)'
                  : isBrownout
                    ? '0 0 20px rgba(239, 68, 68, 0.8), 0 0 8px rgba(239, 68, 68, 0.6)'
                    : isNormalPhase
                      ? '0 0 18px rgba(34, 211, 238, 0.75), 0 0 6px rgba(34, 211, 238, 0.5)'
                      : '0 0 12px rgba(34, 211, 238, 0.45)',
                WebkitTextStroke: '0.3px rgba(0, 0, 0, 0.4)'
              }}
            >
              {phase === 'positioning' && 'POSITIONING...'}
              {phase === 'motor_start' && 'FINE MOTOR START'}
              {(phase === 'voltage_drop_1' || phase === 'voltage_drop_2' || phase === 'voltage_drop_3' || phase === 'voltage_drop_4') && '⚠ SPANNUNGSVERLUST'}
              {phase === 'brownout' && '!!! SPANNUNGSVERLUST !!!'}
              {phase === 'drop' && 'CPU RESET'}
              {phase === 'error' && 'INCIDENT LOGGED'}
            </motion.div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded border border-slate-600 text-right">
            <span className="text-slate-400 block mb-2 text-xs uppercase tracking-wider">VOLTAGE</span>
            <motion.div
              className={`font-bold font-mono text-2xl px-3 py-2 rounded ${
                isBrownout ? 'bg-red-900/70 text-red-100' :
                (phase === 'voltage_drop_3' || phase === 'voltage_drop_4') ? 'bg-yellow-900/70 text-yellow-100' :
                'bg-cyan-900/50 text-cyan-100'
              }`}
              style={{
                textShadow: isBrownout
                  ? '0 0 15px rgba(239, 68, 68, 0.9)'
                  : (phase === 'voltage_drop_3' || phase === 'voltage_drop_4')
                    ? '0 0 10px rgba(252, 211, 77, 0.7)'
                    : '0 0 10px rgba(6, 182, 212, 0.5)'
              }}
            >
              {phase === 'positioning' && '12.0V'}
              {phase === 'motor_start' && '11.8V'}
              {phase === 'voltage_drop_1' && '11.8V'}
              {phase === 'voltage_drop_2' && '11.4V'}
              {phase === 'voltage_drop_3' && '11.2V'}
              {phase === 'voltage_drop_4' && '10.9V'}
              {phase === 'brownout' && '3.6V !!!'}
              {(phase === 'drop' || phase === 'error') && '---'}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Roter Flash bei Drop */}
      {phase === 'drop' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-red-900/40 pointer-events-none z-40"
        />
      )}
    </div>
  );
};
