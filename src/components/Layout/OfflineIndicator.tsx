/**
 * OfflineIndicator Component - Shows offline status
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Persistent badge */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white font-mono text-sm rounded-lg shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            MODE OFFLINE
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={`
              fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg font-mono text-sm
              ${isOnline ? 'bg-forensics-green' : 'bg-red-500'} text-white
            `}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {isOnline ? (
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Connexion rétablie</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>⚠</span>
                <span>Mode offline activé</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineIndicator;
