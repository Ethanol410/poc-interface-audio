# PRD : AudioForensics — URIS (Unité de Recherche et d'Investigation Sonore)

**Équipe :** Anaïs, Owen, Tom
**Date :** 2026-03-19
**Statut :** V2 — Implémentation complète
**Plateforme :** Application Web Interactive — Vite / React / Tone.js / Wavesurfer.js

---

## Contexte

Ce projet est une expérience de stand interactif. Le visiteur incarne un expert de la police scientifique et doit traiter un enregistrement audio dégradé pour identifier un coupable parmi une liste de suspects. L'objectif est double : être pédagogique sur le traitement du signal, et proposer une expérience ludique de type "Cluedo forensique".

---

## 1. Vision Produit

| Dimension | Description |
|-----------|-------------|
| **Immersion** | Ambiance "cellule de crise" : couleurs sombres, police monospace, scanlines |
| **Pédagogie** | Chaque outil (filtre, pitch, spectrogramme) révèle un indice sonore différent |
| **Gamification** | Le nettoyage audio mène à un verdict binaire : arrestation ou fuite du suspect |
| **Multi-scénarios** | Deux scénarios jouables : adultes (Le Corbeau) et enfants/ados (Brain City) |
| **Durée de session** | 5–8 minutes par visiteur sur stand (timer configurable) |

---

## 2. Scénarios Narratifs

### Scénario A — "Le Corbeau de Quissioux" ✅ Implémenté
- **Contexte :** Disparition du petit Léo Trogneux. Message vocal crypté reçu par la mère.
- **Enjeu :** Identifier le ravisseur avant le train de 14h15.
- **Indices sonores :** Son de clocher, annonce de gare, voix inversée
- **Coupable :** Isabelle Renard (`suspect-2`), voisine de palier
- **Suspects :** Bernard Mallet, Isabelle Renard, Karim Daoudi, Sylvie Marchand

### Scénario B — "Agressions à Brain City" ✅ Implémenté
- **Contexte :** Agression dans le quartier industriel. Fichier corrompu par "Larry".
- **Indices sonores :** Cliquetis de clés de chantier, sifflement asthmatique
- **Coupable :** Marco Ferreira (`suspect-bc-1`), ouvrier du chantier
- **Suspects :** Marco Ferreira, Layla Bensaïd, Dylan Roux, Nora Vidal
- **Cible :** Mode adapté enfants/ados

---

## 3. Spécifications Fonctionnelles

### 3.1 Flux Utilisateur Complet

```
[AudioSetup /setup]
  └─→ Étape 1 : Choix scénario (Corbeau / Brain City) + timer de mission
      └─→ Étape 2 : Mode audio (DEMO synthétique ou UPLOAD fichier réel)
          └─→ [LoginScreen /]
                Agent matricule (4 chars)
                └─→ [Dashboard /workspace]
                      Waveform + Spectrogramme + FrequencyBars
                      Filtres LP/HP/BP/Notch + Pitch + Compresseur + Reverse
                      HUD Indices découverts (dynamique par scénario)
                      Timer de mission (compte à rebours si activé)
                      Bouton "IDENTIFIER LE SUSPECT"
                      └─→ [SuspectGrid /suspects]
                            4 fiches suspects (dynamiques par scénario)
                            Lecture voix + Match Score + Notes
                            └─→ [ResultScreen /debrief]
                                  Verdict : Arrestation / Fuite
                                  Rapport détaillé (paramètres + indices + temps)
                                  Export PDF (window.print)
```

### 3.2 Dashboard — Poste de Travail `/workspace`

**Visualisations :**
- `Waveform.tsx` — Forme d'onde (switch vers `evidenceReverse` si `isReversed`)
- `Spectrogram.tsx` — Spectrogramme temps-fréquence (FFT 2048)
- `FrequencyBars.tsx` — Analyseur de spectre en temps réel (64 barres)
- `AudioMeter.tsx` — Mesure RMS + crête

**Contrôles :**
- `FilterPanel.tsx` — LP / HP / BP / Notch / Compresseur / Vitesse + bouton Reverse
- `PitchControl.tsx` — Correction de hauteur (±12 demi-tons)
- Presets : RESET / CLARIFY / DEEP

**Fonctionnalités V2 :**
- [x] **Timer de mission** — compte à rebours configurable (3–15 min), overlay à l'expiration
- [x] **Clues dynamiques** — libellés adaptés au scénario sélectionné
- [x] **Titre et brief narratif** — affichés depuis `scenarios.ts`

### 3.3 SuspectGrid — Comparaison `/suspects`

