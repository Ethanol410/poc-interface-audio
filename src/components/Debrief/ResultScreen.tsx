import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';

interface LocationState {
  suspect?: Suspect;
}

const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { suspect } = (location.state as LocationState) || {};
  const [showResult, setShowResult] = useState(false);
  
  // Determine if correct (for demo, suspect-2 is the correct answer)
  const isCorrect = suspect?.id === 'suspect-2';

  useEffect(() => {
    // Delay result display for suspense
    const timer = setTimeout(() => {
      setShowResult(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    navigate('/');
  };

  if (!suspect) {
    navigate('/suspects');
    return null;
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Loading/Analyzing */}
        <AnimatePresence>
          {!showResult && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <span className="text-6xl">⚙</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-forensics-cyan font-mono mt-6">
                ANALYSE VOCALE EN COURS...
              </h2>
              <p className="text-gray-400 font-mono mt-2">
                Comparaison des empreintes vocales
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-8 bg-forensics-cyan rounded"
                    animate={{
                      height: [32, 8, 32],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {isCorrect ? (
                <>
                  {/* Success */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      className="text-9xl mb-6"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      ✓
                    </motion.div>
                    <h1 className="text-5xl font-bold text-forensics-green font-mono mb-4">
                      ARRESTATION CONFIRMÉE
                    </h1>
                    <p className="text-xl text-gray-300 font-mono">
                      Identification positive: <span className="text-forensics-cyan">{suspect.name}</span>
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-forensics-green/10 border-2 border-forensics-green rounded-lg p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-forensics-green font-mono mb-4">
                      📊 RAPPORT D'ANALYSE
                    </h2>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match vocal:</span>
                        <span className="text-forensics-green font-bold">98.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Signature spectrale:</span>
                        <span className="text-forensics-green font-bold">POSITIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pitch correction détecté:</span>
                        <span className="text-forensics-green font-bold">-5 ST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Taux de confiance:</span>
                        <span className="text-forensics-green font-bold">TRÈS ÉLEVÉ</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-forensics-bg-light border border-forensics-cyan rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-3">
                      🎉 MISSION ACCOMPLIE
                    </h3>
                    <p className="text-gray-300 font-mono text-sm">
                      Grâce à votre expertise en analyse forensique audio, le Corbeau a été démasqué. 
                      L'enregistrement modifié a été restauré et la signature vocale correspond parfaitement 
                      à {suspect.name}. Le suspect a été placé en garde à vue.
                    </p>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Failure */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      className="text-9xl mb-6"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      ✗
                    </motion.div>
                    <h1 className="text-5xl font-bold text-red-500 font-mono mb-4">
                      IDENTIFICATION ERRONÉE
                    </h1>
                    <p className="text-xl text-gray-300 font-mono">
                      {suspect.name} n'est pas le Corbeau
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-red-500/10 border-2 border-red-500 rounded-lg p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-red-500 font-mono mb-4">
                      📊 RAPPORT D'ANALYSE
                    </h2>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match vocal:</span>
                        <span className="text-red-500 font-bold">42.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Signature spectrale:</span>
                        <span className="text-red-500 font-bold">NÉGATIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Correspondance:</span>
                        <span className="text-red-500 font-bold">INSUFFISANTE</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-forensics-bg-light border border-red-500 rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-bold text-red-500 font-mono mb-3">
                      📨 MESSAGE DU CORBEAU
                    </h3>
                    <p className="text-gray-300 font-mono text-sm italic">
                      "Vous pensiez m'avoir ? Je suis toujours dans l'ombre... 
                      Peut-être devriez-vous mieux analyser les preuves la prochaine fois."
                    </p>
                  </motion.div>
                </>
              )}

              {/* Actions */}
              <motion.div
                className="flex gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={handleRestart}
                  className="px-8 py-4 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-all text-lg"
                >
                  {isCorrect ? '🏠 RETOUR ACCUEIL' : '🔄 RÉESSAYER'}
                </button>
                {!isCorrect && (
                  <button
                    onClick={() => navigate('/suspects')}
                    className="px-8 py-4 bg-forensics-bg-light border-2 border-forensics-cyan text-forensics-cyan font-mono font-bold rounded-lg hover:bg-forensics-cyan hover:text-forensics-bg transition-all text-lg"
                  >
                    ← RETOUR SUSPECTS
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultScreen;
