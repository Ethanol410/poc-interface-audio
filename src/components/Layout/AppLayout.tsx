import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-forensics-bg relative overflow-hidden">
      {/* Scanlines overlay */}
      <div className="scanlines" />
      
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
