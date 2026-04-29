/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ToolRenderer } from "./tools/ToolRenderer";
import { motion, AnimatePresence } from "framer-motion";

export function ChatWindow({ id }: { id: string }) {
  const [modelId, setModelId] = useState("deepseek-chat");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant with tool-calling capabilities.");
  const [isSettingsOpen] = useState(false);

  // @ai-sdk/react v3+ useChat
  const { messages, sendMessage, status, addToolResult } = useChat({
    id,
    api: "/api/chat",
    body: {
      data: { modelId, systemPrompt }
    }
  } as any);

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
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

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-slate-50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">System Prompt</label>
                <textarea 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full h-24 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-700 font-mono"
                  placeholder="Define how the AI should behave..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="flex flex-col gap-6 p-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4 mt-20"
              >
                <Bot className="w-16 h-16 text-indigo-200" />
                <p className="text-slate-500">Send a message to start testing the Agent&apos;s capabilities.</p>
              </motion.div>
            )}

            {messages.map((m: any, index: number) => (
              <motion.div 
                key={m.id || index} 
                initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-700 border"}`}>
                    {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    {/* Tool Invocations Visibility */}
                    {m.toolInvocations && m.toolInvocations.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {m.toolInvocations.map((toolInvocation: any) => (
                          <ToolRenderer 
                            key={toolInvocation.toolCallId} 
                            toolInvocation={toolInvocation} 
                            addToolResult={addToolResult}
                          />
                        ))}
                      </div>
                    )}

                    {/* Reasoning / CoT Content */}
                    {(m as any).reasoning && (
                      <div className="mb-2">
                        <details className="group border border-slate-100 bg-slate-50/50 rounded-xl overflow-hidden">
                          <summary className="flex items-center gap-2 p-3 text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                            <div className="w-5 h-5 rounded-full bg-slate-200/50 flex items-center justify-center group-open:rotate-180 transition-transform">
                              <span className="text-[10px]">▼</span>
                            </div>
                            查看推理过程 (Chain of Thought)
                          </summary>
                          <div className="px-4 pb-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3 font-mono italic">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {(m as any).reasoning}
                            </ReactMarkdown>
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Text Content */}
                    {m.content && (
                      <div className={`px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-sm" : "bg-white border text-slate-700 rounded-2xl rounded-tl-sm shadow-sm"}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : "text-slate-700"}`}
                          components={{
                            code({ inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-md my-2"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-slate-500 shrink-0">
                  <Bot size={16} className="animate-spin-slow" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="px-4 py-3 bg-white border rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm text-slate-400 italic text-sm">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    Agent 正在思考并执行任务...
                  </div>
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
