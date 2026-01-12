/**
 * Myrient 代理路由
 * 用于从后端获取 Myrient 网站的真实游戏列表
 */

import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const router = Router();

// 缓存游戏列表，避免频繁请求
const gameListCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 小时

/**
 * 从 Myrient 获取指定主机的游戏列表
 * GET /api/myrient/games/:console
 */
router.get("/games/:console", async (req: Request, res: Response) => {
  try {
    const consoleName = decodeURIComponent(req.params.console);

    // 检查缓存
    const cacheKey = `games_${consoleName}`;
    const cached = gameListCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // 从 Myrient 获取游戏列表
    const games = await fetchGamesFromMyrient(consoleName);

    // 更新缓存
    gameListCache.set(cacheKey, {
      data: games,
      timestamp: Date.now(),
    });

    res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      error: "Failed to fetch games",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * 获取所有主机列表
 * GET /api/myrient/consoles
 */
router.get("/consoles", async (req: Request, res: Response) => {
  try {
    const cacheKey = "consoles";
    const cached = gameListCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // 从 Myrient 获取主机列表
    const consoles = await fetchConsolesFromMyrient();

    // 更新缓存
    gameListCache.set(cacheKey, {
      data: consoles,
      timestamp: Date.now(),
    });

    res.json(consoles);
  } catch (error) {
    console.error("Error fetching consoles:", error);
    res.status(500).json({
      error: "Failed to fetch consoles",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * 清除缓存
 * POST /api/myrient/cache/clear
 */
router.post("/cache/clear", (req: Request, res: Response) => {
  gameListCache.clear();
  res.json({ message: "Cache cleared" });
});

/**
 * 从 Myrient 获取指定主机的游戏列表
 */
async function fetchGamesFromMyrient(consoleName: string): Promise<any[]> {
  const url = `https://myrient.erista.me/files/No-Intro/${encodeURIComponent(
    consoleName
  )}/`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 秒超时

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(html);

    const games: any[] = [];
    const seenNames = new Set<string>();

    // 查找所有 .zip 文件链接
    $("a[href$='.zip']").each((_: any, element: any) => {
      let filename = $(element).attr("href");

      if (!filename) return;

      // 解码 URL 编码的文件名
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        // 如果解码失败，使用原始文件名
      }

      // 跳过已处理的文件
      if (seenNames.has(filename)) return;
      seenNames.add(filename);

      // 解析文件名以获取游戏信息
      const parsed = parseGameFilename(filename);

      const game = {
        id: `${consoleName}__${filename}`.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
        name: parsed.name || filename,
        filename,
        region: parsed.region || "Unknown",
        languages: parsed.languages || ["Unknown"],
        console: consoleName,
        downloadUrl: `${url}${encodeURIComponent(filename)}`,
      };

      games.push(game);
    });

    return games;
  } catch (error) {
    console.error(`Error fetching games from Myrient for ${consoleName}:`, error);
    // 返回空数组而不是抵抗，以便前端不会崩溃
    return [];
  }
}

/**
 * 从 Myrient 获取主机列表
 */
async function fetchConsolesFromMyrient(): Promise<any[]> {
  const url = "https://myrient.erista.me/files/No-Intro/";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 秒超时

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(html);

    const consoles: any[] = [];
    const seenNames = new Set<string>();

    // 查找所有目录链接
    $("a[href$='/']").each((_: any, element: any) => {
      const href = $(element).attr("href");
      const text = $(element).text().trim();

      if (!href || href === "../" || text === "Parent Directory") return;

      // 移除末尾的 /
      const consoleName = href.replace(/\/$/, "");

      if (seenNames.has(consoleName)) return;
      seenNames.add(consoleName);

      const console_obj = {
        id: consoleName.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
        name: consoleName,
        displayName: consoleName.replace(/^Nintendo - /, "")
          .replace(/^Sony - /, "")
          .replace(/^Sega - /, "")
          .replace(/^Atari - /, "")
          .replace(/^Commodore - /, "")
          .replace(/^Coleco - /, ""),
      };

      consoles.push(console_obj);
    });

    return consoles;
  } catch (error) {
    console.error("Error fetching consoles from Myrient:", error);
    // 返回空数组而不是抵抗，以便前端不会崩溃
    return [];
  }
}

/**
 * 解析游戏文件名以提取信息
 */
function parseGameFilename(filename: string): {
  name: string;
  region: string;
  languages: string[];
} {
  // 移除 .zip 扩展名
  const nameWithoutExt = filename.replace(/\.zip$/i, "");

  // 匹配括号内的内容
  const bracketMatches = nameWithoutExt.match(/\(([^)]+)\)/g) || [];

  let gameName = nameWithoutExt;
  let region = "";
  let languages: string[] = [];

  const languageMap: Record<string, string> = {
    En: "English",
    Ja: "Japanese",
    Fr: "French",
    De: "German",
    Es: "Spanish",
    It: "Italian",
    Pt: "Portuguese",
    Nl: "Dutch",
    Sv: "Swedish",
    Da: "Danish",
    Fi: "Finnish",
    No: "Norwegian",
    Pl: "Polish",
    Ru: "Russian",
    Ko: "Korean",
    Zh: "Chinese",
    Cs: "Czech",
    Hu: "Hungarian",
    Tr: "Turkish",
    Ar: "Arabic",
    He: "Hebrew",
  };

  // 地区到语言的映射
  const regionToLanguage: Record<string, string[]> = {
    "USA": ["English"],
    "Europe": ["English", "French", "German", "Spanish", "Italian"],
    "Japan": ["Japanese"],
    "Korea": ["Korean"],
    "China": ["Chinese"],
    "Asia": ["English", "Chinese", "Japanese", "Korean"],
    "World": ["English"],
    "UK": ["English"],
    "Germany": ["German"],
    "France": ["French"],
    "Spain": ["Spanish"],
    "Italy": ["Italian"],
    "Netherlands": ["Dutch"],
    "Sweden": ["Swedish"],
    "Denmark": ["Danish"],
    "Finland": ["Finnish"],
    "Norway": ["Norwegian"],
    "Poland": ["Polish"],
    "Russia": ["Russian"],
    "Brazil": ["Portuguese"],
    "Australia": ["English"],
    "Canada": ["English", "French"],
  };

  if (bracketMatches.length > 0) {
    // 移除所有括号内容来获取游戏名称
    gameName = nameWithoutExt.replace(/\s*\([^)]*\)/g, "").trim();

    // 最后一个括号通常包含语言代码
    const lastBracket = bracketMatches[bracketMatches.length - 1];
    const lastBracketContent = lastBracket.slice(1, -1); // 移除括号

    // 检查是否是语言代码（必须包含逗号或匹配 2 字符的语言代码）
    const isLanguageCode = lastBracketContent.includes(",") || 
      Object.keys(languageMap).some((lang) => {
        // 只匹配完整的语言代码（用逗号或空格分隔）
        const regex = new RegExp(`(^|,|\\s)${lang}($|,|\\s)`);
        return regex.test(lastBracketContent);
      });

    if (isLanguageCode) {
      languages = lastBracketContent.split(",").map((code) => {
        const trimmed = code.trim();
        return languageMap[trimmed] || trimmed;
      });

      // 倒数第二个括号可能是地区信息
      if (bracketMatches.length > 1) {
        region = bracketMatches[bracketMatches.length - 2].slice(1, -1);
      }
    } else {
      // 最后一个括号是地区信息
      region = lastBracketContent;
      if (bracketMatches.length > 1) {
        const secondLastBracket = bracketMatches[bracketMatches.length - 2];
        const secondLastContent = secondLastBracket.slice(1, -1);
        if (
          secondLastContent.includes(",") ||
          Object.keys(languageMap).some((lang) => secondLastContent.includes(lang))
        ) {
          languages = secondLastContent.split(",").map((code) => {
            const trimmed = code.trim();
            return languageMap[trimmed] || trimmed;
          });
        }
      }
    }
  }

  // 如果没有解析到语言，尝试从地区推断
  if (languages.length === 0 && region) {
    const inferredLanguages = regionToLanguage[region];
    if (inferredLanguages) {
      languages = inferredLanguages;
    }
  }

  return {
    name: gameName,
    region: region || "Unknown",
    languages: languages.length > 0 ? languages : ["Unknown"],
  };
}

export default router;
