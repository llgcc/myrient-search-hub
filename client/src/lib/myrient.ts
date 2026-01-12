/**
 * Myrient 数据处理工具
 * 用于解析游戏文件名、提取语言信息等
 */

export interface Game {
  id: string;
  name: string;
  filename: string;
  region: string;
  languages: string[];
  console: string;
}

export interface Console {
  id: string;
  name: string;
  displayName: string;
}

// 常见主机列表（从 Myrient No-Intro 集合中提取）
export const CONSOLES: Console[] = [
  { id: "nintendo-gba", name: "Nintendo - Game Boy Advance", displayName: "Game Boy Advance" },
  { id: "nintendo-gbc", name: "Nintendo - Game Boy Color", displayName: "Game Boy Color" },
  { id: "nintendo-gb", name: "Nintendo - Game Boy", displayName: "Game Boy" },
  { id: "nintendo-n64", name: "Nintendo - Nintendo 64", displayName: "Nintendo 64" },
  { id: "nintendo-snes", name: "Nintendo - Super Nintendo Entertainment System", displayName: "SNES" },
  { id: "nintendo-nes", name: "Nintendo - Nintendo Entertainment System", displayName: "NES" },
  { id: "nintendo-3ds", name: "Nintendo - Nintendo 3DS", displayName: "Nintendo 3DS" },
  { id: "nintendo-ds", name: "Nintendo - Nintendo DS", displayName: "Nintendo DS" },
  { id: "nintendo-switch", name: "Nintendo - Nintendo Switch", displayName: "Nintendo Switch" },
  { id: "sony-ps1", name: "Sony - PlayStation", displayName: "PlayStation 1" },
  { id: "sony-ps2", name: "Sony - PlayStation 2", displayName: "PlayStation 2" },
  { id: "sony-psp", name: "Sony - PlayStation Portable", displayName: "PlayStation Portable" },
  { id: "sega-genesis", name: "Sega - Mega Drive / Genesis", displayName: "Mega Drive / Genesis" },
  { id: "sega-dreamcast", name: "Sega - Dreamcast", displayName: "Dreamcast" },
  { id: "sega-saturn", name: "Sega - Saturn", displayName: "Saturn" },
  { id: "atari-2600", name: "Atari - Atari 2600", displayName: "Atari 2600" },
  { id: "atari-7800", name: "Atari - Atari 7800 (BIN)", displayName: "Atari 7800" },
  { id: "commodore-64", name: "Commodore - Commodore 64", displayName: "Commodore 64" },
  { id: "coleco-vision", name: "Coleco - ColecoVision", displayName: "ColecoVision" },
  { id: "arcade-mame", name: "MAME", displayName: "Arcade (MAME)" },
];

// 语言代码映射
const LANGUAGE_MAP: Record<string, string> = {
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
  Ar: "Arabic",
  Tr: "Turkish",
  Cs: "Czech",
  Hu: "Hungarian",
  Ro: "Romanian",
  Th: "Thai",
  El: "Greek",
  He: "Hebrew",
};

// 地区到语言的映射
const REGION_TO_LANGUAGE: Record<string, string[]> = {
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

/**
 * 从文件名中提取游戏信息
 * 例如: "007 - Everything or Nothing (USA, Europe) (En,Fr,De).zip"
 * 返回: { name: "007 - Everything or Nothing", region: "USA, Europe", languages: ["English", "French", "German"] }
 */
export function parseGameFilename(filename: string): Partial<Game> {
  // 移除 .zip 扩展名
  const nameWithoutExt = filename.replace(/\.zip$/i, "");

  // 匹配括号内的内容
  const bracketMatches = nameWithoutExt.match(/\(([^)]+)\)/g) || [];

  let gameName = nameWithoutExt;
  let region = "";
  let languages: string[] = [];

  if (bracketMatches.length > 0) {
    // 移除所有括号内容来获取游戏名称
    gameName = nameWithoutExt.replace(/\s*\([^)]*\)/g, "").trim();

    // 最后一个括号通常包含语言代码
    const lastBracket = bracketMatches[bracketMatches.length - 1];
    const lastBracketContent = lastBracket.slice(1, -1); // 移除括号

    // 检查是否是语言代码（包含逗号或已知的语言代码）
    if (lastBracketContent.includes(",") || Object.keys(LANGUAGE_MAP).some(lang => lastBracketContent.includes(lang))) {
      languages = lastBracketContent.split(",").map(code => {
        const trimmed = code.trim();
        return LANGUAGE_MAP[trimmed] || trimmed;
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
        if (secondLastContent.includes(",") || Object.keys(LANGUAGE_MAP).some(lang => secondLastContent.includes(lang))) {
          languages = secondLastContent.split(",").map(code => {
            const trimmed = code.trim();
            return LANGUAGE_MAP[trimmed] || trimmed;
          });
        }
      }
    }
  }

  // 如果没有解析到语言，尝试从地区推断
  if (languages.length === 0 && region) {
    // 尝试匹配地区名称（支持部分匹配）
    const regionKey = Object.keys(REGION_TO_LANGUAGE).find(key => 
      region.includes(key) || key.includes(region)
    );
    
    if (regionKey) {
      languages = REGION_TO_LANGUAGE[regionKey];
    }
  }

  return {
    name: gameName,
    region: region || "Unknown",
    languages: languages.length > 0 ? languages : ["Unknown"],
  };
}

/**
 * 获取游戏的 Myrient 直链
 */
export function getMyrientUrl(consoleName: string, filename: string): string {
  const encodedConsoleName = encodeURIComponent(consoleName);
  const encodedFilename = encodeURIComponent(filename);
  return `https://myrient.erista.me/files/No-Intro/${encodedConsoleName}/${encodedFilename}`;
}

/**
 * 从 IGDB 或其他来源获取游戏封面（这里使用 placeholder）
 * 实际应用中应该集成真实的 API
 */
export function getGameCoverUrl(gameName: string): string {
  // 使用 placeholder 图片服务
  const encodedName = encodeURIComponent(gameName);
  return `https://via.placeholder.com/300x400?text=${encodedName}`;
}

/**
 * 从游戏名称生成唯一 ID
 */
export function generateGameId(consoleName: string, filename: string): string {
  return `${consoleName}__${filename}`.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
