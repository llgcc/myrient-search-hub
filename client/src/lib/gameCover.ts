/**
 * 游戏封面获取工具
 * 使用多个免费的游戏数据库 API 来获取游戏封面
 * 
 * 支持的 API：
 * 1. RAWG.io - 免费游戏数据库 API
 * 2. IGDB (通过 Twitch API) - 需要认证
 * 3. OpenCritic - 游戏评论和封面
 * 
 * 改进功能：
 * - localStorage 持久化缓存
 * - 名称相似度匹配防止错配
 * - 智能降级策略
 */

// 内存缓存（用于快速访问）
const coverCache = new Map<string, string>();

// localStorage 键名
const CACHE_KEY = 'myrient_game_covers';
const CACHE_VERSION = 'v1';

/**
 * 从 localStorage 加载缓存
 */
function loadCacheFromStorage(): void {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.version === CACHE_VERSION) {
        Object.entries(data.cache).forEach(([key, value]) => {
          coverCache.set(key, value as string);
        });
      }
    }
  } catch (error) {
    console.error('Error loading cover cache from localStorage:', error);
  }
}

/**
 * 保存缓存到 localStorage
 */
function saveCacheToStorage(): void {
  try {
    const cache: Record<string, string> = {};
    coverCache.forEach((value, key) => {
      cache[key] = value;
    });
    
    const data = {
      version: CACHE_VERSION,
      cache,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cover cache to localStorage:', error);
  }
}

/**
 * 计算两个字符串的相似度（Levenshtein 距离）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * 计算 Levenshtein 距离
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 清理游戏名称（移除特殊字符和版本信息）
 */
function cleanGameName(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '') // 移除括号内容
    .replace(/\[[^\]]*\]/g, '') // 移除方括号内容
    .replace(/[:\-_]/g, ' ') // 替换特殊字符为空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
    .toLowerCase();
}

/**
 * 从 RAWG API 获取游戏封面（带相似度匹配）
 */
export async function getGameCoverFromRAWG(gameName: string): Promise<string | null> {
  try {
    // 检查缓存
    const cacheKey = `rawg_${gameName}`;
    if (coverCache.has(cacheKey)) {
      return coverCache.get(cacheKey) || null;
    }

    // 清理游戏名称以提高搜索准确度
    const cleanedName = cleanGameName(gameName);

    // RAWG API 端点（无需 API key 的公开端点）
    const response = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(cleanedName)}&page_size=5`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // 找到最匹配的游戏（基于名称相似度）
    let bestMatch = null;
    let bestSimilarity = 0;
    const MIN_SIMILARITY = 0.6; // 最低相似度阈值

    for (const game of data.results) {
      const similarity = calculateSimilarity(cleanedName, cleanGameName(game.name));
      
      if (similarity > bestSimilarity && similarity >= MIN_SIMILARITY) {
        bestSimilarity = similarity;
        bestMatch = game;
      }
    }

    if (bestMatch?.background_image) {
      // 缓存结果
      coverCache.set(cacheKey, bestMatch.background_image);
      saveCacheToStorage();
      return bestMatch.background_image;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from RAWG:', error);
    return null;
  }
}

/**
 * 从 IGDB 获取游戏封面（需要 Twitch API 认证）
 * 这是一个备用方案，但需要后端支持
 */
export async function getGameCoverFromIGDB(gameName: string): Promise<string | null> {
  try {
    const cacheKey = `igdb_${gameName}`;
    if (coverCache.has(cacheKey)) {
      return coverCache.get(cacheKey) || null;
    }

    // 注意：IGDB 需要认证，这里使用后端代理
    // 实际应用中需要配置后端 API 端点
    const response = await fetch(`/api/game-cover?name=${encodeURIComponent(gameName)}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.coverUrl) {
      coverCache.set(cacheKey, data.coverUrl);
      saveCacheToStorage();
      return data.coverUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from IGDB:', error);
    return null;
  }
}

/**
 * 获取游戏封面的主函数
 * 尝试多个 API 源，直到找到有效的封面
 */
export async function getGameCover(gameName: string): Promise<string> {
  try {
    // 首先尝试 RAWG API
    const rawgCover = await getGameCoverFromRAWG(gameName);
    if (rawgCover) {
      return rawgCover;
    }

    // 如果 RAWG 失败，尝试 IGDB
    const igdbCover = await getGameCoverFromIGDB(gameName);
    if (igdbCover) {
      return igdbCover;
    }

    // 如果都失败，返回 placeholder
    return getPlaceholderCover(gameName);
  } catch (error) {
    console.error('Error getting game cover:', error);
    return getPlaceholderCover(gameName);
  }
}

/**
 * 获取 placeholder 封面
 * 使用 placeholder 服务生成带有游戏名称的图片
 */
export function getPlaceholderCover(gameName: string): string {
  // 使用 placeholder.com 生成带有游戏名称的图片
  const shortName = gameName.length > 20 ? gameName.substring(0, 20) + '...' : gameName;
  const encodedName = encodeURIComponent(shortName);
  return `https://via.placeholder.com/300x400/1a1a1a/3b82f6?text=${encodedName}`;
}

/**
 * 预加载游戏封面
 * 在后台加载游戏封面，避免阻塞 UI
 */
export function preloadGameCover(gameName: string): Promise<string> {
  return getGameCover(gameName);
}

/**
 * 批量预加载游戏封面
 * 用于在用户浏览时预加载可见区域的封面
 */
export async function batchPreloadCovers(gameNames: string[], maxConcurrent = 3): Promise<void> {
  const queue = [...gameNames];
  const inProgress: Promise<string>[] = [];

  while (queue.length > 0 || inProgress.length > 0) {
    // 启动新的请求直到达到并发限制
    while (inProgress.length < maxConcurrent && queue.length > 0) {
      const gameName = queue.shift()!;
      const promise = preloadGameCover(gameName);
      inProgress.push(promise);
      
      // 请求完成后从进行中列表移除
      promise.finally(() => {
        const index = inProgress.indexOf(promise);
        if (index > -1) {
          inProgress.splice(index, 1);
        }
      });
    }

    // 等待至少一个请求完成
    if (inProgress.length > 0) {
      await Promise.race(inProgress);
    }
  }
}

/**
 * 清除封面缓存
 */
export function clearCoverCache(): void {
  coverCache.clear();
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cover cache from localStorage:', error);
  }
}

/**
 * 获取缓存大小信息
 */
export function getCacheSizeInfo(): { size: number; entries: number } {
  return {
    size: coverCache.size,
    entries: coverCache.size,
  };
}

/**
 * 导出缓存数据（用于调试）
 */
export function exportCache(): Record<string, string> {
  const cache: Record<string, string> = {};
  coverCache.forEach((value, key) => {
    cache[key] = value;
  });
  return cache;
}

// 初始化时加载缓存
loadCacheFromStorage();
