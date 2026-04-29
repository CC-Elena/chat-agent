"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Sidebar } from "@/components/chat/Sidebar";
import { v4 as uuidv4 } from "uuid";
import { Menu } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewChat = useCallback(() => {
    setSessions((currentSessions) => {
      const newSession = {
        id: uuidv4(),
        title: "New Chat " + (currentSessions.length + 1),
        date: new Date().toISOString(),
      };

      setCurrentSessionId(newSession.id);
      return [newSession, ...currentSessions];
    });
  }, []);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chat-sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
      handleNewChat();
    }
  }, [handleNewChat]);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      handleNewChat();
    }
  };

  return (
    <main className="flex h-screen bg-slate-100 relative overflow-hidden">
      {/* Sidebar - Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsSidebarOpen(false)} />
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => {
            setCurrentSessionId(id);
            setIsSidebarOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setIsSidebarOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden relative">
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-md md:hidden z-30"
        >
          <Menu size={20} />
        </button>

        {currentSessionId && <ChatWindow key={currentSessionId} id={currentSessionId} />}
      </div>
    </main>
  );
}
