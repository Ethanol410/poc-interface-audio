/**
 * usePerformance Hook - Performance monitoring and metrics tracking
 */

import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

interface UsePerformanceOptions {
  componentName: string;
  enableLogging?: boolean;
  warningThreshold?: number; // milliseconds
}

export const usePerformance = ({
  componentName,
  enableLogging = false,
  warningThreshold = 16, // ~60fps
}: UsePerformanceOptions) => {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    renderCountRef.current += 1;
    const renderTimes = renderTimesRef.current;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      renderTimes.push(renderTime);
      
      // Keep only last 50 render times
      if (renderTimes.length > 50) {
        renderTimes.shift();
      }

      // Log if enabled
      if (enableLogging) {
        const avgTime = getAverageRenderTime();
        console.log(
          `[Performance] ${componentName} - Render #${renderCountRef.current}: ${renderTime.toFixed(2)}ms (avg: ${avgTime.toFixed(2)}ms)`
        );

        // Warning for slow renders
        if (renderTime > warningThreshold) {
          console.warn(
            `⚠️ [Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms (threshold: ${warningThreshold}ms)`
          );
        }
      }
    };
  });

  const getAverageRenderTime = useCallback(() => {
    if (renderTimesRef.current.length === 0) return 0;
    const sum = renderTimesRef.current.reduce((a, b) => a + b, 0);
    return sum / renderTimesRef.current.length;
  }, []);

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      renderCount: renderCountRef.current,
      lastRenderTime: renderTimesRef.current[renderTimesRef.current.length - 1] || 0,
      averageRenderTime: getAverageRenderTime(),
    };
  }, [getAverageRenderTime]);

  const logMetrics = useCallback(() => {
    const metrics = getMetrics();
    console.log(`[Performance Metrics] ${componentName}:`, {
      renders: metrics.renderCount,
      lastRender: `${metrics.lastRenderTime.toFixed(2)}ms`,
      avgRender: `${metrics.averageRenderTime.toFixed(2)}ms`,
    });
  }, [componentName, getMetrics]);

  const measureAsync = useCallback(
    async <T,>(operation: string, fn: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await fn();
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (enableLogging) {
          console.log(
            `[Performance] ${componentName}.${operation}: ${duration.toFixed(2)}ms`
          );
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(
          `[Performance] ${componentName}.${operation} failed after ${duration.toFixed(2)}ms:`,
          error
        );
        throw error;
      }
    },
    [componentName, enableLogging]
  );

  const measureSync = useCallback(
    <T,>(operation: string, fn: () => T): T => {
      const startTime = performance.now();
      try {
        const result = fn();
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (enableLogging) {
          console.log(
            `[Performance] ${componentName}.${operation}: ${duration.toFixed(2)}ms`
          );
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(
          `[Performance] ${componentName}.${operation} failed after ${duration.toFixed(2)}ms:`,
          error
        );
        throw error;
      }
    },
    [componentName, enableLogging]
  );

  return {
    getMetrics,
    logMetrics,
    measureAsync,
    measureSync,
  };
};

/**
 * Mark a performance point with the User Timing API
 */
export const mark = (name: string) => {
  if (performance.mark) {
    performance.mark(name);
  }
};

/**
 * Measure time between two marks
 */
export const measure = (name: string, startMark: string, endMark: string) => {
  if (performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      console.log(`[Performance Measure] ${name}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
      console.error(`Failed to measure ${name}:`, error);
    }
  }
};

/**
 * Get navigation timing metrics
 */
export const getNavigationMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) {
    return null;
  }

  return {
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpConnection: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    domProcessing: navigation.domComplete - navigation.domInteractive,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    totalTime: navigation.loadEventEnd - navigation.fetchStart,
  };
};

/**
 * Log all navigation metrics
 */
export const logNavigationMetrics = () => {
  const metrics = getNavigationMetrics();
  if (metrics) {
    console.log('[Navigation Performance]:', {
      'DNS Lookup': `${metrics.dnsLookup.toFixed(2)}ms`,
      'TCP Connection': `${metrics.tcpConnection.toFixed(2)}ms`,
      'Request': `${metrics.request.toFixed(2)}ms`,
      'Response': `${metrics.response.toFixed(2)}ms`,
      'DOM Processing': `${metrics.domProcessing.toFixed(2)}ms`,
      'DOM Content Loaded': `${metrics.domContentLoaded.toFixed(2)}ms`,
      'Load Complete': `${metrics.loadComplete.toFixed(2)}ms`,
      'Total Time': `${metrics.totalTime.toFixed(2)}ms`,
    });
  }
};
