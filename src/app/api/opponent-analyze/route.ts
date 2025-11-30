import { NextResponse } from "next/server";
import { fetchLichessGames, fetchLichessEloHistory } from "@/lib/lichess";
import { fetchChessComGames, fetchChessComEloHistory } from "@/lib/chesscom";
import { openai, OPENAI_MODEL } from "@/lib/openai";

type Platform = "lichess" | "chesscom";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, username, maxGames } = body;

    // Default to "lichess" if platform is not provided
    const selectedPlatform: Platform = platform === "chesscom" ? "chesscom" : "lichess";

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json(
        { error: "Username is required and must be non-empty" },
        { status: 400 }
      );
    }

    const numGames = Math.min(Math.max(maxGames || 10, 3), 20);

    let games: string[];
    let eloHistory: any[] = [];

    try {
      if (selectedPlatform === "chesscom") {
        games = await fetchChessComGames(username.trim(), numGames);
        eloHistory = await fetchChessComEloHistory(username.trim());
      } else {
        games = await fetchLichessGames(username.trim(), numGames);
        eloHistory = await fetchLichessEloHistory(username.trim());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.startsWith("REMOTE_CHESS_API_404")) {
        return NextResponse.json(
          { error: "Joueur introuvable ou aucune partie publique sur cette plateforme." },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes("No games found")) {
        return NextResponse.json(
          { error: "Aucune partie trouvée pour cet utilisateur." },
          { status: 400 }
        );
      }
      
      // For other error codes (403, 500, etc.)
      console.error(`${selectedPlatform === "chesscom" ? "Chess.com" : "Lichess"} error:`, error);
      return NextResponse.json(
        { error: `Erreur lors de la récupération des parties sur ${selectedPlatform === "chesscom" ? "Chess.com" : "Lichess"}.` },
        { status: 502 }
      );
    }

    if (games.length === 0) {
      return NextResponse.json(
        { error: "Aucune partie trouvée pour cet utilisateur." },
        { status: 400 }
      );
    }

    const pgnPayload = games.map((g) => "---PGN---\n" + g).join("\n\n");

    const prompt = `Tu es un entraîneur d'échecs expérimenté.

Tu reçois plusieurs parties au format PGN, toutes jouées par le MÊME joueur.
Analyse le style de jeu global, identifie les POINTS FORTS et les POINTS FAIBLES, détecte les faiblesses récurrentes, les erreurs fréquentes et propose des exercices interactifs de SIMULATION adaptés.

IMPORTANT - Pour chaque exercice :
1. Identifie UNE faiblesse spécifique à exploiter (weaknessExploited)
2. Crée une position FEN réaliste qui met en évidence cette faiblesse
3. Fournis la meilleure ligne de jeu (solution) avec 3-5 coups
4. Fournis 3-5 variantes de coups possibles (moveVariants) :
   - 1-2 BONS coups (isBest: true) avec explication
   - 2-3 MAUVAIS coups typiques (isBest: false) avec explication de pourquoi ils sont mauvais
   - Pour chaque variante, indique la réponse typique de l'adversaire (opponentResponse)
5. Fournis les coups typiques que cet adversaire joue dans ce type de position (opponentMoves)
6. Les exercices doivent être des SIMULATIONS où l'utilisateur joue contre les faiblesses de l'adversaire

Réponds UNIQUEMENT avec du JSON valide correspondant à ce type TypeScript:

type ExerciseType = "tactic" | "endgame" | "opening" | "strategy";
type EstimatedLevel = "beginner" | "intermediate" | "advanced";

type OpponentReport = {
  globalSummary: string;
  mainWeaknesses: string[];
  mainStrengths: string[];
  frequentErrors: {
    theme: string;
    description: string;
    howToPunish: string;
  }[];
  recommendedExercises: {
    title: string;
    description: string;
    exerciseType: ExerciseType;
    estimatedLevel: EstimatedLevel;
    positionFen: string;
    solution: string[];
    hint: string;
    weaknessExploited: string;
    moveVariants: {
      move: string;
      isBest: boolean;
      explanation?: string;
      opponentResponse?: string;
    }[];
    opponentMoves: string[];
  }[];
};

Voici les parties séparées par '---PGN---':

${pgnPayload}`;

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Tu es un assistant qui analyse des parties d'échecs." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error("❌ OpenAI returned empty content:", response);
        return NextResponse.json(
          { error: "OpenAI returned empty content" },
          { status: 502 }
        );
      }

      const report = JSON.parse(content);
      return NextResponse.json({ 
        report,
        eloHistory: eloHistory.length > 0 ? eloHistory : null
      });
    } catch (err: any) {
      const errorMessage = err?.message || err?.error?.message || "Erreur inconnue";
      const errorStatus = err?.status || err?.error?.code || "unknown";
      const errorType = err?.error?.type || err?.type || "unknown";
      
      console.error("🔥 REAL OPENAI ERROR:", {
        message: errorMessage,
        status: errorStatus,
        type: errorType,
        data: err?.error,
        full: err
      });
      
      // Créer un message d'erreur plus informatif
      let userMessage = "Erreur lors de l'appel à OpenAI.";
      if (errorMessage.includes("Incorrect API key") || errorMessage.includes("invalid_api_key")) {
        userMessage = "Clé API OpenAI invalide. Vérifiez votre configuration.";
      } else if (errorMessage.includes("project") || errorMessage.includes("organization")) {
        userMessage = "Configuration OpenAI incomplète. Vérifiez OPENAI_PROJECT_ID et OPENAI_ORG_ID.";
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
        userMessage = "Limite de taux OpenAI atteinte. Réessayez plus tard.";
      } else if (errorMessage) {
        userMessage = `Erreur OpenAI: ${errorMessage}`;
      }
      
      return NextResponse.json(
        {
          error: userMessage,
          details: errorMessage,
          status: errorStatus,
          type: errorType
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in opponent-analyze:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes("400") || errorMessage.includes("not found") ? 400 : 500 }
    );
  }
}

