"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="w-full py-4 px-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-xs sm:text-sm text-slate-400">
          {t('contact.email')}{" "}
          <a
            href="mailto:litchen.pro@gmail.com"
            className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 underline underline-offset-2"
          >
            litchen.pro@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}

