"use client";

import { Wrench, Check, X, Mail } from "lucide-react";
import { WeatherCard, WeatherSkeleton } from "./WeatherCard";
import { Button } from "@/components/ui/button";

interface ToolRendererProps {
  toolInvocation: {
    toolName: string;
    toolCallId: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
  addToolResult: (args: { tool: string; toolCallId: string; output: Record<string, unknown> }) => Promise<void>;
}

export function ToolRenderer({ toolInvocation, addToolResult }: ToolRendererProps) {
  const { toolName, toolCallId } = toolInvocation;
  const isCompleted = "result" in toolInvocation;
  const result = isCompleted ? toolInvocation.result : null;

  // 1. 如果工具是 send_email 且尚未确认 (HITL)
  if (!isCompleted && toolName === "send_email") {
    return (
      <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 my-2 shadow-sm animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2 font-bold text-amber-700 mb-3">
          <Mail size={18} />
          <span>确认发送邮件?</span>
        </div>
        
        <div className="bg-white/80 border border-amber-100 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex gap-2 text-xs">
            <span className="font-bold text-slate-400 w-12 shrink-0">收件人:</span>
            <span className="text-slate-700 font-mono">{String(toolInvocation.args.to)}</span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="font-bold text-slate-400 w-12 shrink-0">主题:</span>
            <span className="text-slate-700">{String(toolInvocation.args.subject)}</span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="font-bold text-slate-400 w-12 shrink-0">正文:</span>
            <span className="text-slate-700 line-clamp-2">{String(toolInvocation.args.body)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            onClick={() => addToolResult({ tool: toolName, toolCallId, output: { confirmed: true, status: "sent" } })}
          >
            <Check size={14} className="mr-1" /> 确认发送
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-slate-200 text-slate-600 flex-1 hover:bg-slate-100"
            onClick={() => addToolResult({ tool: toolName, toolCallId, output: { confirmed: false, status: "cancelled" } })}
          >
            <X size={14} className="mr-1" /> 取消
          </Button>
        </div>
      </div>
    );
  }

  // 2. 如果工具正在执行中，展示对应工具的骨架屏 (Weather)
  if (!isCompleted && toolName === "weather") {
    return <WeatherSkeleton />;
  }

  // 2. 如果工具已完成执行，且有专门的 UI 组件
  if (isCompleted && result) {
    switch (toolName) {
      case "weather":
        return (
          <div className="my-2">
            <WeatherCard 
              location={result.location || result.city} 
              temperature={Number(result.temperature)} 
              condition={String(result.condition)} 
            />
          </div>
        );
      
      // 后续可以在这里增加更多工具，如：
      // case "stock": return <StockChart data={result} />;
    }
  }

  // 2. 默认的通用工具显示（执行中或无专门组件）
  return (
    <div 
      key={toolCallId} 
      className={`border rounded-xl p-4 text-sm transition-all shadow-sm my-2 ${
        isCompleted ? "bg-slate-50/50 border-slate-200" : "bg-indigo-50/30 border-indigo-100 animate-pulse"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <div className={`p-1.5 rounded-lg ${isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"}`}>
            <Wrench size={14} />
          </div>
          <span>调用工具: <span className="font-mono text-indigo-600">{toolName}</span></span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tight ${
          isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
        }`}>
          {isCompleted ? "已完成" : "执行中"}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">输入参数</span>
          <pre className="bg-white/80 p-2.5 rounded-lg border border-slate-100 text-xs font-mono text-slate-600 overflow-x-auto">
            {JSON.stringify(toolInvocation.args, null, 2)}
          </pre>
        </div>
        
        {isCompleted && (
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">返回结果</span>
            <pre className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 text-xs font-mono text-emerald-800 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
