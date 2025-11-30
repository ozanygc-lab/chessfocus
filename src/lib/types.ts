export type ExerciseType = "tactic" | "endgame" | "opening" | "strategy";

export type EstimatedLevel = "beginner" | "intermediate" | "advanced";

export type RecommendedExercise = {
  title: string;
  description: string;
  exerciseType: ExerciseType;
  estimatedLevel: EstimatedLevel;
};

export type FrequentError = {
  theme: string; // e.g. "Tactiques sur la dernière rangée"
  description: string; // Explanation
  howToPunish: string; // How to exploit this as the opponent
};

export type OpponentReport = {
  summary: string; // Global summary of play style
  mainWeaknesses: string[]; // 3–5 main weaknesses
  frequentErrors: FrequentError[];
  recommendedExercises: RecommendedExercise[];
};

export type MistakeCategory = "inaccuracy" | "mistake" | "blunder";

export type GameMistake = {
  moveNumber: number;
  movePlayed: string;
  category: MistakeCategory;
  explanation: string;
  betterMoveSuggestion?: string;
};

export type KeyMoment = {
  moveNumber: number;
  description: string;
  evaluationChange?: string; // e.g. "+1.2 to -0.8"
};

export type GameReport = {
  summary: string;
  side: "white" | "black" | "unknown";
  result: "win" | "loss" | "draw" | "unknown";
  keyMoments: KeyMoment[];
  mistakes: GameMistake[];
  recommendedExercises: RecommendedExercise[];
};

