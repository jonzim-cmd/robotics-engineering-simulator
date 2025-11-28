'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from './TypewriterText'; // Assuming TypewriterText exists in ui components
import { useGameStore } from '@/store/gameStore'; // To update credits and level state
import { trackEvent } from '@/app/actions';

interface HaraldDialogProps {
  onApproved: (cost: number) => void;
  onCancel: () => void;
  totalCost: number;
}

// Monologue text for Harald - shorter version
const HARALD_MONOLOGUE = `Äh… ja, guten Tag. Harald Schuldenbremse, interne Budgetkontrolle.

Setzen Sie sich – aber nicht zu bequem, das hier geht nicht so schnell.

Also… ich sehe in Ihrem Antrag, Sie möchten Credits. Das klingt schon nach einem größeren Posten. Das ist… schwierig. Sehr schwierig.

Ich gebe ungern Geld frei, ohne dass ich ganz genau weiß, wofür jeder einzelne Credit eingesetzt wird.

Fangen wir mal an: Für was genau brauchen Sie die Teile? Bitte exakt. Nicht „für den Roboter", das ist mir zu allgemein.

Ich brauche Projektname, Projektnummer, Kostenstelle, Verantwortliche Person und – ganz wichtig – die voraussichtliche Lebensdauer der Teile. Ohne Nutzungsdauer kriege ich das nicht in meine Abschreibungstabelle.

Öh… ich sehe hier außerdem gar keine Alternativangebote. Haben Sie denn schon günstigere Teile geprüft? Mindestens drei Vergleichsangebote brauche ich. Sonst kann ich das nicht objektiv beurteilen.

Wie hoch ist denn die Summe überhaupt… ach du meine Güte… das ist ja richtig viel. Puh. Das tut mir ja schon körperlich weh.

Ganz ehrlich, bei so einem Betrag würde ich normalerweise sagen: „Nein." Einfach nein. Sofort. Aber… hm… na gut, wir schauen genauer hin.

Sagen Sie, hat die Chefin das schriftlich abgesegnet oder nur mündlich? Mündlich zählt nicht. Ich bräuchte schon eine unterschriebene Bedarfsbegründung, am besten mit Stempel.

Ohne Stempel ist das für mich nur eine Meinungsäußerung. Und Meinung ist haushaltstechnisch leider nicht relevant.

Also, folgendes Vorgehen: Sie füllen Formular A-17b aus – das ist der „Antrag auf Ressourcenfreigabe mit erhöhter Schuldengefährdung". Dazu brauche ich die detaillierte Kostenaufstellung, Cent-genau. CENT-genau, verstehen Sie?

Dann noch die Risikoeinschätzung, unterschrieben von Ihrer Projektleitung. Und das Ganze bitte in dreifacher Ausfertigung.

Wie, das ist eilig? Heute noch? Nein, also… so funktioniert das nicht. Eilig und Schuldenbremse, das passt einfach nicht zusammen.

Aber gut… *seufz*… wenn die Chefin das schriftlich befürwortet hat – mit vollständigem Formular, sauber ausgefüllt – dann, ja, dann könnte ich mich vielleicht durchringen, das zu genehmigen. Unter Bauchschmerzen natürlich.

Also: Hier ist das Formular. 12 Seiten. Bitte überall unterschreiben. Und schreiben Sie deutlich. Wenn ich Ihre Zahlen nicht lesen kann, fangen wir von vorne an.

Ja… dann sehen wir weiter. Vielleicht.`;

