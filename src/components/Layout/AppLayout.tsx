import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OfflineIndicator from './OfflineIndicator';
import SuspectPopupModal from '@/components/Suspects/SuspectPopupModal';
import { useAudioStore } from '@/stores/audioStore';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';

const AppLayout = () => {
  const isLoading = useAudioStore((state) => state.isLoading);
  const { isBrainCity } = useScenarioTheme();

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isBrainCity
          ? 'bg-braincity-bg bc-workspace-bg'
          : 'bg-forensics-bg'
      }`}
    >
      {!isBrainCity && <div className="scanlines" />}
      
      {/* Barre de chargement audio */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[200] h-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-forensics-cyan"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: [0, 0.6, 0.8, 1] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Popup suspect Stream Deck (global) */}
      <SuspectPopupModal />
      
      {/* Main content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default AppLayout;
