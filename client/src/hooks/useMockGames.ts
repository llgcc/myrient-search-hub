/**
 * useMockGames Hook
 * 提供模拟游戏数据用于演示
 * 这是一个临时的解决方案，实际应用中应该使用真实的 Myrient 数据
 */

import { useState, useEffect, useCallback } from "react";
import { Game, generateGameId } from "@/lib/myrient";

interface UseMockGamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// 模拟游戏数据库
const MOCK_GAMES_DB: Record<string, Game[]> = {
  "Nintendo - Game Boy Advance": [
    { id: generateGameId("Nintendo - Game Boy Advance", "Pokemon - Ruby (USA).zip"), name: "Pokemon - Ruby", filename: "Pokemon - Ruby (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Pokemon - Sapphire (USA).zip"), name: "Pokemon - Sapphire", filename: "Pokemon - Sapphire (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "The Legend of Zelda - The Minish Cap (USA).zip"), name: "The Legend of Zelda - The Minish Cap", filename: "The Legend of Zelda - The Minish Cap (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Fire Emblem (USA).zip"), name: "Fire Emblem", filename: "Fire Emblem (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Advance Wars (USA).zip"), name: "Advance Wars", filename: "Advance Wars (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Kirby - Nightmare in Dream Land (USA).zip"), name: "Kirby - Nightmare in Dream Land", filename: "Kirby - Nightmare in Dream Land (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Metroid - Zero Mission (USA).zip"), name: "Metroid - Zero Mission", filename: "Metroid - Zero Mission (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
    { id: generateGameId("Nintendo - Game Boy Advance", "Mario Kart - Super Circuit (USA).zip"), name: "Mario Kart - Super Circuit", filename: "Mario Kart - Super Circuit (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Advance" },
  ],
  "Nintendo - Game Boy Color": [
    { id: generateGameId("Nintendo - Game Boy Color", "Pokemon - Gold (USA).zip"), name: "Pokemon - Gold", filename: "Pokemon - Gold (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Color" },
    { id: generateGameId("Nintendo - Game Boy Color", "Pokemon - Silver (USA).zip"), name: "Pokemon - Silver", filename: "Pokemon - Silver (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Color" },
    { id: generateGameId("Nintendo - Game Boy Color", "The Legend of Zelda - Link's Awakening (USA).zip"), name: "The Legend of Zelda - Link's Awakening", filename: "The Legend of Zelda - Link's Awakening (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Color" },
    { id: generateGameId("Nintendo - Game Boy Color", "Donkey Kong Land (USA).zip"), name: "Donkey Kong Land", filename: "Donkey Kong Land (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy Color" },
  ],
  "Nintendo - Game Boy": [
    { id: generateGameId("Nintendo - Game Boy", "Pokemon - Red (USA).zip"), name: "Pokemon - Red", filename: "Pokemon - Red (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy" },
    { id: generateGameId("Nintendo - Game Boy", "Pokemon - Blue (USA).zip"), name: "Pokemon - Blue", filename: "Pokemon - Blue (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy" },
    { id: generateGameId("Nintendo - Game Boy", "Tetris (USA).zip"), name: "Tetris", filename: "Tetris (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Game Boy" },
  ],
  "Nintendo - Nintendo 64": [
    { id: generateGameId("Nintendo - Nintendo 64", "Super Mario 64 (USA).zip"), name: "Super Mario 64", filename: "Super Mario 64 (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 64" },
    { id: generateGameId("Nintendo - Nintendo 64", "The Legend of Zelda - Ocarina of Time (USA).zip"), name: "The Legend of Zelda - Ocarina of Time", filename: "The Legend of Zelda - Ocarina of Time (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 64" },
    { id: generateGameId("Nintendo - Nintendo 64", "Mario Kart 64 (USA).zip"), name: "Mario Kart 64", filename: "Mario Kart 64 (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 64" },
    { id: generateGameId("Nintendo - Nintendo 64", "GoldenEye 007 (USA).zip"), name: "GoldenEye 007", filename: "GoldenEye 007 (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 64" },
  ],
  "Nintendo - Super Nintendo Entertainment System": [
    { id: generateGameId("Nintendo - Super Nintendo Entertainment System", "Super Mario World (USA).zip"), name: "Super Mario World", filename: "Super Mario World (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Super Nintendo Entertainment System" },
    { id: generateGameId("Nintendo - Super Nintendo Entertainment System", "The Legend of Zelda - A Link to the Past (USA).zip"), name: "The Legend of Zelda - A Link to the Past", filename: "The Legend of Zelda - A Link to the Past (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Super Nintendo Entertainment System" },
    { id: generateGameId("Nintendo - Super Nintendo Entertainment System", "Final Fantasy III (USA).zip"), name: "Final Fantasy III", filename: "Final Fantasy III (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Super Nintendo Entertainment System" },
  ],
  "Nintendo - Nintendo Entertainment System": [
    { id: generateGameId("Nintendo - Nintendo Entertainment System", "Super Mario Bros. (USA).zip"), name: "Super Mario Bros.", filename: "Super Mario Bros. (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo Entertainment System" },
    { id: generateGameId("Nintendo - Nintendo Entertainment System", "The Legend of Zelda (USA).zip"), name: "The Legend of Zelda", filename: "The Legend of Zelda (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo Entertainment System" },
    { id: generateGameId("Nintendo - Nintendo Entertainment System", "Donkey Kong (USA).zip"), name: "Donkey Kong", filename: "Donkey Kong (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo Entertainment System" },
  ],
  "Nintendo - Nintendo 3DS": [
    { id: generateGameId("Nintendo - Nintendo 3DS", "Pokemon - X (USA).zip"), name: "Pokemon - X", filename: "Pokemon - X (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 3DS" },
    { id: generateGameId("Nintendo - Nintendo 3DS", "The Legend of Zelda - Ocarina of Time 3D (USA).zip"), name: "The Legend of Zelda - Ocarina of Time 3D", filename: "The Legend of Zelda - Ocarina of Time 3D (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo 3DS" },
  ],
  "Nintendo - Nintendo DS": [
    { id: generateGameId("Nintendo - Nintendo DS", "Pokemon - Diamond (USA).zip"), name: "Pokemon - Diamond", filename: "Pokemon - Diamond (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo DS" },
    { id: generateGameId("Nintendo - Nintendo DS", "New Super Mario Bros. (USA).zip"), name: "New Super Mario Bros.", filename: "New Super Mario Bros. (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo DS" },
  ],
  "Nintendo - Nintendo Switch": [
    { id: generateGameId("Nintendo - Nintendo Switch", "The Legend of Zelda - Breath of the Wild (USA).zip"), name: "The Legend of Zelda - Breath of the Wild", filename: "The Legend of Zelda - Breath of the Wild (USA).zip", region: "USA", languages: ["English"], console: "Nintendo - Nintendo Switch" },
  ],
  "Sony - PlayStation": [
    { id: generateGameId("Sony - PlayStation", "Final Fantasy VII (USA).zip"), name: "Final Fantasy VII", filename: "Final Fantasy VII (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation" },
    { id: generateGameId("Sony - PlayStation", "Metal Gear Solid (USA).zip"), name: "Metal Gear Solid", filename: "Metal Gear Solid (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation" },
    { id: generateGameId("Sony - PlayStation", "Resident Evil (USA).zip"), name: "Resident Evil", filename: "Resident Evil (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation" },
  ],
  "Sony - PlayStation 2": [
    { id: generateGameId("Sony - PlayStation 2", "Grand Theft Auto III (USA).zip"), name: "Grand Theft Auto III", filename: "Grand Theft Auto III (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation 2" },
    { id: generateGameId("Sony - PlayStation 2", "Metal Gear Solid 2 - Sons of Liberty (USA).zip"), name: "Metal Gear Solid 2 - Sons of Liberty", filename: "Metal Gear Solid 2 - Sons of Liberty (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation 2" },
    { id: generateGameId("Sony - PlayStation 2", "Final Fantasy X (USA).zip"), name: "Final Fantasy X", filename: "Final Fantasy X (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation 2" },
  ],
  "Sony - PlayStation Portable": [
    { id: generateGameId("Sony - PlayStation Portable", "Grand Theft Auto - Liberty City Stories (USA).zip"), name: "Grand Theft Auto - Liberty City Stories", filename: "Grand Theft Auto - Liberty City Stories (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation Portable" },
    { id: generateGameId("Sony - PlayStation Portable", "Monster Hunter Freedom (USA).zip"), name: "Monster Hunter Freedom", filename: "Monster Hunter Freedom (USA).zip", region: "USA", languages: ["English"], console: "Sony - PlayStation Portable" },
  ],
  "Sega - Mega Drive / Genesis": [
    { id: generateGameId("Sega - Mega Drive / Genesis", "Sonic the Hedgehog (USA).zip"), name: "Sonic the Hedgehog", filename: "Sonic the Hedgehog (USA).zip", region: "USA", languages: ["English"], console: "Sega - Mega Drive / Genesis" },
    { id: generateGameId("Sega - Mega Drive / Genesis", "Sonic the Hedgehog 2 (USA).zip"), name: "Sonic the Hedgehog 2", filename: "Sonic the Hedgehog 2 (USA).zip", region: "USA", languages: ["English"], console: "Sega - Mega Drive / Genesis" },
  ],
  "Sega - Dreamcast": [
    { id: generateGameId("Sega - Dreamcast", "Shenmue (USA).zip"), name: "Shenmue", filename: "Shenmue (USA).zip", region: "USA", languages: ["English"], console: "Sega - Dreamcast" },
    { id: generateGameId("Sega - Dreamcast", "Jet Grind Radio (USA).zip"), name: "Jet Grind Radio", filename: "Jet Grind Radio (USA).zip", region: "USA", languages: ["English"], console: "Sega - Dreamcast" },
  ],
  "Sega - Saturn": [
    { id: generateGameId("Sega - Saturn", "Panzer Dragoon (USA).zip"), name: "Panzer Dragoon", filename: "Panzer Dragoon (USA).zip", region: "USA", languages: ["English"], console: "Sega - Saturn" },
  ],
  "Atari - Atari 2600": [
    { id: generateGameId("Atari - Atari 2600", "Pac-Man (USA).zip"), name: "Pac-Man", filename: "Pac-Man (USA).zip", region: "USA", languages: ["English"], console: "Atari - Atari 2600" },
    { id: generateGameId("Atari - Atari 2600", "Space Invaders (USA).zip"), name: "Space Invaders", filename: "Space Invaders (USA).zip", region: "USA", languages: ["English"], console: "Atari - Atari 2600" },
  ],
  "Commodore - Commodore 64": [
    { id: generateGameId("Commodore - Commodore 64", "The Last Ninja (USA).zip"), name: "The Last Ninja", filename: "The Last Ninja (USA).zip", region: "USA", languages: ["English"], console: "Commodore - Commodore 64" },
  ],
  "Coleco - ColecoVision": [
    { id: generateGameId("Coleco - ColecoVision", "Donkey Kong (USA).zip"), name: "Donkey Kong", filename: "Donkey Kong (USA).zip", region: "USA", languages: ["English"], console: "Coleco - ColecoVision" },
  ],
  "MAME": [
    { id: generateGameId("MAME", "Street Fighter II (World).zip"), name: "Street Fighter II", filename: "Street Fighter II (World).zip", region: "World", languages: ["English"], console: "MAME" },
    { id: generateGameId("MAME", "Pac-Man (USA).zip"), name: "Pac-Man", filename: "Pac-Man (USA).zip", region: "USA", languages: ["English"], console: "MAME" },
  ],
};

export function useMockGames(consoleName: string | null): UseMockGamesState {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!consoleName) {
      setGames([]);
      return;
    }

    setLoading(true);
    setError(null);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const mockGames = MOCK_GAMES_DB[consoleName] || [];
      setGames(mockGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [consoleName]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    retry: fetchGames,
  };
}
