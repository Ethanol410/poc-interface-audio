import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/Layout/AppLayout';
import LoadingScreen from './components/Layout/LoadingScreen';

// Lazy load route components
const LoginScreen = lazy(() => import('./components/Auth/LoginScreen'));
const Dashboard = lazy(() => import('./components/Workspace/Dashboard'));
const SuspectGrid = lazy(() => import('./components/Suspects/SuspectGrid'));
const ResultScreen = lazy(() => import('./components/Debrief/ResultScreen'));

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route element={<AppLayout />}>
              <Route path="/workspace" element={<Dashboard />} />
              <Route path="/suspects" element={<SuspectGrid />} />
              <Route path="/debrief" element={<ResultScreen />} />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Router>
  );
}

export default App;
