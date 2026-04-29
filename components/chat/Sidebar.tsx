"use client";

import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, History } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession 
}: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 h-full flex flex-col text-slate-300">
      <div className="p-4">
        <Button 
          onClick={onNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <History size={12} /> Recent Chats
        </div>
        
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              currentSessionId === session.id 
                ? "bg-slate-800 text-white shadow-inner" 
                : "hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className={currentSessionId === session.id ? "text-indigo-400" : "text-slate-500"} />
              <span className="text-sm truncate font-medium">{session.title}</span>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500">Agentic Chat v1.0</p>
      </div>
    </div>
  );
}
