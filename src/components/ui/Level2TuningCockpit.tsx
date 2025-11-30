'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  calculateLevel2Physics,
  GEAR_RATIO_MIN,
  GEAR_RATIO_MAX,
  type Level2SimulationResult
} from '@/lib/physicsEngine';
import { BossModal } from './BossModal';
import { TestResultNotification } from './TestResultNotification';
import { assetPath } from '@/lib/basePath';
import { trackEvent } from '@/app/actions';

const CREDITS_PER_TEST = 5;

// --- Sub-Component: Spinning Gear ---
interface SpinningGearProps {
  size: number;
  color: string;
  teeth: number;
  speed: number; // arbitrary rotation speed factor
  direction?: 1 | -1;
}

const SpinningGear: React.FC<SpinningGearProps> = ({ size, color, teeth, speed, direction = 1 }) => {
  const ref = useRef<SVGSVGElement>(null);
  
  useAnimationFrame((t, delta) => {
    if (ref.current) {
      // Rotate based on delta time and speed
      // We use a data-attribute or current rotation storage to avoid React state re-renders for animation
      const currentRotation = parseFloat(ref.current.dataset.rotation || "0");
      const newRotation = currentRotation + (delta * 0.1 * speed * direction);
      ref.current.style.transform = `rotate(${newRotation}deg)`;
      ref.current.dataset.rotation = newRotation.toString();
    }
  });

  // Create gear path (simplified)
  const radius = size / 2;
  const center = size / 2;
  
  return (
    <svg 
      ref={ref}
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      style={{ transformOrigin: 'center' }}
      data-rotation="0"
    >
      <circle cx={center} cy={center} r={radius - 5} fill="none" stroke={color} strokeWidth="2" />
      {/* Hub */}
      <circle cx={center} cy={center} r={radius * 0.3} fill={color} opacity="0.2" />
      <circle cx={center} cy={center} r={radius * 0.1} fill={color} />
      
      {/* Teeth */}
      {Array.from({ length: teeth }).map((_, i) => {
        const angle = (i / teeth) * 360;
        return (
          <rect
            key={i}
            x={center - 4}
            y={0}
            width={8}
            height={10}
            fill={color}
            style={{ 
              transformOrigin: `${center}px ${center}px`, 
              transform: `rotate(${angle}deg)` 
            }}
          />
        );
      })}
      {/* Spokes */}
      <rect x={center - 2} y={center - radius + 5} width={4} height={radius * 2 - 10} fill={color} />
      <rect x={center - 2} y={center - radius + 5} width={4} height={radius * 2 - 10} fill={color} style={{ transformOrigin: 'center', transform: 'rotate(90deg)' }} />
    </svg>
  );
};

