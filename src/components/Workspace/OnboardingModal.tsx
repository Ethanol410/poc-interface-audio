import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import { getScenario } from '@/data/scenarios';

interface OnboardingModalProps {
  scenarioId: 'corbeau' | 'braincity';
  isOpen: boolean;
  onClose: () => void;
}

const BC = {
  mustard: '#FFD166',
  teal: '#06D6A0',
  coral: '#EF476F',
  blue: '#118AB2',
  pink: '#FF70A6',
  violet: '#9D4EDD',
  border: '#073B4C',
  bg: '#FFF9EC',
  text: '#073B4C',
  dim: '#6b7280',
};

const BC_CARD = 'bg-white border-4 border-braincity-border rounded-[32px] overflow-hidden shadow-[0_6px_0_0_#073B4C]';

const OnboardingModal = memo(({ scenarioId, isOpen, onClose }: OnboardingModalProps) => {
  const { isBrainCity } = useScenarioTheme();
  const scenario = getScenario(scenarioId);

  if (!isOpen || !scenario.onboarding) return null;

  const { onboarding } = scenario;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`max-w-2xl w-full ${
            isBrainCity
              ? `${BC_CARD} p-8 flex flex-col gap-6`
              : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden'
          }`}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {!isBrainCity && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forensics-cyan via-forensics-blue to-transparent" />
          )}

          <div className="flex items-start gap-6">
            <div className={`shrink-0 rounded-2xl flex items-center justify-center ${
              isBrainCity ? 'w-32 h-32 bg-braincity-bg border-4 border-braincity-border shadow-[0_4px_0_0_#073B4C]' : 'w-24 h-24 bg-forensics-bg border border-forensics-cyan/30'
            }`}>
              {onboarding.agentImage ? (
                <img src={onboarding.agentImage} alt={onboarding.agentName} className={isBrainCity ? "w-24 h-24 object-contain" : "w-16 h-16 object-contain"} />
              ) : (
                <span className={`text-4xl ${isBrainCity ? 'text-braincity-blue' : 'text-forensics-cyan'}`}>
                  🕵️
                </span>
              )}
            </div>

            <div className="flex-1">
              {isBrainCity ? (
                <>
                  <h2 className="font-bangers text-3xl tracking-wider mb-1" style={{ color: BC.coral }}>
                    {onboarding.agentName}
                  </h2>
                  <p className="font-fredoka text-sm font-bold opacity-80 mb-4" style={{ color: BC.blue }}>
                    {onboarding.agentRole}
                  </p>
                  <p className="font-fredoka font-semibold text-lg" style={{ color: BC.text }}>
                    {onboarding.greeting}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-forensics-cyan/10 border border-forensics-cyan/30 text-forensics-cyan text-[10px] font-mono tracking-wider">
                      TRANSMISSION ENTRANTE
                    </span>
                    <span className="text-gray-500 text-xs font-mono">SECURE CH. 08</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-mono tracking-wider">
                    {onboarding.agentName}
                  </h2>
                  <p className="text-sm font-mono text-forensics-cyan mb-4">
                    {onboarding.agentRole}
                  </p>
                  <p className="text-gray-300 font-mono text-sm leading-relaxed">
                    "{onboarding.greeting}"
                  </p>
                </>
              )}
            </div>
          </div>

          <div className={`space-y-3 ${isBrainCity ? '' : 'bg-black/30 border border-white/5 p-4 rounded-lg'}`}>
            <h3 className={`font-bold ${isBrainCity ? 'font-bangers text-2xl tracking-wider' : 'font-mono text-xs text-forensics-cyan mb-4'}`}
                style={isBrainCity ? { color: BC.violet } : {}}>
              {isBrainCity ? 'TA MISSION :' : 'OBJECTIFS ET PROCÉDURES :'}
            </h3>
            <ul className="space-y-3">
              {onboarding.instructions.map((inst, i) => (
                <li key={i} className={`flex items-start gap-3 ${isBrainCity ? 'font-fredoka text-sm font-semibold' : 'font-mono text-sm text-gray-300'}`}
                    style={isBrainCity ? { color: BC.text } : {}}>
                  <span className={`shrink-0 mt-0.5 ${isBrainCity ? 'text-xl' : 'text-forensics-green text-xs'}`}>
                    {isBrainCity ? '👉' : '▸'}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-end">
            <motion.button
              onClick={onClose}
              className={`${
                isBrainCity
                  ? `px-8 py-3 font-bangers text-xl tracking-wider rounded-xl text-white border-4 border-braincity-border`
                  : 'px-6 py-2 bg-forensics-cyan text-forensics-bg font-mono font-bold tracking-wider hover:bg-white transition-colors'
              }`}
              style={isBrainCity ? {
                background: BC.teal,
                boxShadow: `0 4px 0 0 #073B4C`
              } : {}}
              whileHover={isBrainCity ? { scale: 1.02, translateY: -2, boxShadow: `0 6px 0 0 #073B4C` } : { scale: 1.02 }}
              whileTap={isBrainCity ? { scale: 0.98, translateY: 4, boxShadow: `0 0 0 0 #073B4C` } : { scale: 0.98 }}
            >
              {isBrainCity ? "C'EST PARTI !" : "ACCEPTER LA MISSION"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default OnboardingModal;
