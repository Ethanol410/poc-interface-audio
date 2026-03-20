import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';

const LoginScreen = () => {
  const [matricule, setMatricule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { scenario: scenarioId } = useAudioStore();
  const scenario = getScenario(scenarioId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (matricule.length >= 4) {
      sessionStorage.setItem('agent-matricule', matricule);
      setTimeout(() => {
        navigate('/workspace');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-forensics-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
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

        {/* Login form */}
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
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
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

        {/* Mission brief */}
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
