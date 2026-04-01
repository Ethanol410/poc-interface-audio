import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';

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
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #b8e8ff 0%, #e8f8ff 40%, #d4f5e0 100%)' }}
      >
        {/* Decorative clouds */}
        <div className="absolute top-4 left-6 w-16 h-5 bg-white/70 rounded-full" />
        <div className="absolute top-2 left-14 w-10 h-4 bg-white/60 rounded-full" />
        <div className="absolute top-5 right-10 w-12 h-4 bg-white/60 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Rex */}
          <div className="text-center mb-4">
            <motion.div
              className="text-7xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🐕
            </motion.div>
          </div>

          {/* Rex bubble */}
          <div className="mb-4">
            <RexBubble message="Salut ! Je suis Rex 🐾 On va résoudre cette enquête ensemble !" />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-braincity-primary">BRAIN CITY 🏙️</h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">Mission : Trouve l'agresseur !</p>
          </div>

          {/* Form */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-braincity-primary text-sm font-bold mb-2"
                >
                  👤 Ton prénom d'agent !
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-sky-50 border-2 border-sky-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-braincity-primary transition-all"
                  placeholder="Ex : Léa, Maxime…"
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full font-black py-3 rounded-2xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                style={{ background: isLoading ? '#94a3b8' : 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion…' : '🚀 COMMENCER L\'ENQUÊTE !'}
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
