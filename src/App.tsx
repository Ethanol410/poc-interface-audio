import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/Layout/AppLayout';
import LoadingScreen from './components/Layout/LoadingScreen';
import ErrorBoundary from './components/Layout/ErrorBoundary';
// import PerformanceMonitor from './components/Layout/PerformanceMonitor';
import { useAudioStore } from './stores/audioStore';

// Lazy load route components
const ModeSelectScreen = lazy(() => import('./components/Intro/ModeSelectScreen'));
const IntroScreen = lazy(() => import('./components/Intro/IntroScreen'));
const AudioLoadingScreen = lazy(() => import('./components/AudioPlayer/AudioLoadingScreen'));
const LoginScreen = lazy(() => import('./components/Auth/LoginScreen'));
const StoryBriefScreen = lazy(() => import('./components/Auth/StoryBriefScreen'));
const Dashboard = lazy(() => import('./components/Workspace/Dashboard'));
const SuspectGrid = lazy(() => import('./components/Suspects/SuspectGrid'));
const ResultScreen = lazy(() => import('./components/Debrief/ResultScreen'));

// Composant pour protéger les routes qui nécessitent des audios configurés
function RequireAudio({ children }: { children: React.ReactNode }) {
  const audioUrls = useAudioStore((state) => state.audioUrls);

  if (!audioUrls) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
              {/* Étape 0 : choix du mode (avant l'intro) */}
              <Route path="/" element={<ModeSelectScreen />} />

              {/* Étape 1 : intro adaptée au scénario choisi */}
              <Route path="/intro" element={<IntroScreen />} />

              {/* Étape 2 : préparation des pistes audio */}
              <Route path="/setup" element={<AudioLoadingScreen />} />

              {/* Étape 3 : login agent (nécessite audio prêt) */}
              <Route
                path="/login"
                element={
                  <RequireAudio>
                    <LoginScreen />
                  </RequireAudio>
                }
              />

              <Route element={<AppLayout />}>
                <Route
                  path="/briefing"
                  element={
                    <RequireAudio>
                      <StoryBriefScreen />
                    </RequireAudio>
                  }
                />
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

              {/* Toute route inconnue : retour au choix du mode */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Router>
      {/* <PerformanceMonitor /> */}
    </ErrorBoundary>
  );
}

export default App;
