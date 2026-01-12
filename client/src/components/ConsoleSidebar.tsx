/**
 * ConsoleSidebar 组件
 * 显示主机分类列表，支持选择和过滤
 * 
 * 设计特点：
 * - 左侧固定宽度（240px）
 * - 深色背景
 * - 选中项高亮显示
 * - 响应式设计，移动设备下可收起
 */

import { CONSOLES, Console } from "@/lib/myrient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface ConsoleSidebarProps {
  selectedConsole: Console | null;
  onSelectConsole: (console: Console) => void;
}

export default function ConsoleSidebar({
  selectedConsole,
  onSelectConsole,
}: ConsoleSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* 移动设备菜单按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <ChevronRight size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* 侧栏背景遮罩（移动设备） */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 侧栏 */}
      <div
        className={`fixed md:static left-0 top-0 h-screen md:h-auto w-64 md:w-60 bg-sidebar border-r border-sidebar-border z-30 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {/* 标题 */}
            <div className="px-2 py-3 mb-4">
              <h2 className="text-lg font-bold text-sidebar-foreground">
                主机分类
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                选择一个主机系统
              </p>
            </div>

            {/* 主机列表 */}
            {CONSOLES.map((console) => (
              <Button
                key={console.id}
                onClick={() => {
                  onSelectConsole(console);
                  setIsOpen(false); // 移动设备下选择后关闭侧栏
                }}
                variant={selectedConsole?.id === console.id ? "default" : "ghost"}
                className={`w-full justify-start text-left h-auto py-2 px-3 text-sm transition-all ${
                  selectedConsole?.id === console.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="truncate">{console.displayName}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
