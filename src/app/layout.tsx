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
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import Footer from "@/components/Footer";

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
        <LanguageProvider>
          <div className="flex-1">
            <div className="fixed top-4 right-4 z-50">
              <LanguageSelector />
            </div>
            {children}
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
