/**
 * useGames Hook
 * 用于管理游戏数据的获取和缓存
 */

import { useState, useEffect, useCallback } from "react";
import { Game } from "@/lib/myrient";
import { fetchGamesFromMyrient } from "@/lib/api";

interface UseGamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// 简单的缓存机制
const gameCache = new Map<string, Game[]>();
const cacheTTL = 5 * 60 * 1000; // 5 分钟
const cacheTimestamps = new Map<string, number>();

export function useGames(consoleName: string | null): UseGamesState {
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

    try {
      // 检查缓存
      const cached = gameCache.get(consoleName);
      const cacheTime = cacheTimestamps.get(consoleName);

      if (cached && cacheTime && Date.now() - cacheTime < cacheTTL) {
        setGames(cached);
        setLoading(false);
        return;
      }

      // 从 Myrient 获取数据
      const fetchedGames = await fetchGamesFromMyrient(consoleName);

      // 更新缓存
      gameCache.set(consoleName, fetchedGames);
      cacheTimestamps.set(consoleName, Date.now());

      setGames(fetchedGames);
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
