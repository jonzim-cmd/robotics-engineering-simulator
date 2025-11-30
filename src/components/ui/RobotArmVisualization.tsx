'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Internal state to handle the sequence of the "crash" animation
  const [crashState, setCrashState] = useState<'IDLE' | 'FALLING' | 'CRASHED'>('IDLE');

  useEffect(() => {
    if (isSimulating) {
      setCrashState('IDLE');
    } else if (!isSafeDeflection && !isSimulating && deflection > 0) {
      // Trigger crash sequence when simulation ends with failure
      setCrashState('FALLING');
      const timer = setTimeout(() => setCrashState('CRASHED'), 600); // Time for fall animation
      return () => clearTimeout(timer);
    } else {
      setCrashState('IDLE');
    }
  }, [isSafeDeflection, isSimulating, deflection]);

  const motorColor = isSafeMass ? '#10b981' : '#ef4444'; 
  const precisionColor = isSafeDeflection ? '#10b981' : '#ef4444';

  // Calculate rotation for the "Safe/Bending" state
  const rotationAngle = Math.min(deflection * 2.5, 15); // Cap visual bending for non-broken state

  return (
    <div className="relative w-full h-full bg-slate-950/50 rounded border border-slate-800 p-6 overflow-hidden">
      {/* Title */}
      <div className="text-xs text-slate-500 font-mono mb-4 text-center uppercase tracking-widest">
        SIMULATION CHAMBER
      </div>

      {/* Status LEDs */}
      <div className="absolute top-4 right-4 space-y-2 z-20">
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 p-1 rounded border border-slate-800">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: motorColor }}
            animate={{ opacity: isSimulating || !isSafeMass ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: (isSimulating || !isSafeMass) ? Infinity : 0 }}
          />
          <span className={isSafeMass ? 'text-green-400' : 'text-red-400'}>
            MOTOR
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 p-1 rounded border border-slate-800">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: precisionColor }}
            animate={{ opacity: isSimulating || !isSafeDeflection ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: (isSimulating || !isSafeDeflection) ? Infinity : 0 }}
          />
          <span className={isSafeDeflection ? 'text-green-400' : 'text-red-400'}>
            STRUCT
          </span>
        </div>
      </div>

      {/* Main Scene */}
      <div className="flex items-center justify-center h-64 relative">

        {/* GRID Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
        </div>

        {/* ROBOT BASE (Common) */}
        <div className="relative z-10 mr-8 sm:mr-16 md:mr-24 lg:mr-32">
           {/* Base Stand */}
           <div className={`w-16 h-24 border-2 rounded-sm relative transition-colors duration-500 ${
             !isSafeMass ? 'bg-red-900/30 border-red-500' : 'bg-slate-800 border-slate-600'
           }`}>
              {/* Base Details */}
              <div className="absolute inset-x-2 top-2 h-1 bg-slate-900/50" />
              <div className="absolute inset-x-4 bottom-4 h-8 border border-slate-700 bg-slate-900/50 flex items-center justify-center">
                 <div className={`w-2 h-2 rounded-full ${!isSafeMass ? 'bg-red-500' : 'bg-cyan-500'}`} />
              </div>

              {/* Overheat Effect */}
              {!isSafeMass && !isSimulating && (
                 <>
                   <motion.div 
                     className="absolute -inset-2 border-2 border-red-500/50 rounded-sm"
                     animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1] }}
                     transition={{ duration: 1, repeat: Infinity }}
                   />
                   {/* Smoke Particles */}
                   {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute -top-4 left-1/2 w-4 h-4 bg-slate-500 rounded-full opacity-50 blur-sm"
                        animate={{ y: -40, opacity: 0, scale: 2, x: (i % 2 === 0 ? 10 : -10) }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                      />
                   ))}
                 </>
              )}
           </div>
           
           {/* Shoulder Joint */}
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-700 border-2 border-slate-500 rounded-full z-20 flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-900 rounded-full" />
           </div>

           {/* ARM LOGIC SWITCH */}
           {/* If Deflection Safe: Render Normal Arm */}
           {isSafeDeflection || isSimulating ? (
             <motion.div
               className="absolute top-1 left-1/2 origin-center z-10"
               animate={{ rotate: isSimulating ? 0 : rotationAngle }}
               transition={{ type: "spring", stiffness: 60 }}
             >
                {/* Arm Segment */}
                <div className="absolute left-0 top-0 w-40 h-6 bg-slate-600 border-2 border-slate-500 origin-left -translate-y-1/2 rounded-r flex items-center">
                   <div className="w-full h-1 bg-slate-500/30" />
                   
                   {/* Gripper */}
                   <div className="absolute -right-4 w-6 h-8 border-2 border-slate-500 bg-slate-700 rounded-sm flex flex-col justify-between py-1 px-0.5">
                      <div className="w-full h-1 bg-slate-400" />
                      <div className="w-full h-1 bg-slate-400" />
                   </div>

                   {/* Weight (Container) attached */}
                   <motion.div 
                      className="absolute -right-2 top-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isSimulating || deflection > 0 ? 1 : 0 }}
                   >
                      <div className="w-12 h-10 bg-orange-700 border border-orange-500 flex items-center justify-center relative">
                        <div className="text-[8px] text-orange-200 font-bold">5KG</div>
                        {/* Hanging Rope */}
                        <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-slate-400" />
                      </div>
                   </motion.div>
                </div>
             </motion.div>
           ) : (
             /* BROKEN ARM RENDER (Only when !isSafeDeflection and !isSimulating) */
             <div className="absolute top-1 left-1/2 origin-center z-10">
               {/* Upper Arm (Stump) */}
               <motion.div 
                 className="absolute left-0 top-0 w-20 h-6 bg-slate-700 border-2 border-red-600 origin-left -translate-y-1/2 rounded-r-none flex items-center"
                 initial={{ rotate: 0 }}
                 animate={{ rotate: 15 }}
               >
                  <div className="w-full h-1 bg-slate-500/30" />
                  {/* Jagged Edge */}
                  <div className="absolute -right-2 top-0 bottom-0 w-2 bg-red-600/50" style={{ clipPath: 'polygon(0 0, 100% 20%, 0 40%, 100% 60%, 0 80%, 100% 100%)'}} />
                  
                  {/* Sparks */}
                  <motion.div 
                    className="absolute right-0 w-2 h-2 bg-yellow-400 rounded-full blur-[1px]"
                    animate={{ x: [0, 10, 5], y: [0, 10, 20], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  />
               </motion.div>

               {/* Lower Arm (Falling Part) */}
               <motion.div
                  className="absolute left-20 top-0 w-20 h-6 bg-slate-700 border-2 border-red-600 origin-left -translate-y-1/2"
                  initial={{ rotate: 0, y: 0 }}
                  animate={{ rotate: 65, y: 40 }}
                  transition={{ type: "spring", bounce: 0.4 }}
               >
                  {/* Gripper */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-8 border-2 border-slate-500 bg-slate-700 rounded-sm flex flex-col justify-between py-1 px-0.5">
                      <div className="w-full h-1 bg-slate-400" />
                      <div className="w-full h-1 bg-slate-400" />
                   </div>
               </motion.div>

               {/* Dropped Container */}
               <motion.div 
                  className="absolute left-36 top-0"
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: 140, rotate: -10 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
               >
                  <div className="w-12 h-10 bg-orange-800 border border-orange-600 flex items-center justify-center relative">
                     <div className="text-[8px] text-orange-300 font-bold transform -rotate-180">5KG</div>
                  </div>
                  {/* Impact dust */}
                  {crashState === 'CRASHED' && (
                    <motion.div 
                      className="absolute -bottom-4 -left-4 -right-4 h-8 bg-slate-500/30 blur-xl rounded-full"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0.8, 0], scale: 2 }}
                      transition={{ duration: 1 }}
                    />
                  )}
               </motion.div>
             </div>
           )}

        </div>

      </div>

      {/* Text Output / Terminal Overlay */}
      <AnimatePresence>
        {!isSimulating && deflection > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-700 p-2 rounded font-mono text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="text-slate-500 block">MATERIAL STATUS</span>
                  <span className={isSafeMass ? "text-green-400" : "text-red-500 font-bold"}>
                    {isSafeMass ? "MASS NOMINAL" : "CRITICAL OVERWEIGHT"}
                  </span>
               </div>
               <div className="text-right">
                  <span className="text-slate-500 block">STRUCTURAL INTEGRITY</span>
                  <span className={isSafeDeflection ? "text-green-400" : "text-red-500 font-bold"}>
                    {isSafeDeflection ? `STABLE (${deflection.toFixed(1)}mm)` : "FAILURE DETECTED"}
                  </span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broken Glass Overlay Effect for Critical Failures */}
      {(!isSafeDeflection || !isSafeMass) && !isSimulating && deflection > 0 && (
         <motion.div 
            className="absolute inset-0 bg-red-900/10 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
         />
      )}
    </div>
  );
};