# ChessFocus - Notes de développement

## Structure du projet

Ce projet utilise **Next.js 16 avec App Router** et la structure `/src/app/`.

### ✅ Structure validée

- ✅ Pas de dossier `/pages/` (structure App Router pure)
- ✅ Tous les fichiers dans `/src/app/`
- ✅ Layout racine : `src/app/layout.tsx`
- ✅ Configuration TypeScript avec alias `@/*` → `./src/*`

### Routes principales

#### 1. Page d'accueil
- **Fichier** : `src/app/page.tsx`
- **Route** : `/`
- **Composant** : `HomePage` (export default)
- **Contenu** : Hero ChessFocus avec :
  - Titre "ChessFocus"
  - Bouton vert "Fais-le maintenant" → lien vers `/analyze`
  - Panel "Comment ça marche"
- **Status** : ✅ Export par défaut correct, composant React valide

#### 2. Page d'analyse
- **Fichier** : `src/app/analyze/page.tsx`
- **Route** : `/analyze`
- **Composant** : `ChessFocusPage` (export default)
- **Contenu** : 
  - Onglets "Analyser une partie" / "Analyser un adversaire"
  - Formulaires d'analyse complets
  - Échiquier interactif avec highlights
  - Exercices interactifs
- **Status** : ✅ Export par défaut correct, composant React valide

#### 3. Page 404
- **Fichier** : `src/app/not-found.tsx`
- **Route** : `/_not-found` (gérée automatiquement par Next.js)
- **Composant** : `NotFound` (export default)
- **Contenu** :
  - Titre "Page introuvable"
  - Message : "La page que tu cherches n'existe pas ou a été déplacée."
  - Bouton "Retour à l'accueil" → `/`
  - Bouton "Aller à l'analyse" → `/analyze`
- **Status** : ✅ Export par défaut correct, style dark cohérent

### Routes API

- **API Analyse de partie** : `src/app/api/game-analyze/route.ts` → Route `/api/game-analyze`
  - Méthode : `POST`
  - Status : ✅ Route valide

- **API Analyse d'adversaire** : `src/app/api/opponent-analyze/route.ts` → Route `/api/opponent-analyze`
  - Méthode : `POST`
  - Status : ✅ Route valide

### Configuration

#### Next.js Config (`next.config.ts`)
- ✅ `reactStrictMode: true`
- ✅ Redirections configurées :
  - `/index` → `/` (permanent)
  - `/home` → `/` (permanent)
  - `/analyse` → `/analyze` (permanent)
  - `/analysis` → `/analyze` (permanent)
- ✅ Pas de `basePath`, `trailingSlash`, ou `rewrites` problématiques

#### TypeScript Config (`tsconfig.json`)
- ✅ Path alias `@/*` → `./src/*`
- ✅ Compatible Next.js 16 App Router
- ✅ Module resolution : `bundler`

#### Vercel Config (`vercel.json`)
- ✅ Framework : `nextjs`
- ✅ Build command : `npm run build`
- ✅ Output directory : `.next`

### Déploiement Vercel

- ✅ Structure `src/app/` automatiquement détectée par Next.js
- ✅ Configuration Vercel explicite dans `vercel.json`
- ✅ Build passe sans erreur
- ✅ Toutes les routes détectées correctement

## Build Status

```bash
npm run build  # ✅ Build réussi
npm run lint   # ⚠️ Warnings non-bloquants uniquement (setState in useEffect)
npx tsc --noEmit  # ✅ Aucune erreur TypeScript
```

## Routes détectées par Next.js

```
Route (app)
┌ ○ /                    (Static - Page d'accueil)
├ ○ /_not-found          (Static - Page 404)
├ ○ /analyze             (Static - Page d'analyse)
├ ƒ /api/game-analyze     (Dynamic - API route)
└ ƒ /api/opponent-analyze (Dynamic - API route)
```

## Vérifications effectuées

- ✅ Structure App Router correcte (`src/app/`)
- ✅ Pas de dossier `/pages/` conflictuel
- ✅ Page d'accueil exporte un composant React valide
- ✅ Page d'analyse exporte un composant React valide
- ✅ Page 404 personnalisée avec style cohérent
- ✅ Tous les liens pointent vers `/analyze` (pas d'anciennes routes)
- ✅ Redirections configurées dans `next.config.ts`
- ✅ Imports corrects (alias `@/*` fonctionne)
- ✅ Build passe sans erreur
- ✅ TypeScript compile sans erreur
- ✅ Configuration Vercel explicite

## Résolution des 404

Si vous rencontrez encore des 404 sur Vercel :

1. **Vérifiez les variables d'environnement** :
   - `OPENAI_API_KEY` doit être configurée dans Vercel (Settings → Environment Variables)

2. **Vérifiez le domaine** :
   - Settings → Domains → Votre domaine doit être configuré

3. **Redéployez manuellement** :
   - Allez dans Deployments → Cliquez sur "Redeploy"

4. **Vérifiez les logs de build** :
   - Le build doit se terminer avec "✓ Compiled successfully"
   - Les routes doivent être listées comme ci-dessus