export const HaraldDialog: React.FC<HaraldDialogProps> = ({ onApproved, onCancel, totalCost }) => {
  const { userId } = useGameStore();
  const [phase, setPhase] = useState<'monologue' | 'form' | 'approval'>('monologue');
  const [showFullMonologue, setShowFullMonologue] = useState(false);
  const [rightArrowPresses, setRightArrowPresses] = useState(0);
  const [monologueComplete, setMonologueComplete] = useState(false);

  // Form state
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [justification, setJustification] = useState('');
  const [signed, setSigned] = useState(false);

  const canSubmit = userName.trim() !== '' && justification.trim() !== '' && signed;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (phase === 'monologue') {
      if (event.key === 'ArrowRight') {
        setRightArrowPresses(prev => prev + 1);
        if (rightArrowPresses >= 1) { // Two presses (0 -> 1 -> 2)
          setShowFullMonologue(true);
        }
      } else {
        setRightArrowPresses(0); // Reset if other key is pressed
      }
    }
  }, [phase, rightArrowPresses]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMonologueComplete = () => {
    setMonologueComplete(true);
  };

  const handleSubmitForm = async () => {
    if (userId) {
      await trackEvent(userId, 2, 'HARALD_FORM_SUBMIT', {
        totalCost,
        userName,
        justification,
        date: currentDate
      });
    }

    setPhase('approval');
    setTimeout(() => {
      onApproved(totalCost); // Pass totalCost back to deduct
    }, 4000); // Show stamp for 4 seconds
  };

  const renderMonologue = () => (
    <motion.div
      key="monologue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div
        className="flex-1 overflow-y-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#a8a29e #e7e5e4',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Inner container with limited height - creates scroll space without visible borders */}
        <div
          className="px-6 pt-6 pb-20 text-stone-800 text-base leading-relaxed whitespace-pre-wrap"
          style={{
            fontFamily: 'serif'
          }}
        >
          {showFullMonologue ? (
            <>{HARALD_MONOLOGUE}</>
          ) : (
            <TypewriterText text={HARALD_MONOLOGUE} speed={25} onComplete={handleMonologueComplete} />
          )}
        </div>
      </div>
      <div className="p-4 border-t-2 border-stone-400 bg-stone-200 shrink-0">
        {!showFullMonologue && (
          <p className="text-sm text-stone-600 mb-2">
            <kbd className="px-2 py-0.5 bg-stone-300 border-2 border-stone-500 rounded-sm text-xs font-bold">→ →</kbd> zum Überspringen
          </p>
        )}
        <motion.button
          whileHover={{ scale: (monologueComplete || showFullMonologue) ? 1.02 : 1 }}
          whileTap={{ scale: (monologueComplete || showFullMonologue) ? 0.98 : 1 }}
          onClick={() => (monologueComplete || showFullMonologue) && setPhase('form')}
          disabled={!monologueComplete && !showFullMonologue}
          className={`w-full py-3 font-bold rounded-sm uppercase tracking-wider shadow-lg border-2 transition-all ${
            (monologueComplete || showFullMonologue)
              ? 'bg-amber-600 hover:bg-amber-500 text-stone-900 border-amber-700 cursor-pointer'
              : 'bg-stone-400 text-stone-600 border-stone-500 cursor-not-allowed'
          }`}
          style={{ fontFamily: 'serif', textShadow: (monologueComplete || showFullMonologue) ? '1px 1px 0px rgba(255,255,255,0.3)' : 'none' }}
        >
          ► Formular A-17b öffnen
        </motion.button>
      </div>
    </motion.div>
  );

  const renderForm = () => (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full bg-stone-100 overflow-hidden"
    >
      <div
        className="flex-1 overflow-y-scroll px-6 pt-6 pb-6"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#a8a29e #e7e5e4',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Paper-style form header */}
        <div className="bg-white border-2 border-stone-400 p-4 mb-4 shadow-md" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 25px, rgba(0,0,0,0.03) 25px, rgba(0,0,0,0.03) 26px)',
          fontFamily: 'serif'
        }}>
          <div className="border-b-4 border-double border-stone-800 pb-2 mb-2">
            <h3 className="text-2xl font-bold text-stone-900 text-center tracking-tight">FORMULAR A-17b</h3>
            <p className="text-center text-xs text-stone-600 mt-1">Antrag auf Ressourcenfreigabe mit erhöhter Schuldengefährdung</p>
          </div>
          <div className="flex justify-between text-xs text-stone-700 mt-3">
            <span>Revision 3.14.159 (gültig ab 01.01.2024)</span>
            <span className="font-mono">Form-ID: BK-A17b-v3</span>
          </div>
        </div>

        {/* Warning box */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-3 mb-6 text-xs text-amber-900" style={{ fontFamily: 'serif' }}>
          <p className="font-bold mb-1">⚠ WICHTIGER HINWEIS:</p>
          <p>Bitte füllen Sie alle Felder sorgfältig und CENT-GENAU aus. Unvollständige Anträge werden NICHT bearbeitet und verzögern den Prozess um mindestens 6-8 Wochen.</p>
        </div>

        <div className="bg-white border-2 border-stone-300 p-5 mb-4 shadow-sm" style={{ fontFamily: 'serif' }}>
          <h4 className="text-sm font-bold text-stone-800 mb-3 pb-1 border-b border-stone-300">§1 STAMMDATEN (nur Lesezugriff)</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Projekt:</label>
              <input type="text" value="Unit-7 Recovery" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Kostenstelle:</label>
              <input type="text" value="Robotics-Dept 42" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Projektnummer:</label>
              <input type="text" value="PRJ-UNIT7-REC-001" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Unterprojekt:</label>
              <input type="text" value="Level 3 Konfiguration" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Verantwortliche Person:</label>
              <input type="text" value="Chefin Bazlen" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
            <div>
              <label className="block text-stone-700 text-xs font-bold mb-1">Voraussichtl. Lebensdauer:</label>
              <input type="text" value="5 Jahre (§12 AbschreibVO)" readOnly className="w-full p-1.5 bg-stone-50 border-2 border-stone-400 rounded-none text-stone-800 font-mono text-sm shadow-inner" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-stone-300 p-5 mb-4 shadow-sm" style={{ fontFamily: 'serif' }}>
          <h4 className="text-sm font-bold text-stone-800 mb-3 pb-1 border-b border-stone-300">§2 ANTRAGSTELLER-ANGABEN</h4>

          <div className="mb-4">
            <label htmlFor="userName" className="block text-stone-700 text-xs font-bold mb-1">
              Vollständiger Name (keine Abkürzungen):
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 bg-white border-2 border-stone-500 rounded-none text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-600 font-mono"
              placeholder="Nachname, Vorname"
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="currentDate" className="block text-stone-700 text-xs font-bold mb-1">
              Antragsdatum (TT.MM.JJJJ):
            </label>
            <input
              id="currentDate"
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full p-2 bg-white border-2 border-stone-500 rounded-none text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-600 font-mono"
            />
          </div>
        </div>

        <div className="bg-white border-2 border-stone-300 p-5 mb-4 shadow-sm" style={{ fontFamily: 'serif' }}>
          <h4 className="text-sm font-bold text-stone-800 mb-3 pb-1 border-b border-stone-300">§3 BEDARFSBEGRÜNDUNG (Pflichtfeld)</h4>

          <div className="mb-3">
            <label htmlFor="justification" className="block text-stone-700 text-xs font-bold mb-1">
              Ausführliche Darlegung der Notwendigkeit inkl. Begründung der Nicht-Substituierbarkeit durch kostengünstigere Alternativen (mind. 50 Zeichen):
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={6}
              className="w-full p-2 bg-white border-2 border-stone-500 rounded-none text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-600 resize-y font-mono text-sm leading-relaxed"
              placeholder="Begründen Sie detailliert, weshalb die ausgewählten Mechanismen für die Mission unabdingbar sind und keine günstigeren Alternativen in Frage kommen. Gehen Sie auf technische Spezifikationen, Einsatzbedingungen und wirtschaftliche Erwägungen ein."
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.05) 23px, rgba(0,0,0,0.05) 24px)',
                fontFamily: 'monospace'
              }}
            ></textarea>
            <div className="text-xs text-stone-500 mt-1">Zeichen: {justification.length} / min. 50</div>
          </div>
        </div>

        <div className="bg-white border-2 border-stone-300 p-5 mb-6 shadow-sm" style={{ fontFamily: 'serif' }}>
          <h4 className="text-sm font-bold text-stone-800 mb-3 pb-1 border-b border-stone-300">§4 RECHTSVERBINDLICHE UNTERSCHRIFT</h4>

          <div className="mb-2">
            <label className="block text-stone-700 text-xs font-bold mb-2">
              Ich bestätige hiermit die Richtigkeit aller Angaben und übernehme die haushaltsrechtliche Verantwortung:
            </label>
            <motion.div
              className={`w-full h-24 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                signed
                  ? 'bg-green-50 border-green-600'
                  : 'bg-stone-50 border-stone-500 hover:bg-stone-100'
              }`}
              onClick={() => setSigned(!signed)}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundImage: signed ? 'none' : 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)'
              }}
            >
              {signed ? (
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 300 80"
                  className="w-4/5 h-4/5"
                >
                  {/* Realistic signature - cursive handwriting style */}
                  <motion.path
                    d="M 20 50 Q 30 35, 45 40 T 70 45 Q 80 42, 85 50 Q 88 55, 92 50 T 110 48"
                    fill="transparent"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0 }}
                  />
                  <motion.path
                    d="M 95 50 Q 100 42, 108 48 Q 115 54, 122 50 Q 130 45, 138 52 T 160 48"
                    fill="transparent"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                  <motion.path
                    d="M 165 50 Q 172 38, 185 45 Q 195 50, 205 44 Q 215 38, 225 48 Q 235 56, 245 50 Q 255 44, 265 50 L 280 48"
                    fill="transparent"
                    stroke="#1e3a8a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                  {/* Underline flourish */}
                  <motion.path
                    d="M 25 60 Q 100 65, 180 58 Q 230 55, 270 62"
                    fill="transparent"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                  />
                </motion.svg>
              ) : (
                <div className="text-center">
                  <span className="text-stone-500 text-sm block">⬜ Hier klicken zum Unterschreiben</span>
                  <span className="text-stone-400 text-xs mt-1 block">(erforderlich gemäß §4 Abs. 2 BudgetVO)</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Extra spacing at bottom to ensure everything is scrollable */}
        <div className="h-32"></div>
      </div>

      <div className="border-t-2 border-stone-400 pt-4 pb-4 px-6 bg-stone-200 shrink-0">
        <motion.button
          whileHover={{ scale: canSubmit ? 1.02 : 1 }}
          whileTap={{ scale: canSubmit ? 0.98 : 1 }}
          onClick={handleSubmitForm}
          disabled={!canSubmit}
          className={`w-full py-3 font-bold text-base rounded-sm uppercase tracking-wide transition-all border-2 ${
            canSubmit
              ? 'bg-amber-600 hover:bg-amber-500 text-stone-900 shadow-lg border-amber-700'
              : 'bg-stone-400 text-stone-600 cursor-not-allowed border-stone-500'
          }`}
          style={{ fontFamily: 'serif', textShadow: canSubmit ? '1px 1px 0px rgba(255,255,255,0.3)' : 'none' }}
        >
          {canSubmit ? `✓ Antrag einreichen (${totalCost} Credits)` : '⚠ Bitte alle Felder ausfüllen'}
        </motion.button>
        <button
          onClick={onCancel}
          className="w-full mt-2 py-2 text-stone-600 hover:text-stone-800 transition-colors text-sm"
          style={{ fontFamily: 'serif' }}
        >
          Antrag verwerfen
        </button>
      </div>
    </motion.div>
  );

  const renderApproval = () => (
    <motion.div
      key="approval"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 relative bg-white"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 25px, rgba(0,0,0,0.02) 25px, rgba(0,0,0,0.02) 26px)'
      }}
    >
      {/* Paper form background */}
      <div className="absolute inset-0 bg-white opacity-95"></div>

      {/* The form with stamp */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 bg-stone-50 border-2 border-stone-300 p-8 shadow-xl max-w-2xl w-full"
      >
        <div className="border-b-2 border-stone-400 pb-3 mb-4">
          <h3 className="text-xl font-bold text-stone-900 text-center" style={{ fontFamily: 'serif' }}>
            FORMULAR A-17b
          </h3>
          <p className="text-xs text-stone-600 text-center mt-1" style={{ fontFamily: 'serif' }}>
            Antrag auf Ressourcenfreigabe
          </p>
        </div>

        <div className="space-y-2 text-left text-sm text-stone-700 mb-8" style={{ fontFamily: 'serif' }}>
          <p><strong>Projekt:</strong> Unit-7 Recovery</p>
          <p><strong>Kostenstelle:</strong> Robotics-Dept 42</p>
          <p><strong>Antragssumme:</strong> {totalCost} Credits</p>
          <p><strong>Status:</strong> In Bearbeitung...</p>
        </div>

        {/* The dramatic stamp */}
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: -15, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.6
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.3,
              delay: 0.9,
              times: [0, 0.5, 1]
            }}
            className="relative"
          >
            {/* Stamp outer circle */}
            <div className="w-72 h-72 rounded-full border-8 border-green-700 bg-green-600/20 flex items-center justify-center relative"
              style={{
                boxShadow: '0 4px 20px rgba(21, 128, 61, 0.4), inset 0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              {/* Inner details */}
              <div className="absolute inset-4 rounded-full border-4 border-green-700"></div>

              {/* Text */}
              <div className="text-center">
                <div className="text-6xl font-black text-green-800 leading-none mb-2" style={{
                  fontFamily: 'serif',
                  textShadow: '2px 2px 0px rgba(255,255,255,0.3)',
                  letterSpacing: '0.05em'
                }}>
                  GENEHMIGT
                </div>
                <div className="text-sm font-bold text-green-900" style={{ fontFamily: 'serif' }}>
                  Harald Schuldenbremse
                </div>
                <div className="text-xs text-green-800 font-mono mt-1">
                  {new Date().toLocaleDateString('de-DE')}
                </div>
              </div>

              {/* Stamp texture overlay */}
              <div className="absolute inset-0 rounded-full opacity-30 mix-blend-multiply"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
                }}
              ></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Signature line at bottom */}
        <div className="mt-16 pt-4 border-t border-stone-400">
          <div className="flex justify-between items-end text-xs text-stone-600" style={{ fontFamily: 'serif' }}>
            <div>
              <div className="mb-1">Genehmigt durch:</div>
              <div className="font-bold">H. Schuldenbremse</div>
            </div>
            <div className="text-right">
              <div className="mb-1">Datum:</div>
              <div className="font-mono">{new Date().toLocaleDateString('de-DE')}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-8 text-base text-stone-700 font-bold z-10"
        style={{ fontFamily: 'serif' }}
      >
        Die Finanzierung für {totalCost} Credits wurde bewilligt.
      </motion.p>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-gray-400 via-gray-300 to-gray-400 p-3 md:p-4">
      {/* Ugly office wallpaper pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)`
      }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="max-w-4xl w-full h-[90vh] bg-linear-to-b from-stone-200 to-stone-300 rounded-sm shadow-2xl border-4 border-stone-400 overflow-hidden flex flex-col relative"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.3)'
        }}
      >
        {/* Ugly Header - like old Windows 95 */}
        <div className="bg-linear-to-r from-stone-400 via-stone-500 to-stone-400 border-b-2 border-stone-600 px-4 md:px-6 py-2 shrink-0 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-600 border-2 border-stone-700 flex items-center justify-center text-stone-300 font-bold text-xs">
              HS
            </div>
            <h3 className="text-base md:text-lg font-bold text-stone-800 tracking-tight flex items-center gap-2" style={{ fontFamily: 'serif' }}>
              <span className="text-xl">🤓</span>
              Budgetkontrolle - Harald Schuldenbremse
            </h3>
          </div>
          <div className="bg-amber-100 border-2 border-amber-600 px-2 md:px-3 py-0.5 rounded-sm shrink-0 shadow-inner">
            <span className="text-xs font-mono text-amber-900 font-bold tracking-wide">VERTRAULICH</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative bg-linear-to-b from-stone-100 to-stone-200">
          <AnimatePresence mode="wait">
            {phase === 'monologue' && renderMonologue()}
            {phase === 'form' && renderForm()}
            {phase === 'approval' && renderApproval()}
          </AnimatePresence>
        </div>

        {/* Footer bar - ugly office style */}
        <div className="bg-stone-400 border-t-2 border-stone-500 px-3 py-1 text-xs text-stone-700 font-mono flex justify-between">
          <span>Abt. Finanzwesen | Raum B-17</span>
          <span>Tel: 0815/4711-23</span>
        </div>
      </motion.div>
    </div>
  );
};