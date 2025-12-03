"use client";

import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex rounded-full bg-slate-900/90 backdrop-blur-sm border border-white/10 p-1 shadow-lg">
      {(['fr', 'en'] as Language[]).map((lang) => {
        const isActive = language === lang;
        return (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={isActive
              ? "px-4 py-2 rounded-full text-sm font-semibold bg-emerald-400 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.4)] transition-all"
              : "px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            }
            title={t(`language.${lang}`)}
          >
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        );
      })}
    </div>
  );
}

