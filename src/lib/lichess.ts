export async function fetchLichessGames(username: string, maxGames: number = 10): Promise<string[]> {
  const normalized = username.trim().toLowerCase();
  
  const res = await fetch(
    `https://lichess.org/api/games/user/${encodeURIComponent(normalized)}?max=${maxGames}&moves=false&pgnInJson=true`,
    {
      headers: {
        Accept: "application/x-ndjson",
      },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Lichess API error", res.status, text);
    throw new Error(`REMOTE_CHESS_API_${res.status}`);
  }

  const text = await res.text();
  
  // Parse NDJSON: each line is a JSON object
  const games: string[] = [];
  const lines = text.trim().split("\n").filter((line) => line.trim().length > 0);
  
  for (const line of lines) {
    try {
      const gameData = JSON.parse(line);
      // Extract PGN from the game data
      if (gameData.pgn && typeof gameData.pgn === "string" && gameData.pgn.trim().length > 0) {
        games.push(gameData.pgn.trim());
      }
    } catch (parseError) {
      console.warn("Failed to parse Lichess game line:", line);
      continue;
    }
    
    if (games.length >= maxGames) {
      break;
    }
  }

  if (games.length === 0) {
    throw new Error("No games found for this Lichess user");
  }

  return games.slice(0, maxGames);
}

export function extractLichessGameIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("lichess.org")) return null;

    const parts = u.pathname.split("/").filter(Boolean);
    // e.g. /abcd1234 or /abcd1234/black => first segment is ID
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchLichessGamePgn(gameId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://lichess.org/game/export/${gameId}?moves=true&pgnInJson=false`,
      {
        headers: {
          Accept: "application/x-chess-pgn",
          "User-Agent": "ChessFocus/1.0",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Lichess] Failed to fetch game ${gameId}:`, res.status, text.substring(0, 200));
      throw new Error(`Impossible de récupérer la partie Lichess (${res.status})`);
    }

    const pgn = await res.text();
    
    if (!pgn || pgn.trim().length === 0) {
      throw new Error("PGN vide retourné par Lichess");
    }

    return pgn.trim();
  } catch (error) {
    console.error(`[Lichess] Error fetching game ${gameId}:`, error);
    throw error;
  }
}

export interface EloDataPoint {
  date: string;
  rating: number;
  variant: string;
}

export async function fetchLichessEloHistory(username: string): Promise<EloDataPoint[]> {
  const normalized = username.trim().toLowerCase();
  
  try {
    const res = await fetch(
      `https://lichess.org/api/user/${encodeURIComponent(normalized)}/rating-history`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache 1 hour
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const eloData: EloDataPoint[] = [];
    
    // Lichess returns an array of rating history per variant
    for (const variant of data) {
      const variantName = variant.name || "classical";
      if (variant.points && Array.isArray(variant.points)) {
        for (const point of variant.points) {
          if (point.length >= 2) {
            eloData.push({
              date: `${point[0]}-${String(point[1] + 1).padStart(2, '0')}-01`, // Year-month format
              rating: point[3] || 0, // Rating is at index 3
              variant: variantName,
            });
          }
        }
      }
    }
    
    return eloData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error fetching Lichess ELO history:", error);
    return [];
  }
}

