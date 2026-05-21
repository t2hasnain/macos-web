// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Sparkles, Send, Bot, User, MessageSquare, Plus, Compass, Settings, AlertCircle, Compass as SparkIcon } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function GeminiApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Gemini, your local AI collaborator. I am loaded in standalone container mode because modern browsers block direct iframe embedding of `gemini.google.com` due to Clickjacking security headers (X-Frame-Options).\n\nYou can chat with my local offline engine here, or click the **'Open Gemini Online'** button in the header to load the official Gemini website in a new browser tab!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Dynamic simulated Gemini sparkles response
    setTimeout(() => {
      setIsTyping(false);
      let responseText = '';
      const prompt = userMsg.text.toLowerCase();

      if (prompt.includes('hello') || prompt.includes('hi') || prompt.includes('hey')) {
        responseText = "Hi there! I'm Gemini. I'm here to collaborate with you to brainstorm, write code, analyze data, and much more. Let me know what we should work on next!";
      } else if (prompt.includes('code') || prompt.includes('write')) {
        responseText = "Sure, I would love to help you build clean and structured code! Here's a sample of a responsive React hook for tracking window size:\n\n```typescript\nimport { useState, useEffect } from 'react';\n\nexport function useWindowSize() {\n  const [size, setSize] = useState({ width: 0, height: 0 });\n  useEffect(() => {\n    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });\n    window.addEventListener('resize', handle);\n    handle();\n    return () => window.removeEventListener('resize', handle);\n  }, []);\n  return size;\n}\n```\nLet me know if you'd like me to help integrate this hook.";
      } else if (prompt.includes('who') || prompt.includes('system') || prompt.includes('webos')) {
        responseText = "I'm collaborating with you inside a macOS-style desktop with Finder, Terminal, Notes, Photos, and window multitasking.";
      } else {
        responseText = `I've analyzed your prompt: "${userMsg.text}". \n\nBecause I am operating as a high-fidelity local sandbox agent, I am responding offline. For complete real-time internet search and advanced multimodal reasoning, you can easily open the online portal by clicking **'Open Gemini Online'** above! How can I help you locally in the meantime?`;
      }

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date()
      }]);
    }, 1300);
  };

  return (
    <div className="macos-app w-full h-full flex select-text">
      
      {/* 1. Gemini Sidebar */}
      <div className="macos-sidebar w-[240px] shrink-0 hidden md:flex flex-col p-3 border-r select-none">
        <button className="w-full py-2.5 px-3 bg-[#1a1a1c] hover:bg-[#28292a] text-white/80 hover:text-white rounded-full text-xs font-semibold flex items-center justify-start gap-3 transition-colors border border-white/5">
          <Plus size={16} />
          <span>New chat</span>
        </button>

        {/* Mock Conversations List */}
        <div className="flex-1 overflow-y-auto mt-6 flex flex-col gap-1.5 text-xs text-white/70">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider px-3 mb-1">Recent Activity</span>
          <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#28292a] rounded-full cursor-pointer bg-[#28292a] text-white font-semibold">
            <MessageSquare size={13} className="text-violet-400 shrink-0" />
            <span className="truncate">macOS Shell Guide</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#28292a] rounded-full cursor-pointer">
            <MessageSquare size={13} className="text-white/40 shrink-0" />
            <span className="truncate">Brainstorming SaaS Name</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#28292a] rounded-full cursor-pointer">
            <MessageSquare size={13} className="text-white/40 shrink-0" />
            <span className="truncate">Spotlight calculation</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs hover:bg-[#28292a] cursor-pointer">
            <SparkIcon size={14} className="text-white/50" />
            <span>Gemini Advanced</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs hover:bg-[#28292a] cursor-pointer">
            <Settings size={14} className="text-white/50" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Iframe Restriction Bar */}
        <div className="bg-[#1e1f20] px-5 py-3 border-b border-white/5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold">
            <AlertCircle size={14} className="animate-pulse" />
            <span>STANDALONE CLIENT: DIRECT EMBEDDING BLOCKED BY GOOGLE SECURITY POLICY</span>
          </div>
          <a 
            href="https://gemini.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-full transition-colors shadow-md shadow-violet-700/20"
          >
            <span>Open Gemini Online</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 flex flex-col gap-6 scrollbar-none">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-3xl mx-auto w-full animate-in fade-in duration-300 ${
                  isAI ? 'text-white/90' : 'text-white'
                }`}
              >
                {/* Sender Icon */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center select-none ${
                  isAI ? 'bg-gradient-to-tr from-[#9bc5ff] via-[#84b0ff] to-[#ea9aff] text-[#131314] shadow-sm font-black' : 'bg-white/10 text-white'
                }`}>
                  {isAI ? <Sparkles size={14} className="animate-spin-slow" /> : <User size={15} />}
                </div>

                {/* Sender Text */}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white/30 tracking-wider uppercase">
                    {isAI ? 'Gemini' : 'You'}
                  </span>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap select-text">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing State */}
          {isTyping && (
            <div className="flex gap-4 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9bc5ff] via-[#84b0ff] to-[#ea9aff] text-[#131314] flex items-center justify-center select-none shadow-sm">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/30 tracking-wider uppercase">Gemini</span>
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-pink-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 shrink-0 bg-[#131314] select-none">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto w-full relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Prompt Gemini..."
              className="w-full bg-[#1e1f20] border border-white/5 hover:border-white/10 focus:border-white/20 rounded-full px-5 py-4 pr-12 text-xs text-white outline-none transition-all placeholder-white/30 focus:shadow-[0_0_15px_rgba(132,176,255,0.1)]"
              disabled={isTyping}
            />
            <button 
              type="submit"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all ${
                input.trim() && !isTyping ? 'bg-gradient-to-tr from-[#9bc5ff] via-[#84b0ff] to-[#ea9aff] text-[#131314] hover:scale-105 active:scale-95' : 'text-white/20 bg-transparent pointer-events-none'
              }`}
              disabled={!input.trim() || isTyping}
            >
              <Send size={13} />
            </button>
          </form>
          <div className="text-[9px] text-white/20 text-center mt-2.5 leading-normal">
            Gemini local collaborator. Always verify important information.
          </div>
        </div>

      </div>

    </div>
  );
}
