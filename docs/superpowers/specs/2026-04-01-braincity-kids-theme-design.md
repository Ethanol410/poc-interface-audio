# Brain City Kids Theme — Design Spec

**Date:** 2026-04-01  
**Status:** Approved  
**Scope:** Login + Dashboard + Suspects + Debrief (scénario `braincity` uniquement)

---

## Contexte

L'application possède deux scénarios :
- **Le Corbeau de Quissioux** (`corbeau`) — public adulte, thème "terminal forensique" sombre existant
- **Agressions à Brain City** (`braincity`) — public enfants 7–13 ans, nécessite un thème dédié

Le thème enfantin s'active automatiquement quand `scenarioId === 'braincity'`. Le Setup (AudioSetup) n'est pas concerné — c'est l'animateur qui configure, pas les enfants.

---

## Approche architecturale

**Thème conditionnel** : chaque composant concerné lit `scenarioId` depuis le store Zustand et applique conditionnellement des classes Tailwind / styles inline propres au thème `braincity-kids`. Zéro duplication de logique métier (hooks, clue detection, audio controls restent identiques).

Un hook utilitaire `useTheme()` ou un simple helper `isBrainCityKids(scenarioId)` suffit pour éviter la répétition du check dans chaque composant.

---

## Palette de couleurs Brain City Kids

| Rôle | Valeur | Usage |
|------|--------|-------|
| Fond principal | `#e0f2fe → #f0fdf4` (gradient) | Background pages |
| Fond carte | `#ffffff` | Cartes, panneaux |
| Primaire | `#0ea5e9` (bleu ciel) | Titres, boutons principaux |
| Secondaire | `#84cc16` (vert lime) | Accents positifs, gradient bouton CTA |
| Accent chaud | `#f97316` (orange) | Alertes douces, suspect fort match |
| Accent violet | `#9333ea` | Outils, détails |
| Accent rose | `#f472b6` | Cartes suspects |
| Texte principal | `#1e293b` | Corps de texte |
| Texte secondaire | `#64748b` | Labels, sous-titres |
| Succès | `#16a34a` | Victoire, indices trouvés |

À ajouter dans `tailwind.config.js` sous `colors.braincity.*`.

---

## Mascotte : Rex le chien 🐕

Rex apparaît sur tous les écrans kids avec une **bulle de dialogue jaune pâle** (`#fef9c3`). Ses messages changent selon le contexte :

| Écran | Message Rex |
|-------|------------|
| Login | "Salut ! Je suis Rex 🐾 On va résoudre cette enquête ensemble !" |
| Dashboard (début) | "🎵 Écoute bien cet enregistrement — il y a un bruit bizarre caché dedans !" |
| Dashboard (indice trouvé) | "Ouaf ! J'ai entendu quelque chose ! ⭐ Nouvel indice trouvé !" |
| Suspects | "🎧 Clique sur ▶ pour écouter chaque voix — compare avec l'enregistrement !" |
| Débrief victoire | "Ouaf ouaf ! On a arrêté [nom] ! Le quartier est à nouveau en sécurité ! 🏙️" |
| Débrief échec | "Hmm… Le vrai agresseur court encore ! Tu as entendu [indice clé] ?" |

---

## Écran Login (`/`)

**Changements vs adulte :**
- Fond : gradient bleu ciel → vert clair, nuages blancs animés en décoration
- Rex en grand (emoji 🐕 64px) avec bulle de dialogue
- Titre : "BRAIN CITY 🏙️" en bleu ciel, police arrondie (system-ui ou Nunito si dispo)
- Sous-titre : "Mission : Trouve l'agresseur !" au lieu de "ACCÈS RESTREINT ⚠"
- Label champ : "👤 Ton prénom d'agent !" au lieu de "MATRICULE AGENT"
- Placeholder : "Ex : Léa, Maxime…"
- Bouton : gradient cyan→vert lime, "🚀 COMMENCER L'ENQUÊTE !" arrondi (border-radius: 20px)
- Suppression du texte "Division Criminalistique Audio"

---

## Écran Dashboard (`/workspace`)

### Header
- Rex 🐕 (28px) + titre "BRAIN CITY 🏙️" + sous-titre "Mission : Trouve l'agresseur !"
- Étoiles ⭐ grises (opacité 0.2) qui s'allument en jaune à chaque indice trouvé, au lieu des petits points
- Bouton CTA : "🎯 J'accuse !" gradient cyan→vert, arrondi pill

### Bulle Rex contextuelle
Bandeau blanc arrondi sous le header avec Rex + bulle jaune pâle. Message dynamique selon l'avancement (voir tableau mascotte ci-dessus).

