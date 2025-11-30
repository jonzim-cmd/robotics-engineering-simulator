'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, FileText, User, ArrowRight, Paperclip } from 'lucide-react';
import { trackEvent } from '@/app/actions';

const Level6_Ethics: React.FC = () => {
  const {
    userName,
    userId,
    subStep,
    setSubStep,
    setLevelState,
    levelState,
    pushStateHistory,
  } = useGameStore();

  const [emailContent, setEmailContent] = useState('');

  const handleOpenEmail = () => {
    pushStateHistory();
    setLevelState('ACTIVE');
    setSubStep(1);
  };

  const handleSendEmail = () => {
    if (userId) {
      trackEvent(userId, 6, 'FINAL_EMAIL', { answer: emailContent });
    }
    setSubStep(2);
    setTimeout(() => {
      setLevelState('SUCCESS');
    }, 2000);
  };

  // Determine which view to show
  const showIntro = levelState === 'INTRO' || (levelState === 'ACTIVE' && subStep === 0);
  const showEmail = subStep === 1;
  const showSuccess = levelState === 'SUCCESS' || subStep === 2;

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {/* Intro: The Termination Letter */}
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ y: -1000, rotate: -5, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 50, delay: 0.2 }}
              className="bg-white text-black max-w-2xl w-full shadow-2xl p-8 md:p-12 relative my-8"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {/* Letter Header */}
              <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-widest">AresCorp</h1>
                  <p className="text-xs text-gray-600 uppercase tracking-widest">Global Operations & Human Resources</p>
                </div>
                <div className="text-right text-sm">
                  <p>Datum: 30. November 2025</p>
                  <p>Ref: T-99-X-FINAL</p>
                </div>
              </div>

              {/* Letter Body */}
              <div className="space-y-6 text-lg leading-relaxed">
                <p><strong>Betreff: Außerordentliche Kündigung</strong></p>
                
                <p>Sehr geehrte(r) {userName || 'Mitarbeiter/in'},</p>
                
                <p>
                  im Rahmen unserer globalen Umstrukturierungsmaßnahmen "Effizienz 2030" müssen wir Ihnen leider mitteilen, dass Ihr Arbeitsverhältnis mit sofortiger Wirkung beendet wird.
                </p>
                
                <p>
                  Die Analyse Ihrer jüngsten Leistungen im Robotik-Training hat zwar technische Kompetenz gezeigt, jedoch haben unsere Algorithmen berechnet, dass eine Vollautomatisierung durch KI-gesteuerte Einheiten langfristig eine Kostenersparnis von 99,4% darstellt. Menschliche Faktoren wie "Ethik", "Ermüdung" oder "Gehaltsforderungen" stellen in unserer Bilanz ineffiziente Variablen dar.
                </p>

                <p>
                  <strong>Kündigungsgrund:</strong> Kosteneinsparungen & Optimierung der operativen Marge.
                </p>
                
                <p>
                  Wir danken Ihnen für Ihre bisherigen Dienste und wünschen Ihnen für Ihren weiteren beruflichen Werdegang – soweit in einer automatisierten Welt möglich – alles Gute.
                </p>

                <div className="mt-12 flex justify-between items-end">
                  <div className="text-center">
                    <div className="mb-2 font-signature text-2xl italic font-bold text-blue-900 transform -rotate-6">H. Schuldenbremse</div>
                    <div className="border-t border-black pt-1 w-48 mx-auto">
                      <p className="font-bold">Harald Schuldenbremse</p>
                      <p className="text-sm text-gray-600">Head of Finance</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-2 font-signature text-2xl italic font-bold text-blue-900 transform -rotate-2">S. Bazlen</div>
                    <div className="border-t border-black pt-1 w-48 mx-auto">
                      <p className="font-bold">Sabine Bazlen</p>
                      <p className="text-sm text-gray-600">Chief Executive Officer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Footer */}
              <div className="mt-16 pt-4 border-t border-gray-300 text-xs text-gray-400 text-center">
                <p>AresCorp International • Sector 7G • Neo-Berlin</p>
                <p>Diese Nachricht wurde maschinell erstellt und ist ohne Unterschrift gültig (wurde aber trotzdem unterschrieben, weil es dramatischer wirkt).</p>
              </div>

              {/* Action Button */}
              <div className="absolute -bottom-5 right-10">
                 <button 
                    onClick={handleOpenEmail}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 shadow-lg flex items-center gap-2 font-sans rounded transition-transform hover:scale-105"
                 >
                    <span>Widerspruch einlegen</span>
                    <ArrowRight size={18} />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 1: Write Email */}
        {showEmail && (
          <motion.div
            key="email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-4"
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.3 }}
               className="w-full max-w-3xl bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-700"
            >
              {/* Email Header */}
              <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-200">
                   <Mail size={20} className="text-cyan-400" />
                   <span className="font-bold">Verfassen: Letzte Nachricht</span>
                </div>
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* Email Fields */}
              <div className="p-4 space-y-4 bg-slate-800 flex-1 flex flex-col">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                   <span className="text-slate-400 text-right pr-2">An:</span>
                   <div className="bg-slate-700/50 px-3 py-2 rounded text-slate-200 flex items-center gap-2">
                      <User size={16} />
                      <span>s.bazlen@arescorp.com; h.schuldenbremse@arescorp.com</span>
                   </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                   <span className="text-slate-400 text-right pr-2">Betreff:</span>
                   <div className="bg-slate-700/50 px-3 py-2 rounded text-slate-200 font-bold">
                      RE: Kündigung - Warum der Mensch unersetzbar ist
                   </div>
                </div>

                <div className="flex-1 relative mt-4">
                   <textarea
                      className="w-full h-full bg-slate-900/50 border border-slate-700 rounded p-4 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-mono leading-relaxed"
                      placeholder="Schreiben Sie hier Ihre Nachricht an die Geschäftsführung. Warum sind Sie mehr wert als ein Roboter? Was macht menschliche Arbeit einzigartig?..."
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      autoFocus
                   />
                </div>
              </div>

              {/* Email Footer / Actions */}
              <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-between items-center">
                 <div className="flex gap-4 text-slate-500">
                    <Paperclip size={20} className="hover:text-slate-300 cursor-pointer" />
                    <FileText size={20} className="hover:text-slate-300 cursor-pointer" />
                 </div>
                 <button
                    onClick={handleSendEmail}
                    disabled={emailContent.length < 10}
                    className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-all ${
                       emailContent.length < 10 
                       ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                       : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/25'
                    }`}
                 >
                    <Send size={18} />
                    Absenden
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success / End State */}
        {showSuccess && (
           <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-center p-8"
           >
              <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="max-w-2xl space-y-8"
              >
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Send size={40} className="text-green-500" />
                 </div>
                 
                 <h2 className="text-4xl font-bold text-white">Nachricht gesendet.</h2>
                 <p className="text-xl text-gray-400">
                    Ihre Worte sind nun im System. Ob sie etwas ändern, liegt nicht mehr in Ihrer Hand.
                 </p>
                 
                 <div className="h-px w-32 bg-gray-800 mx-auto my-8"></div>
                 
                 <div className="text-gray-500 italic font-mono text-left max-w-xl mx-auto">
                    <p className="mb-2">Joscha Bach (KI-Forscher) über eine mögliche Zukunft der Menschheit im Zeitalter künstlicher Intelligenz:</p>
                    <p className="mb-2">Es gibt auch eine andere Perspektive: Was würde passieren, wenn wir (...) auf universelle Grundintelligenz abzielen? Wie wäre es, wenn wir alle Menschen kompetent machen?</p>
                    <p className="mb-2">Stell dir vor, jeder Mensch bekommt eine eigene KI. Diese KI wächst mit dir, passt sich an dich an und arbeitet sehr eng mit dir zusammen. Sie hat völlige Integrität – sowohl mit dir als auch mit sich selbst. Gemeinsam mit dir erklärt sie deine Situation. Du kannst alles hinterfragen, was sie tut. Mit der Zeit wird sie ein Teil von dir.</p>
                    <p className="mb-2">Du wirst merken: Dein biologisch-menschlicher Teil bleibt ein wichtiger Teil von dir. Aber es gibt auch einen anderen Teil. Dieser Teil ist mit acht Milliarden Menschen und deren KIs verbunden. So entsteht eine Welt, die extrem vernetzt ist. In dieser Welt hast du gleichzeitig Verträge mit jedem anderen Menschen und deren KIs.</p>
                    <p>Das wird eine viel interessantere Form der Regierungsführung sein, als wir sie heute haben. Es wird eine viel anspruchsvollere und interessantere Welt erschaffen, als die Welt, in der wir derzeit leben.</p>
                 </div>

                 <div className="pt-12 text-sm text-gray-700 uppercase tracking-[0.2em]">
                    Ende der Simulation
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Level6_Ethics;
