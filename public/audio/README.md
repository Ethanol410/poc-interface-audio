# Audio Assets

Ce dossier contient les fichiers audio utilisés dans l'application.

## Fichiers requis

Les fichiers audio suivants doivent être présents pour le bon fonctionnement de l'application :

### Evidence principale
- `evidence-01-distorted.mp3` - Enregistrement vocal modifié (voix du Corbeau)
  - Durée: ~25 secondes
  - Format: MP3, 128 kbps
  - Traitement: Pitch shift, filtrage, bruit ajouté

- `evidence-01-clean.mp3` - Version originale non modifiée
  - Durée: ~25 secondes
  - Format: MP3, 128 kbps
  - Usage: Référence pour comparaison A/B

### Voix suspects (pour comparaison)
- `suspect-01.mp3` - Échantillon vocal suspect A
- `suspect-02.mp3` - Échantillon vocal suspect B
- `suspect-03.mp3` - Échantillon vocal suspect C

Durée: ~15 secondes chacun
Format: MP3, 128 kbps

## Comment créer les fichiers audio

### Option 1: Enregistrement vocal

1. Enregistrer un message court (20-30 secondes)
2. Utiliser Audacity ou un outil similaire pour:
   - Version distorted: appliquer pitch shift (-5 semitones), filtres, bruit
   - Version clean: garder l'original
3. Exporter en MP3 128 kbps

### Option 2: Synthèse vocale (TTS)

Utiliser un service TTS comme:
- Google Cloud Text-to-Speech
- Amazon Polly
- ElevenLabs

### Option 3: Audio libre de droits

Télécharger depuis:
- freesound.org
- zapsplat.com
- BBC Sound Effects

## Conversion et optimisation

```bash
# Convertir en MP3 128 kbps avec ffmpeg
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# Normaliser le volume
ffmpeg -i input.mp3 -filter:a loudnorm output.mp3

# Couper à une durée spécifique (25 secondes)
ffmpeg -i input.mp3 -ss 0 -t 25 -acodec copy output.mp3
```

## Traitement pour version "distorted"

Avec Audacity:
1. Ouvrir le fichier clean
2. **Effets > Changer la hauteur**: -5 semitones
3. **Effets > Égaliseur**: réduire 100-300 Hz et 5000-8000 Hz
4. **Générer > Bruit**: ajouter léger bruit blanc (amplitude -30 dB)
5. **Effets > Compresseur**: ratio 3:1, threshold -18 dB
6. Exporter en MP3 128 kbps

## Structure finale

```
public/audio/
├── README.md (ce fichier)
├── evidence-01-distorted.mp3
├── evidence-01-clean.mp3
├── suspect-01.mp3
├── suspect-02.mp3
└── suspect-03.mp3
```

## Note importante

⚠️ Pour les tests de développement, vous pouvez utiliser des fichiers audio temporaires de n'importe quelle source. Pour la version finale destinée à être présentée, assurez-vous d'avoir les droits d'utilisation des fichiers audio.
