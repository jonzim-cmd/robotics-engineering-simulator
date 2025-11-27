'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  calculateLevel2Physics,
  GEAR_RATIO_MIN,
  GEAR_RATIO_MAX,
  type Level2SimulationResult
} from '@/lib/physicsEngine';
import { BossModal } from './BossModal';
import { TestResultNotification } from './TestResultNotification';

const CREDITS_PER_TEST = 5;

export const Level2TuningSimulation: React.FC = () => {
  const { credits, setCredits, setLevelState } = useGameStore();

  // Slider states
  const [gearRatio, setGearRatio] = useState<number>(10); // Middle value
  const [motorSpeedFactor, setMotorSpeedFactor] = useState<number>(0.5); // 50%

  // UI states
  const [showBossModal, setShowBossModal] = useState(false);
  const [testResult, setTestResult] = useState<Level2SimulationResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Calculate current physics in real-time
  const currentPhysics = calculateLevel2Physics(gearRatio, motorSpeedFactor);

  // Handle test drive
  const handleTestDrive = () => {
    // Check if player has enough credits
    if (credits < CREDITS_PER_TEST) {
      // Show boss modal and reset credits
      setShowBossModal(true);
      return;
    }

    // Deduct credits
    setCredits(credits - CREDITS_PER_TEST);

    // Run test simulation
    setIsTestRunning(true);
    setTestResult(null);

    // Simulate test drive (brief delay for UX)
    setTimeout(() => {
      const result = calculateLevel2Physics(gearRatio, motorSpeedFactor);
      setTestResult(result);
      setIsTestRunning(false);

      // If success, advance to SUCCESS state after a delay
      if (result.testResult === 'SUCCESS') {
        setTimeout(() => {
          setLevelState('SUCCESS');
        }, 3000);
      }
    }, 1500);
  };

  const handleBossModalClose = () => {
    // Reset credits to 15 as per requirements
    setCredits(15);
    setShowBossModal(false);
  };

  // Calculate progress bar percentages (0-100%)
  const torqueProgress = Math.min(100, currentPhysics.torqueRatio * 100);
  const speedProgress = Math.min(100, currentPhysics.speedRatio * 100);

  // Get color based on value
  const getProgressColor = (ratio: number) => {
    if (ratio < 0.4) return 'bg-red-500';
    if (ratio < 0.8) return 'bg-orange-500';
    if (ratio < 1.2) return 'bg-yellow-500';
    if (ratio < 1.6) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-cyan-400 font-bold text-xl border-b border-slate-700 pb-2">
          GETRIEBE & MOTOR KONFIGURATION
        </h3>

        {/* Gear Ratio Slider */}
        <div>
          <label className="block text-sm text-slate-300 mb-2 font-semibold">
            Getriebe (Übersetzung)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 flex-1">Mehr Geschwindigkeit</span>
            <span className="text-xs text-slate-400 flex-1 text-right">Mehr Kraft</span>
          </div>
          <input
            type="range"
            min={GEAR_RATIO_MIN}
            max={GEAR_RATIO_MAX}
            step={0.5}
            value={gearRatio}
            onChange={(e) => setGearRatio(parseFloat(e.target.value))}
            disabled={isTestRunning}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="text-center mt-1 text-slate-400 text-sm font-mono">
            {gearRatio.toFixed(1)}:1
          </div>
        </div>

        {/* Motor Speed Slider */}
        <div>
          <label className="block text-sm text-slate-300 mb-2 font-semibold">
            Motordrehzahl
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 flex-1">Niedrig</span>
            <span className="text-xs text-slate-400 flex-1 text-right">Hoch</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={motorSpeedFactor}
            onChange={(e) => setMotorSpeedFactor(parseFloat(e.target.value))}
            disabled={isTestRunning}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="text-center mt-1 text-slate-400 text-sm font-mono">
            {(motorSpeedFactor * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Qualitative Displays */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-cyan-400 font-bold text-xl border-b border-slate-700 pb-2">
          LIVE ANZEIGEN
        </h3>

        {/* Torque Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-semibold">Kraft am Rad:</span>
            <span className="text-lg font-bold text-white">{currentPhysics.torqueLevel}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${torqueProgress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${getProgressColor(currentPhysics.torqueRatio)} flex items-center justify-end px-2`}
            >
              {torqueProgress > 20 && (
                <span className="text-xs font-bold text-white drop-shadow">
                  {torqueProgress.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Speed Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-semibold">Geschwindigkeit:</span>
            <span className="text-lg font-bold text-white">{currentPhysics.speedLevel}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${speedProgress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${getProgressColor(currentPhysics.speedRatio)} flex items-center justify-end px-2`}
            >
              {speedProgress > 20 && (
                <span className="text-xs font-bold text-white drop-shadow">
                  {speedProgress.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Test Drive Button */}
      <motion.button
        whileHover={{ scale: isTestRunning ? 1 : 1.02 }}
        whileTap={{ scale: isTestRunning ? 1 : 0.98 }}
        onClick={handleTestDrive}
        disabled={isTestRunning}
        className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all ${
          isTestRunning
            ? 'bg-yellow-600 text-white animate-pulse cursor-not-allowed'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50'
        }`}
      >
        {isTestRunning ? (
          <>
            <span className="inline-block animate-spin mr-2">⚙️</span>
            Testfahrt läuft...
          </>
        ) : (
          `Testfahrt starten (${CREDITS_PER_TEST} Credits)`
        )}
      </motion.button>

      {/* Test Result Notification */}
      <AnimatePresence>
        {testResult && !isTestRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TestResultNotification
              resultType={testResult.testResult}
              message={testResult.resultMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Modal */}
      {showBossModal && <BossModal onClose={handleBossModalClose} />}
    </div>
  );
};