// --- Sub-Component: Gauge ---
const Gauge: React.FC<{
  label: string;
  value: number; // 0-100
  displayValue: string;
}> = ({ label, value }) => { // Removed displayValue from destructuring as it's no longer used
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400">
        <span>{label}</span>
      </div>
      <div className="h-4 bg-slate-800 rounded-sm relative overflow-hidden border border-slate-700">
        
        {/* Bar */}
        <motion.div 
          className={`h-full bg-cyan-500`} 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ type: "spring", damping: 20 }}
        />
      </div>
    </div>
  );
};
// --- Main Component ---
export const Level2TuningCockpit: React.FC = () => {
  const { credits, setCredits, setLevelState, setSubStep, userId, currentLevel } = useGameStore();
  
  // States
  const [gearRatio, setGearRatio] = useState<number>(8.0);
  const [motorSpeedFactor, setMotorSpeedFactor] = useState<number>(0.5);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<Level2SimulationResult | null>(null);
  const [showBossModal, setShowBossModal] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Real-time physics calculation
  const physics = calculateLevel2Physics(gearRatio, motorSpeedFactor);

  // Scroll to result when it appears
  useEffect(() => {
    if (testResult && resultRef.current) {
       resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [testResult]);

  // Auto-hide test result after delay (except for SUCCESS)
  useEffect(() => {
    if (testResult && testResult.testResult !== 'SUCCESS') {
      const timer = setTimeout(() => {
        setTestResult(null);
      }, 3500); // Hide after 3.5 seconds

      return () => clearTimeout(timer);
    }
  }, [testResult]);

  // Handlers
  const logEvent = (eventType: string, payload: Record<string, unknown>) => {
    if (!userId) return;
    trackEvent(userId, currentLevel, eventType, payload).catch((err) => console.error('Tracking error', err));
  };

  const handleTestDrive = () => {
    if (credits < CREDITS_PER_TEST) {
      logEvent('LEVEL2_TEST_DENIED', {
        reason: 'insufficient_credits',
        credits,
        gearRatio,
        motorSpeedFactor,
      });
      setShowBossModal(true);
      return;
    }

    logEvent('LEVEL2_TEST_STARTED', {
      creditsBefore: credits,
      gearRatio,
      motorSpeedFactor,
    });

    setCredits(credits - CREDITS_PER_TEST);
    setIsTestRunning(true);
    setTestResult(null);

    // Simulate delay
    setTimeout(() => {
      const result = calculateLevel2Physics(gearRatio, motorSpeedFactor);
      setTestResult(result);
      setIsTestRunning(false);

      logEvent('LEVEL2_TEST_RESULT', {
        gearRatio,
        motorSpeedFactor,
        result: result.testResult,
        torqueRatio: result.torqueRatio,
        speedRatio: result.speedRatio,
      });

      if (result.testResult === 'SUCCESS') {
        setTimeout(() => {
          setSubStep(1);
          setLevelState('SUCCESS');
        }, 2000);
      }
    }, 1500);
  };

  const handleBossClose = () => {
    setCredits(15);
    setShowBossModal(false);
    // Reset logic slightly to force re-think? Optional.
    setMotorSpeedFactor(0.5);
    setGearRatio(8.0);
  };

  // Visualization calculations
  // Motor gear is constant size (driver)
  const driverSize = 100;
  const driverSpeed = motorSpeedFactor * 5; // visual speed multiplier

  // Driven gear (wheel) scales with ratio
  // Ratio 3 (fast) -> small gear. Ratio 20 (slow) -> big gear.
  // Lets map Ratio 3 -> 100px, Ratio 20 -> 280px
  const drivenSize = 100 + ((gearRatio - GEAR_RATIO_MIN) / (GEAR_RATIO_MAX - GEAR_RATIO_MIN)) * 180;
  const drivenSpeed = driverSpeed / gearRatio * 4; // x4 just to make it visually perceivable relative to driver
  const gridBg = assetPath('/grid.svg');

  return (
    <div className="flex flex-col gap-6">
      {/* Top: Results Overlay Area (Conceptually) */}
      <div className="relative">
        {/* Visualization Panel */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex items-center justify-center">
          {/* Background Grid */}
          <div
            className="absolute inset-0 opacity-10 bg-center"
            style={{ backgroundImage: `url(${gridBg})` }}
          />

          {/* Connection Chain (Visual Only - simple line) */}
          <div className="absolute h-2 md:h-3 bg-slate-800/80 border-y border-slate-600 top-1/2 -translate-y-1/2 w-[40%] md:w-[280px] max-w-[280px]" />

          {/* Gears Container */}
          <div className="flex items-center gap-4 sm:gap-8 md:gap-12 lg:gap-20 relative z-10">
            {/* Motor Side */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
              <div className="text-xs sm:text-sm font-mono text-cyan-400 uppercase tracking-widest font-bold">Motor</div>
              <div className="relative">
                <SpinningGear size={driverSize} color="#22d3ee" teeth={8} speed={driverSpeed} />
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-400">{Math.round(motorSpeedFactor * 100)}% RPM</div>
            </div>

            {/* Wheel Side */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] justify-center w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px]">
              <div className="text-xs sm:text-sm font-mono text-cyan-400 uppercase tracking-widest font-bold">Antrieb</div>
              <div className="relative flex items-center justify-center transition-all duration-500 ease-out">
                <SpinningGear
                  size={drivenSize}
                  color="#fbbf24"
                  teeth={Math.floor(8 * (drivenSize/100))}
                  speed={drivenSpeed}
                  direction={-1}
                />
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-400 font-bold">1:{gearRatio.toFixed(1)}</div>
            </div>
          </div>

          {/* Result Overlay */}
          <AnimatePresence>
            {testResult && !isTestRunning && (
               <motion.div
                 ref={resultRef}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.3 }}
                 className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6"
               >
                  <TestResultNotification
                    resultType={testResult.testResult}
                    message={testResult.resultMessage}
                  />
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cockpit Controls & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Controls */}
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Konfiguration
          </h3>
          
          {/* Gear Ratio Slider */}
          <div>
            <div className="flex justify-between mb-2 text-sm font-medium text-slate-300">
              <span>Geschwindigkeit</span>
              <span>Kraft</span>
            </div>
            <input
              type="range"
              min={GEAR_RATIO_MIN}
              max={GEAR_RATIO_MAX}
              step={0.5}
              value={gearRatio}
              onChange={(e) => setGearRatio(parseFloat(e.target.value))}
              disabled={isTestRunning}
              className="w-full h-5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all border-2 border-slate-600 shadow-inner"
              style={{
                background: `linear-gradient(to right, #0891b2 0%, #06b6d4 ${((gearRatio - GEAR_RATIO_MIN) / (GEAR_RATIO_MAX - GEAR_RATIO_MIN)) * 100}%, #334155 ${((gearRatio - GEAR_RATIO_MIN) / (GEAR_RATIO_MAX - GEAR_RATIO_MIN)) * 100}%, #334155 100%)`
              }}
            />
          </div>

          {/* Motor RPM Slider */}
          <div>
            <div className="flex justify-between mb-2 text-sm font-medium text-slate-300">
              <span>Motor Stopp</span>
              <span>Max. Drehzahl</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={motorSpeedFactor}
              onChange={(e) => setMotorSpeedFactor(parseFloat(e.target.value))}
              disabled={isTestRunning}
              className="w-full h-5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-orange-400 hover:accent-orange-300 transition-all border-2 border-slate-600 shadow-inner"
              style={{
                background: `linear-gradient(to right, #fb923c 0%, #f97316 ${motorSpeedFactor * 100}%, #334155 ${motorSpeedFactor * 100}%, #334155 100%)`
              }}
            />
          </div>
        </div>

        {/* Telemetry */}
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live-Telemetrie
          </h3>

          {/* Torque Gauge */}
          {/* Logic: Torque Ratio 1.0 is 100% of REQUIRED. 
              Let's display scale 0 to 2.0 (200%). 
              Threshold is at 50% (1.0).
          */}
          <Gauge 
            label="Drehmoment (Kraft)" 
            value={(physics.torqueRatio / 2) * 100} 
            displayValue={physics.torqueLevel}
          />

          {/* Speed Gauge */}
          {/* Logic: Speed Ratio 1.0 is Reference. 
              Let's display scale 0 to 2.0.
              Threshold at 50% (1.0).
          */}
          <Gauge 
            label="Geschwindigkeit" 
            value={(physics.speedRatio / 2) * 100}
            displayValue={physics.speedLevel}
          />
          
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
             <div className="text-xs text-slate-500">
               STATUS: <span className="text-slate-300">{isTestRunning ? "SIMULATION LÄUFT..." : "BEREIT"}</span>
             </div>
             <div className="text-xs text-slate-500">
               CREDITS: <span className={credits < 5 ? "text-red-500 font-bold" : "text-cyan-400 font-bold"}>{credits}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleTestDrive}
        disabled={isTestRunning}
        className={`w-full py-5 rounded-lg font-bold text-lg uppercase tracking-widest shadow-xl transition-all ${
          isTestRunning 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 hover:shadow-cyan-500/40 border border-cyan-400/20'
        }`}
      >
        {isTestRunning ? 'Systemtest läuft...' : `Testfahrt Starten [-${CREDITS_PER_TEST} Credits]`}
      </motion.button>

      {/* Boss Modal */}
      {showBossModal && <BossModal onClose={handleBossClose} />}
    </div>
  );
};
