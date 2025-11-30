/**
 * PAGE 404 CUSTOM - Route : /_not-found (gérée automatiquement par Next.js)
 * 
 * Fichier : src/app/not-found.tsx
 * 
 * Cette page s'affiche automatiquement quand une route n'existe pas.
 * Next.js App Router détecte automatiquement ce fichier pour gérer les 404.
 * 
 * POUR VERCEL :
 * - Export par défaut requis : ✅ export default function NotFound()
 * - Composant React valide : ✅
 * - Route générée : /_not-found (Static, prerendered)
 * 
 * IMPORTANT :
 * - Ce fichier doit s'appeler "not-found.tsx" (nom réservé par Next.js)
 * - Doit être placé dans src/app/ pour être détecté
 * - S'affiche automatiquement pour toutes les routes inexistantes
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/page-accueil.png')" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-950/75 to-slate-900/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <div className="max-w-2xl w-full rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] p-8 sm:p-12">
          <h1 className="text-6xl sm:text-8xl font-bold text-emerald-400 mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            Page introuvable
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            La page que tu cherches n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-tr from-emerald-400 to-emerald-300 shadow-[0_18px_50px_rgba(16,185,129,0.45)] hover:shadow-[0_22px_65px_rgba(16,185,129,0.7)] hover:brightness-110 transition-all duration-200"
            >
              Retour à l'accueil
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white bg-slate-800/60 border border-white/10 hover:bg-slate-700/80 transition-all duration-200"
            >
              Aller à l'analyse
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

