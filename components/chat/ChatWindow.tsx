/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Wrench } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function ChatWindow() {
  const [modelId, setModelId] = useState("deepseek-chat");

  // @ai-sdk/react v3+ useChat
  const { messages, sendMessage, status } = useChat({
    api: "/api/chat",
    body: {
      data: { modelId }
    }
  } as any);

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    // sendMessage uses { text: string } format in newer versions
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <Card className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto shadow-xl bg-white border-0">
      {/* Header */}
      <div className="border-b p-4 bg-slate-50/50 rounded-t-xl flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Bot className="w-6 h-6 text-indigo-500" />
            Agentic Chat MVP
          </h2>
          <p className="text-sm text-slate-500">Capable of invoking weather and search tools.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Model:</span>
          <select 
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 shadow-sm"
            disabled={isLoading}
          >
            <optgroup label="DeepSeek">
              <option value="deepseek-chat">DeepSeek V3 (Chat)</option>
              <option value="deepseek-reasoner">DeepSeek R1 (Reasoner)</option>
            </optgroup>
            <optgroup label="Aliyun DashScope">
              <option value="qwen-turbo">Qwen Turbo</option>
              <option value="qwen-max">Qwen Max</option>
            </optgroup>
            <optgroup label="NVIDIA NIM">
              <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B</option>
              <option value="nvidia/llama-3.1-nemotron-70b-instruct">Llama 3.1 Nemotron 70B</option>
              <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="flex flex-col gap-6 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 mt-20">
              <Bot className="w-16 h-16 text-indigo-200" />
              <p className="text-slate-500">Send a message to start testing the Agent&apos;s capabilities.</p>
            </div>
          )}

          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-700 border"}`}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  {/* Tool Invocations Visibility */}
                  {m.toolInvocations && m.toolInvocations.length > 0 && (
                    <div className="flex flex-col gap-2 mb-1">
                      {m.toolInvocations.map((toolInvocation: any) => {
                        const toolCallId = toolInvocation.toolCallId;
                        const isCompleted = "result" in toolInvocation;

                        return (
                          <div key={toolCallId} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <Wrench size={14} className={isCompleted ? "text-emerald-500" : "text-amber-500 animate-pulse"} />
                              Tool Executing: <span className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">{toolInvocation.toolName}</span>
                            </div>
                            <div className="bg-white p-2 rounded border text-xs font-mono overflow-x-auto text-slate-500">
                              Input: {JSON.stringify(toolInvocation.args)}
                            </div>
                            {isCompleted && (
                              <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100 text-xs font-mono overflow-x-auto text-emerald-700 mt-1">
                                Output: {JSON.stringify(toolInvocation.result)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Content */}
                  {m.content && (
                    <div className={`px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-sm" : "bg-white border text-slate-700 rounded-2xl rounded-tl-sm shadow-sm"}`}>
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-slate-500 shrink-0">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 bg-white border rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm h-[46px]">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-slate-50/50 rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Send a message... (try asking about Beijing weather)"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-700"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all px-6"
          >
            <Send size={18} className="mr-2" />
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