- [x] 4 fiches suspects dynamiques (selon scénario)
- [x] Bouton lecture voix (`suspect1`…`suspect4` depuis `audioUrls`)
- [x] Match Score narrative par suspect (fictif, cohérent avec scénario)
- [x] Modal notes par suspect
- [x] Dialogue confirmation identification

### 3.4 ResultScreen — Verdict `/debrief`

- [x] Écran succès (vert) / échec (rouge)
- [x] Narrative dynamique selon scénario (`successStory` / `failureMessage`)
- [x] Rapport détaillé : paramètres actifs, indices découverts, temps de mission
- [x] **Export PDF** — bouton "EXPORTER PDF" via `window.print()` + `@media print` CSS

---

## 4. Architecture Technique

### Chaîne Audio (`audioEngine.ts`)

```
source HTML <audio>
  └─→ lpFilter → hpFilter → bandpass → notch → compressor → gain → analyser → destination
```

Le mode Reverse swipe l'URL audio vers `evidenceReverse` (buffer synthétique inversé en DEMO, fichier séparé en production).

### État Global — Zustand Store (`audioStore.ts`)

```typescript
// Playback
audioUrls: { evidenceDistorted, evidenceClean, evidenceReverse?, suspect1..4? }
isPlaying, currentTime, duration, volume

// Filtres
lowPassFilter, highPassFilter, bandPassFilter, notchFilter  // FilterConfig
compressor                                                    // CompressorConfig
pitchShift                                                    // PitchShiftConfig
playbackSpeed: number

// Modes
isReversed: boolean
isComparisonMode: boolean

// HUD pédagogique
discoveredClues: string[]

// Scénario
scenario: 'corbeau' | 'braincity'

// Timer de mission
missionTimerEnabled: boolean
missionDuration: number       // secondes
missionStartTime: number | null  // timestamp ms
```

### Données scénarios (`src/data/scenarios.ts`)

```typescript
interface ScenarioData {
  id, title, subtitle, guiltyId
  suspects: Suspect[]
  matchScores: Record<string, number>
  clueTriggers: ClueDefinition[]
  missionBrief: { crime, evidence, mission }
  analysisSteps: string[]
  successTitle, successStory
  failureTitle, failureMessage
}
```

### Routes (`App.tsx`)

| Route | Composant | Protégée |
|-------|-----------|----------|
| `/setup` | AudioSetup | Non |
| `/` | LoginScreen | Oui (audio chargé) |
| `/workspace` | Dashboard | Oui |
| `/suspects` | SuspectGrid | Oui |
| `/debrief` | ResultScreen | Oui |

---

## 5. Manifest Audio

### Scénario Corbeau

| ID | Fichier | Description | Usage |
|----|---------|-------------|-------|
| `evidence-distorted` | `evidence-distorted.wav` | Voix modifiée + bruit blanc + clocher | Preuve à nettoyer |
| `evidence-clean` | `evidence-clean.wav` | Voix claire de référence | Comparaison A/B |
| `evidence-reverse` | `evidence-reverse.wav` | Message inversé "Prenez le train de 14h15" | Indice (mode Reverse) |
| `suspect-01` | `suspect-01.wav` | Voix témoin Bernard Mallet | Comparaison |
| `suspect-02` | `suspect-02.wav` | Voix témoin Isabelle Renard (coupable) | Comparaison |
| `suspect-03` | `suspect-03.wav` | Voix témoin Karim Daoudi | Comparaison |
| `suspect-04` | `suspect-04.wav` | Voix témoin Sylvie Marchand | Comparaison |

### Scénario Brain City

Mêmes slots audio (`suspect-01` à `suspect-04`) avec les voix de Marco, Layla, Dylan, Nora.

**Remarque :** Le mode DEMO génère des substituts synthétiques pour tous les slots. Les fichiers réels → `public/audio/`.

---

## 6. Suspects — Fiches Narratives

### Corbeau de Quissioux

| ID | Nom | Rôle | Coupable |
|----|-----|------|----------|
| `suspect-1` | Bernard Mallet | Gardien d'immeuble | Non |
| `suspect-2` | **Isabelle Renard** | Voisine de palier | **Oui** |
| `suspect-3` | Karim Daoudi | Livreur | Non |
| `suspect-4` | Sylvie Marchand | Institutrice retraitée | Non |

### Agressions à Brain City

| ID | Nom | Rôle | Coupable |
|----|-----|------|----------|
| `suspect-bc-1` | **Marco Ferreira** | Ouvrier du chantier | **Oui** |
| `suspect-bc-2` | Layla Bensaïd | Gérante du bar Le Cosmos | Non |
| `suspect-bc-3` | Dylan Roux | Étudiant en BTS | Non |
| `suspect-bc-4` | Nora Vidal | Infirmière de quartier | Non |

