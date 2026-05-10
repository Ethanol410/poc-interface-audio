import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';

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

const StoryBriefScreen = () => {
  const navigate = useNavigate();
  const { scenario: scenarioId } = useAudioStore();
  const { isBrainCity } = useScenarioTheme();
  const scenario = getScenario(scenarioId);

  const handleContinue = () => {
    navigate('/workspace');
  };

  if (isBrainCity) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-[#FFF9EC]"
        style={{ backgroundImage: 'radial-gradient(circle, #E0D4C3 2px, transparent 2px)', backgroundSize: '24px 24px' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl bg-white border-4 border-braincity-border rounded-[32px] p-8 shadow-[0_8px_0_0_#073B4C] relative"
        >
          {/* Ricardo Header */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b-4 border-braincity-border border-dashed">
            <img src="/images/inspecteur/Ricardo_Pouleto_sticker.png" alt="Ricardo" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="font-bangers text-3xl tracking-wider" style={{ color: BC.coral }}>
                MESSAGE DU COMMISSAIRE
              </h2>
              <p className="font-fredoka font-bold text-sm" style={{ color: BC.text }}>
                Ricardo Pouleto
              </p>
            </div>
          </div>

          {/* Crime scene banner */}
          <motion.img
            src="/images/crime_scene.png"
            alt="Scène de crime — Brain City"
            className="w-full h-48 object-cover rounded-2xl border-4 border-braincity-border mb-6"
            style={{ boxShadow: '0 4px 0 0 #073B4C' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          />

          <div className="space-y-4 mb-8">
            {scenario.storyBrief.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="font-fredoka text-lg font-semibold leading-relaxed"
                style={{ color: BC.text }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.button
            onClick={handleContinue}
            className="w-full py-4 font-bangers text-2xl tracking-widest rounded-2xl text-white border-4 border-braincity-border"
            style={{
              background: BC.teal,
              boxShadow: `0 4px 0 0 #073B4C`,
            }}
            whileHover={{ scale: 1.02, translateY: -2, boxShadow: `0 6px 0 0 #073B4C` }}
            whileTap={{ scale: 0.98, translateY: 4, boxShadow: `0 0 0 0 #073B4C` }}
          >
            C'EST COMPRIS !
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forensics-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl w-full border border-forensics-cyan-dark bg-forensics-bg-light p-8 rounded-lg relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forensics-cyan via-forensics-blue to-transparent" />
        
        <div className="flex items-center gap-4 mb-8 border-b border-forensics-cyan-dark pb-4">
          <div className="w-12 h-12 rounded-full border border-forensics-cyan/50 bg-forensics-cyan/10 flex items-center justify-center shrink-0">
            <span className="text-forensics-cyan text-xl font-mono">V</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-forensics-cyan/10 text-forensics-cyan text-[10px] font-mono tracking-wider border border-forensics-cyan/30">
                TOP SECRET
              </span>
              <span className="text-gray-500 text-xs font-mono">CH. SÉCURISÉ 08</span>
            </div>
            <h2 className="text-xl font-bold font-mono tracking-wider text-white">
              NOTE DE SERVICE SRIS
            </h2>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          {scenario.storyBrief.map((paragraph, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.5 }}
              className="font-mono text-sm leading-relaxed text-gray-300"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        <div className="flex justify-end">
          <motion.button
            onClick={handleContinue}
            className="px-8 py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold tracking-wider hover:bg-white transition-colors uppercase rounded"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ACCEPTER LA MISSION
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryBriefScreen;
