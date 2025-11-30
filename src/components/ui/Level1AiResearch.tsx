import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from './TypewriterText';

interface Level1AiResearchProps {
  onComplete: () => void;
}

export const Level1AiResearch: React.FC<Level1AiResearchProps> = ({ onComplete }) => {
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  // Start AI response after a short delay to simulate "thinking"
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAiResponse(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[700px]"
      >
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-gray-500 text-sm font-medium">NeuroLink AI Research</div>
          <div className="w-4" /> {/* Spacer for centering if needed */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8 font-sans">
          
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-sm">
              <p className="text-sm md:text-base">
                Was muss ich bei der Materialwahl für den Roboterarm beachten? Welche physikalischen Eigenschaften sind wichtig?
              </p>
            </div>
          </div>

          {/* AI Response */}
          {showAiResponse && (
            <div className="flex justify-start items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AI
              </div>
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] shadow-sm">
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  <TypewriterText 
                    text={`Hallo! Hier ist eine Analyse der wichtigsten Faktoren für deine Mission:

1. Dichte (Gewicht):
Das Material darf nicht zu schwer sein. Eine hohe Dichte bedeutet, dass der Arm schwerer wird. Wenn er mehr als 1000g wiegt, müssen die Motoren extrem viel Kraft (Drehmoment) aufbringen, um den Arm zu bewegen. Dadurch werden die Motoren überlastet und brennen durch.

2. E-Modul (Steifigkeit):
Das Material muss steif genug sein, damit sich der Arm unter Last nicht verbiegt. Ein hoher E-Modul bedeutet weniger Biegung und mehr Präzision.

3. Kosten:
Hochleistungsmaterialien sind oft teurer. Du musst im Budget bleiben.

Fazit: Suche ein Material, das leicht genug ist (geringe Dichte), aber trotzdem steif (hoher E-Modul).`}
                    speed={15}
                    onComplete={() => setShowContinue(true)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator before AI response */}
          {!showAiResponse && (
            <div className="flex justify-start items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AI
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full" 
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full" 
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full" 
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer / Input Area (Disabled/Simulated) */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2 items-center mb-4">
             <div className="h-10 flex-1 bg-gray-50 rounded-full border border-gray-200 px-4 flex items-center text-gray-400 text-sm">
               Nachricht an NeuroLink AI...
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
               ↑
             </div>
          </div>
          
          {/* Continue Button */}
          <AnimatePresence>
            {showContinue && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onComplete}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Recherche beenden & Mission starten
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
