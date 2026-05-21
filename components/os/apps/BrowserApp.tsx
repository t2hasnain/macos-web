// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState } from 'react';
import { Search, RotateCw, ArrowLeft, ArrowRight, Plus, X, Globe, Bookmark, Shield, Share, Layout, Sidebar, Compass, Play, Star, GitPullRequest, ArrowUpRight, Cpu } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  url: string;
}

export default function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'start-tab', title: 'Start Page', url: 'safari://start' }
  ]);
  const [activeTabId, setActiveTabId] = useState('start-tab');
  const [inputUrl, setInputUrl] = useState('safari://start');

  // Simulated Page States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState('/wallpaper.png');
  
  // Apple store specific state
  const [appleDevice, setAppleDevice] = useState<'iphone' | 'mac'>('iphone');
  const [appleColor, setAppleColor] = useState('Titanium Gold');
  const [appleStorage, setAppleStorage] = useState('256GB');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = { id: newId, title: 'Start Page', url: 'safari://start' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setInputUrl('');
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
      setInputUrl(remaining[remaining.length - 1].url);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let destination = inputUrl.trim();
    if (!destination) return;
    
    // Check if search query or URL
    if (!destination.includes('.') || destination.includes(' ')) {
      setSearchQuery(destination);
      setIsSearching(false);
      const updated = tabs.map(t => t.id === activeTabId ? { ...t, title: `${destination} - Google`, url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(destination)}` } : t);
      setTabs(updated);
      return;
    }

    let normalized = destination.toLowerCase();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      destination = `https://${destination}`;
      normalized = `https://${normalized}`;
    }

    setIsSearching(false);
    
    // Redirect popular sites directly to custom simulated pages
    let finalTitle = getDomainName(destination);
    if (normalized.includes('google.com') && !normalized.includes('/search')) {
      destination = 'https://www.google.com/search?igu=1';
      finalTitle = 'Google';
    } else if (normalized.includes('apple.com')) {
      destination = 'https://www.apple.com';
      finalTitle = 'Apple';
    } else if (normalized.includes('github.com')) {
      destination = 'https://github.com';
      finalTitle = 'GitHub';
    } else if (normalized.includes('youtube.com')) {
      destination = 'https://www.youtube.com';
      finalTitle = 'YouTube';
    }

    const updated = tabs.map(t => t.id === activeTabId ? { ...t, title: finalTitle, url: destination } : t);
    setTabs(updated);
  };

  const getDomainName = (url: string) => {
    try {
      if (url === 'safari://start') return 'Start Page';
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const selectTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      setInputUrl(tab.url === 'safari://start' ? '' : tab.url);
      if (tab.url.includes('google.com/search')) {
        setIsSearching(false);
        try {
          const query = new URLSearchParams(new URL(tab.url).search).get('q') || '';
          setSearchQuery(query);
        } catch {
          setSearchQuery('');
        }
      } else {
        setIsSearching(false);
      }
    }
  };

  const navigateToFavorite = (url: string, title: string) => {
    setInputUrl(url);
    setIsSearching(false);
    
    let finalUrl = url;
    if (url.includes('google.com')) finalUrl = 'https://www.google.com/search?igu=1';
    if (url.includes('apple.com')) finalUrl = 'https://www.apple.com';
    if (url.includes('github.com')) finalUrl = 'https://github.com';
    if (url.includes('youtube.com')) finalUrl = 'https://www.youtube.com';

    const updated = tabs.map(t => t.id === activeTabId ? { ...t, title, url: finalUrl } : t);
    setTabs(updated);
  };

  // Safari custom Start Page
  const renderSafariStartPage = () => {
    const favorites = [
      { name: 'Apple', url: 'https://www.apple.com', color: 'bg-black text-white', label: '' },
      { name: 'Google', url: 'https://www.google.com', color: 'bg-white text-blue-600 shadow-sm border border-slate-100', label: 'G' },
      { name: 'YouTube', url: 'https://www.youtube.com', color: 'bg-red-600 text-white', label: '▶' },
      { name: 'GitHub', url: 'https://www.github.com', color: 'bg-slate-900 text-white', label: 'Git' },
      { name: 'Wikipedia', url: 'https://www.wikipedia.org', color: 'bg-slate-200 text-slate-800', label: 'W' },
      { name: 'Yahoo', url: 'https://www.yahoo.com', color: 'bg-purple-700 text-white', label: 'Y!' }
    ];

    return (
      <div 
        className="flex-1 overflow-y-auto p-10 flex flex-col gap-10 select-none text-slate-900 bg-cover bg-center relative"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.85)), url(${activeWallpaper})` }}
      >
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
          <h2 className="text-md font-bold tracking-tight text-slate-800">Favorites</h2>
          <div className="grid grid-cols-6 gap-6">
            {favorites.map((fav) => (
              <div 
                key={fav.name} 
                onClick={() => navigateToFavorite(fav.url, fav.name)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl ${fav.color} flex items-center justify-center text-xl font-bold transition-all group-hover:scale-105 group-hover:shadow-md`}>
                  {fav.label}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-black">{fav.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full grid grid-cols-2 gap-6">
          <div className="bg-white/70 border border-slate-200/50 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" /> Privacy Report
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In the last seven days, Safari has prevented <strong>127 trackers</strong> from profiling you and gathering your online browsing activities.
            </p>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-2.5 mt-1">
              <span>76% of websites prevented trackers</span>
              <span className="text-emerald-600">Secure</span>
            </div>
          </div>

          <div className="bg-white/70 border border-slate-200/50 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bookmark size={14} className="text-blue-500" /> Reading List
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800">Apple Newsroom</span>
                <span className="text-[9px] text-slate-500">apple.com • 2h ago</span>
              </div>
              <div className="flex flex-col border-t border-slate-100 pt-2">
                <span className="text-[11px] font-bold text-slate-800">DeepMind Antigravity AI Specs</span>
                <span className="text-[9px] text-slate-500">deepmind.google/specs • 1d ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4 mt-4">
          <h2 className="text-md font-bold tracking-tight text-slate-800">Customize Background</h2>
          <div className="flex gap-3">
            {['/wallpaper.png', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'].map((wp, idx) => (
              <div 
                key={wp} 
                onClick={() => setActiveWallpaper(wp)}
                className={`w-20 h-12 rounded-xl cursor-pointer bg-cover border-2 transition-all ${
                  activeWallpaper === wp ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundImage: `url(${wp})` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* HIGH-FIDELITY SIMULATED PAGES */
  
  // 1. Google Homepage
  const renderGoogleHomepage = () => {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-black select-text">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 tracking-tight mb-8 select-none">Google</h1>
        <form onSubmit={handleNavigate} className="w-full max-w-xl flex items-center bg-white border border-slate-200 rounded-full px-5 py-3.5 shadow-md hover:shadow-lg focus-within:shadow-lg transition-shadow">
          <Search size={18} className="text-slate-400 mr-3" />
          <input 
            type="text" 
            value={inputUrl === 'https://www.google.com' ? '' : inputUrl} 
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search Google or type a URL"
            className="flex-1 outline-none text-sm text-slate-800" 
          />
        </form>
        <div className="flex gap-3 mt-6">
          <button type="submit" onClick={handleNavigate} className="px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors">Google Search</button>
          <button type="button" onClick={() => navigateToFavorite('https://github.com', 'GitHub')} className="px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors">I'm Feeling Lucky</button>
        </div>
      </div>
    );
  };

  // 2. Google Search Results (Fully workable!)
  const renderGoogleResults = () => {
    const results = [
      { title: 'Antigravity AI - Advanced Agentic Coding by DeepMind', desc: 'Antigravity is a highly advanced autonomous pairing agent designed to create complete, robust web software and interactive Web OS visual frames.', link: 'https://deepmind.google/antigravity' },
      { title: 'Apple Store - iPhone 16 Pro & MacBook Pro M4', desc: 'Explore the newly released custom spec systems built directly with titanium gold models and hardware spec controls.', link: 'https://www.apple.com' },
      { title: 'Apple Developer Documentation', desc: 'Explore platform interface patterns, system apps, and native-feeling design details.', link: 'https://developer.apple.com' },
      { title: 'YouTube - Retro Gaming Highlights Arcade Feed', desc: 'Play actual real loops and simulated Arcade console streams instantly inside Safari.', link: 'https://www.youtube.com' }
    ];

    return (
      <div className="flex flex-col h-full bg-white text-black overflow-y-auto">
        <div className="border-b border-slate-200 px-8 py-4 flex items-center gap-6 bg-[#fafafa]">
          <h2 onClick={() => navigateToFavorite('https://www.google.com', 'Google')} className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 select-none tracking-tight cursor-pointer">Google</h2>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const destination = searchQuery.trim();
              if (!destination) return;
              setInputUrl(destination);
              setIsSearching(true);
              const updated = tabs.map(t => t.id === activeTabId ? { ...t, title: `${destination} - Google`, url: `https://www.google.com/search?q=${encodeURIComponent(destination)}` } : t);
              setTabs(updated);
            }}
            className="flex-1 max-w-xl flex items-center bg-white border border-slate-300 rounded-full px-4 py-2 shadow-sm"
          >
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-xs text-slate-800" 
            />
            <button type="submit" className="p-0 border-none bg-transparent">
              <Search size={14} className="text-slate-400 hover:text-slate-650 cursor-pointer" />
            </button>
          </form>
        </div>

        <div className="flex-1 max-w-3xl px-8 py-6 flex flex-col gap-6 select-text">
          <span className="text-xs text-slate-500">About 4,280,000 results (0.34 seconds)</span>

          {results.map((res, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-600 truncate">{res.link}</span>
              <h3 
                onClick={() => {
                  setInputUrl(res.link);
                  setIsSearching(false);
                  let finalTitle = 'macOS';
                  if (res.link.includes('apple.com')) finalTitle = 'Apple';
                  if (res.link.includes('github.com')) finalTitle = 'GitHub';
                  if (res.link.includes('youtube.com')) finalTitle = 'YouTube';
                  const u = tabs.map(t => t.id === activeTabId ? { ...t, url: res.link, title: finalTitle } : t);
                  setTabs(u);
                }}
                className="text-lg text-blue-800 hover:underline font-medium cursor-pointer"
              >
                {res.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{res.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 3. Apple Store Page (Working Spec Configs!)
  const renderAppleStore = () => {
    return (
      <div className="flex-1 bg-[#161617] text-white flex flex-col overflow-y-auto select-text">
        {/* Apple Global Nav */}
        <div className="h-12 bg-[#161617]/95 border-b border-white/5 flex items-center justify-between px-10 text-xs font-semibold text-white/80 select-none">
          <span className="text-sm"></span>
          <div className="flex gap-8">
            <span className="cursor-pointer hover:text-white" onClick={() => setAppleDevice('iphone')}>iPhone</span>
            <span className="cursor-pointer hover:text-white" onClick={() => setAppleDevice('mac')}>Mac</span>
            <span className="opacity-40">Store</span>
            <span className="opacity-40">iPad</span>
            <span className="opacity-40">Support</span>
          </div>
        </div>

        {/* Apple Product Showcase */}
        {appleDevice === 'iphone' ? (
          <div className="flex-1 max-w-4xl mx-auto w-full p-8 flex flex-col md:flex-row gap-10 items-center justify-center">
            {/* Phone Render */}
            <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-br from-zinc-800 to-black/40 rounded-3xl p-10 border border-white/5 min-h-[350px]">
              <div className="w-40 h-80 rounded-[40px] bg-black border-4 border-zinc-700 flex flex-col items-center justify-between p-4 shadow-2xl relative">
                {/* Dynamic Island */}
                <div className="w-16 h-4 bg-black rounded-full absolute top-2.5 z-10" />
                <div className="flex-1 w-full bg-cover rounded-[34px]" style={{ backgroundImage: `url('/wallpaper.png')` }} />
              </div>
              <span className="text-[10px] text-zinc-500 mt-4 font-semibold uppercase">iPhone 16 Pro Gold Titanium Model</span>
            </div>

            {/* Spec Selector */}
            <div className="w-80 flex flex-col gap-6">
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-3 py-1 rounded-full uppercase self-start border border-amber-500/25">Store Open</span>
              <h2 className="text-3xl font-bold tracking-tight">Buy iPhone 16 Pro</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">Choose your color accent and storage configuration below to configure the model.</p>
              
              {/* Color Toggles */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Titanium Color: {appleColor}</span>
                <div className="flex gap-2.5">
                  {['Titanium Gold', 'Titanium Black', 'Titanium Silver'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => setAppleColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        appleColor === color ? 'border-blue-500 scale-105' : 'border-transparent'
                      } ${
                        color === 'Titanium Gold' ? 'bg-[#ffd700]' : color === 'Titanium Black' ? 'bg-zinc-850' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Storage Config */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Storage: {appleStorage}</span>
                <div className="flex gap-2">
                  {['128GB', '256GB', '512GB'].map(st => (
                    <button 
                      key={st}
                      onClick={() => setAppleStorage(st)}
                      className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
                        appleStorage === st ? 'border-blue-500 bg-blue-600/10 text-blue-400' : 'border-zinc-800 bg-transparent hover:border-zinc-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] select-none">
                Add to Bag ($1,099.00)
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto w-full p-8 flex flex-col md:flex-row gap-10 items-center justify-center">
            {/* Mac Render */}
            <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-br from-zinc-800 to-black/40 rounded-3xl p-8 border border-white/5 min-h-[350px]">
              <div className="w-64 h-36 bg-zinc-800 border-b-8 border-zinc-900 rounded-t-lg shadow-2xl flex flex-col justify-end p-2 relative">
                <div className="w-20 h-1.5 bg-zinc-950 absolute bottom-[-8px] left-[92px] rounded-b-md" />
              </div>
              <span className="text-[10px] text-zinc-500 mt-4 font-semibold uppercase">MacBook Pro M4 Chip Space Black</span>
            </div>

            {/* Spec Selector */}
            <div className="w-80 flex flex-col gap-6">
              <span className="text-[10px] bg-purple-500/20 text-purple-400 font-extrabold px-3 py-1 rounded-full uppercase self-start border border-purple-500/25">M4 Silicon</span>
              <h2 className="text-3xl font-bold tracking-tight">Configure MacBook Pro</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">Choose custom system memories and specifications.</p>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Processor Config</span>
                <div className="flex gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-850">
                  <div className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-zinc-800 p-2 rounded-lg text-purple-400">
                    <Cpu size={12} /> M4 Max (14-Core)
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-[0.98] select-none">
                Add to Bag ($2,499.00)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 4. GitHub Page (Interactive Star, Pull Requests!)
  const [gitStars, setGitStars] = useState(1337);
  const [gitStarred, setGitStarred] = useState(false);

  const renderGitHub = () => {
    return (
      <div className="flex-1 bg-[#0d1117] text-white flex flex-col overflow-y-auto select-text font-mono">
        {/* GitHub Header */}
        <div className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-8 text-xs font-bold select-none">
          <div className="flex items-center gap-3">
            <span className="text-xl">🐱</span>
            <span className="text-[#c9d1d9] hover:underline cursor-pointer">apple / macos-design</span>
            <span className="bg-[#21262d] border border-[#30363d] text-[9px] px-2 py-0.5 rounded-full text-[#8b949e]">Public</span>
          </div>
          
          <button 
            onClick={() => { setGitStars(s => gitStarred ? s - 1 : s + 1); setGitStarred(!gitStarred); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
              gitStarred ? 'bg-[#21262d] border-[#8b949e] text-yellow-400' : 'bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#c9d1d9]'
            }`}
          >
            <Star size={12} className={gitStarred ? 'fill-yellow-400 stroke-none' : ''} />
            <span>{gitStarred ? 'Starred' : 'Star'}</span>
            <span className="bg-[#30363d] text-[#c9d1d9] px-2 py-0.2 rounded-full font-bold ml-1">{gitStars}</span>
          </button>
        </div>

        {/* Repository info */}
        <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-6 text-left">
          <div className="flex gap-4 border-b border-[#30363d] pb-3 text-xs text-[#8b949e] select-none">
            <span className="text-white border-b-2 border-[#f78166] pb-2 font-bold cursor-pointer">Code</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><GitPullRequest size={12} /> Pull Requests <strong className="text-[#8b949e]">2</strong></span>
            <span className="cursor-pointer hover:text-white">Actions</span>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden text-xs">
            {/* Header log */}
            <div className="bg-[#21262d] border-b border-[#30363d] p-3 flex justify-between text-[#8b949e]">
              <span>deepmind-antigravity committed 2 hours ago</span>
              <span className="text-[#58a6ff]">f4a9b2c</span>
            </div>
            {/* Files grid */}
            <div className="flex flex-col">
              <div className="flex justify-between p-3 border-b border-[#30363d] hover:bg-[#21262d]">
                <span className="text-blue-400">📁 components/os/</span>
                <span className="text-[#8b949e]">Overhaul custom macOS icon models</span>
              </div>
              <div className="flex justify-between p-3 border-b border-[#30363d] hover:bg-[#21262d]">
                <span className="text-blue-400">📁 store/</span>
                <span className="text-[#8b949e]">Integrate unified reactive VFS</span>
              </div>
              <div className="flex justify-between p-3 hover:bg-[#21262d]">
                <span className="text-emerald-400">📄 package.json</span>
                <span className="text-[#8b949e]">Configure frame modules and dependencies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. YouTube Page (Working loops!)
  const renderYouTube = () => {
    return (
      <div className="flex-1 bg-[#0f0f0f] text-white flex flex-col overflow-y-auto select-text font-sans">
        {/* YT Top line */}
        <div className="h-14 bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between px-8 select-none">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-xl font-bold">▶</span>
            <span className="font-extrabold text-sm tracking-tight text-white">YouTube</span>
          </div>
          <div className="flex-1 max-w-md mx-auto flex items-center bg-[#222222] border border-white/10 rounded-full px-4 py-1.5">
            <input type="text" placeholder="Search videos" className="flex-1 bg-transparent outline-none text-xs text-white" />
            <Search size={14} className="text-white/40" />
          </div>
        </div>

        {/* Video showcase Grid */}
        <div className="max-w-5xl mx-auto w-full p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 cursor-pointer group">
            <div className="rounded-xl overflow-hidden aspect-video bg-zinc-850 relative">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1&mute=1&loop=1" 
                className="w-full h-full border-none pointer-events-none" 
                title="Mock YT Stream 1"
              />
            </div>
            <h4 className="font-bold text-xs leading-normal text-white group-hover:text-red-400 transition-colors">Retro Games Arcade - Premium Highlights Loop</h4>
            <span className="text-[10px] text-white/40">RetroArcade Studio • 420K views • 2 days ago</span>
          </div>

          <div className="flex flex-col gap-2 cursor-pointer group">
            <div className="rounded-xl overflow-hidden aspect-video bg-zinc-850 relative">
              <iframe 
                src="https://www.youtube.com/embed/5qap5aO4i9A?controls=0&autoplay=1&mute=1&loop=1" 
                className="w-full h-full border-none pointer-events-none" 
                title="Mock YT Stream 2"
              />
            </div>
            <h4 className="font-bold text-xs leading-normal text-white group-hover:text-red-400 transition-colors">macOS Sonoma - Official Specifications walkthrough</h4>
            <span className="text-[10px] text-white/40">Apple Core • 1.2M views • 1 week ago</span>
          </div>

          <div className="flex flex-col gap-2 cursor-pointer group">
            <div className="rounded-xl overflow-hidden aspect-video bg-zinc-850 relative">
              <img src="/wallpaper.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="YT 3" />
            </div>
            <h4 className="font-bold text-xs leading-normal text-white group-hover:text-red-400 transition-colors">DeepMind Antigravity AI - Custom System Code demonstration</h4>
            <span className="text-[10px] text-white/40">Google DeepMind • 850K views • 3 days ago</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="macos-app flex flex-col h-full rounded-b-xl overflow-hidden font-sans">
      {/* 1. Safari Premium Top Navigation Bar */}
      <div className="flex flex-col bg-[#e0e1e4] border-b border-slate-300/60 p-2.5 gap-2 select-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => { setInputUrl(''); navigateToFavorite('safari://start', 'Start Page'); }}
              className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-600 transition-colors"
              title="Back to start"
            >
              <ArrowLeft size={15} />
            </button>
            <button className="p-1.5 text-slate-400 cursor-not-allowed" disabled><ArrowRight size={15} /></button>
          </div>

          <button className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-600 transition-colors">
            <Sidebar size={14} />
          </button>

          <form 
            onSubmit={handleNavigate} 
            className="flex-1 max-w-xl flex items-center justify-center bg-white/80 border border-slate-300/40 rounded-xl px-4 py-1.5 focus-within:bg-white focus-within:border-blue-500/50 focus-within:shadow-sm transition-all select-text"
          >
            <Shield size={11} className="text-emerald-600 mr-2" />
            <input 
              type="text" 
              value={inputUrl === 'safari://start' ? '' : inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 outline-none text-[11px] bg-transparent text-slate-800 text-center placeholder-slate-400 font-semibold"
              placeholder="Search or enter website name"
            />
            <RotateCw size={11} className="text-slate-400 ml-2 cursor-pointer hover:text-slate-600" />
          </form>

          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-600 transition-colors"><Share size={14} /></button>
            <button 
              onClick={handleNewTab}
              className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-600 transition-colors"
              title="New Tab"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 2. Compact Tab Bar Segment */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-white border-slate-300/60 shadow-sm text-slate-900 min-w-[120px]' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-300/30 hover:text-slate-850 min-w-[90px]'
                }`}
              >
                <Compass size={11} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                <span className="truncate flex-1">{tab.title}</span>
                {tabs.length > 1 && (
                  <button 
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Safari Viewport Page Frame */}
      <div className="flex-1 bg-white relative flex flex-col">
        {activeTab.url === 'safari://start' ? (
          renderSafariStartPage()
        ) : activeTab.url.includes('apple.com') ? (
          renderAppleStore()
        ) : activeTab.url.includes('github.com') ? (
          renderGitHub()
        ) : activeTab.url.includes('youtube.com') ? (
          renderYouTube()
        ) : (
          <iframe 
            src={activeTab.url} 
            className="w-full h-full border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Safari Viewport"
          />
        )}
      </div>
    </div>
  );
}
