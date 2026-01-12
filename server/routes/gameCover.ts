/**
 * 游戏封面代理路由
 * 用于代理需要认证的游戏封面 API（如 IGDB）
 */

import { Router, Request, Response } from "express";

const router = Router();

// 缓存封面 URL
const coverCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

/**
 * 获取游戏封面
 * GET /api/game-cover?name=GameName
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const gameName = req.query.name as string;

    if (!gameName) {
      return res.status(400).json({ error: "Game name is required" });
    }

    // 检查缓存
    const cacheKey = `cover_${gameName}`;
    const cached = coverCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ coverUrl: cached.url });
    }

    // TODO: 在这里实现 IGDB API 调用
    // 需要先在 Twitch Developer Console 注册应用获取 Client ID 和 Secret
    // https://dev.twitch.tv/console/apps
    
    // 示例实现（需要配置环境变量）:
    /*
    const clientId = process.env.IGDB_CLIENT_ID;
    const accessToken = process.env.IGDB_ACCESS_TOKEN;

    if (!clientId || !accessToken) {
      return res.status(500).json({ 
        error: "IGDB credentials not configured" 
      });
    }

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: `search "${gameName}"; fields name,cover.url; limit 1;`,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.length > 0 && data[0].cover?.url) {
      const coverUrl = data[0].cover.url.replace("t_thumb", "t_cover_big");
      
      // 缓存结果
      coverCache.set(cacheKey, {
        url: coverUrl,
        timestamp: Date.now(),
      });

      return res.json({ coverUrl });
    }
    */

    // 如果没有配置 IGDB，返回 404
    res.status(404).json({ 
      error: "Cover not found",
      message: "IGDB API not configured. Please set IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN environment variables."
    });
  } catch (error) {
    console.error("Error fetching game cover:", error);
    res.status(500).json({
      error: "Failed to fetch game cover",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * 清除封面缓存
 * POST /api/game-cover/cache/clear
 */
router.post("/cache/clear", (req: Request, res: Response) => {
  coverCache.clear();
  res.json({ message: "Cover cache cleared" });
});

export default router;
