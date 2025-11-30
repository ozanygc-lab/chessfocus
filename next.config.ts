import type { NextConfig } from "next";

/**
 * Configuration Next.js pour Vercel Production
 * 
 * STRUCTURE APP ROUTER :
 * - Le projet utilise la structure /src/app/ (App Router)
 * - Next.js détecte automatiquement cette structure pour Vercel
 * - Toutes les routes sont définies via les fichiers page.tsx dans src/app/
 * 
 * ROUTES DÉTECTÉES :
 * - / → src/app/page.tsx (Page d'accueil ChessFocus)
 * - /analyze → src/app/analyze/page.tsx (Page d'analyse)
 * - /_not-found → src/app/not-found.tsx (Page 404 custom)
 * - /api/game-analyze → src/app/api/game-analyze/route.ts
 * - /api/opponent-analyze → src/app/api/opponent-analyze/route.ts
 * 
 * REDIRECTIONS :
 * - /index et /home → / (pour éviter les 404)
 * - /analyse et /analysis → /analyze (compatibilité anciennes URLs)
 * 
 * IMPORTANT POUR VERCEL :
 * - Pas de basePath : les routes sont à la racine du domaine
 * - Pas de rewrites : on utilise uniquement des redirects simples
 * - reactStrictMode activé pour la production
 */
const nextConfig: NextConfig = {
  // Ensure App Router is used
  reactStrictMode: true,
  
  // Redirects for common paths and old URLs
  // Ces redirections garantissent qu'aucune route ne retourne 404
  async redirects() {
    return [
      // Home page redirects
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Old analysis routes (if they existed)
      {
        source: "/analyse",
        destination: "/analyze",
        permanent: true,
      },
      {
        source: "/analysis",
        destination: "/analyze",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
