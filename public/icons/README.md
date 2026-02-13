# PWA Icons

Ce dossier doit contenir les icônes PWA dans différentes résolutions pour une installation optimale sur tous les appareils.

## Fichiers requis

- `icon-192x192.png` - Icône standard PWA
- `icon-512x512.png` - Icône haute résolution PWA
- `apple-touch-icon.png` (180x180) - Icône iOS
- `favicon.ico` - Favicon navigateur

## Génération des icônes

### Option 1: Générateur en ligne (recommandé)

Utilisez [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator):
1. Uploader une image carrée (minimum 512x512)
2. Télécharger le package d'icônes généré
3. Copier les fichiers dans ce dossier

### Option 2: Outil CLI

Installer `pwa-asset-generator`:
```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo.png public/icons --background "#0a0e27" --icon-only --padding "10%"
```

### Option 3: Création manuelle

Avec un outil comme Photoshop, GIMP, ou Figma:
1. Créer un design carré sur fond `#0a0e27`
2. Logo/icône centré
3. Exporter en PNG aux résolutions:
   - 192x192 px
   - 512x512 px
   - 180x180 px (Apple)

## Design recommandé

**Concept**: Badge forensics avec initiales "EC" (Écho du Corbeau)

**Éléments**:
- Fond: `#0a0e27` (forensics-bg)
- Cercle/badge: border `#00d4ff` (cyan) 2-3px
- Texte "EC": font JetBrains Mono, couleur `#00d4ff`
- Effet glow subtle autour du texte
- Style "police scientifique" minimaliste

**Exemple Figma/Code**:
```
- Canvas 512x512, bg #0a0e27
- Circle stroke #00d4ff, 400x400, centered
- Text "EC" 120pt, JetBrains Mono Bold, #00d4ff
- Drop shadow: 0 0 20px #00d4ff40 (glow)
```

## Outils utiles

- [Figma](https://figma.com) - Design gratuit
- [Canva](https://canva.com) - Créer rapidement
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Tous formats
- [Squoosh](https://squoosh.app/) - Optimisation PNG
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) - CLI

## Vérification

Après avoir ajouté les icônes:
```bash
# Build et test PWA
npm run build
npm run preview

# Inspecter manifest
# Chrome DevTools → Application → Manifest
# Vérifier que les icônes s'affichent
```

## Notes

⚠️ Les icônes PWA doivent être optimisées (< 50 KB chacune) pour un chargement rapide.

Pour les tests, vous pouvez utiliser temporairement des placeholders générés sur [placehold.co](https://placehold.co/512x512/0a0e27/00d4ff?text=EC).
