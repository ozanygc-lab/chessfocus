"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.analyze': 'Analyser',
    'nav.opponent': 'Adversaire',
    'nav.tab.game': 'Analyser une partie',
    'nav.tab.opponent': 'Analyser un adversaire',
    
    // Homepage
    'home.title': 'ChessFocus',
    'home.subtitle1': 'Apprendre contre tes faiblesses.',
    'home.subtitle2': 'Apprendre contre les faiblesses de tes adversaires.',
    'home.description': 'Analyse intelligente de tes parties & de celles de tes adversaires, pour préparer chaque match comme un joueur pro.',
    'home.cta': 'Fais-le maintenant',
    'home.noAccount': 'Aucun compte nécessaire pour tester l\'analyse.',
    'home.howItWorks': 'COMMENT ÇA MARCHE',
    'home.step1.title': 'Importe une partie',
    'home.step1.desc': 'Colle un lien Lichess ou Chess.com, ou ton PGN brut.',
    'home.step2.title': 'Détecte tes faiblesses',
    'home.step2.desc': 'L\'IA identifie tes erreurs et les moments clés de la partie.',
    'home.step3.title': 'Analyse ton adversaire',
    'home.step3.desc': 'Prépare un plan de jeu ciblé contre ses faiblesses.',
    'home.step4.title': 'Passe à l\'échiquier',
    'home.step4.desc': 'Tu joues en sachant déjà où frapper.',
    
    // Game Analysis Tab
    'game.source': 'Source de la partie',
    'game.tab.link': 'Lien (Lichess / Chess.com)',
    'game.tab.pgn': 'PGN',
    'game.input.link.placeholder': 'Collez l\'URL de la partie (ex: lichess.org/...) ',
    'game.input.pgn.placeholder': 'Collez ici le PGN complet de votre partie...',
    'game.analyze': 'Analyser la partie',
    'game.loading': 'Analyse en cours...',
    'game.error': 'Une erreur est survenue lors de l\'analyse.',
    'game.noAnalysis': 'Aucune analyse pour le moment. Lance une analyse pour voir les résultats.',
    'game.results': 'Résultats de l\'analyse',
    'game.playerSide': 'Dans cette partie, vous étiez :',
    'game.playerSide.white': '⚪ Blancs',
    'game.playerSide.black': '⚫ Noirs',
    'game.playerSide.exercises': 'Les exercices seront adaptés selon les erreurs des',
    'game.analysis': 'Analyse de la partie',
    'game.keyMoments': 'Moments clés',
    'game.mistakes': 'Erreurs & Imprécisions',
    'game.exercises': 'Exercices recommandés',
    'game.linkGuide.title': '📱 Copier le lien de ta partie',
    'game.linkGuide.mobile': 'Comment copier le lien de ta partie sur mobile ?',
    'game.linkGuide.hide': 'Masquer le guide mobile',
    'game.pgnGuide.title': '📋 Copier le PGN de ta partie',
    'game.pgnGuide.mobile': 'Comment copier le PGN de ta partie ?',
    'game.pgnGuide.hide': 'Masquer le guide PGN',
    'game.error.pgn': 'Veuillez coller le PGN.',
    'game.error.link': 'Veuillez coller un lien.',
    'game.error.invalid': 'Réponse invalide du serveur.',
    'game.error.retry': 'Une erreur est survenue lors de l\'analyse. Veuillez réessayer.',
    
    // Opponent Analysis Tab
    'opponent.title': 'Analyser un adversaire',
    'opponent.settings': 'Paramètres de l\'analyse',
    'opponent.platform': 'Plateforme',
    'opponent.username': 'Nom d\'utilisateur',
    'opponent.games': 'Nombre de parties à analyser',
    'opponent.analyze': 'Analyser l\'adversaire',
    'opponent.profile': 'Profil de l\'adversaire',
    'opponent.elo': 'Évolution du classement ELO',
    'opponent.strengths': 'Points forts & Points faibles',
    'opponent.mistakes': 'Erreurs fréquentes & Thèmes défavorables',
    'opponent.exercises': 'Exercices interactifs pour la préparation',
    
    // Contact
    'contact': 'Contact',
    'contact.email': 'Contact :',
    
    // Common
    'loading': 'Chargement...',
    'error': 'Erreur',
    'language': 'Langue',
    'language.fr': 'Français',
    'language.en': 'English',
  },
  en: {
    // Navigation
    'nav.analyze': 'Analyze',
    'nav.opponent': 'Opponent',
    'nav.tab.game': 'Analyze a game',
    'nav.tab.opponent': 'Analyze an opponent',
    
    // Homepage
    'home.title': 'ChessFocus',
    'home.subtitle1': 'Learn against your weaknesses.',
    'home.subtitle2': 'Learn against your opponents\' weaknesses.',
    'home.description': 'Intelligent analysis of your games & your opponents\' games, to prepare every match like a pro player.',
    'home.cta': 'Do it now',
    'home.noAccount': 'No account needed to test the analysis.',
    'home.howItWorks': 'HOW IT WORKS',
    'home.step1.title': 'Import a game',
    'home.step1.desc': 'Paste a Lichess or Chess.com link, or your raw PGN.',
    'home.step2.title': 'Detect your weaknesses',
    'home.step2.desc': 'AI identifies your mistakes and key moments in the game.',
    'home.step3.title': 'Analyze your opponent',
    'home.step3.desc': 'Prepare a targeted game plan against their weaknesses.',
    'home.step4.title': 'Go to the board',
    'home.step4.desc': 'You play knowing exactly where to strike.',
    
    // Game Analysis Tab
    'game.source': 'Game source',
    'game.tab.link': 'Link (Lichess / Chess.com)',
    'game.tab.pgn': 'PGN',
    'game.input.link.placeholder': 'Paste the game URL (ex: lichess.org/...) ',
    'game.input.pgn.placeholder': 'Paste the complete PGN of your game here...',
    'game.analyze': 'Analyze game',
    'game.loading': 'Analyzing...',
    'game.error': 'An error occurred during analysis.',
    'game.noAnalysis': 'No analysis yet. Start an analysis to see results.',
    'game.results': 'Analysis results',
    'game.playerSide': 'In this game, you were:',
    'game.playerSide.white': '⚪ White',
    'game.playerSide.black': '⚫ Black',
    'game.playerSide.exercises': 'Exercises will be adapted based on',
    'game.analysis': 'Game analysis',
    'game.keyMoments': 'Key moments',
    'game.mistakes': 'Mistakes & Inaccuracies',
    'game.exercises': 'Recommended exercises',
    'game.linkGuide.title': '📱 Copy your game link',
    'game.linkGuide.mobile': 'How to copy your game link on mobile?',
    'game.linkGuide.hide': 'Hide mobile guide',
    'game.pgnGuide.title': '📋 Copy your game PGN',
    'game.pgnGuide.mobile': 'How to copy your game PGN?',
    'game.pgnGuide.hide': 'Hide PGN guide',
    'game.error.pgn': 'Please paste the PGN.',
    'game.error.link': 'Please paste a link.',
    'game.error.invalid': 'Invalid server response.',
    'game.error.retry': 'An error occurred during analysis. Please try again.',
    
    // Opponent Analysis Tab
    'opponent.title': 'Analyze an opponent',
    'opponent.settings': 'Analysis settings',
    'opponent.platform': 'Platform',
    'opponent.username': 'Username',
    'opponent.games': 'Number of games to analyze',
    'opponent.analyze': 'Analyze opponent',
    'opponent.profile': 'Opponent profile',
    'opponent.elo': 'ELO rating evolution',
    'opponent.strengths': 'Strengths & Weaknesses',
    'opponent.mistakes': 'Frequent mistakes & Unfavorable themes',
    'opponent.exercises': 'Interactive exercises for preparation',
    
    // Contact
    'contact': 'Contact',
    'contact.email': 'Contact:',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'language': 'Language',
    'language.fr': 'Français',
    'language.en': 'English',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chessfocus-language') as Language | null;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('chessfocus-language', lang);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

