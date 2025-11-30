import { openai, OPENAI_MODEL } from "@/lib/openai";
import { fetchChessComGamePgn } from "@/lib/chesscom";

type Body =
  | { sourceType: "pgn"; pgn: string }
  | { sourceType: "url"; link: string };

type MistakeCategory = "inaccuracy" | "mistake" | "blunder";

interface KeyMoment {
  moveNumber: number;
  description: string;
  evaluationChange: number; // centipawns
}

interface Mistake {
  moveNumber: number;
  movePlayed: string;
  category: MistakeCategory;
  explanation: string;
  bestSuggestion?: string;
  bestSuggestionExplanation?: string; // Explication détaillée de pourquoi ce coup est meilleur
}

interface Exercise {
  title: string;
  description: string;
  exerciseType: "tactic" | "endgame" | "opening" | "strategy";
  estimatedLevel: "beginner" | "intermediate" | "advanced";
}

interface GameReport {
  summary: string;
  analyzedSide: "White" | "Black";
  result: "1-0" | "0-1" | "1/2-1/2";
  keyMoments: KeyMoment[];
  mistakes: Mistake[];
  recommendedExercises: Exercise[];
}

// Helper functions
function isLichessUrl(url: string): boolean {
  try {
    // Normalize URL - handle cases where protocol is missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    const u = new URL(normalizedUrl);
    return u.hostname.includes("lichess.org");
  } catch {
    // Also check if it's just a game ID or path
    return url.includes("lichess.org") || /^[a-z0-9]{8,}$/i.test(url.trim());
  }
}

function isChessComUrl(url: string): boolean {
  try {
    // Normalize URL - handle cases where protocol is missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    const u = new URL(normalizedUrl);
    return u.hostname.includes("chess.com");
  } catch {
    return url.includes("chess.com");
  }
}

