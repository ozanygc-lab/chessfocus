"use client";

/**
 * PAGE D'ANALYSE - Route : /analyze
 * 
 * Fichier : src/app/analyze/page.tsx
 * 
 * Cette page contient les fonctionnalités d'analyse de parties et d'adversaires.
 * Next.js App Router détecte automatiquement ce fichier comme la route "/analyze".
 * 
 * POUR VERCEL :
 * - Export par défaut requis : ✅ export default ChessFocusPage
 * - Composant React valide : ✅
 * - Route générée : /analyze (Static, prerendered)
 * 
 * IMPORTANT :
 * - Le dossier "analyze" dans src/app/ crée la route /analyze
 * - Le fichier doit s'appeler "page.tsx" pour être détecté comme route
 * - Ne pas déplacer ce fichier (doit rester dans src/app/analyze/)
 */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

// Composant pour afficher les courbes ELO
const EloChart: React.FC<{ data: EloDataPoint[] }> = ({ data }) => {
  // Grouper par variant et préparer les données pour le graphique
  const variants = Array.from(new Set(data.map(d => d.variant)));
  const maxRating = Math.max(...data.map(d => d.rating), 1000);
  const minRating = Math.min(...data.map(d => d.rating), 1000);
  const range = maxRating - minRating || 200;
  
  // Couleurs par variant
  const variantColors: Record<string, string> = {
    classical: "text-blue-400",
    rapid: "text-green-400",
    blitz: "text-yellow-400",
    bullet: "text-purple-400",
    daily: "text-cyan-400",
  };

  return (
    <div className="space-y-4">
      {variants.map((variant) => {
        const variantData = data.filter(d => d.variant === variant).slice(-12); // Derniers 12 mois
        if (variantData.length === 0) return null;
        
        return (
          <div key={variant} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium capitalize ${variantColors[variant] || "text-slate-300"}`}>
                {variant === "classical" ? "Classique" : variant === "rapid" ? "Rapide" : variant === "blitz" ? "Blitz" : variant === "bullet" ? "Bullet" : variant === "daily" ? "Correspondance" : variant}
              </span>
              <span className="text-sm text-slate-400">
                {variantData[variantData.length - 1]?.rating || "N/A"}
              </span>
            </div>
            <div className="relative h-8 bg-slate-800/60 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center">
                {variantData.map((point, idx) => {
                  const height = ((point.rating - minRating) / range) * 100;
                  const width = 100 / variantData.length;
                  return (
                    <div
                      key={idx}
                      className={`${variantColors[variant]?.replace("text-", "bg-") || "bg-emerald-400"} opacity-70`}
                      style={{
                        width: `${width}%`,
                        height: `${Math.max(height, 10)}%`,
                        marginLeft: idx > 0 ? "1px" : "0",
                      }}
                      title={`${point.date}: ${point.rating}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      {variants.length === 0 && (
        <p className="text-slate-400 text-center py-4">Données ELO non disponibles</p>
      )}
    </div>
  );
};

// --- TYPESCRIPT INTERFACES ---

type AnalysisSource = 'PGN' | 'LINK';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error';

interface KeyMoment {
  moveNumber: number;
  description: string;
  evaluationChange: number;
}

type MistakeCategory = 'inaccuracy' | 'mistake' | 'blunder';

interface Mistake {
  moveNumber: number;
  movePlayed: string;
  category: MistakeCategory;
  explanation: string;
  bestSuggestion?: string;
  bestSuggestionExplanation?: string; // Explication détaillée de pourquoi ce coup est meilleur
}

interface MoveVariant {
  move: string; // Coup en notation algébrique
  isBest: boolean; // true si c'est le meilleur coup
  explanation?: string; // Explication du coup
  opponentResponse?: string; // Réponse de l'adversaire après ce coup
}

interface Exercise {
  title: string;
  description: string;
  exerciseType: 'tactic' | 'endgame' | 'opening' | 'strategy';
  estimatedLevel: 'beginner' | 'intermediate' | 'advanced';
  positionFen?: string; // Position de départ en FEN
  solution?: string[]; // Séquence de coups solution (meilleure ligne)
  hint?: string; // Indice pour l'exercice
  weaknessExploited?: string; // Faiblesse spécifique exploitée
  moveVariants?: MoveVariant[]; // Variantes de coups possibles (bons et mauvais)
  opponentMoves?: string[]; // Coups typiques de l'adversaire dans cette position
  completionExplanation?: string; // Explication détaillée après complétion de l'exercice
}

interface GameReport {
  summary: string;
  analyzedSide: 'White' | 'Black';
  result: '1-0' | '0-1' | '1/2-1/2';
  keyMoments: KeyMoment[];
  mistakes: Mistake[];
  recommendedExercises: Exercise[];
}

interface OpponentWeakness {
  theme: string;
  description: string;
  howToPunish: string;
}

interface OpponentReport {
  globalSummary: string;
  mainWeaknesses: string[];
  mainStrengths: string[]; // Points forts
  frequentErrors: OpponentWeakness[];
  recommendedExercises: Exercise[];
}

interface EloDataPoint {
  date: string;
  rating: number;
  variant: string;
}

// --- MOCK DATA ---

const MOCK_GAME_REPORT: GameReport = {
  summary: "Une victoire solide avec les Noirs. La partie a basculé au 22ème coup suite à une imprécision de l'adversaire en milieu de jeu.",
  analyzedSide: 'Black',
  result: '0-1',
  keyMoments: [
    { moveNumber: 12, description: "Ouverture bien jouée par les deux camps, égalité maintenue.", evaluationChange: 0 },
    { moveNumber: 22, description: "L'adversaire rate une tactique et laisse un pion central vulnérable.", evaluationChange: 150 },
    { moveNumber: 31, description: "Phase de conversion en finale, position gagnante assurée.", evaluationChange: 400 },
  ],
  mistakes: [
    { moveNumber: 15, movePlayed: 'Qe2', category: 'inaccuracy', explanation: "Un coup passif. Plus actif était Rd1.", bestSuggestion: 'Rd1' },
    { moveNumber: 22, movePlayed: 'Nxd5', category: 'mistake', explanation: "Ouvre la colonne d pour la Tour adverse, la position devient critique.", bestSuggestion: 'Bf4' },
    { moveNumber: 34, movePlayed: 'h3', category: 'blunder', explanation: "Permet l'échec en f2 qui mène à la perte immédiate du Cavalier.", bestSuggestion: 'Kd2' },
  ],
  recommendedExercises: [
    { title: 'Défense du Cavalier', description: "Exercices pour reconnaître les menaces sur les pièces non défendues.", exerciseType: 'tactic', estimatedLevel: 'intermediate' },
    { title: 'Finales de Tour et Pion', description: "Améliorer la technique en finale pour convertir un avantage matériel.", exerciseType: 'endgame', estimatedLevel: 'advanced' },
  ],
};

const MOCK_OPPONENT_REPORT: OpponentReport = {
  globalSummary: "Cet adversaire (pseudo: MaxLichessPlayer) a tendance à jouer de manière agressive dans l'ouverture (prédominance de l'attaque Est-Indienne et Sicilienne ouverte), mais montre un manque de patience en finale, cherchant souvent des complications inutiles.",
  mainStrengths: [
    "Excellente connaissance des ouvertures agressives.",
    "Très bon en tactique et calcul rapide.",
    "Joue bien sous pression en milieu de partie.",
  ],
  mainWeaknesses: [
    "Mauvaise gestion du temps dans les positions complexes.",
    "Faible contre-jeu sur le côté Dame (Queenside) en milieu de jeu.",
    "Erreurs récurrentes de pendule en finales de pions.",
  ],
  frequentErrors: [
    { theme: "Pièces non coordonnées", description: "Laisse souvent des pièces sur des cases passives, les Tours n'étant connectées qu'après le 15ème coup.", howToPunish: "Jouer sur le côté opposé pour isoler ces pièces et créer des menaces directes." },
    { theme: "Ouverture Italienne (Giuoco Piano)", description: "Joue toujours la variante ultra-solide, mais n'aime pas être bousculé par d'agressives déviations.", howToPunish: "Essayer l'attaque Fried Liver ou des plans basés sur ...h6 et ...g5." },
  ],
  recommendedExercises: [
    { title: 'Exercices tactiques contre la Giuoco Piano', description: "Entraînement sur les pièges et les tactiques typiques de cette ouverture.", exerciseType: 'opening', estimatedLevel: 'intermediate' },
    { title: 'Calcul et Défense de Finale', description: "Améliorer la précision en finale pour punir les erreurs d'impatience.", exerciseType: 'endgame', estimatedLevel: 'advanced' },
  ],
};

// --- GAME BOARD WITH HIGHLIGHTS COMPONENT ---

type SelectedHighlight = 
  | { type: 'keyMoment'; index: number; moveNumber: number }
  | { type: 'mistake'; index: number; moveNumber: number }
  | null;

interface GameBoardWithHighlightsProps {
  pgn: string;
  keyMoments: KeyMoment[];
  mistakes: Mistake[];
  selectedHighlight: SelectedHighlight;
  onHighlightChange?: (highlight: SelectedHighlight) => void;
}

const GameBoardWithHighlights: React.FC<GameBoardWithHighlightsProps> = ({
  pgn,
  keyMoments,
  mistakes,
  selectedHighlight,
  onHighlightChange,
}) => {
  const [game, setGame] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color: string }>>([]);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, { backgroundColor: string }>>({});
  const [showSolution, setShowSolution] = useState(false);

  // Parse PGN and extract moves
  useEffect(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const history: string[] = [];
      for (const move of chess.history()) {
        history.push(move);
      }
      setMoveHistory(history);
    } catch (error) {
      console.error("Failed to parse PGN:", error);
    }
  }, [pgn]);

  // Reset showSolution when highlight changes
  useEffect(() => {
    setShowSolution(false);
  }, [selectedHighlight]);

  // Update board position and arrows based on selected highlight
  useEffect(() => {
    if (!selectedHighlight || moveHistory.length === 0) {
      setGame(new Chess());
      setArrows([]);
      setHighlightedSquares({});
      return;
    }

    const { moveNumber } = selectedHighlight;
    
    // Calculate move index (moveNumber 1 = indices 0 and 1)
    const moveIndex = (moveNumber - 1) * 2; // Start of the move (white's move)
    const positionBeforeMove = Math.max(0, moveIndex - 1); // Position just before the move
    
    // Build position up to just before the selected move
    const tempGame = new Chess();
    const movesToShow = moveHistory.slice(0, positionBeforeMove + 1);
    
    for (const move of movesToShow) {
      try {
        tempGame.move(move);
      } catch (e) {
        console.error("Failed to apply move:", move, e);
      }
    }
    
    setGame(tempGame);
    
    // Calculate arrows and highlights for the selected move
    const newArrows: Array<{ from: string; to: string; color: string }> = [];
    const highlights: Record<string, { backgroundColor: string }> = {};
    
    if (selectedHighlight.type === 'mistake') {
      const mistake = mistakes[selectedHighlight.index];
      if (mistake && moveIndex < moveHistory.length) {
        // Create a fresh game state at position before the mistake
        const tempGameBefore = new Chess();
        for (let i = 0; i <= positionBeforeMove; i++) {
          try {
            tempGameBefore.move(moveHistory[i]);
          } catch (e) {
            // Skip invalid moves
          }
        }
        
        // Get the move that was played (the mistake)
        const mistakeMove = moveHistory[moveIndex];
        try {
          const moveVerbose = tempGameBefore.move(mistakeMove);
          if (moveVerbose) {
            // Arrow showing the bad move (red)
            newArrows.push({
              from: moveVerbose.from,
              to: moveVerbose.to,
              color: '#ef4444', // red-500
            });
            
            highlights[moveVerbose.from] = { backgroundColor: 'rgba(239, 68, 68, 0.3)' };
            highlights[moveVerbose.to] = { backgroundColor: 'rgba(239, 68, 68, 0.3)' };
            
            // If there's a best suggestion and showSolution is true, show it as a green arrow
            if (showSolution && mistake.bestSuggestion) {
              try {
                // Create a fresh game state at position before the mistake
                const tempGameForBest = new Chess();
                for (let i = 0; i <= positionBeforeMove; i++) {
                  try {
                    tempGameForBest.move(moveHistory[i]);
                  } catch (e) {
                    // Skip invalid moves
                  }
                }
                
                // Try to parse the best move
                let bestMoveParsed = null;
                try {
                  bestMoveParsed = tempGameForBest.move(mistake.bestSuggestion);
                } catch (e) {
                  // If direct parsing fails, try to extract from notation
                  // Remove common prefixes like "Best: ", "N", "B", "R", "Q", "K"
                  const cleanMove = mistake.bestSuggestion
                    .replace(/^(Best|Meilleur|Solution):?\s*/i, '')
                    .trim();
                  
                  // Try different formats
                  const formats = [
                    cleanMove,
                    cleanMove.toLowerCase(),
                    cleanMove.toUpperCase(),
                  ];
                  
                  for (const format of formats) {
                    try {
                      bestMoveParsed = tempGameForBest.move(format);
                      break;
                    } catch (e2) {
                      // Try next format
                    }
                  }
                  
                  // If still no luck, try to find a move that matches the target square
                  if (!bestMoveParsed) {
                    const targetMatch = cleanMove.match(/([a-h][1-8])/);
                    if (targetMatch) {
                      const targetSquare = targetMatch[1];
                      const allMoves = tempGameForBest.moves({ verbose: true }) as any[];
                      const matchingMove = allMoves.find((m: any) => m.to === targetSquare);
                      if (matchingMove) {
                        bestMoveParsed = tempGameForBest.move(matchingMove.san);
                      }
                    }
                  }
                }
                
                if (bestMoveParsed) {
                  newArrows.push({
                    from: bestMoveParsed.from,
                    to: bestMoveParsed.to,
                    color: '#10b981', // emerald-500
                  });
                  
                  // Highlight the best move squares with a different style
                  highlights[bestMoveParsed.from] = { backgroundColor: 'rgba(16, 185, 129, 0.2)' };
                  highlights[bestMoveParsed.to] = { backgroundColor: 'rgba(16, 185, 129, 0.4)' };
                }
              } catch (e) {
                console.error("Failed to parse best move:", mistake.bestSuggestion, e);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse mistake move:", mistakeMove, e);
        }
      }
    } else if (selectedHighlight.type === 'keyMoment') {
      const keyMoment = keyMoments[selectedHighlight.index];
      if (keyMoment && moveIndex < moveHistory.length) {
        // Show the move that created this key moment
        const keyMove = moveHistory[moveIndex];
        try {
          const moveVerbose = tempGame.move(keyMove);
          if (moveVerbose) {
            // Arrow showing the key move (yellow/green depending on evaluation)
            const arrowColor = keyMoment.evaluationChange > 0 ? '#10b981' : '#f59e0b';
            newArrows.push({
              from: moveVerbose.from,
              to: moveVerbose.to,
              color: arrowColor,
            });
            
            highlights[moveVerbose.from] = { backgroundColor: keyMoment.evaluationChange > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)' };
            highlights[moveVerbose.to] = { backgroundColor: keyMoment.evaluationChange > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)' };
          }
        } catch (e) {
          // Could not parse key move
        }
      }
    }
    
    setArrows(newArrows);
    setHighlightedSquares(highlights);
  }, [selectedHighlight, moveHistory, keyMoments, mistakes, showSolution]);

  return (
    <div className="space-y-4">
      {/* Chessboard and Explanation side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Chessboard */}
        <div className="space-y-4">
          <div className="bg-slate-800/60 rounded-lg p-4 flex justify-center">
            <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '1', position: 'relative' }}>
              <Chessboard
                options={{
                  position: game.fen(),
                  boardStyle: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    width: '100%',
                    height: '100%',
                  },
                  darkSquareStyle: { backgroundColor: '#769656' },
                  lightSquareStyle: { backgroundColor: '#eeeed2' },
                  allowDragging: false,
                  squareStyles: highlightedSquares,
                }}
              />
              
              {/* SVG Overlay pour les flèches et annotations */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                <defs>
                  <marker
                    id="arrowhead-red"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#ef4444"
                      fillOpacity="0.8"
                    />
                  </marker>
                  <marker
                    id="arrowhead-green"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#10b981"
                      fillOpacity="0.9"
                    />
                  </marker>
                  <marker
                    id="arrowhead-yellow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#f59e0b"
                      fillOpacity="0.8"
                    />
                  </marker>
                  {/* Background for text labels */}
                  <filter id="text-shadow">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.8)"/>
                  </filter>
                </defs>
                {arrows.map((arrow, idx) => {
                  const fileFrom = arrow.from.charCodeAt(0) - 97;
                  const rankFrom = parseInt(arrow.from[1]) - 1;
                  const fileTo = arrow.to.charCodeAt(0) - 97;
                  const rankTo = parseInt(arrow.to[1]) - 1;
                  
                  const boardSize = 100;
                  const squareSize = boardSize / 8;
                  
                  const x1 = (fileFrom + 0.5) * squareSize;
                  const y1 = (7 - rankFrom + 0.5) * squareSize;
                  const x2 = (fileTo + 0.5) * squareSize;
                  const y2 = (7 - rankTo + 0.5) * squareSize;
                  
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  
                  const shrinkFactor = 0.35;
                  const adjustedX2 = x1 + dx * shrinkFactor;
                  const adjustedY2 = y1 + dy * shrinkFactor;
                  
                  const markerId = arrow.color === '#10b981' ? 'arrowhead-green' : arrow.color === '#f59e0b' ? 'arrowhead-yellow' : 'arrowhead-red';
                  
                  // Label text based on arrow color
                  const labelText = arrow.color === '#10b981' 
                    ? 'Meilleur coup' 
                    : arrow.color === '#ef4444' 
                    ? 'Coup joué' 
                    : 'Moment clé';
                  
                  // Position for label (midpoint of arrow)
                  const labelX = (x1 + adjustedX2) / 2;
                  const labelY = (y1 + adjustedY2) / 2;
                  
                  return (
                    <g key={idx}>
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${adjustedX2}%`}
                        y2={`${adjustedY2}%`}
                        stroke={arrow.color}
                        strokeWidth="3"
                        strokeOpacity="0.9"
                        markerEnd={`url(#${markerId})`}
                        filter="drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
                      />
                      {/* Label background */}
                      <rect
                        x={`${labelX - 3}%`}
                        y={`${labelY - 1.2}%`}
                        width="6%"
                        height="2.4%"
                        fill="rgba(0, 0, 0, 0.7)"
                        rx="0.3%"
                        filter="url(#text-shadow)"
                      />
                      {/* Label text */}
                      <text
                        x={`${labelX}%`}
                        y={`${labelY}%`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={arrow.color}
                        fontSize="1.2%"
                        fontWeight="bold"
                        filter="url(#text-shadow)"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Informations contextuelles sur l'échiquier */}
              {selectedHighlight && selectedHighlight.type === 'mistake' && mistakes[selectedHighlight.index] && (
                <div className="absolute top-2 left-2 right-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-red-400">❌</span>
                    <span className="font-semibold">Coup {mistakes[selectedHighlight.index].moveNumber}:</span>
                    <span className="font-mono text-slate-200">{mistakes[selectedHighlight.index].movePlayed}</span>
                    {showSolution && mistakes[selectedHighlight.index].bestSuggestion && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400">💡</span>
                        <span className="font-semibold text-emerald-300">Meilleur:</span>
                        <span className="font-mono text-emerald-200">{mistakes[selectedHighlight.index].bestSuggestion}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {selectedHighlight && selectedHighlight.type === 'keyMoment' && keyMoments[selectedHighlight.index] && (
                <div className="absolute top-2 left-2 right-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={keyMoments[selectedHighlight.index].evaluationChange > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {keyMoments[selectedHighlight.index].evaluationChange > 0 ? '✅' : '⚡'}
                    </span>
                    <span className="font-semibold">Coup {keyMoments[selectedHighlight.index].moveNumber}</span>
                    <span className="text-slate-500">•</span>
                    <span className={`font-semibold ${
                      keyMoments[selectedHighlight.index].evaluationChange > 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {keyMoments[selectedHighlight.index].evaluationChange > 0 ? '+' : ''}{keyMoments[selectedHighlight.index].evaluationChange / 100}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Légende</h4>
            <div className="space-y-2 text-xs">
              <div className="space-y-1.5">
                <p className="text-slate-400 font-semibold mb-1.5">Catégories de coups</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-base">✅</span>
                  <span>Coup fort / précis</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-base">⚡</span>
                  <span>Imprécision</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-base">⚠️</span>
                  <span>Erreur</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-base">❌</span>
                  <span>Gaffe</span>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <p className="text-slate-400 font-semibold mb-1.5">Flèches sur l'échiquier</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span>Coup joué (erreur)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-0.5 bg-emerald-500"></div>
                    <span>Meilleur coup (solution)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span>Moment clé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Explanation and Navigation */}
        <div className="space-y-4">
          {/* Navigation controls */}
          {selectedHighlight && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  if (!onHighlightChange) return;
                  
                  if (selectedHighlight.type === 'keyMoment') {
                    // Navigate to previous key moment or last mistake
                    if (selectedHighlight.index > 0) {
                      const prevMoment = keyMoments[selectedHighlight.index - 1];
                      onHighlightChange({ type: 'keyMoment', index: selectedHighlight.index - 1, moveNumber: prevMoment.moveNumber });
                    } else if (mistakes.length > 0) {
                      const lastMistake = mistakes[mistakes.length - 1];
                      onHighlightChange({ type: 'mistake', index: mistakes.length - 1, moveNumber: lastMistake.moveNumber });
                    }
                  } else {
                    // Navigate to previous mistake or last key moment
                    if (selectedHighlight.index > 0) {
                      const prevMistake = mistakes[selectedHighlight.index - 1];
                      onHighlightChange({ type: 'mistake', index: selectedHighlight.index - 1, moveNumber: prevMistake.moveNumber });
                    } else if (keyMoments.length > 0) {
                      const lastMoment = keyMoments[keyMoments.length - 1];
                      onHighlightChange({ type: 'keyMoment', index: keyMoments.length - 1, moveNumber: lastMoment.moveNumber });
                    }
                  }
                }}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Précédent"
              >
                ◀
              </button>
              
              <span className="text-sm text-slate-400">
                {selectedHighlight.type === 'keyMoment' 
                  ? `Moment clé ${selectedHighlight.index + 1} / ${keyMoments.length}`
                  : `Erreur ${selectedHighlight.index + 1} / ${mistakes.length}`
                }
              </span>
              
              <button
                onClick={() => {
                  if (!onHighlightChange) return;
                  
                  if (selectedHighlight.type === 'keyMoment') {
                    // Navigate to next key moment or first mistake
                    if (selectedHighlight.index < keyMoments.length - 1) {
                      const nextMoment = keyMoments[selectedHighlight.index + 1];
                      onHighlightChange({ type: 'keyMoment', index: selectedHighlight.index + 1, moveNumber: nextMoment.moveNumber });
                    } else if (mistakes.length > 0) {
                      const firstMistake = mistakes[0];
                      onHighlightChange({ type: 'mistake', index: 0, moveNumber: firstMistake.moveNumber });
                    }
                  } else {
                    // Navigate to next mistake or first key moment
                    if (selectedHighlight.index < mistakes.length - 1) {
                      const nextMistake = mistakes[selectedHighlight.index + 1];
                      onHighlightChange({ type: 'mistake', index: selectedHighlight.index + 1, moveNumber: nextMistake.moveNumber });
                    } else if (keyMoments.length > 0) {
                      const firstMoment = keyMoments[0];
                      onHighlightChange({ type: 'keyMoment', index: 0, moveNumber: firstMoment.moveNumber });
                    }
                  }
                }}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Suivant"
              >
                ▶
              </button>
              
              {/* Solution button (only for mistakes) */}
              {selectedHighlight.type === 'mistake' && mistakes[selectedHighlight.index]?.bestSuggestion && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showSolution
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-slate-700/80'
                  }`}
                >
                  {showSolution ? '✅ Masquer la solution' : '💡 Voir la solution'}
                </button>
              )}
            </div>
          )}
          
          {/* Move details */}
          {selectedHighlight && (
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-5">
              {selectedHighlight.type === 'mistake' && (() => {
                const mistake = mistakes[selectedHighlight.index];
                if (!mistake) return null;
                
                // Emojis style Chess.com
                const badgeEmoji = mistake.category === 'blunder' ? '❌' : mistake.category === 'mistake' ? '⚠️' : '⚡';
                const categoryLabel = mistake.category === 'blunder' ? 'Gaffe' : mistake.category === 'mistake' ? 'Erreur' : 'Imprécision';
                const categoryColor = mistake.category === 'blunder' ? 'text-red-400' : mistake.category === 'mistake' ? 'text-orange-400' : 'text-yellow-400';
                const categoryBg = mistake.category === 'blunder' ? 'bg-red-500/10 border-red-500/30' : mistake.category === 'mistake' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-yellow-500/10 border-yellow-500/30';
                
                return (
                  <div className="space-y-4">
                    {/* Header avec emoji et catégorie */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${categoryBg} border`}>
                      <span className="text-2xl">{badgeEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200">
                            Coup {mistake.moveNumber}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${categoryColor} bg-slate-800/50`}>
                            {categoryLabel.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm text-slate-400">Coup joué: </span>
                          <span className="text-sm font-mono font-semibold text-slate-200">{mistake.movePlayed}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations sur la position */}
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>🎯</span>
                        <span>Position avant le coup {mistake.moveNumber}</span>
                        <span className="text-slate-500">•</span>
                        <span>{game.turn() === 'w' ? '⚪ Blancs' : '⚫ Noirs'} à jouer</span>
                      </div>
                    </div>
                    
                    {/* Explication détaillée */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">📝</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200 mb-1">Pourquoi ce coup est problématique ?</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{mistake.explanation}</p>
                        </div>
                      </div>
                      
                      {/* Conseils pédagogiques */}
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400">💭</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-wide mb-1">
                              Leçon à retenir
                            </p>
                            <p className="text-xs text-blue-300/90 leading-relaxed">
                              {mistake.category === 'blunder' 
                                ? 'Une gaffe peut coûter la partie. Prenez toujours le temps de vérifier les menaces avant de jouer.'
                                : mistake.category === 'mistake'
                                ? 'Une erreur significative affaiblit votre position. Analysez toutes les options avant de décider.'
                                : 'Une petite imprécision peut s\'accumuler. Cherchez toujours le coup le plus précis.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meilleur coup suggéré */}
                    {mistake.bestSuggestion && (
                      <div className={`p-4 rounded-lg border transition-all ${
                        showSolution 
                          ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                          : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wide mb-1">
                                Meilleur coup
                              </p>
                              <p className="text-base text-emerald-300 font-mono font-semibold mb-2">
                                {mistake.bestSuggestion}
                              </p>
                            </div>
                            
                            {/* Explication détaillée du meilleur coup */}
                            {mistake.bestSuggestionExplanation && (
                              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                <p className="text-xs font-semibold text-emerald-400/90 mb-1.5 flex items-center gap-1">
                                  <span>🎯</span>
                                  <span>Pourquoi ce coup est meilleur ?</span>
                                </p>
                                <p className="text-sm text-emerald-200/90 leading-relaxed">
                                  {mistake.bestSuggestionExplanation}
                                </p>
                              </div>
                            )}
                            
                            {showSolution && (
                              <div className="flex items-start gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-emerald-400">👆</span>
                                <p className="text-xs text-emerald-300/80 leading-relaxed">
                                  Regardez la <span className="font-semibold">flèche verte</span> sur l'échiquier pour visualiser ce coup. Les cases vertes indiquent les cases de départ et d'arrivée.
                                </p>
                              </div>
                            )}
                            {!showSolution && (
                              <p className="text-xs text-slate-400 italic">
                                Cliquez sur "Voir la solution" pour visualiser ce coup sur l'échiquier
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {selectedHighlight.type === 'keyMoment' && (() => {
                const keyMoment = keyMoments[selectedHighlight.index];
                if (!keyMoment) return null;
                
                // Emoji style Chess.com pour les bons coups
                const isPositive = keyMoment.evaluationChange > 0;
                const momentEmoji = isPositive ? '✅' : '⚡';
                const momentLabel = isPositive ? 'Coup fort' : 'Moment décisif';
                const evalPoints = Math.abs(keyMoment.evaluationChange / 100);
                const evalSignificance = evalPoints > 3 ? 'très significatif' : evalPoints > 1.5 ? 'significatif' : 'modéré';
                
                return (
                  <div className="space-y-4">
                    {/* Header avec emoji */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-2xl">{momentEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200">
                            Coup {keyMoment.moveNumber}
                          </span>
                          <span className="text-xs font-bold px-2 py-1 rounded text-emerald-400 bg-slate-800/50">
                            {momentLabel.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full inline-block ${
                            keyMoment.evaluationChange > 0 
                              ? 'text-emerald-400 bg-emerald-900/30' 
                              : 'text-red-400 bg-red-900/30'
                          }`}>
                            Évaluation: {keyMoment.evaluationChange > 0 ? '+' : ''}{keyMoment.evaluationChange / 100} centipions
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations sur la position */}
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>🎯</span>
                        <span>Position après le coup {keyMoment.moveNumber}</span>
                        <span className="text-slate-500">•</span>
                        <span className={keyMoment.evaluationChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          Impact: {evalSignificance}
                        </span>
                      </div>
                    </div>
                    
                    {/* Explication détaillée */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">📝</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200 mb-1">
                            {isPositive ? 'Pourquoi ce coup est fort ?' : 'Pourquoi ce moment est décisif ?'}
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed">{keyMoment.description}</p>
                        </div>
                      </div>
                      
                      {/* Conseils pédagogiques */}
                      {isPositive && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400">💭</span>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wide mb-1">
                                Leçon à retenir
                              </p>
                              <p className="text-xs text-emerald-300/90 leading-relaxed">
                                Ce type de coup fort crée des opportunités tactiques ou positionnelles. Identifiez les motifs récurrents dans vos parties.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* Empty state when no selection */}
          {!selectedHighlight && (
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm">
                Cliquez sur un moment clé ou une erreur dans la liste pour voir l'analyse sur l'échiquier
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- GAME REPLAY COMPONENT (DEPRECATED - keeping for backward compatibility) ---

interface GameReplayProps {
  pgn: string;
  keyMoments: KeyMoment[];
  mistakes: Mistake[];
  onNavigateToMove?: (moveNumber: number) => void;
}

const GameReplay: React.FC<GameReplayProps> = ({ pgn, keyMoments, mistakes, onNavigateToMove }) => {
  const [game, setGame] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, { backgroundColor: string }>>({});
  const [pieceIcons, setPieceIcons] = useState<Record<string, { icon: string; color: string }>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color: string; type: 'error' | 'solution' }>>([]);

  // Parse PGN and extract moves
  useEffect(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      
      const history: string[] = [];
      const tempGame = new Chess();
      
      for (const move of chess.history()) {
        tempGame.move(move);
        history.push(move);
      }
      
      setMoveHistory(history);
      setGame(new Chess()); // Reset to starting position
      setCurrentMoveIndex(-1);
    } catch (error) {
      console.error("Failed to parse PGN:", error);
    }
  }, [pgn]);

  // Update board position based on current move index
  useEffect(() => {
    const tempGame = new Chess();
    const movesToShow = moveHistory.slice(0, currentMoveIndex + 1);
    
    for (const move of movesToShow) {
      try {
        tempGame.move(move);
      } catch (e) {
        console.error("Failed to apply move:", move, e);
      }
    }
    
    setGame(tempGame);
    
    // Highlight squares for key moments and mistakes
    const highlights: Record<string, { backgroundColor: string }> = {};
    const icons: Record<string, { icon: string; color: string }> = {};
    
    // Build a map of move quality for each move in history
    const moveQualityMap: Record<number, { type: 'good' | 'dangerous' | 'bad'; category?: string }> = {};
    
    // Mark mistakes as "bad"
    mistakes.forEach(mistake => {
      moveQualityMap[mistake.moveNumber] = { 
        type: 'bad',
        category: mistake.category 
      };
    });
    
    // Mark key moments with positive evaluation as "good", negative as "dangerous"
    keyMoments.forEach(keyMoment => {
      if (!moveQualityMap[keyMoment.moveNumber]) {
        if (keyMoment.evaluationChange > 50) {
          moveQualityMap[keyMoment.moveNumber] = { type: 'good' };
        } else if (keyMoment.evaluationChange < -50) {
          moveQualityMap[keyMoment.moveNumber] = { type: 'dangerous' };
        }
      }
    });
    
    // Add icons to pieces that made moves
    if (currentMoveIndex >= 0) {
      // Check all moves up to current position
      const tempGameForMoves = new Chess();
      for (let i = 0; i <= currentMoveIndex; i++) {
        try {
          const move = moveHistory[i];
          const moveNumber = Math.floor(i / 2) + 1;
          const moveQuality = moveQualityMap[moveNumber];
          
          if (moveQuality) {
            const moveVerbose = tempGameForMoves.move(move);
            if (moveVerbose) {
              // The piece that moved is now on the "to" square
              const square = moveVerbose.to;
              
              // Determine icon based on quality - utiliser des symboles Unicode simples et fiables
              let icon = '';
              let color = '';
              
              if (moveQuality.type === 'bad') {
                if (moveQuality.category === 'blunder') {
                  icon = '✗'; // Blunder - symbole X simple
                  color = 'text-red-500';
                } else if (moveQuality.category === 'mistake') {
                  icon = '⚠'; // Mistake - triangle d'avertissement
                  color = 'text-orange-500';
                } else {
                  icon = '!'; // Inaccuracy - point d'exclamation
                  color = 'text-yellow-500';
                }
              } else if (moveQuality.type === 'dangerous') {
                icon = '⚡'; // Dangerous - éclair (Unicode standard)
                color = 'text-orange-400';
              } else if (moveQuality.type === 'good') {
                icon = '✓'; // Good - coche simple
                color = 'text-emerald-400';
              }
              
              if (icon) {
                icons[square] = { icon, color };
              }
            }
          } else {
            tempGameForMoves.move(move);
          }
        } catch (e) {
          // Skip invalid moves
        }
      }
    }
    
    if (currentMoveIndex >= 0) {
      const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
      
      // Check if this is a key moment
      const keyMoment = keyMoments.find(km => km.moveNumber === moveNumber);
      if (keyMoment) {
        // Highlight the last move squares
        if (movesToShow.length > 0) {
          const lastMove = tempGame.history({ verbose: true }).slice(-1)[0];
          if (lastMove) {
            highlights[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
            highlights[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
          }
        }
      }
      
      // Check if this is a mistake
      const mistake = mistakes.find(m => m.moveNumber === moveNumber);
      if (mistake) {
        if (movesToShow.length > 0) {
          const lastMove = tempGame.history({ verbose: true }).slice(-1)[0];
          if (lastMove) {
            highlights[lastMove.from] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' };
            highlights[lastMove.to] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' };
          }
        }
      }
    }
    
    setHighlightedSquares(highlights);
    setPieceIcons(icons);
  }, [currentMoveIndex, moveHistory, keyMoments, mistakes]);

  // Calculate arrows for errors and solutions
  useEffect(() => {
    const newArrows: Array<{ from: string; to: string; color: string; type: 'error' | 'solution' }> = [];
    
    if (currentMoveIndex >= 0) {
      const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
      const mistake = mistakes.find(m => m.moveNumber === moveNumber);
      
      if (mistake) {
        // Get the position before the mistake
        const tempGameBefore = new Chess();
        const movesBefore = moveHistory.slice(0, currentMoveIndex);
        for (const move of movesBefore) {
          try {
            tempGameBefore.move(move);
          } catch (e) {
            // Skip invalid moves
          }
        }
        
        // Get the move that was played (the mistake)
        const mistakeMove = moveHistory[currentMoveIndex];
        if (mistakeMove) {
          try {
            const moveVerbose = tempGameBefore.move(mistakeMove);
            if (moveVerbose) {
              // Arrow showing the bad move (red)
              newArrows.push({
                from: moveVerbose.from,
                to: moveVerbose.to,
                color: '#ef4444', // red-500
                type: 'error'
              });
              
              // Check for threats on the piece that moved (why the move is bad)
              const positionAfterMistake = new Chess(tempGameBefore.fen());
              const targetSquare = moveVerbose.to;
              const pieceColor = positionAfterMistake.get(targetSquare)?.color;
              
              if (pieceColor) {
                // Find all pieces that can attack the target square
                const allSquares = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
                                   'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
                                   'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
                                   'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
                                   'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
                                   'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
                                   'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
                                   'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'];
                
                for (const square of allSquares) {
                  const piece = positionAfterMistake.get(square as any);
                  if (piece && piece.color !== pieceColor) {
                    // Check if this piece can attack the target square
                    try {
                      const moves = positionAfterMistake.moves({ square: square as any, verbose: true }) as any[];
                      const canAttack = moves.some((m: any) => m.to === targetSquare);
                      if (canAttack) {
                        // Add arrow showing the threat
                        newArrows.push({
                          from: square,
                          to: targetSquare,
                          color: '#f59e0b', // amber-500 for threats
                          type: 'error'
                        });
                      }
                    } catch (e) {
                      // Skip invalid squares
                    }
                  }
                }
              }
              
              // If there's a best suggestion, add solution arrow when showSolution is true
              if (showSolution && mistake.bestSuggestion) {
                // Parse the best suggestion move
                try {
                  const tempGameForBest = new Chess();
                  for (const move of movesBefore) {
                    try {
                      tempGameForBest.move(move);
                    } catch (e) {
                      // Skip
                    }
                  }
                  
                  // Try to parse the best move
                  const bestMove = tempGameForBest.move(mistake.bestSuggestion);
                  if (bestMove) {
                    newArrows.push({
                      from: bestMove.from,
                      to: bestMove.to,
                      color: '#10b981', // emerald-500
                      type: 'solution'
                    });
                  }
                } catch (e) {
                  // If we can't parse the best move, try to find it from the square
                  // Extract square coordinates from bestSuggestion (e.g., "e4" or "Nf3")
                  const bestMoveStr = mistake.bestSuggestion.replace(/[^a-h1-8]/g, '');
                  if (bestMoveStr.length >= 2) {
                    const targetSquare = bestMoveStr.slice(-2);
                    if (/^[a-h][1-8]$/.test(targetSquare)) {
                      // Try to find which piece should move to this square
                      const piece = tempGameBefore.get(moveVerbose.from);
                      if (piece) {
                        // Try the same piece from the same square
                        newArrows.push({
                          from: moveVerbose.from,
                          to: targetSquare,
                          color: '#10b981',
                          type: 'solution'
                        });
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Could not parse the mistake move
          }
        }
      }
    }
    
    setArrows(newArrows);
  }, [currentMoveIndex, moveHistory, mistakes, showSolution]);

  const goToStart = () => {
    setCurrentMoveIndex(-1);
  };

  const goToPrevious = () => {
    setCurrentMoveIndex(prev => Math.max(-1, prev - 1));
  };

  const goToNext = () => {
    setCurrentMoveIndex(prev => Math.min(moveHistory.length - 1, prev + 1));
  };

  const goToEnd = () => {
    setCurrentMoveIndex(moveHistory.length - 1);
  };

  const goToMove = (index: number) => {
    setCurrentMoveIndex(index);
  };

  const getMoveNumber = (index: number): number => {
    return Math.floor(index / 2) + 1;
  };

  const getMoveIndexFromMoveNumber = (moveNumber: number): number => {
    // moveNumber 1 = indices 0 (white) and 1 (black)
    // We want to go to the position AFTER the moveNumber
    // If moveNumber is 5, we want to see the position after move 5
    // Move 5 = indices 8 (white move 5) and 9 (black move 5)
    // We want index 9 (after black's move 5)
    const targetIndex = (moveNumber - 1) * 2 + 1; // After black's move
    // Make sure we don't go beyond the move history
    return Math.min(targetIndex, moveHistory.length - 1);
  };

  const goToMoveNumber = useCallback((moveNumber: number) => {
    const targetIndex = getMoveIndexFromMoveNumber(moveNumber);
    setCurrentMoveIndex(targetIndex);
  }, [moveHistory.length]);

  // Expose navigation function to parent via window (simple approach)
  useEffect(() => {
    (window as any).__gameReplayNavigate = goToMoveNumber;
    return () => {
      delete (window as any).__gameReplayNavigate;
    };
  }, [goToMoveNumber]);

  const isKeyMoment = (index: number): boolean => {
    const moveNumber = getMoveNumber(index);
    return keyMoments.some(km => km.moveNumber === moveNumber);
  };

  const isMistake = (index: number): boolean => {
    const moveNumber = getMoveNumber(index);
    return mistakes.some(m => m.moveNumber === moveNumber);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Échiquier */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 rounded-lg p-4" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
              <Chessboard
                options={{
                  position: game.fen(),
                  boardStyle: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    width: '100%',
                    height: '100%',
                  },
                  darkSquareStyle: { backgroundColor: '#769656' },
                  lightSquareStyle: { backgroundColor: '#eeeed2' },
                  allowDragging: false,
                  squareStyles: highlightedSquares,
                }}
              />
              {/* Overlay pour les icônes sur les pièces */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gridTemplateRows: 'repeat(8, 1fr)',
                }}
              >
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((file, fileIdx) =>
                  [8, 7, 6, 5, 4, 3, 2, 1].map((rank, rankIdx) => {
                    const square = `${file}${rank}`;
                    const icon = pieceIcons[square];
                    if (!icon) return null;
                    
                    return (
                      <div
                        key={square}
                        className="flex items-center justify-center"
                        style={{
                          gridColumn: fileIdx + 1,
                          gridRow: rankIdx + 1,
                        }}
                      >
                        <span 
                          className={`text-2xl font-bold drop-shadow-lg ${icon.color}`}
                          style={{
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.5)',
                            lineHeight: '1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: icon.color.includes('red') ? 'rgba(239, 68, 68, 0.2)' : 
                                           icon.color.includes('orange') ? 'rgba(249, 115, 22, 0.2)' : 
                                           icon.color.includes('yellow') ? 'rgba(234, 179, 8, 0.2)' : 
                                           icon.color.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                            border: `2px solid ${icon.color.includes('red') ? '#ef4444' : 
                                              icon.color.includes('orange') ? '#f97316' : 
                                              icon.color.includes('yellow') ? '#eab308' : 
                                              icon.color.includes('emerald') ? '#10b981' : '#fff'}`,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                          }}
                          role="img"
                          aria-label={icon.icon === '✗' ? 'Erreur' : icon.icon === '⚠' ? 'Attention' : icon.icon === '⚡' ? 'Dangereux' : icon.icon === '✓' ? 'Bon coup' : 'Point d\'exclamation'}
                        >
                          {icon.icon}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* SVG Overlay pour les flèches */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                <defs>
                  <marker
                    id="arrowhead-error"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#ef4444"
                      fillOpacity="0.7"
                    />
                  </marker>
                  <marker
                    id="arrowhead-solution"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#10b981"
                      fillOpacity="0.9"
                    />
                  </marker>
                  <marker
                    id="arrowhead-threat"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#f59e0b"
                      fillOpacity="0.8"
                    />
                  </marker>
                </defs>
                {arrows.map((arrow, idx) => {
                  // Convert square to coordinates (0-7 for file and rank)
                  const fileFrom = arrow.from.charCodeAt(0) - 97; // a=0, h=7
                  const rankFrom = parseInt(arrow.from[1]) - 1; // 1=0, 8=7
                  const fileTo = arrow.to.charCodeAt(0) - 97;
                  const rankTo = parseInt(arrow.to[1]) - 1;
                  
                  // Get board dimensions (assuming square board)
                  const boardSize = 100; // percentage
                  const squareSize = boardSize / 8;
                  
                  // Calculate center of squares
                  const x1 = (fileFrom + 0.5) * squareSize;
                  const y1 = (7 - rankFrom + 0.5) * squareSize; // Flip Y axis
                  const x2 = (fileTo + 0.5) * squareSize;
                  const y2 = (7 - rankTo + 0.5) * squareSize;
                  
                  // Calculate arrow direction
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  
                  // Adjust end point to be inside the target square
                  const shrinkFactor = 0.35;
                  const adjustedX2 = x1 + dx * shrinkFactor;
                  const adjustedY2 = y1 + dy * shrinkFactor;
                  
                  return (
                    <line
                      key={idx}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${adjustedX2}%`}
                      y2={`${adjustedY2}%`}
                      stroke={arrow.color}
                      strokeWidth={arrow.type === 'solution' ? '2.5' : arrow.color === '#f59e0b' ? '2' : '2'}
                      strokeOpacity={arrow.type === 'solution' ? '0.9' : arrow.color === '#f59e0b' ? '0.8' : '0.7'}
                      markerEnd={
                        arrow.type === 'solution' 
                          ? 'url(#arrowhead-solution)' 
                          : arrow.color === '#f59e0b'
                          ? 'url(#arrowhead-threat)'
                          : 'url(#arrowhead-error)'
                      }
                      filter="drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Bouton Solution */}
            {currentMoveIndex >= 0 && mistakes.some(m => m.moveNumber === Math.floor(currentMoveIndex / 2) + 1) && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showSolution
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-slate-700/80'
                  }`}
                >
                  {showSolution ? '✅ Masquer la solution' : '💡 Voir la solution'}
                </button>
              </div>
            )}
            
            {/* Contrôles de navigation */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={goToStart}
                disabled={currentMoveIndex === -1}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Début"
              >
                ⏮
              </button>
              <button
                onClick={goToPrevious}
                disabled={currentMoveIndex === -1}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Précédent"
              >
                ◀
              </button>
              <button
                onClick={goToNext}
                disabled={currentMoveIndex >= moveHistory.length - 1}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Suivant"
              >
                ▶
              </button>
              <button
                onClick={goToEnd}
                disabled={currentMoveIndex >= moveHistory.length - 1}
                className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Fin"
              >
                ⏭
              </button>
            </div>
            
            <div className="mt-2 text-center text-sm text-slate-400">
              Coup {currentMoveIndex + 1} / {moveHistory.length}
              {currentMoveIndex >= 0 && (
                <span className="ml-2">
                  (Coup {getMoveNumber(currentMoveIndex)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Liste des coups */}
        <div className="lg:col-span-1">
          <div className="p-4 rounded-lg bg-slate-800/60 border border-white/10 max-h-[600px] overflow-y-auto">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Liste des coups</h4>
            <div className="space-y-1">
              {moveHistory.map((move, index) => {
                const moveNumber = getMoveNumber(index);
                const isWhite = index % 2 === 0;
                const isCurrent = index === currentMoveIndex;
                const isKey = isKeyMoment(index);
                const isMistakeMove = isMistake(index);
                
                return (
                  <button
                    key={index}
                    onClick={() => goToMove(index)}
                    className={`w-full text-left p-2 rounded text-xs font-mono transition-colors ${
                      isCurrent
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : isMistakeMove
                        ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                        : isKey
                        ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                        : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="inline-block w-8 text-slate-400">
                      {isWhite ? `${moveNumber}.` : ''}
                    </span>
                    <span>{move}</span>
                    {isKey && <span className="ml-2 text-yellow-400">⭐</span>}
                    {isMistakeMove && <span className="ml-2 text-red-400">⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INTERACTIVE EXERCISE COMPONENT ---

interface InteractiveExerciseProps {
  exercise: Exercise;
  weakness?: string; // Faiblesse de l'adversaire à exploiter
  mistake?: Mistake; // Erreur associée à cet exercice
}

const InteractiveExercise: React.FC<InteractiveExerciseProps> = ({ exercise, weakness, mistake }) => {
  const [game, setGame] = useState(() => {
    const chess = new Chess();
    if (exercise.positionFen) {
      chess.load(exercise.positionFen);
    }
    return chess;
  });
  const [moveHistory, setMoveHistory] = useState<Array<{ move: string; player: 'user' | 'opponent'; evaluation?: string }>>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<MoveVariant | null>(null);
  const [isOpponentTurn, setIsOpponentTurn] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Trouver la variante correspondant au coup joué
  const findVariant = (moveSan: string): MoveVariant | null => {
    if (!exercise.moveVariants || exercise.moveVariants.length === 0) return null;
    
    return exercise.moveVariants.find(variant => {
      const variantMove = variant.move.toLowerCase().replace(/[+#=]/g, '');
      const playedMove = moveSan.toLowerCase().replace(/[+#=]/g, '');
      return variantMove === playedMove || 
             variantMove.includes(playedMove) || 
             playedMove.includes(variantMove);
    }) || null;
  };

  // Simuler la réponse de l'adversaire
  const playOpponentMove = useCallback((variant: MoveVariant, currentGame: Chess) => {
    const response = variant.opponentResponse;
    if (!response) return;
    
    setTimeout(() => {
      try {
        const gameCopy = new Chess(currentGame.fen());
        const opponentMove = gameCopy.move(response);
        
        if (opponentMove) {
          setGame(gameCopy);
          setMoveHistory(prev => [...prev, { 
            move: opponentMove.san, 
            player: 'opponent',
            evaluation: 'Réponse typique de l\'adversaire'
          }]);
          setIsOpponentTurn(false);
        }
      } catch (error) {
        console.error('Erreur lors de la réponse de l\'adversaire:', error);
        setIsOpponentTurn(false);
      }
    }, 800);
  }, []);

  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare || isOpponentTurn) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) {
        setMessage('❌ Coup invalide');
        return false;
      }

      // Trouver la variante correspondante
      const variant = findVariant(move.san);
      
      setGame(gameCopy);
      setMoveHistory(prev => [...prev, { 
        move: move.san, 
        player: 'user',
        evaluation: variant?.explanation
      }]);
      setCurrentVariant(variant);
      
      // Évaluer le coup
      if (variant) {
        if (variant.isBest) {
          setIsCorrect(true);
          setMessage(`✅ ${variant.explanation || 'Excellent coup ! Tu exploits bien la faiblesse de l\'adversaire.'}`);
          
          // Si l'adversaire doit répondre, simuler sa réponse
          if (variant.opponentResponse) {
            setIsOpponentTurn(true);
            setMessage(prev => prev + ' L\'adversaire réfléchit...');
            playOpponentMove(variant, gameCopy);
          } else {
            // Vérifier si l'exercice est terminé
            const solutionIndex = exercise.solution?.findIndex(sol => 
              sol.toLowerCase().replace(/[+#=]/g, '') === move.san.toLowerCase().replace(/[+#=]/g, '')
            );
            
            if (solutionIndex !== undefined && solutionIndex >= 0) {
              const remainingMoves = exercise.solution?.slice(solutionIndex + 1) || [];
              if (remainingMoves.length === 0) {
                setExerciseCompleted(true);
                setMessage('🎉 Bravo ! Tu as complété l\'exercice en exploitant parfaitement la faiblesse de l\'adversaire !');
              }
            }
          }
        } else {
          setIsCorrect(false);
          setMessage(`❌ ${variant.explanation || 'Ce n\'est pas le meilleur coup. L\'adversaire peut mieux répondre.'}`);
        }
      } else {
        // Coup non dans les variantes, vérifier contre la solution
        if (exercise.solution && exercise.solution.length > 0) {
          const expectedMove = exercise.solution[0];
          const moveSan = move.san.toLowerCase().replace(/[+#=]/g, '');
          const expectedSan = expectedMove.toLowerCase().replace(/[+#=]/g, '');
          
          if (moveSan === expectedSan) {
            setIsCorrect(true);
            setMessage('✅ Bon coup ! Continue.');
          } else {
            setIsCorrect(false);
            setMessage('❌ Ce n\'est pas le meilleur coup pour exploiter la faiblesse.');
          }
        } else {
          setIsCorrect(null);
          setMessage('✓ Coup valide');
        }
      }

      return true;
    } catch (error) {
      setMessage('❌ Erreur lors du coup');
      return false;
    }
  };

  const resetExercise = () => {
    const chess = new Chess();
    if (exercise.positionFen) {
      chess.load(exercise.positionFen);
    }
    setGame(chess);
    setMoveHistory([]);
    setShowHint(false);
    setShowSolution(false);
    setCurrentVariant(null);
    setIsOpponentTurn(false);
    setMessage('');
    setExerciseCompleted(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 border-t-2 border-t-emerald-400 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-white mb-1">{exercise.title}</h4>
          <p className="text-slate-400 text-sm mb-2">{exercise.description}</p>
          {weakness && (
            <p className="text-xs text-orange-300 mt-1">💡 Exploite : {weakness}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Badge category={exercise.exerciseType}>{exercise.exerciseType.toUpperCase()}</Badge>
          <Badge category={exercise.estimatedLevel}>{exercise.estimatedLevel.toUpperCase()}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Échiquier */}
        <div className="w-full">
          <div className="bg-slate-800/60 rounded-lg p-2" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ width: '100%', aspectRatio: '1' }}>
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: onDrop,
                  boardStyle: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    width: '100%',
                    height: '100%',
                  },
                  darkSquareStyle: { backgroundColor: '#769656' },
                  lightSquareStyle: { backgroundColor: '#eeeed2' },
                  allowDragging: true,
                }}
              />
            </div>
          </div>
          {message && (
            <p className={`mt-2 text-sm font-medium text-center ${isCorrect === true ? 'text-emerald-400' : isCorrect === false ? 'text-red-400' : 'text-slate-300'}`}>
              {message}
            </p>
          )}
          {isOpponentTurn && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-blue-400">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>L'adversaire réfléchit...</span>
            </div>
          )}
          {exerciseCompleted && (
            <div className="mt-2 space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                <p className="text-sm text-emerald-300 text-center font-semibold">🎉 Exercice complété !</p>
              </div>
              
              {/* Explication détaillée après complétion */}
              {(exercise.completionExplanation || mistake) && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">📚 Explication de la solution</p>
                  <div className="space-y-3 text-sm text-blue-200">
                    {exercise.completionExplanation ? (
                      <p className="leading-relaxed">{exercise.completionExplanation}</p>
                    ) : mistake ? (
                      <div className="space-y-2">
                        <p className="leading-relaxed">
                          <span className="font-semibold">Pourquoi ce coup est meilleur ?</span>
                        </p>
                        {mistake.bestSuggestionExplanation ? (
                          <p className="leading-relaxed pl-2 border-l-2 border-blue-500/30">
                            {mistake.bestSuggestionExplanation}
                          </p>
                        ) : (
                          <p className="leading-relaxed pl-2 border-l-2 border-blue-500/30">
                            Le coup <span className="font-mono font-semibold">{mistake.bestSuggestion}</span> évite l'erreur 
                            <span className="font-semibold"> {mistake.category}</span> commise au coup {mistake.moveNumber} avec 
                            <span className="font-mono"> {mistake.movePlayed}</span>. {mistake.explanation}
                          </p>
                        )}
                        {mistake.bestSuggestion && (
                          <div className="mt-3 p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                            <p className="text-xs text-emerald-300">
                              <span className="font-semibold">💡 Leçon à retenir :</span> Dans cette position, 
                              <span className="font-mono font-semibold"> {mistake.bestSuggestion}</span> était le meilleur coup car il 
                              {mistake.bestSuggestionExplanation ? ` ${mistake.bestSuggestionExplanation.toLowerCase()}` : ' évite les pièges tactiques et maintient un avantage positionnel.'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contrôles et informations */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-white/10">
            <p className="text-xs text-slate-400 mb-2">Objectif :</p>
            <p className="text-sm text-slate-200">
              {exercise.weaknessExploited ? (
                <>Exploite la faiblesse : <span className="text-orange-300 font-semibold">{exercise.weaknessExploited}</span></>
              ) : (
                <>
                  {exercise.exerciseType === 'tactic' && 'Trouve le meilleur coup tactique'}
                  {exercise.exerciseType === 'endgame' && 'Trouve la meilleure continuation en finale'}
                  {exercise.exerciseType === 'opening' && 'Joue le meilleur coup d\'ouverture'}
                  {exercise.exerciseType === 'strategy' && 'Trouve le meilleur plan stratégique'}
                </>
              )}
            </p>
            {!isOpponentTurn && (
              <p className="text-xs text-slate-300 mt-2">
                {game.turn() === 'w' ? '⚪' : '⚫'} C'est à <span className="font-semibold text-emerald-400">toi</span> de jouer
              </p>
            )}
            {isOpponentTurn && (
              <p className="text-xs text-slate-300 mt-2">
                ⏳ En attente de la réponse de l'adversaire...
              </p>
            )}
          </div>

          {/* Variantes de coups possibles */}
          {exercise.moveVariants && exercise.moveVariants.length > 0 && !exerciseCompleted && (
            <div className="p-3 rounded-lg bg-slate-800/60 border border-white/10">
              <p className="text-xs text-slate-400 mb-2">💡 Coups possibles :</p>
              <div className="space-y-1.5">
                {exercise.moveVariants.map((variant, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs p-2 rounded border ${
                      variant.isBest 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono font-semibold">{variant.move}</span>
                      <span>{variant.isBest ? '✅' : '❌'}</span>
                    </div>
                    {variant.explanation && (
                      <p className="text-xs mt-1 opacity-90">{variant.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {exercise.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-colors"
              >
                💡 {showHint ? 'Masquer' : 'Voir'} l'indice
              </button>
            )}
            {exercise.solution && (
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
              >
                🔍 {showSolution ? 'Masquer' : 'Voir'} la solution
              </button>
            )}
            <button
              onClick={resetExercise}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-slate-700/80 transition-colors"
            >
              🔄 Réinitialiser
            </button>
          </div>

          {showHint && exercise.hint && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs font-semibold text-blue-300 mb-1">💡 Indice :</p>
              <p className="text-sm text-blue-200">{exercise.hint}</p>
            </div>
          )}

          {showSolution && exercise.solution && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-xs font-semibold text-purple-300 mb-1">🔍 Solution :</p>
              <p className="text-sm text-purple-200 font-mono">
                {exercise.solution.join(' → ')}
              </p>
            </div>
          )}

          {moveHistory.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-800/60 border border-white/10">
              <p className="text-xs text-slate-400 mb-2">Historique des coups :</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {moveHistory.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs p-1.5 rounded flex items-center gap-2 ${
                      entry.player === 'user' 
                        ? 'bg-blue-500/10 text-blue-300' 
                        : 'bg-purple-500/10 text-purple-300'
                    }`}
                  >
                    <span className="font-semibold">
                      {entry.player === 'user' ? '👤 Toi' : '🤖 Adversaire'}:
                    </span>
                    <span className="font-mono">{entry.move}</span>
                    {entry.evaluation && (
                      <span className="text-xs opacity-75 ml-auto">({entry.evaluation})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMMONS COMPONENTS ---

const SectionTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold border-b border-slate-700 pb-2 mb-4 text-white ${className}`}>
    {children}
  </h3>
);

interface BadgeProps {
  children: React.ReactNode;
  category: MistakeCategory | Exercise['exerciseType'] | Exercise['estimatedLevel'] | 'result-win' | 'result-draw' | 'result-loss' | 'default';
}

const Badge: React.FC<BadgeProps> = ({ children, category }) => {
  let colorClasses = '';
  switch (category) {
    case 'inaccuracy':
      colorClasses = 'bg-amber-400/15 text-amber-300 border-amber-400/40';
      break;
    case 'mistake':
      colorClasses = 'bg-orange-400/15 text-orange-300 border-orange-400/40';
      break;
    case 'blunder':
      colorClasses = 'bg-red-400/15 text-red-300 border-red-400/40';
      break;
    case 'tactic':
      colorClasses = 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40';
      break;
    case 'endgame':
      colorClasses = 'bg-purple-400/15 text-purple-300 border-purple-400/40';
      break;
    case 'opening':
      colorClasses = 'bg-blue-400/15 text-blue-300 border-blue-400/40';
      break;
    case 'strategy':
      colorClasses = 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40';
      break;
    case 'beginner':
      colorClasses = 'bg-slate-400/15 text-slate-300 border-slate-400/40';
      break;
    case 'intermediate':
      colorClasses = 'bg-teal-400/15 text-teal-300 border-teal-400/40';
      break;
    case 'advanced':
      colorClasses = 'bg-pink-400/15 text-pink-300 border-pink-400/40';
      break;
    case 'result-win':
      colorClasses = 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40';
      break;
    case 'result-draw':
      colorClasses = 'bg-slate-400/15 text-slate-300 border-slate-400/40';
      break;
    case 'result-loss':
      colorClasses = 'bg-red-400/15 text-red-300 border-red-400/40';
      break;
    default:
      colorClasses = 'bg-slate-400/15 text-slate-300 border-slate-400/40';
      break;
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${colorClasses}`}>
      {children}
    </span>
  );
};

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <svg className="animate-spin h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span className="text-emerald-400">Analyse en cours...</span>
  </div>
);

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 flex items-center space-x-3">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <span className="font-medium">Erreur :</span>
    <p>{message}</p>
  </div>
);

// --- TAB 1: GAME ANALYSIS ---

const GameAnalysisTab: React.FC = () => {
  const [source, setSource] = useState<AnalysisSource>('LINK');
  const [inputContent, setInputContent] = useState('');
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [report, setReport] = useState<GameReport | null>(null);
  const [gamePgn, setGamePgn] = useState<string | null>(null);
  const [inputError, setInputError] = useState('');
  const [showMobileGuide, setShowMobileGuide] = useState(false);
  const [showPgnGuide, setShowPgnGuide] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<SelectedHighlight>(null);
  const [playerSide, setPlayerSide] = useState<'White' | 'Black' | null>(null); // Côté choisi par l'utilisateur
  
  // Set default selection when report is loaded
  useEffect(() => {
    if (report && !selectedHighlight) {
      // Default: first key moment, otherwise first mistake
      if (report.keyMoments.length > 0) {
        setSelectedHighlight({ type: 'keyMoment', index: 0, moveNumber: report.keyMoments[0].moveNumber });
      } else if (report.mistakes.length > 0) {
        setSelectedHighlight({ type: 'mistake', index: 0, moveNumber: report.mistakes[0].moveNumber });
      }
    }
  }, [report, selectedHighlight]);

  // Initialize playerSide with analyzedSide when report is loaded
  useEffect(() => {
    if (report && !playerSide) {
      setPlayerSide(report.analyzedSide);
    }
  }, [report, playerSide]);

  const isInputValid = useMemo(() => inputContent.trim().length > 0, [inputContent]);

  const handleAnalyze = useCallback(async () => {
    setInputError("");
    if (!isInputValid) {
      setInputError(source === "PGN" ? "Veuillez coller le PGN." : "Veuillez coller un lien.");
      return;
    }

    setStatus("loading");
    setReport(null);
    
    try {
      const body =
        source === "PGN"
          ? { sourceType: "pgn", pgn: inputContent }
          : { sourceType: "url", link: inputContent };

      const res = await fetch("/api/game-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Game analysis HTTP error:", res.status);
        let errorMessage = "Une erreur est survenue lors de l'analyse.";
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          errorMessage = `Erreur ${res.status}: ${res.statusText || "Requête invalide"}`;
        }
        setStatus("error");
        setInputError(errorMessage);
        return;
      }

      const data = await res.json();
      if (!data.report) {
        console.error("Game analysis missing report:", data);
        setStatus("error");
        setInputError("Réponse invalide du serveur.");
        return;
      }

      setReport(data.report as GameReport);
      setGamePgn(data.pgn || null);
      setStatus("success");
    } catch (err) {
      console.error("Game analysis fetch error:", err);
      setStatus("error");
      setInputError("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    }
  }, [isInputValid, source, inputContent]);

  const getResultCategory = (result: string, analyzedSide: 'White' | 'Black'): 'result-win' | 'result-draw' | 'result-loss' => {
    if (result === '1-0') return analyzedSide === 'White' ? 'result-win' : 'result-loss';
    if (result === '0-1') return analyzedSide === 'Black' ? 'result-win' : 'result-loss';
    return 'result-draw';
  };

  return (
    <div className="space-y-6">
      <SectionTitle>Source de la partie</SectionTitle>
      <div className="inline-flex rounded-full bg-slate-900/70 p-1 border border-white/10">
        {['Lien (Lichess / Chess.com)', 'PGN'].map((label, index) => {
          const currentSource: AnalysisSource = index === 0 ? 'LINK' : 'PGN';
          const isActive = source === currentSource;
          return (
            <button
              key={label}
              onClick={() => { setSource(currentSource); setInputContent(''); setInputError(''); }}
              className={isActive
                ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {source === 'PGN' ? (
        <>
          <textarea
            value={inputContent}
            onChange={(e) => { setInputContent(e.target.value); setInputError(''); }}
            rows={6}
            placeholder="Collez ici le PGN complet de votre partie..."
            className="w-full p-4 rounded-lg bg-slate-900/60 text-slate-200 border border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20"
            disabled={status === 'loading'}
          />
          <button
            type="button"
            onClick={() => setShowPgnGuide(!showPgnGuide)}
            className="mt-2 text-xs text-sky-400 hover:text-sky-300 cursor-pointer inline-flex items-center gap-1"
          >
            {showPgnGuide ? (
              <>
                ❌ Masquer le guide PGN
              </>
            ) : (
              <>
                📋 Comment copier le PGN de ta partie ?
              </>
            )}
          </button>
          {showPgnGuide && (
            <div className="mt-3 p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-sm text-slate-200">
              <h4 className="text-base font-semibold text-slate-100 mb-3">📋 Copier le PGN de ta partie</h4>
              
              <div className="space-y-4">
                {/* Chess.com - Application mobile */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Chess.com – Application mobile</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre l'app Chess.com</li>
                    <li>Va dans : Menu → Parties / Archive</li>
                    <li>Ouvre la partie que tu veux analyser</li>
                    <li>Appuie sur ⋯ (en haut à droite)</li>
                    <li>Choisis "Download PGN" ou "Copy PGN"</li>
                    <li>Le PGN est maintenant dans ton presse-papiers</li>
                  </ul>
                </div>

                {/* Chess.com – Navigateur (ordinateur) */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Chess.com – Navigateur (ordinateur)</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre la partie sur chess.com</li>
                    <li>Clique sur le menu "..." ou "More" en haut à droite</li>
                    <li>Choisis "Download PGN"</li>
                    <li>Ouvre le fichier .pgn avec un éditeur de texte (Bloc-notes, TextEdit, etc.)</li>
                    <li>Copie tout le contenu (Ctrl+A puis Ctrl+C / Cmd+A puis Cmd+C)</li>
                    <li>Colle-le dans le champ ci-dessus</li>
                  </ul>
                </div>

                {/* Lichess – Application mobile */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Lichess – Application mobile</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre l'app Lichess</li>
                    <li>Va dans : Menu → Parties</li>
                    <li>Ouvre la partie que tu veux analyser</li>
                    <li>Appuie sur ⋯ ou "Partager"</li>
                    <li>Choisis "Download PGN" ou "Copy PGN"</li>
                    <li>Le PGN est maintenant dans ton presse-papiers</li>
                  </ul>
                </div>

                {/* Lichess – Navigateur (ordinateur) */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Lichess – Navigateur (ordinateur)</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre la partie sur lichess.org</li>
                    <li>Clique sur le bouton "Download" en haut à droite (icône de téléchargement)</li>
                    <li>Choisis "Download PGN"</li>
                    <li>Ouvre le fichier .pgn avec un éditeur de texte</li>
                    <li>Copie tout le contenu (Ctrl+A puis Ctrl+C / Cmd+A puis Cmd+C)</li>
                    <li>Colle-le dans le champ ci-dessus</li>
                  </ul>
                </div>

                {/* Astuce */}
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-xs text-blue-300">
                    <span className="font-semibold">💡 Astuce :</span> Le PGN commence généralement par <span className="font-mono text-blue-200">[Event</span> et contient tous les coups de la partie. Assure-toi de copier tout le texte du fichier.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <input
            type="text"
            value={inputContent}
            onChange={(e) => { setInputContent(e.target.value); setInputError(''); }}
            placeholder="Collez l'URL de la partie (ex: lichess.org/...) "
            className="w-full p-3 rounded-lg bg-slate-900/60 text-slate-200 border border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20"
            disabled={status === 'loading'}
          />
          <button
            type="button"
            onClick={() => setShowMobileGuide(!showMobileGuide)}
            className="mt-2 text-xs text-sky-400 hover:text-sky-300 cursor-pointer inline-flex items-center gap-1"
          >
            {showMobileGuide ? (
              <>
                ❌ Masquer le guide mobile
              </>
            ) : (
              <>
                📱 Comment copier le lien de ta partie sur mobile ?
              </>
            )}
          </button>
          {showMobileGuide && (
            <div className="mt-3 p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-sm text-slate-200">
              <h4 className="text-base font-semibold text-slate-100 mb-3">📱 Copier le lien de ta partie</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Chess.com – Application mobile</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre l&apos;app Chess.com</li>
                    <li>Va dans : Menu → Parties / Archive</li>
                    <li>Ouvre la partie</li>
                    <li>Appuie sur ⋯ (en haut à droite)</li>
                    <li>Choisis &quot;Share Game&quot; puis &quot;Copy Link&quot;</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Chess.com – Navigateur mobile (Safari / Chrome)</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre la partie</li>
                    <li>Appuie sur la barre d&apos;adresse</li>
                    <li>Copie l&apos;URL</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-2 mb-2">Lichess – Application mobile</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                    <li>Ouvre la partie</li>
                    <li>Appuie sur ⋯ ou &quot;Partager&quot;</li>
                    <li>Choisis &quot;Copier le lien&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {inputError && <p className="text-red-400 text-sm mt-1">{inputError}</p>}

      <button
        onClick={handleAnalyze}
        disabled={status === 'loading' || !isInputValid}
        className={`w-full py-3 rounded-xl text-lg font-bold transition-colors ${
          status === 'loading'
            ? 'bg-emerald-700/50 text-emerald-300 cursor-not-allowed'
            : 'bg-gradient-to-tr from-emerald-400 to-emerald-300 text-slate-950 hover:brightness-110 shadow-[0_18px_50px_rgba(16,185,129,0.45)]'
        }`}
      >
        {status === 'loading' ? <Spinner /> : 'Analyser la partie'}
      </button>

      <div className="mt-8 pt-8 border-t border-slate-700">
        {status === 'idle' && (
          <p className="text-slate-400 text-center py-10">
            Aucune analyse pour le moment. Lance une analyse pour voir les résultats.
          </p>
        )}

        {status === 'error' && (
          <ErrorMessage message={inputError || "Une erreur est survenue lors de l'analyse. Veuillez vérifier votre PGN ou votre lien."} />
        )}

        {status === 'success' && report && (
          <div className="space-y-10">
            <SectionTitle>Résultats de l'analyse</SectionTitle>

            {/* Sélecteur Blanc/Noir */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <h4 className="text-lg font-semibold text-emerald-400 mb-3">Dans cette partie, vous étiez :</h4>
              <div className="inline-flex rounded-full bg-slate-800/60 p-1 border border-white/10">
                {(['White', 'Black'] as const).map((side) => {
                  const isActive = playerSide === side;
                  return (
                    <button
                      key={side}
                      onClick={() => setPlayerSide(side)}
                      className={isActive
                        ? "px-6 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                        : "px-6 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
                      }
                    >
                      {side === 'White' ? '⚪ Blancs' : '⚫ Noirs'}
                    </button>
                  );
                })}
              </div>
              {playerSide && (
                <p className="text-sm text-slate-400 mt-3">
                  Les exercices seront adaptés selon les erreurs des <span className="font-semibold text-emerald-400">{playerSide === 'White' ? 'Blancs' : 'Noirs'}</span>.
                </p>
              )}
            </div>

            {/* Échiquier interactif avec highlights */}
            {gamePgn && (
              <div>
                <SectionTitle>Analyse de la partie</SectionTitle>
                <GameBoardWithHighlights
                  pgn={gamePgn}
                  keyMoments={report.keyMoments}
                  mistakes={report.mistakes}
                  selectedHighlight={selectedHighlight}
                  onHighlightChange={setSelectedHighlight}
                />
              </div>
            )}

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <h4 className="text-lg font-semibold text-emerald-400 mb-2">Résumé de la partie</h4>
              <p className="text-slate-300 mb-3">{report.summary}</p>
              <div className="flex space-x-4 text-sm font-medium">
                <Badge category="default">Camp analysé : {report.analyzedSide}</Badge>
                <Badge category={getResultCategory(report.result, report.analyzedSide)}>Résultat : {report.result}</Badge>
              </div>
            </div>

            <div>
              <SectionTitle>Moments clés</SectionTitle>
              <div className="space-y-3">
                {report.keyMoments.map((moment, index) => {
                  const isSelected = selectedHighlight?.type === 'keyMoment' && selectedHighlight.index === index;
                  
                  return (
                    <div
                      key={index}
                      ref={(el) => {
                        if (isSelected && el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      onClick={() => setSelectedHighlight({ type: 'keyMoment', index, moveNumber: moment.moveNumber })}
                      className={`p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 border-l-4'
                          : 'bg-slate-900/60 border-white/10 border-l-4 border-l-emerald-400 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{moment.evaluationChange > 0 ? '✅' : '⚡'}</span>
                            <span className="font-bold text-emerald-300">Coup {moment.moveNumber}:</span>
                            <span className={`text-sm font-semibold p-1.5 rounded-full ${moment.evaluationChange > 0 ? 'text-emerald-400 bg-emerald-900/30' : 'text-red-400 bg-red-900/30'}`}>
                              Éval. : {moment.evaluationChange > 0 ? '+' : ''}{moment.evaluationChange / 100}
                    </span>
                  </div>
                          <p className="text-slate-300">{moment.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle>Erreurs & Imprécisions</SectionTitle>
              <div className="space-y-4">
                {report.mistakes.map((mistake, index) => {
                  const isSelected = selectedHighlight?.type === 'mistake' && selectedHighlight.index === index;
                  const badgeEmoji = mistake.category === 'blunder' ? '❌' : mistake.category === 'mistake' ? '⚠️' : '⚡';
                  
                  return (
                    <div
                      key={index}
                      ref={(el) => {
                        if (isSelected && el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      onClick={() => setSelectedHighlight({ type: 'mistake', index, moveNumber: mistake.moveNumber })}
                      className={`p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? mistake.category === 'blunder'
                            ? 'bg-red-500/20 border-red-400 border-l-4'
                            : mistake.category === 'mistake'
                            ? 'bg-orange-500/20 border-orange-400 border-l-4'
                            : 'bg-amber-500/20 border-amber-400 border-l-4'
                          : 'bg-slate-900/60 border-white/10 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{badgeEmoji}</span>
                      <Badge category={mistake.category}>{mistake.category.toUpperCase()}</Badge>
                      <p className="text-slate-200">
                        <span className="font-bold text-lg mr-1">Coup {mistake.moveNumber}:</span>
                          <span className="font-mono">{mistake.movePlayed}</span>
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 pl-1">{mistake.explanation}</p>
                    {mistake.bestSuggestion && (
                        <div className="flex items-center gap-2 pl-1">
                          <span className="text-sm text-emerald-400 font-medium">
                            💡 Meilleur coup: <span className="font-mono">{mistake.bestSuggestion}</span>
                          </span>
                        </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle>Exercices recommandés</SectionTitle>
              
              {!playerSide ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                  <p className="text-slate-400 text-center">
                    Veuillez sélectionner votre couleur (Blancs ou Noirs) pour voir les exercices interactifs adaptés à vos erreurs.
                  </p>
                    </div>
              ) : (
                <>
                  {/* Filtrer les erreurs selon la couleur choisie */}
                  {(() => {
                    // Déterminer si une erreur appartient aux Blancs ou aux Noirs
                    // Les coups impairs (1, 3, 5...) sont joués par les Blancs
                    // Les coups pairs (2, 4, 6...) sont joués par les Noirs
                    const filteredMistakes = report.mistakes.filter(mistake => {
                      const isWhiteMove = mistake.moveNumber % 2 === 1;
                      return playerSide === 'White' ? isWhiteMove : !isWhiteMove;
                    });

                    // Fonction pour extraire la position FEN avant une erreur
                    const getPositionBeforeMistake = (mistake: Mistake): string | null => {
                      if (!gamePgn) return null;
                      try {
                        const chess = new Chess();
                        chess.loadPgn(gamePgn);
                        
                        // Calculer l'index du coup dans l'historique
                        // moveNumber 1 = indices 0 et 1 (Blanc puis Noir)
                        // moveNumber 2 = indices 2 et 3
                        // Donc pour moveNumber N, on veut s'arrêter avant l'index (N-1)*2
                        const moveIndex = (mistake.moveNumber - 1) * 2;
                        
                        // Reconstruire la position jusqu'à avant l'erreur
                        const tempGame = new Chess();
                        const history = chess.history();
                        
                        for (let i = 0; i < moveIndex; i++) {
                          try {
                            tempGame.move(history[i]);
                          } catch (e) {
                            console.error("Failed to apply move:", history[i], e);
                            return null;
                          }
                        }
                        
                        return tempGame.fen();
                      } catch (error) {
                        console.error("Failed to extract position:", error);
                        return null;
                      }
                    };

                    // Créer des exercices enrichis basés sur les erreurs filtrées
                    const enrichedExercises = report.recommendedExercises.map((ex, index) => {
                      // Trouver une erreur correspondante pour enrichir l'exercice
                      const relatedMistake = filteredMistakes.find(m => 
                        ex.exerciseType === 'tactic' && (m.category === 'blunder' || m.category === 'mistake') ||
                        ex.exerciseType === 'endgame' && m.moveNumber > 30 ||
                        ex.exerciseType === 'opening' && m.moveNumber <= 15 ||
                        ex.exerciseType === 'strategy' && m.category === 'inaccuracy'
                      ) || filteredMistakes[index % filteredMistakes.length];

                      // Extraire la position FEN réelle avant l'erreur
                      const realPositionFen = relatedMistake ? getPositionBeforeMistake(relatedMistake) : null;

                      // Enrichir l'exercice avec des données de l'erreur
                      const enrichedExercise: Exercise = {
                        ...ex,
                        positionFen: realPositionFen || ex.positionFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        hint: ex.hint || relatedMistake 
                          ? `Évite l'erreur ${relatedMistake.category} du coup ${relatedMistake.moveNumber}: ${relatedMistake.movePlayed}. ${relatedMistake.bestSuggestion ? `Le meilleur coup était ${relatedMistake.bestSuggestion}.` : ''}`
                          : `Pense à exploiter les faiblesses en ${ex.exerciseType}.`,
                        weaknessExploited: relatedMistake 
                          ? `${relatedMistake.category} au coup ${relatedMistake.moveNumber}: ${relatedMistake.explanation.substring(0, 100)}...`
                          : ex.weaknessExploited,
                        solution: relatedMistake?.bestSuggestion ? [relatedMistake.bestSuggestion] : ex.solution,
                        moveVariants: relatedMistake ? [
                          {
                            move: relatedMistake.bestSuggestion || 'N/A',
                            isBest: true,
                            explanation: relatedMistake.bestSuggestionExplanation || `Meilleur coup pour éviter l'erreur ${relatedMistake.category}.`,
                            opponentResponse: undefined,
                          },
                          {
                            move: relatedMistake.movePlayed,
                            isBest: false,
                            explanation: relatedMistake.explanation,
                            opponentResponse: undefined,
                          },
                        ] : ex.moveVariants,
                      };

                      return enrichedExercise;
                    });

                    return (
                      <div className="space-y-6">
                        {filteredMistakes.length === 0 ? (
                          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                            <p className="text-slate-400 text-center">
                              Aucune erreur trouvée pour les <span className="font-semibold text-emerald-400">{playerSide === 'White' ? 'Blancs' : 'Noirs'}</span>. Excellent jeu !
                            </p>
                  </div>
                        ) : (
                          <>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                              <p className="text-sm text-blue-300">
                                <span className="font-semibold">{filteredMistakes.length}</span> erreur{filteredMistakes.length > 1 ? 's' : ''} identifiée{filteredMistakes.length > 1 ? 's' : ''} pour les <span className="font-semibold">{playerSide === 'White' ? 'Blancs' : 'Noirs'}</span>. Les exercices ci-dessous sont adaptés pour corriger ces erreurs.
                              </p>
              </div>
                            
                            <div className="space-y-6">
                              {enrichedExercises.map((ex, index) => {
                                // Trouver la faiblesse correspondante
                                const relatedMistake = filteredMistakes.find(m => 
                                  ex.exerciseType === 'tactic' && (m.category === 'blunder' || m.category === 'mistake') ||
                                  ex.exerciseType === 'endgame' && m.moveNumber > 30 ||
                                  ex.exerciseType === 'opening' && m.moveNumber <= 15 ||
                                  ex.exerciseType === 'strategy' && m.category === 'inaccuracy'
                                ) || filteredMistakes[index % filteredMistakes.length];

                                return (
                                  <InteractiveExercise
                                    key={index}
                                    exercise={ex}
                                    weakness={relatedMistake ? `${relatedMistake.category} au coup ${relatedMistake.moveNumber}` : undefined}
                                    mistake={relatedMistake || undefined}
                                  />
                                );
                              })}
            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- TAB 2: OPPONENT ANALYSIS ---

type Platform = "lichess" | "chesscom";

const OpponentAnalysisTab: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>("lichess");
  const [pseudo, setPseudo] = useState('');
  const [gameCount, setGameCount] = useState(10);
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [report, setReport] = useState<OpponentReport | null>(null);
  const [eloHistory, setEloHistory] = useState<EloDataPoint[] | null>(null);
  const [pseudoError, setPseudoError] = useState('');

  const handleAnalyze = useCallback(async () => {
    setPseudoError('');
    if (pseudo.trim().length === 0) {
      setPseudoError(`Veuillez entrer un pseudo ${platform === "lichess" ? "Lichess" : "Chess.com"}.`);
      return;
    }

    setStatus('loading');
    setReport(null);
    
    try {
      const res = await fetch('/api/opponent-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: pseudo,
          maxGames: gameCount,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setStatus('error');
        // Afficher le message d'erreur détaillé si disponible
        const errorMsg = errorData.error || errorData.details || `Impossible de trouver le joueur ${pseudo} ou d'analyser les parties.`;
        setPseudoError(errorMsg);
        console.error("Erreur API opponent-analyze:", errorData);
        return;
      }

      const data = await res.json();
      setReport(data.report);
      setEloHistory(data.eloHistory || null);
        setStatus('success');
    } catch (error) {
      setStatus('error');
      setPseudoError(`Impossible de trouver le joueur ${pseudo} ou d'analyser les parties.`);
      }
  }, [pseudo, platform, gameCount]);

  const gameOptions = [5, 10, 20];

  return (
    <div className="space-y-6">
      <SectionTitle>Paramètres de l'analyse</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Plateforme</label>
          <div className="inline-flex rounded-full bg-slate-900/70 p-1 border border-white/10">
            <button
              onClick={() => setPlatform("lichess")}
              className={platform === "lichess"
                ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              }
              disabled={status === 'loading'}
            >
              Lichess
            </button>
            <button
              onClick={() => setPlatform("chesscom")}
              className={platform === "chesscom"
                ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              }
              disabled={status === 'loading'}
            >
              Chess.com
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="pseudo" className="block text-sm font-medium text-slate-300">
            Pseudo {platform === "lichess" ? "Lichess" : "Chess.com"}
          </label>
          <input
            type="text"
            id="pseudo"
            value={pseudo}
            onChange={(e) => { setPseudo(e.target.value); setPseudoError(''); }}
            placeholder="Ex: MaxLichessPlayer"
            className="w-full p-3 rounded-lg bg-slate-900/60 text-slate-200 border border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20"
            disabled={status === 'loading'}
          />
          {pseudoError && <p className="text-red-400 text-sm mt-1">{pseudoError}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="gameCount" className="block text-sm font-medium text-slate-300">Nombre de parties à analyser</label>
        <div className="inline-flex rounded-full bg-slate-900/70 p-1 border border-white/10">
          {gameOptions.map((count) => (
            <button
              key={count}
              onClick={() => setGameCount(count)}
              className={gameCount === count
                ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              }
              disabled={status === 'loading'}
            >
              {count} parties
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={status === 'loading' || pseudo.trim().length === 0}
        className={`w-full py-3 rounded-xl text-lg font-bold transition-colors ${
          status === 'loading'
            ? 'bg-emerald-700/50 text-emerald-300 cursor-not-allowed'
            : 'bg-gradient-to-tr from-emerald-400 to-emerald-300 text-slate-950 hover:brightness-110 shadow-[0_18px_50px_rgba(16,185,129,0.45)]'
        }`}
      >
        {status === 'loading' ? <Spinner /> : 'Analyser cet adversaire'}
      </button>

      <div className="mt-8 pt-8 border-t border-slate-700">
        {status === 'idle' && (
          <p className="text-slate-400 text-center py-10">
            Aucune analyse encore. Lance une analyse pour voir le profil de ton adversaire.
          </p>
        )}

        {status === 'error' && (
          <ErrorMessage message={pseudoError || `Impossible de trouver le joueur ${pseudo} ou d'analyser les parties.`} />
        )}

        {status === 'success' && report && (
          <div className="space-y-10">
            <SectionTitle>Profil de l'adversaire</SectionTitle>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <h4 className="text-lg font-semibold text-emerald-400 mb-2">Résumé global (sur {gameCount} parties)</h4>
              <p className="text-slate-300">{report.globalSummary}</p>
            </div>

            {/* Courbes ELO */}
            {eloHistory && eloHistory.length > 0 && (
            <div>
                <SectionTitle>Évolution du classement ELO</SectionTitle>
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                  <EloChart data={eloHistory} />
                </div>
              </div>
            )}

            {/* Points forts / Points faibles */}
            <div>
              <SectionTitle>Points forts & Points faibles</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Points forts */}
                {report.mainStrengths && report.mainStrengths.length > 0 && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 border-l-4 border-l-emerald-400">
                    <h4 className="text-lg font-semibold text-emerald-400 mb-3">💪 Points forts</h4>
                    <ul className="space-y-2">
                      {report.mainStrengths.map((strength, index) => (
                        <li key={index} className="text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Points faibles */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 border-l-4 border-l-red-400">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">⚠️ Points faibles</h4>
                  <ul className="space-y-2">
                {report.mainWeaknesses.map((weakness, index) => (
                      <li key={index} className="text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span>{weakness}</span>
                  </li>
                ))}
              </ul>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>Erreurs fréquentes & Thèmes défavorables</SectionTitle>
              <div className="space-y-4">
                {report.frequentErrors.map((error, index) => (
                  <div key={index} className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 border-l-4 border-l-orange-400 space-y-3">
                    <h4 className="font-bold text-xl text-white">{error.theme}</h4>
                    <p className="text-slate-400">{error.description}</p>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-white/5">
                      <p className="font-semibold text-orange-300 mb-1">Comment en profiter :</p>
                      <p className="text-slate-300 text-sm">{error.howToPunish}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Exercices interactifs pour la préparation</SectionTitle>
              <div className="space-y-6">
                {report.recommendedExercises.map((ex, index) => {
                  // Trouver la faiblesse associée si possible
                  const relatedWeakness = report.frequentErrors.find(err => 
                    ex.description.toLowerCase().includes(err.theme.toLowerCase()) ||
                    err.theme.toLowerCase().includes(ex.exerciseType)
                  )?.theme;

                  // Utiliser les données de l'exercice ou des valeurs par défaut
                  const enrichedExercise: Exercise = {
                    ...ex,
                    positionFen: ex.positionFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                    solution: ex.solution || [],
                    hint: ex.hint || `Pense à exploiter les faiblesses de l'adversaire en ${ex.exerciseType}.`,
                  };

                  return (
                    <InteractiveExercise
                      key={index}
                      exercise={enrichedExercise}
                      weakness={relatedWeakness}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

type Tab = 'game' | 'opponent';

const ChessFocusPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('game');

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/page-accueil.png')" }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-950/75 to-slate-900/80" />

      {/* Content wrapper */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
        <div className="max-w-6xl w-full rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] p-6 sm:p-10 lg:p-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="font-hero-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Analyse ChessFocus
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300/85 max-w-xl">
                Analyse une partie ou prépare-toi contre un adversaire en quelques clics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Tableau d&apos;analyse
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 space-y-6">
            <div className="inline-flex rounded-full bg-slate-900/70 p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('game')}
                className={activeTab === 'game'
                  ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                  : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                }
              >
                Analyser une partie
              </button>
              <button
                onClick={() => setActiveTab('opponent')}
                className={activeTab === 'opponent'
                  ? "px-5 py-2 rounded-full text-sm sm:text-base font-semibold bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.55)] transition-all"
                  : "px-5 py-2 rounded-full text-sm sm:text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                }
              >
                Analyser un adversaire
              </button>
            </div>

            {/* Tab content */}
            <div>
              {activeTab === 'game' && <GameAnalysisTab />}
              {activeTab === 'opponent' && <OpponentAnalysisTab />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChessFocusPage;
