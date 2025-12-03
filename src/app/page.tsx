"use client";

/**
 * PAGE D'ACCUEIL - Route : /
 * 
 * Fichier : src/app/page.tsx
 * 
 * Cette page est la page d'accueil de ChessFocus.
 * Next.js App Router détecte automatiquement ce fichier comme la route racine "/".
 * 
 * POUR VERCEL :
 * - Export par défaut requis : ✅ export default function HomePage()
 * - Composant React valide : ✅
 * - Route générée : / (Static, prerendered)
 * 
 * IMPORTANT :
 * - Ne pas renommer ce fichier (doit rester "page.tsx")
 * - Ne pas déplacer ce fichier (doit rester dans src/app/)
 */
import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/page-accueil.png')" }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-950/75 to-slate-900/80" />

      {/* Existing hero content */}
      <div className="relative z-10">
        {/* Centered Glass Card */}
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-5xl w-full rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] overflow-hidden animate-[fadeIn_0.7s_ease-out]">
            {/* Inner 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 p-6 sm:p-8 lg:p-10">
            {/* LEFT COLUMN: Main text */}
            <div className="flex flex-col justify-center">
              {/* Big brand/title */}
              <h1 className="font-hero-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
                {t('home.title')}
              </h1>

              {/* Two subtitle lines */}
              <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed">
                {t('home.subtitle1')}
              </p>
              <p className="text-base sm:text-lg text-slate-200/80 leading-relaxed">
                {t('home.subtitle2')}
              </p>

              {/* Small supporting line */}
              <p className="mt-4 text-xs sm:text-sm text-slate-300/80 max-w-md">
                {t('home.description')}
              </p>

              {/* CTA button */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-950
                             bg-gradient-to-tr from-emerald-400 to-emerald-300 shadow-[0_18px_50px_rgba(16,185,129,0.45)]
                             hover:shadow-[0_22px_65px_rgba(16,185,129,0.7)] hover:brightness-110 hover:-translate-y-[1px]
                             transition-all duration-200"
                >
                  {t('home.cta')}
                </Link>

                <span className="text-xs text-slate-300/80">
                  {t('home.noAccount')}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Info panel */}
            <div className="h-full flex items-stretch">
              <div className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-5 sm:px-5 sm:py-6 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t('home.howItWorks')}
                </p>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/50 text-xs font-semibold text-emerald-300">
                      01
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{t('home.step1.title')}</p>
                      <p className="text-slate-300/80 text-xs">
                        {t('home.step1.desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/50 text-xs font-semibold text-emerald-300">
                      02
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{t('home.step2.title')}</p>
                      <p className="text-slate-300/80 text-xs">
                        {t('home.step2.desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/50 text-xs font-semibold text-emerald-300">
                      03
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{t('home.step3.title')}</p>
                      <p className="text-slate-300/80 text-xs">
                        {t('home.step3.desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-slate-600/60 border border-slate-400/50 text-xs font-semibold text-slate-200">
                      04
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{t('home.step4.title')}</p>
                      <p className="text-slate-300/80 text-xs">
                        {t('home.step4.desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