async function fetchLichessPgn(link: string): Promise<string> {
  try {
    // Normalize the URL - handle cases where protocol is missing
    let normalizedLink = link.trim();
    if (!normalizedLink.startsWith("http://") && !normalizedLink.startsWith("https://")) {
      normalizedLink = "https://" + normalizedLink;
    }

    const u = new URL(normalizedLink);
    const parts = u.pathname.split("/").filter(Boolean);
    const gameId = parts[0];
    
    if (!gameId || gameId.length < 4) {
      throw new Error("Impossible d'extraire l'ID de la partie Lichess depuis l'URL");
    }

    const pgnUrl = `https://lichess.org/game/export/${gameId}?moves=1&pgnInJson=0`;
    
    console.log(`[Game Analyze] Fetching Lichess PGN from: ${pgnUrl}`);
    
    const res = await fetch(pgnUrl, {
      headers: {
        Accept: "text/plain",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[Game Analyze] Lichess fetch failed: ${res.status}`, errorText.substring(0, 200));
      throw new Error(`Erreur lors de la récupération de la partie Lichess: ${res.status} ${res.statusText}`);
    }

    const pgn = await res.text();
    
    if (!pgn || pgn.trim().length === 0) {
      throw new Error("PGN vide retourné par Lichess");
    }

    // Basic validation that it's actually a PGN
    if (!pgn.includes("[Event") && !pgn.includes("1.")) {
      throw new Error("Réponse invalide de Lichess : format PGN non reconnu");
    }

    return pgn.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[Game Analyze] Lichess PGN fetch error:`, errorMessage);
    throw new Error(`Impossible de récupérer la partie depuis Lichess: ${errorMessage}`);
  }
}

// Note: fetchChessComPgn a été remplacé par fetchChessComGamePgn de @/lib/chesscom
// qui est plus robuste et utilise plusieurs méthodes de fallback pour récupérer le PGN

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: any;
    try {
      const rawBody = await request.text();
      console.log("[Game Analyze] Raw request body:", rawBody.substring(0, 200));
      body = JSON.parse(rawBody);
      console.log("[Game Analyze] Parsed body:", { 
        sourceType: body?.sourceType, 
        hasPgn: !!(body as any)?.pgn, 
        hasLink: !!(body as any)?.link 
      });
    } catch (parseError) {
      console.error("[Game Analyze] Failed to parse request body", parseError);
      return new Response(
        JSON.stringify({ error: "Corps de la requête invalide. JSON attendu." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate sourceType
    if (!body || typeof body !== "object" || !body.sourceType) {
      console.error("[Game Analyze] Missing sourceType in body", body);
      return new Response(
        JSON.stringify({ error: "sourceType est requis ('pgn' ou 'url')" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.sourceType !== "pgn" && body.sourceType !== "url") {
      console.error("[Game Analyze] Invalid sourceType:", body.sourceType);
      return new Response(
        JSON.stringify({ error: `sourceType invalide: "${body.sourceType}". Doit être 'pgn' ou 'url'` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Type guard to ensure body is properly typed
    const typedBody = body as Body;

    let pgn: string;

    try {
      if (typedBody.sourceType === "pgn") {
        if (!typedBody.pgn || typeof typedBody.pgn !== "string" || typedBody.pgn.trim().length === 0) {
          console.error("[Game Analyze] Empty or invalid PGN provided");
          return new Response(
            JSON.stringify({ error: "PGN requis lorsque sourceType est 'pgn'. Le PGN ne peut pas être vide." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        pgn = typedBody.pgn.trim();
        console.log(`[Game Analyze] Using provided PGN (length: ${pgn.length} chars)`);
      } else {
        // sourceType === "url"
        if (!typedBody.link || typeof typedBody.link !== "string" || typedBody.link.trim().length === 0) {
          console.error("[Game Analyze] Empty or invalid link provided");
          return new Response(
            JSON.stringify({ error: "Lien requis lorsque sourceType est 'url'. Le lien ne peut pas être vide." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const link = typedBody.link.trim();
        console.log(`[Game Analyze] Fetching PGN from URL: ${link.substring(0, 100)}`);

        if (isLichessUrl(link)) {
          console.log("[Game Analyze] Detected Lichess URL");
          pgn = await fetchLichessPgn(link);
        } else if (isChessComUrl(link)) {
          console.log("[Game Analyze] Detected Chess.com URL");
          pgn = await fetchChessComGamePgn(link);
        } else {
          console.error("[Game Analyze] URL not recognized as Lichess or Chess.com:", link);
          return new Response(
            JSON.stringify({ error: `URL invalide : "${link.substring(0, 50)}..." n'est pas reconnu comme un lien Lichess ou Chess.com.` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } catch (pgnError) {
      const errorMessage = pgnError instanceof Error ? pgnError.message : "Erreur inconnue lors de la récupération du PGN";
      console.error("[Game Analyze] PGN fetch failed", {
        error: errorMessage,
        stack: pgnError instanceof Error ? pgnError.stack : undefined,
      });
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate PGN is not empty
    if (!pgn || pgn.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "PGN vide ou invalide" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the prompt
    const prompt = `Tu es un entraîneur d'échecs expérimenté de niveau maître international.

On te donne une partie complète en notation PGN.

Analyse la partie en profondeur avec une attention particulière aux détails tactiques et stratégiques.

INSTRUCTIONS DÉTAILLÉES :

1. RÉSUMÉ : 
   - Décris le camp analysé (White ou Black).
   - Donne le résultat (1-0, 0-1 ou 1/2-1/2).
   - Fournis un résumé détaillé de la partie (ouverture jouée, thèmes stratégiques, tournants de la partie, qualité du jeu).

2. MOMENTS CLÉS :
   - Identifie TOUS les moments clés où l'évaluation change significativement (plus de 50 centipawns).
   - Pour chaque moment clé, donne :
     * Le numéro exact du coup (moveNumber)
     * Une description DÉTAILLÉE de ce qui s'est passé (tactique, erreur de l'adversaire, opportunité manquée, etc.)
     * Le changement d'évaluation en centipawns (positif si avantageux pour le camp analysé, négatif sinon)
   - Inclus les moments où une combinaison tactique a été jouée, où une erreur de l'adversaire a été exploitée, ou où une opportunité a été manquée.

3. ERREURS & IMPRÉCISIONS :
   - Liste TOUTES les imprécisions, erreurs et gaffes du camp analysé.
   - Pour chaque erreur, donne :
     * Le numéro exact du coup (moveNumber)
     * Le coup joué en notation algébrique (movePlayed)
     * La catégorie : "inaccuracy" (imprécision, perte de 10-30 centipawns), "mistake" (erreur, perte de 30-100 centipawns), "blunder" (gaffe, perte de plus de 100 centipawns)
     * Une explication DÉTAILLÉE de pourquoi c'est une erreur (ce qui était mieux, ce qui a été manqué, la menace non vue, etc.)
     * Le meilleur coup suggéré en notation algébrique (bestSuggestion) si applicable
     * Une explication DÉTAILLÉE de pourquoi le meilleur coup est meilleur (bestSuggestionExplanation) : avantages tactiques, positionnels, menaces créées, opportunités saisies, etc.
   - Sois précis : une "inaccuracy" est une petite imprécision, une "mistake" est une vraie erreur, un "blunder" est une gaffe majeure.

4. EXERCICES :
   - Propose 3-5 exercices ciblés pour corriger les erreurs identifiées.
   - Chaque exercice doit avoir un titre, une description, un type (tactic, endgame, opening, strategy) et un niveau estimé.

Tu dois répondre STRICTEMENT en JSON qui respecte ce type TypeScript :

type MistakeCategory = "inaccuracy" | "mistake" | "blunder";

interface KeyMoment {
  moveNumber: number;
  description: string;
  evaluationChange: number; // centipawns (positif = avantageux pour le camp analysé)
}

interface Mistake {
  moveNumber: number;
  movePlayed: string;
  category: MistakeCategory;
  explanation: string;
  bestSuggestion?: string;
  bestSuggestionExplanation?: string; // Explication détaillée de pourquoi ce coup est meilleur
}

interface Exercise {
  title: string;
  description: string;
  exerciseType: "tactic" | "endgame" | "opening" | "strategy";
  estimatedLevel: "beginner" | "intermediate" | "advanced";
}

interface GameReport {
  summary: string;
  analyzedSide: "White" | "Black";
  result: "1-0" | "0-1" | "1/2-1/2";
  keyMoments: KeyMoment[];
  mistakes: Mistake[];
  recommendedExercises: Exercise[];
}

IMPORTANT :

- Ne renvoie aucun texte en dehors du JSON.
- Respecte strictement les catégories "inaccuracy", "mistake", "blunder".
- Respecte strictement les types "tactic", "endgame", "opening", "strategy".
- Respecte strictement les niveaux "beginner", "intermediate", "advanced".
- Sois exhaustif : identifie TOUS les moments clés et TOUTES les erreurs significatives.
- Les descriptions doivent être détaillées et pédagogiques.
- Les numéros de coups (moveNumber) doivent correspondre exactement aux coups dans le PGN.

Voici le PGN :

${pgn}`;

    // Call OpenAI
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Tu es un moteur d'analyse d'échecs." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
    } catch (openaiError: any) {
      const errorMessage = openaiError?.message || openaiError?.error?.message || "Erreur OpenAI inconnue";
      console.error("Game analysis error: OpenAI API call failed", {
        message: errorMessage,
        status: openaiError?.status,
        type: openaiError?.error?.type,
        full: openaiError,
      });
      
      let userMessage = "Erreur lors de l'analyse avec OpenAI.";
      if (errorMessage.includes("Incorrect API key") || errorMessage.includes("invalid_api_key")) {
        userMessage = "Clé API OpenAI invalide. Vérifiez votre configuration.";
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
        userMessage = "Limite de taux OpenAI atteinte. Réessayez dans quelques instants.";
      }
      
      return new Response(
        JSON.stringify({ error: userMessage }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("Game analysis error: OpenAI returned empty content", completion);
      return new Response(
        JSON.stringify({ error: "OpenAI n'a retourné aucun contenu." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let report: GameReport;
    try {
      report = JSON.parse(content) as GameReport;
    } catch (parseError) {
      console.error("Game analysis error: Failed to parse OpenAI response", {
        content: content.substring(0, 200),
        error: parseError,
      });
      return new Response(
        JSON.stringify({ error: "Réponse OpenAI invalide : JSON mal formé." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate report structure
    if (!report.summary || !report.analyzedSide || !report.result) {
      console.error("Game analysis error: Invalid report structure", report);
      return new Response(
        JSON.stringify({ error: "Structure du rapport invalide." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure arrays exist
    if (!Array.isArray(report.keyMoments)) report.keyMoments = [];
    if (!Array.isArray(report.mistakes)) report.mistakes = [];
    if (!Array.isArray(report.recommendedExercises)) report.recommendedExercises = [];

    return new Response(JSON.stringify({ report, pgn: pgn }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Game analysis error: Unexpected error", {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      full: err,
    });
    return new Response(
      JSON.stringify({ error: `Erreur lors de l'analyse de la partie: ${errorMessage}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
