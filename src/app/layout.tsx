/**
 * LAYOUT RACINE - App Router
 * 
 * Fichier : src/app/layout.tsx
 * 
 * Ce fichier définit le layout racine de l'application Next.js.
 * Il enveloppe toutes les pages et définit les métadonnées globales.
 * 
 * POUR VERCEL :
 * - Export par défaut requis : ✅ export default function RootLayout()
 * - Composant React valide : ✅
 * - Doit contenir <html> et <body> (requis par Next.js)
 * - Les métadonnées sont utilisées pour le SEO et les previews
 * 
 * IMPORTANT :
 * - Ce fichier doit s'appeler "layout.tsx" (nom réservé par Next.js)
 * - Doit être placé dans src/app/ pour être détecté
 * - Toutes les pages héritent de ce layout
 * - Le footer avec le contact est inclus ici pour être visible sur toutes les pages
 */
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "ChessFocus - Analyse de parties & préparation contre un adversaire",
  description: "Analysez vos parties d'échecs et préparez-vous contre vos adversaires avec l'IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} min-h-screen bg-gray-900 flex flex-col`}>
        <div className="flex-1">
          {children}
        </div>
        <footer className="w-full py-4 px-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Contact :{" "}
              <a
                href="mailto:litchen.pro@gmail.com"
                className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 underline underline-offset-2"
              >
                litchen.pro@gmail.com
              </a>
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
