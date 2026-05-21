// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useEffect, useRef } from 'react';
import { useOSStore, appsRegistry, AppId } from '@/store/osStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Calculator, Globe, CornerDownLeft } from 'lucide-react';
import MacIcon from './MacIcon';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Spotlight({ isOpen, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openApp, customApps } = useOSStore();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate math query
  let mathResult: string | null = null;
  const isMathQuery = /^[0-9+\-*/().\s]+$/.test(query) && /[+\-*/()]/.test(query);
  if (isMathQuery) {
    try {
      // Safe evaluation
      const res = new Function(`return ${query}`)();
      if (res !== undefined && !isNaN(res)) {
        mathResult = String(res);
      }
    } catch {}
  }

  // Filter apps (both static and custom)
  const allApps = [...Object.values(appsRegistry), ...Object.values(customApps)];
  const matchedApps = allApps.filter(app => 
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.id.toLowerCase().includes(query.toLowerCase())
  );

  const results: Array<{
    type: 'app' | 'calc' | 'web';
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    action: () => void;
  }> = [];

  // 1. Math result
  if (mathResult !== null) {
    results.push({
      type: 'calc',
      id: 'calc-result',
      title: mathResult,
      subtitle: `Calculator: ${query}`,
      icon: <Calculator className="text-orange-400" size={18} />,
      action: () => {
        openApp('calculator');
        onClose();
      }
    });
  }

  // 2. Matched Apps
  matchedApps.forEach(app => {
    results.push({
      type: 'app',
      id: app.id,
      title: app.name,
      subtitle: 'Application',
      icon: <div className="w-6 h-6 relative"><MacIcon id={app.id} /></div>,
      action: () => {
        openApp(app.id);
        onClose();
      }
    });
  });

  // 3. Web Search
  if (query.trim().length > 0 && mathResult === null) {
    results.push({
      type: 'web',
      id: 'web-search',
      title: `Search Google for "${query}"`,
      subtitle: 'Google Search',
      icon: <Globe className="text-blue-400" size={18} />,
      action: () => {
        openApp('browser', `https://www.google.com/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-black/35 backdrop-blur-[2px] flex justify-center pt-24"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl h-fit bg-[#1c1c1e]/85 border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/5">
          <Search className="text-white/40" size={22} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Spotlight Search..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/20 font-medium"
          />
          <span className="text-[10px] text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-semibold uppercase select-none">ESC</span>
        </div>

        {/* Results List */}
        {results.length > 0 && (
          <div className="p-2 max-h-[360px] overflow-y-auto flex flex-col gap-0.5">
            {results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold tracking-wide">{item.title}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-white/40'}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] text-white/70 font-medium">
                      <span>Open</span>
                      <CornerDownLeft size={10} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
