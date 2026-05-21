// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useOSStore } from '@/store/osStore';
import Taskbar from './Taskbar';
import ContextMenu from './ContextMenu';
import Window from './Window';
import Header from './Header';
import LockScreen from './LockScreen';
import DesktopGrid from './DesktopGrid';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Plus, X, Globe, Sparkles } from 'lucide-react';

// App Components
import BrowserApp from './apps/BrowserApp';
import NotepadApp from './apps/NotepadApp';
import GalleryApp from './apps/GalleryApp';
import SettingsApp from './apps/SettingsApp';
import FolderApp from './apps/FolderApp';
import GameApp from './apps/GameApp';
import PasswordApp from './apps/PasswordApp';
import CalculatorApp from './apps/CalculatorApp';
import MonitorApp from './apps/MonitorApp';
import TerminalApp from './apps/TerminalApp';
import GeminiApp from './apps/GeminiApp';
import ChatgptApp from './apps/ChatgptApp';
import CameraApp from './apps/CameraApp';
import AppStoreApp from './apps/AppStoreApp';
import AboutMeApp from './apps/AboutMeApp';

export default function Desktop() {
  const { wallpaper, windows, openContextMenu, theme, customApps, addCustomApp } = useOSStore();
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appIcon, setAppIcon] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const handleOpenModal = () => {
      setShowNewAppModal(true);
      setAppName('');
      setAppUrl('');
      setAppIcon('');
      setValidationError('');
    };
    window.addEventListener('open-new-app-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-app-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('macos-startup-sound-played') === 'true') return;

    const playStartupSound = () => {
      const audio = new Audio('/sounds/mac-startup-sound.mp3');
      audio.volume = 0.45;
      audio.play().then(() => {
        localStorage.setItem('macos-startup-sound-played', 'true');
      }).catch(() => {});
      window.removeEventListener('pointerdown', playStartupSound);
      window.removeEventListener('keydown', playStartupSound);
    };

    window.addEventListener('pointerdown', playStartupSound, { once: true });
    window.addEventListener('keydown', playStartupSound, { once: true });
    return () => {
      window.removeEventListener('pointerdown', playStartupSound);
      window.removeEventListener('keydown', playStartupSound);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, 'desktop');
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appUrl.trim()) {
      setValidationError('App Name and Website URL are required!');
      return;
    }
    
    // Simple URL validation / normalization
    let normalizedUrl = appUrl.trim();
    if (!normalizedUrl.includes('.') || normalizedUrl.includes(' ')) {
      setValidationError('Please enter a valid website URL!');
      return;
    }

    addCustomApp(appName.trim(), normalizedUrl, appIcon.trim() || undefined);
    setShowNewAppModal(false);
  };

  const renderAppContent = (appId: string) => {
    if (appId.startsWith('custom-app-')) {
      // return <CustomAppWrapper appId={appId} />;
      return <div className="p-4 text-white">Custom App View: {appId}</div>;
    }

    switch (appId) {
      case 'browser': return <BrowserApp />;
      case 'notepad': return <NotepadApp />;
      case 'gallery': return <GalleryApp />;
      case 'settings': return <SettingsApp />;
      case 'folder': return <FolderApp />;
      case 'game': return <GameApp />;
      case 'passwords': return <PasswordApp />;
      case 'calculator': return <CalculatorApp />;
      case 'monitor': return <MonitorApp />;
      case 'terminal': return <TerminalApp />;
      case 'gemini': return <GeminiApp />;
      case 'chatgpt': return <ChatgptApp />;
      case 'camera': return <CameraApp />;
      case 'appstore': return <AppStoreApp />;
      case 'aboutme': return <AboutMeApp />;
      default: return <div className="p-4 text-white">App not found</div>;
    }
  };

  return (
    <div 
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-500 ${
        theme === 'light' ? 'bg-[#f4f5f6] text-slate-800' : 'bg-black text-white'
      }`}
      onContextMenu={handleContextMenu}
    >
      {/* Top Menu Bar */}
      <Header />

      {/* Wallpaper */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={wallpaper}
          alt="Wallpaper"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Desktop Grid Shortcuts */}
      <DesktopGrid />

      {/* Desktop Area / Windows */}
      <div className="absolute inset-0 z-10 pt-10 pointer-events-none">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <Window id={win.id}>
              {renderAppContent(win.appId)}
            </Window>
          </div>
        ))}
      </div>

      {/* Standalone Apple Glassmorphic New App Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-[100000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#1e1f20]/90 backdrop-blur-2xl border border-white/10 rounded-2xl w-[400px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <span className="text-xs font-bold tracking-wider uppercase text-white/50 flex items-center gap-2">
                <Sparkles size={13} className="text-pink-500" /> Create Custom App Shortcut
              </span>
              <button 
                onClick={() => setShowNewAppModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateApp} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white/70">App Name <span className="text-pink-500">*</span></label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Website" 
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white placeholder-white/30 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white/70">Website URL <span className="text-pink-500">*</span></label>
                <input 
                  type="text" 
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="e.g. example.com" 
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white placeholder-white/30 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white/70">Icon Image URL <span className="text-white/30">(Optional)</span></label>
                <input 
                  type="text" 
                  value={appIcon}
                  onChange={(e) => setAppIcon(e.target.value)}
                  placeholder="e.g. https://domain.com/icon.png" 
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white placeholder-white/30 transition-colors"
                />
                <span className="text-[9px] text-white/40 leading-normal">
                  If left empty, a beautiful gradient icon based on the app's name will be generated.
                </span>
              </div>

              {validationError && (
                <div className="text-[10px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-center mt-2">
                  {validationError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-lg font-bold shadow-lg transition-all active:scale-95"
                >
                  Create App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Taskbar />
      <ContextMenu />
      <LockScreen />
    </div>
  );
}
