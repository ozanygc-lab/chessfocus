import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
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
      <body className={`${playfair.variable} min-h-screen bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