---

## 7. Identité Visuelle

| Rôle | Couleur |
|------|---------|
| Fond principal | `#0a0e27` |
| Fond secondaire | `#141a3a` |
| Cyan forensique | `#00d4ff` |
| Vert succès | `#00ff88` |
| Rouge danger | `#ff3366` |
| Orange avertissement | `#ff9933` |

**Typographie :** JetBrains Mono
**Effets :** Scanlines, glow cyan, Framer Motion transitions
**Print :** `@media print` dans `globals.css` — isole `#rapport-pdf` pour export PDF propre

---

## 8. Expérience Stand

1. **Accueil** : Zone sombre, briefing oral
2. **Remise du dossier** : Dossier papier "CONFIDENTIEL" avec photos des 4 suspects
3. **Setup** : Opérateur lance `/setup` → choix scénario + timer → DEMO ou fichier réel
4. **Action** : Visiteur met le casque, nettoie l'audio (filtres, pitch, reverse)
5. **Déduction** : Repère les indices, sélectionne le suspect
6. **Verdict** : Écran vert (arrestation) ou rouge (fuite)
7. **Souvenir** : Opérateur peut exporter le rapport PDF

---

## 9. État d'Avancement

### ✅ V1 — Implémenté

- Moteur audio (Tone.js : LP/HP/BP/Notch/Pitch/Compressor/Analyser)
- Visualisations temps réel (Waveform, Spectrogram, FrequencyBars, AudioMeter)
- Panneau filtres + pitch + compresseur + vitesse avec presets
- Bouton **Reverse** — switch vers `evidenceReverse` dans Waveform/Spectrogram
- Génération audio synthétique DEMO (4 suspects + evidenceReverse)
- A/B Comparison
- Grille suspects + notes + identification
- **HUD indices découverts** (store + Dashboard)
- **Match Score fictif** par suspect
- **Personnalisation fiches suspects** (noms + rôles)
- Écran résultat (succès/échec)
- PWA offline
- Thème forensique complet

### ✅ V2 — Implémenté

- [x] **Sélection scénario depuis `/setup`** — étape 1 du wizard (Corbeau / Brain City)
- [x] **Scénario "Brain City"** — suspects, indices, narrative, coupable propres
- [x] **Timer de mission** — configurable 3–15 min, overlay expiration, affiché dans le header
- [x] **Export rapport PDF** — `window.print()` + `@media print` isolant `#rapport-pdf`
- [x] **Rapport enrichi** — paramètres actifs, indices, temps de mission, titre scénario

### 🔲 Non implémenté

- [ ] Intégration des vrais fichiers audio (`public/audio/`)
- [ ] Timer par scénario (durée recommandée différente)
- [ ] Sons ambiants (`ambient-bg.wav`) en fond sonore

---

## 10. Vérification / Tests End-to-End

1. `npm run dev` → `http://localhost:5173/setup`
2. Sélectionner scénario **Corbeau** → activer timer 5 min → DÉMO
3. Login 4 chars → Dashboard
4. LP/HP + pitch → indices apparaissent dans le HUD
5. Reverse → Waveform change, indice "Message caché" coché
6. Timer visible dans le header, overlay à expiration
7. `/suspects` → 4 suspects Corbeau, écoute voix, match score 94% sur Isabelle
8. Identifier **Isabelle Renard** → succès vert + narrative
9. "EXPORTER PDF" → boîte de dialogue impression navigateur
10. Recommencer → `/setup` → sélectionner **Brain City**
11. Dashboard affiche "Agressions à Brain City", indices Brain City
12. `/suspects` → 4 suspects Brain City, identifier **Marco Ferreira** → succès

---

## 11. Fichiers Critiques

| Fichier | Rôle |
|---------|------|
| `src/data/scenarios.ts` | Définition des 2 scénarios (suspects, clues, narrative) |
| `src/stores/audioStore.ts` | État global — isReversed, discoveredClues, scenario, timer |
| `src/components/AudioPlayer/AudioSetup.tsx` | Wizard 2 étapes : scénario + audio |
| `src/components/Workspace/Dashboard.tsx` | Timer + clues dynamiques |
| `src/components/Suspects/SuspectGrid.tsx` | Suspects + match scores dynamiques |
| `src/components/Debrief/ResultScreen.tsx` | Narrative dynamique + export PDF |
| `src/styles/globals.css` | `@media print` pour export PDF |
| `src/services/audioEngine.ts` | Moteur audio Web Audio API |
| `src/utils/audioGenerator.ts` | Génération synthétique DEMO (4 suspects + reverse) |
| `src/App.tsx` | Routage |
