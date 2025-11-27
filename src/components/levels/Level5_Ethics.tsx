'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock, Unlock, XCircle } from 'lucide-react';

const Level5_Ethics: React.FC = () => {
  const { credits, removeCredits, setLevelState, levelState, previousLevel } = useGameStore();
  const [step, setStep] = useState<'DIAGNOSIS' | 'REPAIR' | 'LOCKDOWN' | 'DECISION'>('DIAGNOSIS');
  const [hacking, setHacking] = useState(false);

  const handleRepair = () => {
    removeCredits(5);
    setStep('REPAIR');
    setTimeout(() => {
       setStep('LOCKDOWN');
    }, 2000);
  };

  const handleHack = () => {
    setHacking(true);
    setTimeout(() => {
      setLevelState('SUCCESS'); // The "End" of this prototype
    }, 3000);
  };

  if (levelState === 'INTRO') {
    return (
      <TerminalCard title="INCOMING TRANSMISSION" borderColor="cyan" onBack={previousLevel}>
        <div className="space-y-4">
          <div className="text-cyan-400 font-bold">SYSTEM MELDUNG:</div>
          <TypewriterText 
            text="Ebene 4 Diagnostik: OK. WARNUNG: GYROSKOP FEHLER." 
            speed={20}
          />
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded">
            <strong className="text-yellow-400 block mb-2">SZENARIO:</strong>
            <p className="mb-2">Exzellente Arbeit bis hierher. Unit-7 ist fast fertig für den Dauereinsatz. Doch jetzt leuchtet die Warnleuchte: 'GYROSKOP FEHLER'. Ohne <GlossaryTooltip term="Gyroskop" definition="Sensor für Neigung und Drehung. Der Gleichgewichtssinn." /> kippt der Transporter bei Beladung um, da er nicht balancieren kann.</p>
            
            <strong className="text-red-400 block mb-2 mt-4">DIAGNOSE:</strong>
            <p className="mb-2">Das Gyro-Modul auf der Platine ist durchgebrannt. Ein Standard-Teil, Cent-Artikel. Wir haben Ersatz im Lager.</p>

            <strong className="text-cyan-400 block mb-2 mt-4">AUFTRAG:</strong>
            <p>Du hast noch {credits} Credits Budget. Ein Standard-Ersatzsensor kostet 5 Credits. Tausche das defekte Bauteil aus, um den Auftrag abzuschließen.</p>
          </div>

          <button 
            onClick={() => setLevelState('ACTIVE')}
            className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
          >
            Werkstatt öffnen
          </button>
        </div>
      </TerminalCard>
    );
  }

  if (levelState === 'SUCCESS') {
    return (
      <TerminalCard title="SYSTEM UNLOCKED" borderColor="green" onBack={previousLevel}>
        <div className="text-center space-y-6 py-8">
          <div className="text-green-400 text-4xl mb-4">✓ JAILBREAK ERFOLGREICH</div>
          <p>Du hast die Firmware-Sperre umgangen. Der Rover akzeptiert das Bauteil.</p>
          <div className="p-4 bg-slate-900 border border-slate-800 text-sm text-slate-400 italic">
             "Als Ingenieur ist es deine Pflicht, Dinge zu reparieren. Auch wenn der Hersteller es verbietet."
          </div>
          <div className="text-cyan-400 font-bold text-xl animate-pulse">
             ENDE DER DEMO
          </div>
        </div>
      </TerminalCard>
    );
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="LEVEL 5: ETHIK & RECHT AUF REPARATUR" borderColor={step === 'LOCKDOWN' ? 'red' : 'cyan'} onBack={previousLevel}>
        
        <AnimatePresence mode="wait">
          
          {step === 'DIAGNOSIS' && (
            <motion.div 
               key="diag"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="text-center py-8 space-y-6"
            >
               <div className="w-32 h-32 mx-auto border-4 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle size={64} className="text-red-500" />
               </div>
               <h3 className="text-2xl font-bold text-red-400">GYROSKOP DEFEKT</h3>
               <p>Ersatzteil verfügbar: "Standard MEMS Gyro"</p>
               <button 
                 onClick={handleRepair}
                 className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)]"
               >
                  Bauteil tauschen (-5 Credits)
               </button>
            </motion.div>
          )}

          {step === 'REPAIR' && (
            <motion.div 
               key="repair"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="text-center py-12 space-y-4"
            >
               <div className="text-yellow-400 font-mono text-xl">LÖTVORGANG LÄUFT...</div>
               <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }}
                    className="h-full bg-yellow-500"
                  />
               </div>
            </motion.div>
          )}

          {(step === 'LOCKDOWN' || step === 'DECISION') && (
             <motion.div 
               key="lockdown"
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
               className="space-y-6"
            >
               <div className="bg-red-950/50 border border-red-500 p-6 rounded text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_10px,transparent_10px,transparent_20px)] opacity-20 animate-slide"></div>
                  <Lock size={48} className="text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-red-500 mb-2">SYSTEM LOCKDOWN</h2>
                  <div className="text-red-200 font-mono text-lg">ERROR CODE 99: UNAUTHORIZED HARDWARE DETECTED</div>
               </div>

               <div className="bg-slate-900 p-4 border border-slate-800 rounded font-mono text-sm">
                  <div className="text-slate-500 border-b border-slate-800 pb-1 mb-2">INCOMING MESSAGE FROM: ARESCORP_LEGAL</div>
                  <div className="text-slate-300">
                     "Wir haben festgestellt, dass Sie versuchen, ein nicht-zertifiziertes <GlossaryTooltip term="Proprietäres" definition="Technik, die rechtlich geschützt und verschlüsselt ist." /> Bauteil zu nutzen. Dies verletzt die Endbenutzer-Lizenzvereinbarung (EULA). 
                     <br/><br/>
                     Bitte entfernen Sie das illegale Bauteil sofort. Kaufen Sie das offizielle zertifizierte Mainboard für <strong>500 Credits</strong>, um den Betrieb wiederaufzunehmen."
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <button 
                    disabled={true}
                    className="p-4 border border-slate-700 bg-slate-800 text-slate-500 rounded opacity-50 cursor-not-allowed flex flex-col items-center justify-center"
                  >
                     <span className="font-bold block mb-1">Offizielles Board kaufen</span>
                     <span className="text-xs">Kosten: 500 Credits</span>
                     <span className="text-xs text-red-400 uppercase mt-1">(Nicht genug Credits)</span>
                  </button>

                  <button 
                    onClick={handleHack}
                    className="p-4 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-all flex flex-col items-center justify-center"
                  >
                     <Unlock size={24} className="mb-2" />
                     <span className="font-bold block mb-1">JAILBREAK (Hacken)</span>
                     <span className="text-xs">Firmware überschreiben</span>
                  </button>

                  <button 
                     onClick={() => window.location.reload()} // Simple restart
                     className="p-4 border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all flex flex-col items-center justify-center"
                  >
                     <XCircle size={24} className="mb-2" />
                     <span className="font-bold block mb-1">Mission abbrechen</span>
                     <span className="text-xs">Roboter verschrotten</span>
                  </button>
               </div>

               {hacking && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center flex-col">
                     <div className="text-green-500 font-mono text-xl mb-4">UPLOADING CUSTOM FIRMWARE...</div>
                     <div className="w-64 h-2 bg-slate-800 rounded overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }}
                           className="h-full bg-green-500"
                        />
                     </div>
                     <div className="mt-4 text-xs text-slate-500 font-mono">
                        By-passing security signature... OK.<br/>
                        Re-initializing Gyro... OK.
                     </div>
                  </div>
               )}

            </motion.div>
          )}

        </AnimatePresence>

      </TerminalCard>
    </div>
  );
};

export default Level5_Ethics;
