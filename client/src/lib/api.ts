/**
 * API 工具函数
 * 用于从 Myrient 获取游戏数据
 */

import { Game, parseGameFilename, generateGameId } from "./myrient";

/**
 * 从后端代理获取指定主机的游戏列表
 * 使用后端代理解决 CORS 跨域问题
 */
export async function fetchGamesFromMyrient(consoleName: string): Promise<Game[]> {
  try {
    // 使用后端代理 API
    const response = await fetch(`/api/myrient/games/${encodeURIComponent(consoleName)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const games = await response.json();
    return games;
  } catch (error) {
    console.error("Error fetching games from backend:", error);
    // 返回空数组而不是抛出错误，这样页面不会崩溃
    return [];
  }
}



/**
 * 从后端获取所有主机列表
 */
export async function fetchConsoles(): Promise<any[]> {
  try {
    const response = await fetch('/api/myrient/consoles');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const consoles = await response.json();
    return consoles;
  } catch (error) {
    console.error("Error fetching consoles from backend:", error);
    return [];
  }
}

/**
 * 清除后端缓存
 */
export async function clearBackendCache(): Promise<void> {
  try {
    await fetch('/api/myrient/cache/clear', { method: 'POST' });
  } catch (error) {
    console.error("Error clearing backend cache:", error);
  }
}
