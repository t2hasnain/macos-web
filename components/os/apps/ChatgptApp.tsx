// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Sparkles, Send, Bot, User, MessageSquare, Plus, Compass, Settings, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function ChatgptApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am ChatGPT. I'm running in standalone local container mode because major web browsers strictly prevent direct iframe embedding of `chatgpt.com` due to Clickjacking security rules (X-Frame-Options).\n\nYou can chat with my local assistant here, or click the **'Open chatgpt.com'** button in the header to launch the full online ChatGPT website in a new browser tab!",
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

    // Dynamic simulated ChatGPT responses
    setTimeout(() => {
      setIsTyping(false);
      let responseText = '';
      const prompt = userMsg.text.toLowerCase();

      if (prompt.includes('hello') || prompt.includes('hi')) {
        responseText = "Hello there! How can I help you today? Feel free to ask me to write code, solve problems, or draft messages!";
      } else if (prompt.includes('code') || prompt.includes('write')) {
        responseText = "Certainly! Here is a sample code snippet for a premium Next.js responsive component:\n\n```tsx\nexport default function ShinyCard() {\n  return (\n    <div className=\"p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/50 transition-all\">\n      <h3 className=\"text-lg font-bold\">Aesthetic Card</h3>\n      <p className=\"text-xs text-white/50 mt-1\">Hover to reveal reflection</p>\n    </div>\n  );\n}\n```\nLet me know if you would like me to modify or explain this code further!";
      } else if (prompt.includes('who') || prompt.includes('system') || prompt.includes('webos')) {
        responseText = "I am running inside a macOS-style desktop with Finder, Terminal, Notes, Photos, and window multitasking.";
      } else {
        responseText = `I received your message: "${userMsg.text}". That's an interesting query! \n\nAs a sandboxed local client, I have offline reasoning capabilities. To get the full online GPT-4o capabilities, you can sign in to your real account by clicking **'Open chatgpt.com'** in the top bar. What else can I assist you with locally?`;
      }

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date()
      }]);
    }, 1200);
  };

  return (
    <div className="macos-app w-full h-full flex select-text">
      
      {/* 1. ChatGPT Sidebar */}
      <div className="macos-sidebar w-[240px] shrink-0 hidden md:flex flex-col p-3 border-r select-none">
        <button className="w-full py-2.5 px-3 border border-white/20 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors">
          <span className="flex items-center gap-2"><Plus size={14} /> New chat</span>
          <MessageSquare size={12} className="text-white/40" />
        </button>

        {/* Mock Conversations List */}
        <div className="flex-1 overflow-y-auto mt-6 flex flex-col gap-1.5 text-xs text-white/70">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider px-2 mb-1">Recent Chats</span>
          <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-white/5 rounded-lg cursor-pointer bg-white/5 text-white">
            <MessageSquare size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate">macOS Shell Help</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <MessageSquare size={13} className="text-white/40 shrink-0" />
            <span className="truncate">Drafting email to team</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <MessageSquare size={13} className="text-white/40 shrink-0" />
            <span className="truncate">Next.js 16.2.6 Routing</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 cursor-pointer">
            <Compass size={13} className="text-white/50" />
            <span>Explore GPTs</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 cursor-pointer">
            <Settings size={13} className="text-white/50" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Iframe Restriction Bar */}
        <div className="bg-[#1f1f1f] px-5 py-3 border-b border-white/5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold">
            <AlertCircle size={14} className="animate-pulse" />
            <span>STANDALONE CLIENT: DIRECT EMBEDDING BLOCKED BY CHATGPT SECURITY POLICY</span>
          </div>
          <a 
            href="https://chatgpt.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-md shadow-emerald-700/20"
          >
            <span>Open chatgpt.com</span>
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
                  isAI ? 'bg-[#10a37f] text-white shadow-sm' : 'bg-white/10 text-white'
                }`}>
                  {isAI ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Sender Text */}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white/30 tracking-wider uppercase">
                    {isAI ? 'ChatGPT' : 'You'}
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
              <div className="w-8 h-8 rounded-full bg-[#10a37f] text-white flex items-center justify-center select-none shadow-sm">
                <Bot size={16} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/30 tracking-wider uppercase">ChatGPT</span>
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 shrink-0 bg-[#212121] select-none">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto w-full relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message ChatGPT..."
              className="w-full bg-[#2f2f2f] border border-white/5 hover:border-white/10 focus:border-white/20 rounded-2xl px-4 py-3.5 pr-12 text-xs text-white outline-none transition-all placeholder-white/30"
              disabled={isTyping}
            />
            <button 
              type="submit"
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                input.trim() && !isTyping ? 'bg-white text-black hover:scale-105 active:scale-95' : 'text-white/20 bg-transparent'
              }`}
              disabled={!input.trim() || isTyping}
            >
              <Send size={14} />
            </button>
          </form>
          <div className="text-[9px] text-white/20 text-center mt-2.5 leading-normal">
            ChatGPT local client. Always verify important information.
          </div>
        </div>

      </div>

    </div>
  );
}
