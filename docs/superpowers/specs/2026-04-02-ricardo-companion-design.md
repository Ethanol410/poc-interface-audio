# Ricardo Pouleto — Compagnon d'enquête actif

**Date :** 2026-04-02  
**Scénario concerné :** Brain City (+ extensions futures vers Corbeau)  
**Statut :** Approuvé

---

## Contexte

Ricardo Pouleto est le mascotte de Brain City. Actuellement il affiche une bulle texte statique dont le contenu change selon le nombre d'indices trouvés, et joue un son au clic. L'objectif est d'en faire un vrai personnage central qui co-mène l'enquête avec l'utilisateur.

---

## Objectif

Ricardo doit être présent et réactif sur **tous les écrans** du parcours :
- Il commente chaque action en temps réel (play, filtres, slider)
- Il émet des déductions sur les suspects
- Il change d'état émotionnel selon l'avancement
- Il déclenche des pop-ups dramatiques pour les grands moments
- Il accueille et clôture la mission

---

## Architecture : `useRicardo` hook

### Principe

Un hook unique `useRicardo()` contient toute l'intelligence de Ricardo. Il observe le store Zustand et calcule en permanence l'état à afficher. Aucune logique Ricardo n'est disséminée dans les composants.

### Interface retournée

```ts
interface RicardoState {
  message: string;
  emotion: 'neutral' | 'excited' | 'thinking' | 'panicking' | 'triumphant' | 'scared';
  isEvent: boolean;       // true = RicardoEventModal, false = RicardoBubble
  soundKey: 'bouche' | 'chant' | 'apeure' | 'agace';
  eventTitle?: string;    // ex: "INDICE TROUVÉ !"
}
```

### Système de priorités (décroissant)

| Priorité | Déclencheur | Emotion | isEvent |
|----------|------------|---------|---------|
| 1 | Timer < 30s | panicking | true |
| 2 | Nouvel indice découvert | triumphant | true |
| 3 | Tous les indices trouvés | triumphant | true |
| 4 | Proximité indice > 0.85 | excited | false |
| 5 | Proximité indice > 0.6 | excited | false |
| 6 | Filtre activé (commentaire) | thinking | false |
| 7 | Lecture démarrée | neutral | false |
| 8 | Idle / hint suivant | neutral | false |

Une seule règle s'applique à la fois — la plus prioritaire l'emporte. Cela évite que Ricardo parle de plusieurs choses simultanément.

### Détection chaud/froid

Chaque `ClueDefinition` dans `scenarios.ts` reçoit une fonction optionnelle :

```ts
proximity?: (s: StoreState) => number; // retourne 0→1
```

- `>= 0.85` → Ricardo dit "Très chaud !!" (excited)
- `>= 0.6` → Ricardo dit "Chaud !" (excited)
- `< 0.6` ou absent → pas de signal chaud

La `proximity` est évaluée uniquement si l'indice n'est pas encore découvert. Elle est calculée sur la valeur courante des sliders (pas seulement au toggle), ce qui permet un feedback progressif.

### Lignes de dialogue

Les dialogues de Ricardo sont définis dans `scenarios.ts` au niveau du scénario, dans un objet `ricardoLines` :

```ts
ricardoLines: {
  setup: string;                          // briefing initial
  play: string;                           // au démarrage de la lecture
  filters: Record<string, string>;        // clé = id filtre, valeur = commentaire
  hot: string;                            // signal chaud générique
  veryHot: string;                        // signal très chaud
  suspectComments: Record<string, string>; // clé = suspectId, valeur = avis
  allCluesFound: string;                  // tous les indices trouvés
  correctSuspect: string;                 // bon suspect
  wrongSuspect: string;                   // mauvais suspect
}
```

---

## Composants

### `RicardoBubble` (enrichi)

Composant existant, enrichi avec :
- Prop `emotion: RicardoEmotion` → sélectionne l'image correspondante parmi les fichiers disponibles dans `/public/images/inspecteur/`
- Indicateur visuel selon l'émotion : couleur de bordure, badge icône (💭 🔥 ⚠️)
- L'animation de tremblement (panicking) est gérée en CSS

Convention de nommage des images :
```
Ricardo_Pouleto_neutral.png
Ricardo_Pouleto_excited.png
Ricardo_Pouleto_thinking.png
Ricardo_Pouleto_panicking.png
Ricardo_Pouleto_triumphant.png
Ricardo_Pouleto_scared.png
```

