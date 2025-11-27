'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { motion } from 'framer-motion';

const Level0_Intro: React.FC = () => {
  const { advanceLevel, setUserName, userName, credits, skipAnimations, setSkipAnimations } = useGameStore();
  const [bootStep, setBootStep] = useState(0);
  const [inputName, setInputName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showMission, setShowMission] = useState(false);

  // Bei skipAnimations direkt alles anzeigen
  useEffect(() => {
    if (skipAnimations && userName) {
      setLoggedIn(true);
      setBootStep(3);
      setTextComplete(true);
      setShowFinance(true);
      setShowMission(true);
      setSkipAnimations(false); // Reset für nächstes Mal
    }
  }, [skipAnimations, userName, setSkipAnimations]);

  useEffect(() => {
    if (!loggedIn) return;
    
    const timer = setInterval(() => {
      setBootStep((prev) => {
        if (prev < 3) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loggedIn]);

  useEffect(() => {
    if (textComplete) {
      const timer = setTimeout(() => setShowFinance(true), 500);
      return () => clearTimeout(timer);
    }
  }, [textComplete]);

  useEffect(() => {
    if (showFinance) {
      const timer = setTimeout(() => setShowMission(true), 800);
      return () => clearTimeout(timer);
    }
  }, [showFinance]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setUserName(inputName);
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <TerminalCard title="SECURE LOGIN REQUIRED" borderColor="cyan">
        <div className="flex flex-col items-center justify-center space-y-6 py-10">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-cyan-900">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-xl font-bold text-cyan-500 tracking-widest">IDENTIFIZIERUNG</h2>
          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
            <div>
              <label className="block text-xs text-slate-500 font-mono mb-1">BENUTZER-ID / NAME</label>
              <input 
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded focus:border-cyan-500 focus:outline-none font-mono text-center uppercase"
                placeholder="NAME EINGEBEN..."
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!inputName.trim()}
            >
              LOGIN
            </button>
          </form>
        </div>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard title="REMOTE MAINTENANCE LOGIN" borderColor="cyan">
      <div className="space-y-6 py-4">
        <div className="font-mono text-sm space-y-2 text-slate-400">
          <div className="flex justify-between">
            <span>{'>'} AUTHENTICATING_USER: {userName.toUpperCase()}...</span>
            <span className={bootStep >= 1 ? "text-green-400" : "text-slate-600"}>{bootStep >= 1 ? "VERIFIED" : "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>{'>'} LOADING_DIAGNOSTICS...</span>
            <span className={bootStep >= 2 ? "text-green-400" : "text-slate-600"}>{bootStep >= 2 ? "READY" : "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>{'>'} SECURE_CONNECTION_ESTABLISHED</span>
            <span className={bootStep >= 3 ? "text-green-400" : "text-slate-600"}>{bootStep >= 3 ? "ACTIVE" : "..."}</span>
          </div>
        </div>

        {bootStep >= 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 border-t border-slate-800 pt-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-slate-800 border border-slate-600 rounded flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl text-cyan-400 font-bold mb-2">WARTUNGS-PORTAL V4.2</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <TypewriterText 
                    text={`Willkommen im Fernwartungssystem des Logistikzentrums Nord, Ingenieur ${userName}. Wir haben Störmeldungen von der automatisierten Fertigungsstraße erhalten. Ihre Aufgabe ist es, die Fehlerursachen zu identifizieren und die Systeme gemäß Industriestandard DIN-EN-ISO 9001 neu zu kalibrieren.`} 
                    speed={15}
                    onComplete={() => setTextComplete(true)}
                  />
                </p>
              </div>
            </div>

            {showFinance && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 p-4 rounded border-l-2 border-yellow-500"
              >
                 <div className="flex justify-between items-start">
                    <div>
                       <h4 className="text-yellow-500 text-xs font-bold mb-1">FINANZ-STATUS</h4>
                       <p className="text-slate-400 text-sm">
                          Budget-Zuweisung: <span className="text-white font-bold">{credits} Credits</span>.
                          Nutzen Sie diese Ressourcen weise für Ersatzteile und Reparaturen. Unnötige Ausgaben gefährden die Projekt-Marge.
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}

            {showMission && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-slate-900 p-4 rounded border-l-2 border-cyan-500 mb-6">
                  <h4 className="text-cyan-500 text-xs font-bold mb-1">AKTUELLER AUFTRAG</h4>
                  <p className="text-slate-400 text-sm">
                    Unit-7 (Schwerlast-Greifer) meldet Abweichungen bei der Materialfestigkeit. Überprüfen Sie die physikalischen Parameter und stellen Sie den Betrieb sicher.
                  </p>
                </div>

                <button 
                  onClick={() => advanceLevel()}
                  className="w-full group relative px-8 py-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded uppercase tracking-widest transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center gap-2">
                    Diagnose Starten
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </TerminalCard>
  );
};

export default Level0_Intro;