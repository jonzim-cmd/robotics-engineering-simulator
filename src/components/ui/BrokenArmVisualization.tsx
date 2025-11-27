'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BrokenArmVisualization: React.FC = () => {
  const [smokeCleared, setSmokeCleared] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setSmokeCleared(true), 5500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-64 bg-slate-950 rounded-lg border border-red-900/30 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Warning Lights */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.div
          className="w-3 h-3 rounded-full bg-red-500"
          animate={{
            opacity: [1, 0.3, 1],
            boxShadow: [
              '0 0 10px rgba(239, 68, 68, 0.8)',
              '0 0 5px rgba(239, 68, 68, 0.3)',
              '0 0 10px rgba(239, 68, 68, 0.8)'
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-yellow-500"
          animate={{
            opacity: [0.3, 1, 0.3],
            boxShadow: [
              '0 0 5px rgba(234, 179, 8, 0.3)',
              '0 0 10px rgba(234, 179, 8, 0.8)',
              '0 0 5px rgba(234, 179, 8, 0.3)'
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.75
          }}
        />
      </div>

      {/* Status Text */}
      <div className="absolute top-4 left-4 text-red-500 text-xs font-mono font-bold">
        [SYSTEM ERROR]
      </div>

      {/* Main Scene */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Robot Base */}
          <div className="relative">
            <div className="w-24 h-16 bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600 rounded-sm mx-auto relative">
              {/* Unit Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/50">
                  <span className="text-cyan-400 font-bold text-xs tracking-wider">UNIT-7</span>
                </div>
              </div>
              {/* Base Details */}
              <div className="absolute bottom-1 left-1 right-1 h-1 bg-slate-900/50" />
            </div>

            {/* Shoulder Joint */}
            <div className="w-8 h-8 bg-slate-600 border-2 border-slate-500 rounded-full mx-auto -mt-2 relative z-10">
              <div className="absolute inset-2 bg-slate-800 rounded-full" />
            </div>

            {/* Bent Arm - Upper Segment */}
            <motion.div
              className="relative mx-auto"
              style={{ width: '8px', transformOrigin: 'top center' }}
              animate={{
                rotate: [0, -1, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-8 h-24 bg-gradient-to-b from-slate-600 to-slate-700 border-2 border-slate-500 mx-auto relative"
                style={{
                  transform: 'skewX(-8deg)',
                  borderColor: '#dc2626'
                }}
              >
                {/* Stress Marks */}
                <div className="absolute inset-0 flex flex-col justify-around px-1">
                  <div className="h-px bg-red-500/50" />
                  <div className="h-px bg-red-500/50" />
                  <div className="h-px bg-red-500/50" />
                </div>
              </div>

              {/* Elbow Joint (bent) */}
              <div className="w-6 h-6 bg-red-900 border-2 border-red-700 rounded-full mx-auto -mt-1 relative z-10">
                <div className="absolute inset-1 bg-red-950 rounded-full" />
              </div>

              {/* Lower Arm Segment (more bent) */}
              <div
                className="w-6 h-20 bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-red-600 mx-auto relative"
                style={{
                  transform: 'skewX(-15deg) translateX(-8px)',
                }}
              >
                {/* More stress marks */}
                <div className="absolute inset-0 flex flex-col justify-around px-1">
                  <div className="h-px bg-red-600/70" />
                  <div className="h-px bg-red-600/70" />
                </div>
              </div>

              {/* Gripper */}
              <motion.div
                className="relative mx-auto -ml-4"
                animate={{
                  y: [0, 2, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-6 bg-slate-600 border border-slate-500" />
                  <div className="w-2 h-6 bg-slate-600 border border-slate-500" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Fallen Container */}
          <motion.div
            className="absolute left-48 bottom-8"
            initial={{ y: -20, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: -8 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-20 h-16 bg-gradient-to-br from-orange-900 to-orange-950 border-2 border-orange-700 relative" style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 95%)' }}>
              {/* Container details - damaged */}
              <div className="absolute inset-2 border border-orange-800" style={{ clipPath: 'polygon(8% 5%, 95% 5%, 90% 90%, 5% 92%)' }} />
              {/* Danger stripes */}
              <div className="absolute inset-0 flex flex-col justify-around">
                <div className="h-1 bg-yellow-600/30" />
                <div className="h-1 bg-yellow-600/30" />
              </div>
              {/* Dents and damage marks */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-black/40 rounded-full" />
              <div className="absolute bottom-3 left-3 w-2 h-4 bg-black/30" />
              <div className="absolute top-1/2 right-1 w-1 h-6 bg-red-900/60" style={{ transform: 'skewY(-10deg)' }} />
            </div>
            {/* Impact effect */}
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-slate-600 text-xs"
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ···
            </motion.div>
          </motion.div>

          {/* Smoke/Steam particles */}
          <div className="absolute -right-8 top-24">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-slate-600 rounded-full opacity-50"
                animate={{
                  y: [0, -30],
                  x: [0, Math.random() * 10 - 5],
                  opacity: [0.5, 0],
                  scale: [0.5, 1.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Text */}
      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-red-500/70">
        DEFLECTION: CRITICAL | MOTOR OVERLOAD | MATERIAL FAILURE
      </div>

      {/* Smoke Overlay - appears on mount, then clears */}
      {!smokeCleared && (
        <>
          {/* Large smoke clouds */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`smoke-${i}`}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.9 }}
              animate={{
                opacity: 0,
                y: -120,
                scale: [1, 1.5, 2.2],
              }}
              transition={{
                duration: 5.5,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            >
              <div
                className="absolute w-full h-full bg-slate-800"
                style={{
                  filter: `blur(${40 + i * 10}px)`,
                  transform: `translateX(${i * 20 - 40}px) translateY(${i * 15}px)`,
                  opacity: 0.7 - i * 0.1
                }}
              />
            </motion.div>
          ))}

          {/* Dense center smoke */}
          <motion.div
            className="absolute inset-0 bg-slate-700 pointer-events-none"
            initial={{ opacity: 0.95 }}
            animate={{
              opacity: 0,
              scale: 1.5,
            }}
            transition={{
              duration: 4.5,
              ease: "easeInOut"
            }}
            style={{ filter: 'blur(60px)' }}
          />

          {/* Warning Text Overlay - Left Side */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 max-w-xs space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: [0, 1, 1, 0], x: [-20, 0, 0, -10] }}
            transition={{ duration: 4, times: [0, 0.15, 0.75, 1] }}
          >
            <div className="text-yellow-300 text-base italic">
              "Achtung! Weg da! Der Container fällt!"
            </div>
          </motion.div>

          {/* Flickering embers/sparks effect */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{
                opacity: 0,
                y: [-20, -80],
                x: [0, (Math.random() - 0.5) * 60],
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