> Note : le fichier actuel `Ricardo_Pouleto_sticker.png` sert de fallback si une image d'émotion est manquante.

### `RicardoEventModal` (nouveau)

Pop-up centré, superposé sur l'interface via `AnimatePresence`. Apparaît automatiquement quand `isEvent: true` et disparaît après 2,5 secondes (ou au clic).

Props :
```ts
interface RicardoEventModalProps {
  emotion: RicardoEmotion;
  title: string;
  message: string;
  clueProgress?: { found: number; total: number }; // affiche les étoiles
  onDismiss: () => void;
}
```

Variantes visuelles par émotion :
- `triumphant` → dégradé vert/bleu
- `panicking` → dégradé rouge
- `scared` → dégradé gris/rouge doux

---

## Intégrations par écran

### AudioSetup (`/setup`) — `src/components/AudioPlayer/AudioSetup.tsx`

- Ajout d'un bloc "Briefing Ricardo" sous le titre du scénario, uniquement quand `isBrainCity`
- Ricardo affiche `ricardoLines.setup` avec son titre "INSPECTEUR EN CHEF"
- Badges : nombre d'indices, nombre d'enregistrements
- Emotion : `neutral`

### Dashboard (`/workspace`)

- `useRicardo()` branché sur le store → alimente `RicardoBubble` + `RicardoEventModal`
- `RicardoEventModal` monté au niveau `Dashboard` (pas dans la bulle)
- Réactions :
  - **Play** → `ricardoLines.play`
  - **Filtre activé** (toggle enable/disable) → `ricardoLines.filters[filterId]` où `filterId` ∈ `{ lowPass, highPass, bandPass, notch, compressor, reverse }`
  - **Chaud** → `ricardoLines.hot` / `ricardoLines.veryHot`
  - **Indice trouvé** → pop-up `triumphant` avec label de l'indice
  - **Timer < 30s** → pop-up `panicking` avec temps restant
  - **Tous les indices** → pop-up `triumphant` + `ricardoLines.allCluesFound`

### SuspectGrid (`/suspects`)

- Barre fixe en haut avec `RicardoBubble`
- Au survol d'un suspect : Ricardo affiche `ricardoLines.suspectComments[suspectId]`
- Le suspect que Ricardo "suspecte" (= le coupable) reçoit un badge 🔥
- Sans survol : Ricardo dit qu'il attend le choix

### ResultScreen (`/debrief`)

- Ricardo réagit au verdict avant l'animation principale
- Bon suspect : `triumphant` + `ricardoLines.correctSuspect` + son `chant`
- Mauvais suspect : `scared` + `ricardoLines.wrongSuspect` + son `apeure`

---

## Images requises

6 images à fournir dans `/public/images/inspecteur/` :

| Fichier | Usage |
|---------|-------|
| `Ricardo_Pouleto_neutral.png` | Idle, play, hints |
| `Ricardo_Pouleto_thinking.png` | Filtre activé, analyse |
| `Ricardo_Pouleto_excited.png` | Signal chaud, progression |
| `Ricardo_Pouleto_panicking.png` | Timer critique |
| `Ricardo_Pouleto_triumphant.png` | Indice trouvé, victoire |
| `Ricardo_Pouleto_scared.png` | Mauvais suspect |

---

## Ce qui ne change pas

- Le son `pouleBouche` se joue uniquement au clic (déjà implémenté)
- Les sons `chant` / `apeure` restent automatiques sur message change (déjà implémenté)
- Le scénario Corbeau n'est pas affecté (`isBrainCity` guard)
- La logique de détection des indices dans `Dashboard` reste inchangée

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/hooks/useRicardo.ts` | Créer |
| `src/components/BrainCity/RicardoBubble.tsx` | Modifier (prop emotion + images) |
| `src/components/BrainCity/RicardoEventModal.tsx` | Créer |
| `src/data/scenarios.ts` | Modifier (ricardoLines + proximity) |
| `src/components/Workspace/Dashboard.tsx` | Modifier (brancher useRicardo) |
| `src/components/Suspects/SuspectGrid.tsx` | Modifier (barre Ricardo + hover) |
| `src/components/AudioPlayer/AudioSetup.tsx` | Modifier (bloc briefing Ricardo) |
