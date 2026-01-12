/**
 * GameCard 组件
 * 显示单个游戏的卡片，包含封面、名称、地区和语言信息
 * 
 * 设计特点：
 * - 深色背景卡片（oklch(0.14 0.01 286)）
 * - 8px 圆角
 * - 悬停时上升效果和阴影增强
 * - 语言标签采用小型徽章设计
 */

import { Game, getMyrientUrl } from "@/lib/myrient";
import { getGameCover } from "@/lib/gameCover";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(true);

  const downloadUrl = getMyrientUrl(game.console, game.filename);

  // 加载游戏封面
  useEffect(() => {
    const loadCover = async () => {
      setLoadingCover(true);
      try {
        const url = await getGameCover(game.name);
        setCoverUrl(url);
      } catch (error) {
        console.error("Error loading cover:", error);
        setCoverUrl(null);
      } finally {
        setLoadingCover(false);
      }
    };

    loadCover();
  }, [game.name]);

  const displayImageUrl = imageError || !coverUrl 
    ? `https://via.placeholder.com/300x400/1a1a1a/3b82f6?text=${encodeURIComponent(game.name)}`
    : coverUrl;

  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      <div className="h-full bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer">
        {/* 游戏封面 */}
        <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden">
          {loadingCover && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={displayImageUrl}
            alt={game.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* 悬停时显示下载按钮 */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <ExternalLink size={16} />
              Download
            </div>
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="p-3 flex flex-col gap-2">
          {/* 游戏名称 */}
          <h3 className="font-medium text-card-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {game.name}
          </h3>

          {/* 地区信息 */}
          {game.region && (
            <p className="text-xs text-muted-foreground">
              {game.region}
            </p>
          )}

          {/* 语言标签 */}
          <div className="flex flex-wrap gap-1">
            {game.languages.map((lang, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs py-0.5 px-1.5 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {lang.substring(0, 2)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}