### Waveform
- Fond : gradient bleu ciel → vert lime au lieu de noir
- Barres de la waveform en `#0ea5e9` / `#22d3ee` / `#84cc16`
- Boutons play/inverser : arrondis pill, colorés

### Outils (remplace les onglets FILTRES / PITCH / PARAMÈTRES)
4 boutons cards en grille 2×2, chacun avec emoji + nom simple + description :

| Emoji | Nom | Description technique cachée | Filtre réel |
|-------|-----|-------------------------------|-------------|
| 🔊 | Sons graves | "Filtre les bruits forts" | Low-Pass Filter |
| 🎵 | Sons aigus | "Nettoie les sifflements" | High-Pass Filter |
| ⚡ | Nettoyer | "Enlève le buzz électrique" | Notch Filter |
| 🔎 | Amplifier | "Rends la voix plus forte" | Compressor |

Un clic sur un bouton toggle le filtre correspondant (même logique interne). Le bouton sélectionné s'affiche avec un fond coloré plein.

Le pitch shift et le contrôle de vitesse restent accessibles via un bouton "⚙️ Options avancées" discret (expand/collapse), pour les animateurs.

### Indices
Grille 2×2 de cartes arrondies. État non-trouvé : étoile grise + "Indice caché…". État trouvé : étoile jaune ⭐ animée (scale bounce) + label de l'indice.

### Mission brief
Simplifié en 1 ligne colorée : "🚨 Crime : [crime] · 🎙️ Preuve : [evidence]"

---

## Écran Suspects (`/suspects`)

**Changements vs adulte :**
- Header : Rex + "Qui a fait ça ? 🤔" + instruction simplifiée
- Bulle Rex avec conseil d'écoute
- Cartes suspects : emoji de rôle en fond coloré (gradient par personnage) au lieu de photo
- "Ressemblance vocale" au lieu de "CONCORDANCE VOCALE"
- Barre de match : gradient orange→rouge pour score élevé, gradient cyan→vert pour score bas
- Bouton écoute : "▶ Écouter sa voix" pill bleu ciel
- Bouton identification : "🎯 C'est lui !" / "🎯 C'est elle !" gradient orange→rouge, pill
- Dialog confirmation simplifié : "Tu es sûr(e) que c'est [nom] ?" avec "OUI, j'accuse !" et "Non, je cherche encore"
- Suppression du champ Notes (trop complexe pour l'âge cible)

---

## Écran Débrief (`/debrief`)

### Victoire
- Confettis décoratifs (emojis 🎉🎊🎈)
- Rex en grand (64px) + "BRAVO ! 🎉" vert
- Bulle Rex avec histoire de résolution simplifiée
- Score en 4 tuiles colorées : indices ⭐, correspondance vocale 🎵, temps ⏱️, message décodé 🔄
- Bouton : "🏠 Retour à l'accueil"
- Bouton secondaire : "📄 Imprimer mon diplôme de détective" (remplace "Exporter PDF")

### Échec
- Rex avec bulle d'indice (donne un coup de pouce sans révéler la réponse)
- "Pas tout à fait… 🤔" en orange
- Boutons : "🔄 Réessayer" et "← Retour suspects"

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `tailwind.config.js` | Ajouter palette `colors.braincity.*` |
| `src/hooks/useScenarioTheme.ts` | Nouveau hook : retourne `isBrainCity: boolean` |
| `src/components/BrainCity/RexBubble.tsx` | Nouveau : mascotte + bulle contextuelle |
| `src/components/Auth/LoginScreen.tsx` | Conditionnel sur `isBrainCity` |
| `src/components/Layout/AppLayout.tsx` | Fond conditionnel (enlever scanlines pour braincity) |
| `src/components/Workspace/Dashboard.tsx` | Thème conditionnel sur tous les sous-éléments |
| `src/components/Controls/FilterPanel.tsx` | Remplacé par `KidsToolPanel.tsx` pour braincity |
| `src/components/BrainCity/KidsToolPanel.tsx` | Nouveau : 4 boutons imagés |
| `src/components/Suspects/SuspectGrid.tsx` | Thème conditionnel |
| `src/components/Debrief/ResultScreen.tsx` | Thème conditionnel |

---

## Contraintes techniques

- Aucune modification de la logique audio, du store, des hooks ou des scenarios data
- Le thème adulte (`corbeau`) ne doit pas être affecté
- Pas de nouvelle dépendance externe (pas de lib d'animation supplémentaire — Framer Motion déjà présent)
- TypeScript strict maintenu (`noUnusedLocals`, `noUnusedParameters`)
- Police : utiliser `system-ui` / `sans-serif` pour le thème kids (plus arrondi que JetBrains Mono)
