/**
 * Home 页面
 * Myrient 检索页面的主页面
 * 
 * 设计特点：
 * - 两列布局：左侧主机分类导航 + 右侧游戏内容
 * - 顶部搜索栏
 * - 游戏卡片网格展示
 * - 实时搜索和过滤
 * - 支持切换真实数据和模拟数据
 */

import { useState, useMemo } from "react";
import { CONSOLES, Console } from "@/lib/myrient";
import { useMockGames } from "@/hooks/useMockGames";
import { useRealGames } from "@/hooks/useRealGames";
import ConsoleSidebar from "@/components/ConsoleSidebar";
import GameCard from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, Database } from "lucide-react";

export default function Home() {
  const [selectedConsole, setSelectedConsole] = useState<Console | null>(CONSOLES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [useRealData, setUseRealData] = useState(false); // 默认使用模拟数据

  // 根据开关选择使用真实数据还是模拟数据
  const { games: mockGames, loading: mockLoading } = useMockGames(
    useRealData ? null : selectedConsole?.name || null
  );
  const { games: realGames, loading: realLoading, error: realError, retry: retryReal } = useRealGames(
    useRealData ? selectedConsole?.name || null : null
  );

  const games = useRealData ? realGames : mockGames;
  const loading = useRealData ? realLoading : mockLoading;
  const error = useRealData ? realError : null;

  // 过滤游戏列表
  const filteredGames = useMemo(() => {
    if (!searchQuery) return games;

    const query = searchQuery.toLowerCase();
    return games.filter(
      (game) =>
        game.name.toLowerCase().includes(query) ||
        game.region.toLowerCase().includes(query) ||
        game.languages.some((lang) => lang.toLowerCase().includes(query))
    );
  }, [games, searchQuery]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 侧栏 */}
      <ConsoleSidebar
        selectedConsole={selectedConsole}
        onSelectConsole={setSelectedConsole}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        {/* 顶部搜索栏 */}
        <div className="border-b border-border bg-card p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">
                Myrient 游戏检索
              </h1>
              {/* 数据源切换按钮 */}
              <div className="flex items-center gap-2">
                <Database size={16} className="text-muted-foreground" />
                <button
                  onClick={() => setUseRealData(!useRealData)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    useRealData
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {useRealData ? "真实数据" : "模拟数据"}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="搜索游戏名称、地区或语言..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {selectedConsole && (
                <div className="hidden sm:flex items-center px-4 py-2 bg-secondary rounded-lg text-sm text-secondary-foreground">
                  {selectedConsole.displayName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 游戏列表区域 */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive mb-6">
                <AlertCircle size={20} />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryReal}
                  className="ml-2"
                >
                  重试
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-muted-foreground">
                  {useRealData ? "从 Myrient 加载游戏列表中..." : "加载游戏列表中..."}
                </p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "未找到匹配的游戏" : "暂无游戏数据"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    清除搜索
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* 结果计数 */}
                <p className="text-sm text-muted-foreground mb-4">
                  找到 <span className="font-semibold text-foreground">{filteredGames.length}</span> 个游戏
                </p>

                {/* 游戏卡片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
