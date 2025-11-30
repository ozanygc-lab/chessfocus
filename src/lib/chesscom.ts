// Chess.com support for fetching games via their public API

const USER_AGENT = "ChessFocus/1.0 (contact: contact@chessfocus.app)";

export function extractChessComGameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("chess.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    
    // Formats supportés :
    // /game/live/123456789
    // /game/daily/123456789
    // /analysis/game/live/123456789
    // /game/view/123456789
    
    if (parts[0] === "game" && parts.length >= 3) {
      // /game/live/123456789 ou /game/daily/123456789
      return parts[2] ?? null;
    } else if (parts[0] === "analysis" && parts[1] === "game" && parts.length >= 4) {
      // /analysis/game/live/123456789
      return parts[3] ?? null;
    } else if (parts[0] === "game" && parts[1] === "view" && parts.length >= 3) {
      // /game/view/123456789
      return parts[2] ?? null;
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function fetchChessComGamePgn(gameUrl: string): Promise<string> {
  try {
    const u = new URL(gameUrl);
    if (!u.hostname.includes("chess.com")) {
      throw new Error("Invalid Chess.com URL");
    }

    // Extraire l'ID de la partie
    const gameId = extractChessComGameFromUrl(gameUrl);
    if (!gameId) {
      throw new Error("Could not extract game ID from Chess.com URL");
    }

    console.log("Extracted Chess.com game ID:", gameId);

    // Méthode 1: Endpoint d'export Chess.com (le plus fiable)
    // Format: https://www.chess.com/game/export/{gameId}
    const exportUrl = `https://www.chess.com/game/export/${gameId}`;
    console.log("Trying export endpoint:", exportUrl);
    
    try {
      const exportRes = await fetch(exportUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/x-chess-pgn, text/plain, */*",
        },
        next: { revalidate: 0 },
      });

      if (exportRes.ok) {
        const pgn = await exportRes.text();
        if (pgn && pgn.trim().length > 0 && (pgn.includes("[Event") || pgn.includes("1."))) {
          console.log("Successfully fetched PGN from export endpoint");
          return pgn.trim();
        }
      } else {
        console.log(`Export endpoint failed with status ${exportRes.status}`);
      }
    } catch (exportErr) {
      console.warn("Export endpoint error:", exportErr);
    }

    // Méthode 2: Endpoint download alternatif
    const downloadUrl = `https://www.chess.com/game/download/${gameId}`;
    console.log("Trying download endpoint:", downloadUrl);
    
    try {
      const downloadRes = await fetch(downloadUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/x-chess-pgn, text/plain, */*",
        },
        next: { revalidate: 0 },
      });

      if (downloadRes.ok) {
        const pgn = await downloadRes.text();
        if (pgn && pgn.trim().length > 0 && (pgn.includes("[Event") || pgn.includes("1."))) {
          console.log("Successfully fetched PGN from download endpoint");
          return pgn.trim();
        }
      } else {
        console.log(`Download endpoint failed with status ${downloadRes.status}`);
      }
    } catch (downloadErr) {
      console.warn("Download endpoint error:", downloadErr);
    }

    // Méthode 3: Scraper la page HTML pour extraire le PGN
    console.log("Trying HTML scraping method...");
    try {
      const htmlRes = await fetch(gameUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        next: { revalidate: 0 },
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        
        // Chercher dans window.gameData ou window.gameAnalysis
        const gameDataPatterns = [
          /window\.gameData\s*=\s*({[\s\S]*?});/,
          /window\.gameAnalysis\s*=\s*({[\s\S]*?});/,
          /gameData\s*:\s*({[\s\S]*?}),/,
          /"pgn"\s*:\s*"([^"]+)"/,
          /'pgn'\s*:\s*'([^']+)'/,
        ];

        for (const pattern of gameDataPatterns) {
          const match = html.match(pattern);
          if (match) {
            try {
              if (match[1] && match[1].startsWith('{')) {
                const gameData = JSON.parse(match[1]);
                if (gameData.pgn) {
                  console.log("Found PGN in gameData object");
                  return gameData.pgn.trim();
                }
              } else if (match[1]) {
                const decodedPgn = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
                if (decodedPgn.includes("[Event") || decodedPgn.includes("1.")) {
                  console.log("Found PGN in string format");
                  return decodedPgn.trim();
                }
              }
            } catch (e) {
              // Continue to next pattern
            }
          }
        }

        // Chercher directement le PGN dans le HTML
        const pgnMatch = html.match(/(\[Event[^\]]*\][\s\S]*?)(?=\n\n|\n\[|<\/|$)/);
        if (pgnMatch && pgnMatch[1]) {
          const extractedPgn = pgnMatch[1].trim();
          if (extractedPgn.includes("[Event") && extractedPgn.length > 50) {
            console.log("Found PGN directly in HTML");
            return extractedPgn;
          }
        }
      }
    } catch (htmlErr) {
      console.warn("HTML scraping method error:", htmlErr);
    }

    // Méthode 4: Essayer avec /pgn à la fin de l'URL originale
    const pgnUrl = gameUrl.endsWith('/pgn') ? gameUrl : `${gameUrl.replace(/\/$/, '')}/pgn`;
    console.log("Trying direct PGN URL:", pgnUrl);
    
    try {
      const directRes = await fetch(pgnUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/x-chess-pgn, text/plain, */*",
        },
        next: { revalidate: 0 },
      });

      if (directRes.ok) {
        const pgn = await directRes.text();
        if (pgn && pgn.trim().length > 0 && (pgn.includes("[Event") || pgn.includes("1."))) {
          console.log("Successfully fetched PGN from direct URL");
          return pgn.trim();
        }
      } else {
        console.log(`Direct URL method failed with status ${directRes.status}`);
      }
    } catch (directErr) {
      console.warn("Direct URL method error:", directErr);
    }

    // Si toutes les méthodes ont échoué
    throw new Error(
      `Impossible de récupérer le PGN depuis Chess.com. ` +
      `L'ID de la partie est ${gameId}, mais aucune méthode n'a fonctionné. ` +
      `Essayez de copier directement le PGN depuis la page Chess.com (bouton "Download PGN") et collez-le dans l'onglet PGN.`
    );
  } catch (error) {
    console.error("Error fetching Chess.com game PGN:", error);
    throw error;
  }
}

export async function fetchChessComGames(username: string, maxGames: number = 10): Promise<string[]> {
  const normalized = username.trim().toLowerCase();

  // Fetch archives list
  const archivesRes = await fetch(
    `https://api.chess.com/pub/player/${encodeURIComponent(normalized)}/games/archives`,
    {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
      },
      next: { revalidate: 0 },
    }
  );

  if (!archivesRes.ok) {
    const text = await archivesRes.text();
    console.error("Chess.com API error", archivesRes.status, text);
    throw new Error(`REMOTE_CHESS_API_${archivesRes.status}`);
  }

  const archivesData = await archivesRes.json();
  const archives: string[] = archivesData.archives || [];

  if (!archives || archives.length === 0) {
    throw new Error("No games found for this Chess.com user");
  }

  // Collect games from the most recent archives (last 6 months max)
  const collectedGames: string[] = [];
  const maxArchivesToCheck = 6;
  
  // Start from the most recent archives (end of array) and go backwards
  const archivesToCheck = archives.slice(-maxArchivesToCheck).reverse();

  for (const archiveUrl of archivesToCheck) {
    if (collectedGames.length >= maxGames) {
      break;
    }

    try {
      const archiveRes = await fetch(archiveUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json",
        },
        next: { revalidate: 0 },
      });

      if (!archiveRes.ok) {
        const text = await archiveRes.text();
        console.error("Chess.com API error (archive)", archiveRes.status, text);
        continue; // Skip this archive if it fails
      }

      const archiveData = await archiveRes.json();
      const games = archiveData.games || [];

      for (const game of games) {
        if (collectedGames.length >= maxGames) {
          break;
        }

        // Extract PGN if it exists and is non-empty
        if (game.pgn && typeof game.pgn === "string" && game.pgn.trim().length > 0) {
          collectedGames.push(game.pgn.trim());
        }
      }
    } catch (error) {
      // Continue to next archive if this one fails
      console.warn(`Failed to fetch archive ${archiveUrl}:`, error);
      continue;
    }
  }

  if (collectedGames.length === 0) {
    throw new Error("No games found for this Chess.com user");
  }

  // Return exactly maxGames (or fewer if not enough available)
  return collectedGames.slice(0, maxGames);
}

export interface EloDataPoint {
  date: string;
  rating: number;
  variant: string;
}

export async function fetchChessComEloHistory(username: string): Promise<EloDataPoint[]> {
  const normalized = username.trim().toLowerCase();
  
  try {
    const res = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(normalized)}/stats`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const eloData: EloDataPoint[] = [];
    const now = new Date().toISOString().split('T')[0];
    
    // Chess.com returns current ratings for different time controls
    if (data.chess_daily?.last?.rating) {
      eloData.push({
        date: now,
        rating: data.chess_daily.last.rating,
        variant: "daily",
      });
    }
    if (data.chess_rapid?.last?.rating) {
      eloData.push({
        date: now,
        rating: data.chess_rapid.last.rating,
        variant: "rapid",
      });
    }
    if (data.chess_blitz?.last?.rating) {
      eloData.push({
        date: now,
        rating: data.chess_blitz.last.rating,
        variant: "blitz",
      });
    }
    if (data.chess_bullet?.last?.rating) {
      eloData.push({
        date: now,
        rating: data.chess_bullet.last.rating,
        variant: "bullet",
      });
    }
    
    return eloData;
  } catch (error) {
    console.error("Error fetching Chess.com ELO:", error);
    return [];
  }
}
