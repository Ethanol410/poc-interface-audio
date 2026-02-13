# 🎵 Guide de Démarrage Rapide

## ✅ Application opérationnelle !

Votre application est maintenant configurée pour fonctionner sans fichiers audio préexistants.

## 🚀 Comment tester l'application

### Option 1 : MODE DÉMO (Recommandé) ⚡

1. **L'application devrait afficher l'écran de configuration**
2. **Cliquez sur "GÉNÉRER & DÉMARRER"** dans la section "MODE DÉMO"
3. L'application va générer automatiquement des sons de test synthétiques
4. Vous serez redirigé vers l'écran de login, puis vers le Dashboard

**Avantages du mode démo :**
- ✓ Aucun fichier audio requis
- ✓ Test immédiat de toutes les fonctionnalités
- ✓ Sons générés en quelques secondes

### Option 2 : VOS PROPRES FICHIERS 📁

1. Sur l'écran de configuration, utilisez la section "MES FICHIERS"
2. **Uploadez au minimum** : Un fichier audio principal (Evidence)
3. **Optionnel** : Ajoutez des voix de suspects pour la comparaison
4. Cliquez sur "UTILISER MES FICHIERS"

**Formats audio supportés :**
- MP3, WAV, OGG, FLAC
- Durée recommandée : 15-30 secondes

## 🎮 Fonctionnalités disponibles

### 📊 Dashboard (Workspace)
- **Waveform** : Visualisation de forme d'onde interactive
- **Spectrogramme** : Analyse fréquentielle temps-réel
- **Filtres audio** : Passe-bas, passe-haut avec contrôles
- **Pitch Shift** : Modification de la tonalité
- **Comparaison A/B** : Bascule entre audio traité/original

### 🕵️ Analyse des Suspects
- Grille de suspects avec photos
- Prise de notes par suspect
- Identification du coupable
- Comparaison vocale

### 📈 Visualisations
- Barres de fréquence en temps réel
- Niveaux audio (VU meters)
- Affichage des paramètres actifs

## 🔧 Résolution de problèmes

### Si rien ne se charge
1. Vérifiez la console du navigateur (F12)
2. Rechargez la page (Ctrl + Shift + R)
3. Videz le cache du navigateur
4. Essayez le mode démo d'abord

### Si le son ne joue pas
- Vérifiez que votre navigateur autorise la lecture audio
- Cliquez n'importe où sur la page pour activer l'AudioContext
- Vérifiez le volume système et du navigateur

### Si l'upload échoue
- Vérifiez le format du fichier (MP3, WAV, OGG acceptés)
- Taille max recommandée : 50 MB
- Essayez de convertir votre fichier en MP3

## 📂 Structure des fichiers (si vous préférez les placer manuellement)

Si vous souhaitez utiliser des fichiers audio statiques au lieu du système d'upload :

```
public/audio/
├── evidence-01-distorted.mp3  (fichier principal modifié)
├── evidence-01-clean.mp3      (version originale)
├── suspect-01.mp3             (voix suspect 1)
├── suspect-02.mp3             (voix suspect 2)
└── suspect-03.mp3             (voix suspect 3)
```

Puis modifiez `src/assets/audioManifest.ts` pour pointer vers ces fichiers.

## 🆘 Support

En cas de problème :
1. Vérifiez les messages d'erreur dans la console (F12)
2. Consultez les logs du terminal où tourne `npm run dev`
3. Essayez de recréer le build : `npm run build`

## 🎯 Prochaines étapes

1. **Testez le mode démo** pour comprendre l'interface
2. **Uploadez vos propres fichiers** pour une analyse réelle
3. **Explorez les filtres audio** pour restaurer les voix modifiées
4. **Comparez les suspects** pour identifier le coupable

---

💡 **Astuce** : Utilisez les raccourcis clavier :
- `Espace` : Play/Pause
- `←` / `→` : Avancer/Reculer
- `↑` / `↓` : Volume

Bon forensic audio ! 🕵️‍♂️🎧
