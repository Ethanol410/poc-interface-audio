# Performance Optimization Guide

## 🎯 Vue d'ensemble

Ce guide documente les optimisations de performance implémentées dans l'application "L'Écho du Corbeau - Dossier 84-V".

---

## 🚀 Optimisations Implémentées

### 1. React Performance Optimizations

#### React.memo
Tous les composants coûteux sont enveloppés dans `React.memo` pour éviter les re-renders inutiles:

```typescript
const Dashboard = memo(() => {
  // Component logic
});
Dashboard.displayName = 'Dashboard';
```

**Composants optimisés:**
- Dashboard
- Waveform
- Spectrogram
- FrequencyBars
- AudioMeter
- ParameterDisplay
- ParameterItem

#### useMemo
Calculs coûteux mémoïsés pour éviter les recalculations inutiles:

```typescript
// Exemple: ColorMap du Spectrogram (256 calculs)
const colorMap = useMemo(() => {
  const map: [number, number, number, number][] = [];
  // ... 256 iterations
  return map;
}, []); // Calculé une seule fois
```

#### useCallback
Callbacks mémoïsés pour éviter de recréer les fonctions:

```typescript
const formatTime = useCallback((seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}, []);
```

---

### 2. Code Splitting

#### Route-Based Splitting
Chaque route est chargée à la demande (lazy loading):

```typescript
const Dashboard = lazy(() => import('./components/Workspace/Dashboard'));
const SuspectGrid = lazy(() => import('./components/Suspects/SuspectGrid'));
```

#### Vendor Splitting
Les bibliothèques tierces sont séparées en chunks pour optimiser le cache:

```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['framer-motion'],
  'audio-vendor': ['tone', 'wavesurfer.js'],
}
```

---

### 3. Error Boundaries

Le composant `ErrorBoundary` attrape les erreurs React et affiche une UI de fallback:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Fonctionnalités:**
- Capture des erreurs à tous les niveaux
- Stack trace en développement
- Bouton de retry
- UI forensique cohérente

---

### 4. Performance Monitoring

#### usePerformance Hook

Hook personnalisé pour mesurer les performances des composants:

```typescript
import { usePerformance } from '@/hooks/usePerformance';

const MyComponent = () => {
  const { getMetrics, measureAsync, logMetrics } = usePerformance({
    componentName: 'MyComponent',
    enableLogging: true,
    warningThreshold: 16, // 60fps target
  });

  // Mesurer une opération async
  const loadData = async () => {
    await measureAsync('loadData', async () => {
      // ... operation
    });
  };

  // Log metrics on demand
  useEffect(() => {
    logMetrics();
  }, []);

  return <div>...</div>;
};
```

**Métriques trackées:**
- Nombre de renders
- Temps de render (dernier/moyen)
- Warnings pour renders lents
- Performance d'opérations async/sync

#### PerformanceMonitor Component

Composant de monitoring visuel (développement uniquement):

**Activation:**
- Automatique en mode développement
- Bouton flottant en bas à droite (⚡)
- Raccourci clavier: `Ctrl+Shift+P`

**Métriques affichées:**
- **FPS**: Frame rate en temps réel
  - Vert: ≥55 fps (optimal)
  - Jaune: 30-54 fps (acceptable)
  - Rouge: <30 fps (problème)

- **Memory**: Utilisation mémoire JS Heap
  - Vert: <70%
  - Jaune: 70-85%
  - Rouge: >85%

- **Navigation Timing**:
  - Total load time
  - DOM processing time
  - DNS lookup time
  - Request time

**Screenshot:**
```
┌─────────────────────────┐
│ ⚡ PERFORMANCE MONITOR  │
├─────────────────────────┤
│ Frame Rate              │
│ 60 FPS                  │
│                         │
│ Memory Usage            │
│ 45 MB / 128 MB          │
│ [████████           ]   │
│                         │
│ Navigation Timing       │
│ Total: 1234ms          │
│ DOM: 567ms             │
│ DNS: 12ms              │
│ Request: 234ms         │
└─────────────────────────┘
```

---

## 📊 Bundle Analysis

### Tailles de Bundle (Production)

```
CSS:         16.09 KB (gzip: 4.00 KB)
LoginScreen:  2.55 KB (gzip: 1.14 KB)
ResultScreen: 6.26 KB (gzip: 1.77 KB)
SuspectGrid:  6.40 KB (gzip: 2.10 KB)
Main:         7.61 KB (gzip: 3.00 KB)
Dashboard:   57.94 KB (gzip: 21.57 KB)
UI Vendor:  118.89 KB (gzip: 39.67 KB)
React:      159.88 KB (gzip: 52.20 KB)
Audio:      282.94 KB (gzip: 73.31 KB)
─────────────────────────────────────
Total:      ~644 KB (gzip: ~195 KB)
```

