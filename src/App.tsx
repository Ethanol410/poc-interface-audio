import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/Layout/AppLayout';
import LoadingScreen from './components/Layout/LoadingScreen';
import ErrorBoundary from './components/Layout/ErrorBoundary';
// import PerformanceMonitor from './components/Layout/PerformanceMonitor';
import { AudioSetup } from './components/AudioPlayer/AudioSetup';
import { useAudioStore } from './stores/audioStore';
import { useNavigate } from 'react-router-dom';

// Lazy load route components
const LoginScreen = lazy(() => import('./components/Auth/LoginScreen'));
const Dashboard = lazy(() => import('./components/Workspace/Dashboard'));
const SuspectGrid = lazy(() => import('./components/Suspects/SuspectGrid'));
const ResultScreen = lazy(() => import('./components/Debrief/ResultScreen'));

// Composant pour protéger les routes qui nécessitent des audios configurés
function RequireAudio({ children }: { children: React.ReactNode }) {
  const audioUrls = useAudioStore((state) => state.audioUrls);
  
  if (!audioUrls) {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
}

// Composant wrapper pour AudioSetup avec navigation
function AudioSetupWrapper() {
  const navigate = useNavigate();
  const setAudioUrls = useAudioStore((state) => state.setAudioUrls);
  
  const handleAudiosReady = (urls: {
    evidenceDistorted: string;
    evidenceClean: string;
    evidenceReverse?: string;
    suspect1: string;
    suspect2: string;
    suspect3: string;
    suspect4?: string;
  }) => {
    setAudioUrls(urls);
    navigate('/');
  };
  
  return <AudioSetup onAudiosReady={handleAudiosReady} />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/setup" element={<AudioSetupWrapper />} />
              <Route 
                path="/" 
                element={
                  <RequireAudio>
                    <LoginScreen />
                  </RequireAudio>
                } 
              />
              <Route element={<AppLayout />}>
                <Route 
                  path="/workspace" 
                  element={
                    <RequireAudio>
                      <Dashboard />
                    </RequireAudio>
                  } 
                />
                <Route 
                  path="/suspects" 
                  element={
                    <RequireAudio>
                      <SuspectGrid />
                    </RequireAudio>
                  } 
                />
                <Route 
                  path="/debrief" 
                  element={
                    <RequireAudio>
                      <ResultScreen />
                    </RequireAudio>
                  } 
                />
              </Route>
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Router>
      {/* <PerformanceMonitor /> */}
    </ErrorBoundary>
  );
}

export default App;
