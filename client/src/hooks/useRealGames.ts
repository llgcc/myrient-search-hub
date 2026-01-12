/**
 * useRealGames Hook
 * 从后端 API 获取真实的 Myrient 游戏数据
 */

import { useState, useEffect, useCallback } from "react";
import { Game } from "@/lib/myrient";

interface UseRealGamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// 简单的缓存机制
const gameCache = new Map<string, Game[]>();
const cacheTTL = 30 * 60 * 1000; // 30 分钟
const cacheTimestamps = new Map<string, number>();

export function useRealGames(consoleName: string | null): UseRealGamesState {
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

      // 从后端 API 获取数据
      const response = await fetch(
        `/api/myrient/games/${encodeURIComponent(consoleName)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API 返回的不是 JSON 数据');
      }

      const fetchedGames = await response.json();

      // 更新缓存
      gameCache.set(consoleName, fetchedGames);
      cacheTimestamps.set(consoleName, Date.now());

      setGames(fetchedGames);
    } catch (err) {
      console.error('Error fetching games:', err);
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