### Stratégie de Chargement

**Initial Load (~95 KB gzipped):**
- React vendor
- UI vendor
- LoginScreen
- CSS

**Dashboard Load (+22 KB gzipped):**
- Dashboard component
- Audio vendor (si pas déjà chargé)

**Subsequent Routes (<3 KB chaque):**
- SuspectGrid
- ResultScreen

---

## 🎯 Best Practices

### 1. Utiliser React.memo Intelligemment

✅ **À faire:**
```typescript
// Composants avec calculs coûteux
const ExpensiveComponent = memo(({ data }) => {
  // Heavy computations
});
```

❌ **À éviter:**
```typescript
// Composants simples (overhead inutile)
const SimpleText = memo(({ text }) => <span>{text}</span>);
```

### 2. useMemo pour Calculs Coûteux

✅ **À faire:**
```typescript
// Calcul qui prend du temps
const processedData = useMemo(() => {
  return data.map(item => heavyComputation(item));
}, [data]);
```

❌ **À éviter:**
```typescript
// Calcul trivial (overhead inutile)
const doubled = useMemo(() => value * 2, [value]);
```

### 3. useCallback pour Callbacks Stables

✅ **À faire:**
```typescript
// Callback passé à un composant mémoïsé
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

return <MemoizedButton onClick={handleClick} />;
```

❌ **À éviter:**
```typescript
// Callback non passé en prop
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### 4. Lazy Loading

✅ **À faire:**
```typescript
// Routes ou composants lourds
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

❌ **À éviter:**
```typescript
// Composants critiques pour le first paint
const Header = lazy(() => import('./Header'));
```

---

## 🔍 Debugging Performance

### Chrome DevTools

1. **Performance Tab**
   - Record une session
   - Identifiez les long tasks (>50ms)
   - Analyser le flame chart

2. **React DevTools Profiler**
   - Click "Record"
   - Interagir avec l'app
   - Stop et analyser les renders
   - Identifier les re-renders inutiles

3. **Memory Tab**
   - Prendre des snapshots
   - Comparer avant/après actions
   - Identifier les memory leaks

### PerformanceMonitor

1. Lancer en mode dev: `npm run dev`
2. Ouvrir l'app dans le navigateur
3. Appuyer sur `Ctrl+Shift+P`
4. Observer les métriques en temps réel
5. Identifier les problèmes de FPS

---

## 📈 Measuring Performance

### Lighthouse

```bash
# Lancer un audit Lighthouse
npm run build
npm run preview
# Puis ouvrir Chrome DevTools > Lighthouse
```

**Cibles:**
- Performance: >90
- Accessibility: 100
- Best Practices: 100
- SEO: >90

### Custom Metrics

```typescript
import { mark, measure } from '@/hooks/usePerformance';

// Marquer le début
mark('operation-start');

// ... opération

// Marquer la fin
mark('operation-end');

// Mesurer
measure('operation-duration', 'operation-start', 'operation-end');
// Logs: [Performance Measure] operation-duration: 123.45ms
```

---

## 🛠️ Outils Recommandés

### Development
- React DevTools (Chrome/Firefox extension)
- Redux DevTools (si utilisant Redux)
- Chrome Performance Tab
- PerformanceMonitor component

### CI/CD
- Lighthouse CI
- Bundle size tracking
- Performance budgets

### Monitoring Production
- Google Analytics (Core Web Vitals)
- Sentry (Error tracking)
- Custom analytics events

---

## 📚 Resources

### Documentation
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Web.dev Performance](https://web.dev/performance/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Phobia](https://bundlephobia.com/)

---

## ✅ Checklist Performance

Avant chaque release, vérifier:

- [ ] Lighthouse score >90
- [ ] Initial bundle <100KB gzipped
- [ ] FPS stable à 60 en animations
- [ ] Memory usage stable (no leaks)
- [ ] Tous les composants lourds mémoïsés
- [ ] Code splitting efficace
- [ ] Error boundaries en place
- [ ] PWA cache configuré
- [ ] Images optimisées
- [ ] No console.logs en production

---

## 🎉 Conclusion

L'application "L'Écho du Corbeau" est maintenant optimisée pour offrir une expérience utilisateur fluide et réactive. Les outils de monitoring permettent de maintenir ces performances au fil du temps.

**Questions?** Consultez la documentation ou utilisez `Ctrl+Shift+P` pour voir les métriques en temps réel.
