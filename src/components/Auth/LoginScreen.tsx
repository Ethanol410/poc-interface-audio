import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';

const LoginScreen = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { scenario: scenarioId } = useAudioStore();
  const { isBrainCity } = useScenarioTheme();
  const scenario = getScenario(scenarioId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (name.length >= (isBrainCity ? 2 : 4)) {
      sessionStorage.setItem('agent-matricule', name);
      setTimeout(() => navigate('/workspace'), 1500);
    }
  };

  if (isBrainCity) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 bg-[#FFF9EC]"
        style={{ backgroundImage: 'radial-gradient(circle, #E0D4C3 2px, transparent 2px)', backgroundSize: '24px 24px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Ricardo bubble */}
          <div className="mb-4">
            <RicardoBubble
              message="Salut ! Je suis Ricardo Pouleto 🐔 On va résoudre cette enquête ensemble !"
              soundOnMessage="chant"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bangers tracking-wider text-[#EF476F]">BRAIN CITY 🏙️</h1>
            <p className="text-lg text-[#073B4C] font-fredoka font-bold mt-1">Mission : Trouve l'agresseur !</p>
          </div>

          {/* Form */}
          <motion.div
            className="bg-white rounded-[32px] border-4 border-[#073B4C] p-6 shadow-[0_6px_0_0_#073B4C]"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-[#073B4C] font-bangers tracking-wide text-xl mb-3"
                >
                  👤 Ton prénom d'agent !
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFF9EC] border-4 border-[#073B4C] text-[#073B4C] font-fredoka font-bold text-lg px-4 py-3 rounded-2xl focus:outline-none focus:shadow-[0_4px_0_0_#073B4C] transition-all placeholder:text-[#6b7280] placeholder:font-semibold"
                  placeholder="Ex : Léa, Maxime…"
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full font-bangers text-[#073B4C] text-2xl py-4 rounded-2xl border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                style={{ background: isLoading ? '#FFF9EC' : '#06D6A0' }}
                disabled={isLoading}
              >
                {isLoading ? 'CONNEXION…' : '🚀 COMMENCER !'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Adult theme (corbeau)
  return (
    <div className="min-h-screen bg-forensics-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-forensics-cyan mb-2 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {scenario.subtitle.split('—')[0].trim()}
          </motion.h1>
          <motion.p
            className="text-red-500 text-sm font-mono uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            ⚠ ACCÈS RESTREINT ⚠
          </motion.p>
        </div>

        <motion.div
          className="bg-forensics-bg-light border-2 border-forensics-cyan p-8 rounded-lg glow-cyan"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="matricule"
                className="block text-forensics-cyan text-sm font-mono mb-2 uppercase"
              >
                Matricule Agent
              </label>
              <input
                id="matricule"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-forensics-bg border border-forensics-cyan-dark text-white px-4 py-3 rounded font-mono focus:outline-none focus:border-forensics-cyan focus:glow-cyan transition-all"
                placeholder="Entrez votre matricule"
                required
                minLength={4}
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-forensics-cyan text-forensics-bg font-mono font-bold py-3 rounded uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'VÉRIFICATION...' : 'ACCÉDER AU DOSSIER'}
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-gray-400 text-xs font-mono text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 }}
          >
            {scenario.subtitle.split('—')[1]?.trim() ?? 'Division Criminalistique Audio'}
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-500 text-sm font-mono">
            Mission : {scenario.missionBrief.mission}
            <br />
            Preuve : {scenario.missionBrief.evidence}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
