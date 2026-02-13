/**
 * PerformanceMonitor Component - Dev-only performance metrics display
 */

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigationMetrics } from '@/hooks/usePerformance';

interface PerformanceMetrics {
  fps: number;
  memory?: {
    used: number;
    total: number;
  };
  navigation?: ReturnType<typeof getNavigationMetrics>;
}

const PerformanceMonitor = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
  });

  // Only show in development mode
  const isDev = import.meta.env.MODE === 'development';

  useEffect(() => {
    if (!isDev) return;

    // FPS tracking
    let frames = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        setMetrics((prev) => ({
          ...prev,
          fps,
        }));

        frames = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory tracking (if available)
    const updateMemory = () => {
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memory: {
            used: Math.round(perfMemory.usedJSHeapSize / 1048576), // MB
            total: Math.round(perfMemory.jsHeapSizeLimit / 1048576), // MB
          },
        }));
      }
    };

    updateMemory();
    const memoryInterval = setInterval(updateMemory, 2000);

    // Navigation metrics (once)
    const navMetrics = getNavigationMetrics();
    if (navMetrics) {
      setMetrics((prev) => ({
        ...prev,
        navigation: navMetrics,
      }));
    }

    // Keyboard shortcut: Ctrl+Shift+P to toggle
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isDev]);

  if (!isDev) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage < 70) return 'text-green-400';
    if (percentage < 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] bg-forensics-bg-light border-2 border-forensics-cyan rounded-full w-12 h-12 flex items-center justify-center hover:bg-forensics-cyan hover:text-forensics-bg transition-colors shadow-lg"
        title="Toggle Performance Monitor (Ctrl+Shift+P)"
      >
        <span className="text-sm font-mono font-bold">⚡</span>
      </button>

      {/* Performance Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-20 right-4 z-[9999] bg-forensics-bg-light border-2 border-forensics-cyan rounded-lg shadow-2xl p-4 font-mono text-xs w-80"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-forensics-cyan-dark">
              <h3 className="text-forensics-cyan font-bold">⚡ PERFORMANCE MONITOR</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* FPS */}
            <div className="mb-3">
              <div className="text-gray-400 mb-1">Frame Rate</div>
              <div className={`text-2xl font-bold ${getFPSColor(metrics.fps)}`}>
                {metrics.fps} FPS
              </div>
            </div>

            {/* Memory */}
            {metrics.memory && (
              <div className="mb-3">
                <div className="text-gray-400 mb-1">Memory Usage</div>
                <div className={`font-bold ${getMemoryColor(metrics.memory.used, metrics.memory.total)}`}>
                  {metrics.memory.used} MB / {metrics.memory.total} MB
                </div>
                <div className="mt-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-forensics-cyan transition-all duration-300"
                    style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Navigation Metrics */}
            {metrics.navigation && (
              <div className="pt-2 border-t border-forensics-cyan-dark">
                <div className="text-gray-400 mb-2">Navigation Timing</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="text-forensics-cyan ml-2">
                      {metrics.navigation.totalTime.toFixed(0)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">DOM:</span>
                    <span className="text-forensics-cyan ml-2">
                      {metrics.navigation.domProcessing.toFixed(0)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">DNS:</span>
                    <span className="text-forensics-cyan ml-2">
                      {metrics.navigation.dnsLookup.toFixed(0)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Request:</span>
                    <span className="text-forensics-cyan ml-2">
                      {metrics.navigation.request.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-forensics-cyan-dark text-gray-500 text-[10px]">
              Press Ctrl+Shift+P to toggle
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
