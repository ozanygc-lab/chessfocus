# ChessFocus

Analysez vos parties d'échecs et préparez-vous contre vos adversaires avec l'IA.

ChessFocus est une application SaaS qui utilise l'API OpenAI pour analyser des parties d'échecs individuelles et analyser les adversaires basés sur leurs dernières parties Lichess.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env.local` à la racine du projet avec votre clé API OpenAI:

```env
OPENAI_API_KEY=your_openai_key_here
```

Vous pouvez copier `.env.example` et remplacer la valeur:

```bash
cp .env.example .env.local
```

## Lancement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

### 1. Analyser une partie

- Entrez un PGN directement ou un lien vers une partie Lichess
- Obtenez une analyse complète avec:
  - Résumé de la partie
  - Moments clés
  - Erreurs détectées (imprécisions, erreurs, erreurs graves)
  - Exercices recommandés

### 2. Analyser un adversaire

- Entrez le pseudo Lichess d'un adversaire
- Sélectionnez le nombre de parties à analyser (5, 10, ou 20)
- Obtenez un rapport détaillé avec:
  - Résumé du style de jeu
  - Faiblesses principales
  - Erreurs fréquentes et comment les exploiter
  - Exercices recommandés pour s'améliorer

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run start` - Lance le serveur de production

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o-mini)
