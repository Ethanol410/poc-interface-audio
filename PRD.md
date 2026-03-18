# PRD : AudioForensics — URIS (Unité de Recherche et d'Investigation Sonore)

**Équipe :** Anaïs, Owen, Tom
**Date :** 2026-03-18
**Statut :** V1 — Dossier 84-V "L'Écho du Corbeau"
**Plateforme :** Application Web Interactive — Vite / React / Tone.js / Wavesurfer.js

---

## Contexte

Ce projet est une expérience de stand interactif. Le visiteur incarne un expert de la police scientifique et doit traiter un enregistrement audio dégradé pour identifier un coupable parmi une liste de suspects. L'objectif est double : être pédagogique sur le traitement du signal, et proposer une expérience ludique de type "Cluedo forensique".

Le code existant est fonctionnel et couvre la majorité du moteur audio et de l'interface principale. Ce PRD décrit l'état cible du produit, la complétion des manques, et la feuille de route pour le déploiement sur stand.

---

## 1. Vision Produit

| Dimension | Description |
|-----------|-------------|
| **Immersion** | Ambiance "cellule de crise" : couleurs sombres, police monospace, scanlines |
| **Pédagogie** | Chaque outil (filtre, pitch, spectrogramme) révèle un indice sonore différent |
| **Gamification** | Le nettoyage audio mène à un verdict binaire : arrestation ou fuite du suspect |
| **Durée de session** | 5–8 minutes par visiteur sur stand |

---

## 2. Scénarios Narratifs

### Concept A — "Le Corbeau de Quissioux" *(Mode principal — déjà partiellement implémenté)*
- **Contexte :** Disparition du petit Léo Trogneux. Message vocal crypté reçu par la mère.
- **Enjeu :** Identifier le ravisseur avant le train de 14h15.
- **Indices sonores à révéler :**
  - Son de clocher (église à proximité du suspect)
  - Annonce de gare (lieu de la scène)
  - Battements cardiaques rapides (stress du ravisseur)
- **Suspects :** 4 fiches (dont le voisin de palier — coupable)

### Concept B — "Agressions à Brain City" *(Mode alternatif — optionnel V2)*
- **Contexte :** Agression dans le quartier industriel. Fichier corrompu par "Larry".
- **Indices sonores :** Cliquetis de clés de chantier, sifflement asthmatique.
- **Cible :** Mode adapté enfants/ados.

---

## 3. Spécifications Fonctionnelles

### 3.1 Flux Utilisateur Complet

```
[AudioSetup /setup]
  └─→ Choix DEMO (générateur) ou UPLOAD (fichier réel)
      └─→ [LoginScreen /]
            Agent matricule (4 chars)
            └─→ [Dashboard /workspace]
                  Waveform + Spectrogramme + FrequencyBars
                  Filtres LP/HP + Pitch + A/B Compare + Reverse
                  HUD Indices découverts
                  Bouton "IDENTIFIER LE SUSPECT"
                  └─→ [SuspectGrid /suspects]
                        4 fiches suspects + notes + écoute voix + Match Score
                        └─→ [ResultScreen /debrief]
                              Verdict : Arrestation / Fuite
```

### 3.2 Dashboard — Poste de Travail `/workspace`

**Visualisations (déjà implémentées) :**
- `Waveform.tsx` — Forme d'onde interactive (Wavesurfer.js)
- `Spectrogram.tsx` — Spectrogramme temps-fréquence (FFT 2048)
- `FrequencyBars.tsx` — Analyseur de spectre en temps réel (64 barres)
- `AudioMeter.tsx` — Mesure RMS + crête

**Contrôles (déjà implémentés) :**
- `FilterPanel.tsx` — Filtre passe-bas + passe-haut (fréquence + Q)
- `PitchControl.tsx` — Correction de hauteur (±12 demi-tons)
- Presets : RESET / CLARIFY / DEEP-ANALYSIS

**À compléter :**
- [x] **Bouton Reverse** : Inverser la lecture audio pour révéler le message caché "Prenez le train de 14h15"
  - Logique dans `audioEngine.ts` + `audioStore.ts` + bouton dans `FilterPanel.tsx`
- [x] **Indicateur de progression pédagogique** : HUD affichant les indices déjà découverts
  - Champs `discoveredClues` + `addClue` dans `audioStore.ts`
  - Composant `ClueTracker` dans `Dashboard.tsx`
- [ ] **Timer de mission** : Compte à rebours optionnel (V2)

### 3.3 SuspectGrid — Comparaison `/suspects`

**Déjà implémenté :**
- 4 fiches suspects avec photo
- Modal de notes par suspect
- Dialogue de confirmation d'identification

**À compléter :**
- [x] **Lecture audio témoin** : Bouton play + mini-player par fiche
- [x] **Match Score visuel** : Barre de correspondance narrative par suspect

### 3.4 ResultScreen — Verdict `/debrief`

**Déjà implémenté :**
- Écran succès (vert) / échec (rouge)
- Rapport d'analyse, boutons recommencer/réessayer

**Optionnel V2 :**
- [ ] Rapport PDF exportable

---

## 4. Architecture Technique

### Chaîne Audio (audioEngine.ts)

```
originalPlayer ──────────────────────────────────────┐
                                                       ├─→ crossFade ──→ analyzer ──→ destination
player ──→ [Reverse?] ──→ lowPass ──→ highPass ──→ pitchShift ──┘
```

### État Global — Zustand Store (audioStore.ts)

**Champs existants :**
- `audioUrls`, `isPlaying`, `currentTime`, `duration`, `volume`
- `lowPassFilter`, `highPassFilter` (FilterConfig)
- `pitchShift` (PitchShiftConfig)
- `analysisProgress`, `isComparisonMode`

**Champs ajoutés :**
```typescript
isReversed: boolean          // Mode lecture inversée
toggleReverse: () => void

discoveredClues: string[]    // Indices découverts (pédagogique)
addClue: (clue: string) => void
resetClues: () => void
```

### Routes (App.tsx)

| Route | Composant | Protégée |
|-------|-----------|----------|
| `/setup` | AudioSetup | Non |
| `/` | LoginScreen | Oui (audio chargé) |
| `/workspace` | Dashboard | Oui |
| `/suspects` | SuspectGrid | Oui |
| `/debrief` | ResultScreen | Oui |

---

## 5. Manifest Audio

| ID | Fichier | Description | Usage |
|----|---------|-------------|-------|
| `evidence-distorted` | `evidence-distorted.wav` | Voix modifiée + bruit blanc + clocher | Preuve à nettoyer |
| `evidence-clean` | `evidence-clean.wav` | Voix claire de référence | Comparaison A/B |
| `evidence-reverse` | `evidence-reverse.wav` | Message inversé "Prenez le train de 14h15" | Indice temporel (mode Reverse) |
| `ambient-bg` | `ambient-bg.wav` | Brouhaha de gare + annonce | Indice géographique |
| `suspect-01` | `suspect-01.wav` | Voix témoin Bernard Mallet | Comparaison |
| `suspect-02` | `suspect-02.wav` | Voix témoin Isabelle Renard (coupable) | Comparaison |
| `suspect-03` | `suspect-03.wav` | Voix témoin Karim Daoudi | Comparaison |
| `suspect-04` | `suspect-04.wav` | Voix témoin Sylvie Marchand | Comparaison |

**Remarque :** Le mode DEMO génère des substituts synthétiques. Les fichiers réels → `public/audio/`.

---

## 6. Suspects — Fiches Narratives

| ID | Nom | Rôle | Alibi | Indice | Coupable |
|----|-----|------|-------|--------|----------|
| `suspect-1` | Bernard Mallet | Gardien d'immeuble | "J'étais à la cave" | Aucun indice sonore | Non |
| `suspect-2` | Isabelle Renard | Voisine de palier | "J'étais chez ma sœur" | Voix + clocher de l'église Saint-Pierre | **Oui** |
| `suspect-3` | Karim Daoudi | Livreur | "En tournée toute la journée" | Aucun indice sonore | Non |
| `suspect-4` | Sylvie Marchand | Institutrice retraitée | "Cours de jardinage" | Aucun indice sonore | Non |

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

---

## 8. Expérience Stand

1. **Accueil** : Zone sombre, briefing oral par Anaïs / Owen / Tom
2. **Remise du dossier** : Dossier papier "CONFIDENTIEL" avec photos des 4 suspects
3. **Setup** : Opérateur lance `/setup` → mode DEMO ou chargement fichier réel
4. **Action** : Visiteur met le casque, nettoie l'audio (filtres, pitch, reverse)
5. **Déduction** : Repère les indices (clocher → Isabelle Renard), sélectionne le suspect
6. **Verdict** : Écran vert (arrestation) ou rouge (fuite)

---

## 9. État d'Avancement

### ✅ Implémenté
- Moteur audio (Tone.js : LP/HP/Pitch/Crossfade/Analyser)
- Visualisations temps réel (Waveform, Spectrogram, FrequencyBars, AudioMeter)
- Panneau filtres + pitch avec presets
- A/B Comparison
- Grille suspects + notes + identification
- Écran résultat (succès/échec)
- PWA offline
- Thème forensique complet
- Générateur audio synthétique (DEMO)

### 🔲 À implémenter (V1)
- [x] Bouton **Reverse** (audioEngine + store + UI)
- [x] **Lecture audio par suspect** (SuspectGrid mini-player)
- [x] **HUD indices découverts** (Dashboard + store)
- [x] **Match Score fictif** (SuspectGrid)
- [x] **Personnalisation fiches suspects** (noms français + rôles narratifs)
- [ ] Intégration des vrais fichiers audio (`public/audio/`)

### 🔲 Optionnel (V2)
- [ ] Timer de mission
- [ ] Scénario "Brain City"
- [ ] Export rapport PDF
- [ ] Sélection scénario depuis `/setup`

---

## 10. Vérification / Tests End-to-End

1. `npm run dev` → `http://localhost:5173/setup`
2. DEMO → génération audio synthétique
3. Login 4 chars → route protection
4. Dashboard : LP/HP + pitch → visualisations temps réel
5. A/B → crossfade original/traité
6. Reverse → message inversé audible
7. HUD → indices s'affichent au fil des manipulations
8. `/suspects` → écoute voix + match score affiché
9. Sélection suspect-2 → succès vert
10. Autre suspect → échec rouge
11. Offline (DevTools) → PWA fonctionne

---

## 11. Fichiers Critiques

| Fichier | Rôle |
|---------|------|
| `src/services/audioEngine.ts` | Moteur audio — Reverse |
| `src/stores/audioStore.ts` | État global — isReversed, discoveredClues |
| `src/components/Controls/FilterPanel.tsx` | Bouton Reverse |
| `src/components/Suspects/SuspectGrid.tsx` | Mini-player + Match Score |
| `src/assets/audioManifest.ts` | URLs fichiers audio |
| `src/utils/audioGenerator.ts` | Générateur synthétique (DEMO) |
| `src/App.tsx` | Routage |
