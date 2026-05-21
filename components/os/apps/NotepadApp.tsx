// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Download, Upload, Trash2, Moon, Sun, Type, Plus, X, AlertTriangle } from 'lucide-react';
import { useOSStore, VFSItem } from '@/store/osStore';
import MacIcon from '../MacIcon';
import { MacDocumentIcon } from '../MacFileIcon';

interface NotepadTab {
  id: string;
  name: string;
  content: string;
  isSaved: boolean;
  fileId?: string; // If linked to a VFS file
}

export default function NotepadApp() {
  const { vfs, saveFileContent, createFile, windows, closeWindow, theme } = useOSStore();
  
  // Tab states
  const [tabs, setTabs] = useState<NotepadTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  
  // Editor preferences
  const [fontSize, setFontSize] = useState(14);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retrieve Notepad window configuration statically to avoid focus shifts resetting editor contents
  const notepadWin = windows.find(w => w.appId === 'notepad');
  const activeFileId = notepadWin?.data?.fileId;
  const activeVfsFile = activeFileId ? vfs.find(item => item.id === activeFileId) : null;

  // 1. Sync outside opened files (from Finder double-click)
  useEffect(() => {
    if (activeVfsFile) {
      // Check if this file is already open in one of the tabs
      const existingTab = tabs.find(t => t.fileId === activeVfsFile.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const newTab: NotepadTab = {
          id: `tab-${Date.now()}`,
          name: activeVfsFile.name,
          content: activeVfsFile.content || '',
          isSaved: true,
          fileId: activeVfsFile.id
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    } else if (tabs.length === 0) {
      // Fallback: load last session from localStorage or open fresh document
      const saved = localStorage.getItem('rich_notepad_content');
      const savedName = localStorage.getItem('rich_notepad_name');
      const newTab: NotepadTab = {
        id: 'default-tab',
        name: savedName || 'untitled.txt',
        content: saved || '',
        isSaved: true
      };
      setTabs([newTab]);
      setActiveTabId('default-tab');
    }
  }, [activeFileId]); // ONLY run when the actual target file opened inside Notepad window changes!

  // 2. Intercept window-closing event dispatched by traffic light Close button
  useEffect(() => {
    const handleTryClose = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (notepadWin && customEvent.detail?.windowId === notepadWin.id) {
        // If there are ANY unsaved changes across tabs, show close confirmation warning
        const hasUnsavedChanges = tabs.some(t => !t.isSaved);
        if (hasUnsavedChanges) {
          setShowCloseWarning(true);
        } else {
          // Safe to close immediately
          closeWindow(notepadWin.id);
        }
      }
    };

    window.addEventListener('notepad-try-close', handleTryClose);
    return () => window.removeEventListener('notepad-try-close', handleTryClose);
  }, [tabs, notepadWin, closeWindow]);

  // Current active tab object
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || {
    id: 'fallback',
    name: 'untitled.txt',
    content: '',
    isSaved: true
  };

  const updateActiveTab = (updates: Partial<Omit<NotepadTab, 'id'>>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    updateActiveTab({ content: text, isSaved: false });
  };

  // Add new tab
  const handleNewTab = () => {
    const id = `tab-${Date.now()}`;
    const newTab: NotepadTab = {
      id,
      name: `untitled-${tabs.length + 1}.txt`,
      content: '',
      isSaved: true
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  };

  // Close specific tab
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabToClose = tabs.find(t => t.id === tabId);
    if (!tabToClose) return;

    if (!tabToClose.isSaved) {
      const confirmClose = confirm(`Discard unsaved changes in ${tabToClose.name}?`);
      if (!confirmClose) return;
    }

    const remaining = tabs.filter(t => t.id !== tabId);
    if (remaining.length === 0) {
      // If we closed the last remaining tab, create a new fresh empty one
      const id = `tab-${Date.now()}`;
      const newTab: NotepadTab = {
        id,
        name: 'untitled.txt',
        content: '',
        isSaved: true
      };
      setTabs([newTab]);
      setActiveTabId(id);
    } else {
      setTabs(remaining);
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
    }
  };

  const handleSave = () => {
    if (activeTab.fileId) {
      saveFileContent(activeTab.fileId, activeTab.content);
      updateActiveTab({ isSaved: true });
    } else {
      const name = prompt('Save file as:', activeTab.name);
      if (!name) return;
      const cleanName = name.endsWith('.txt') ? name : `${name}.txt`;
      
      createFile(cleanName, 'txt', activeTab.content, 'documents');
      updateActiveTab({ name: cleanName, isSaved: true });

      // Cache state in localStorage
      localStorage.setItem('rich_notepad_content', activeTab.content);
      localStorage.setItem('rich_notepad_name', cleanName);
    }
  };

  // Dialog actions for close warnings
  const handleSaveAndCloseAll = () => {
    // Save all unsaved tabs
    tabs.forEach(t => {
      if (!t.isSaved) {
        if (t.fileId) {
          saveFileContent(t.fileId, t.content);
        } else {
          // Automatically save untitled files to Documents folder
          createFile(t.name, 'txt', t.content, 'documents');
        }
      }
    });
    
    // Clear close warning and close window
    setShowCloseWarning(false);
    if (notepadWin) closeWindow(notepadWin.id);
  };

  const handleDiscardAndCloseAll = () => {
    // completely purge unsaved cache
    localStorage.removeItem('rich_notepad_content');
    localStorage.removeItem('rich_notepad_name');
    
    // Reset all tabs to saved so they don't trigger again, then clear close warnings and close
    setShowCloseWarning(false);
    if (notepadWin) closeWindow(notepadWin.id);
  };

  const handleDownload = () => {
    const blob = new Blob([activeTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTab.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const id = `tab-${Date.now()}`;
      const newTab: NotepadTab = {
        id,
        name: file.name,
        content: text,
        isSaved: false
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(id);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    updateActiveTab({ content: '', isSaved: false });
  };

  const lines = activeTab.content.split('\n');

  return (
    <div className={`macos-app font-sans flex flex-col h-full transition-colors relative select-none ${theme === 'dark' ? 'terminal-native text-white' : 'bg-white text-slate-800'}`}>
      
      {/* 1. Cupertino Tab bar */}
      <div className={`flex items-center gap-1.5 px-4 pt-2 border-b select-none overflow-x-auto scrollbar-none shrink-0 ${
        theme === 'dark' ? 'bg-black/45 border-white/5' : 'macos-toolbar border-black/10'
      }`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-[10px] font-bold tracking-wide transition-all cursor-pointer border-t border-x relative ${
                isActive
                  ? theme === 'dark' 
                    ? 'bg-[#0f172a] border-white/10 text-white font-black shadow-[0_-2px_10px_rgba(0,0,0,0.3)]' 
                    : 'bg-[#fafafa] border-slate-200 text-slate-800 font-black shadow-[0_-2px_6px_rgba(0,0,0,0.05)]'
                  : theme === 'dark'
                    ? 'bg-transparent border-transparent text-white/40 hover:text-white/60'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <MacDocumentIcon className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{tab.name}</span>
              
              {!tab.isSaved && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              )}

              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-0.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={10} />
              </button>

              {isActive && (
                <div className={`absolute bottom-[-1.5px] left-0 right-0 h-[2px] z-10 ${
                  theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#fafafa]'
                }`} />
              )}
            </div>
          );
        })}

        <button
          onClick={handleNewTab}
          className={`p-1.5 rounded-lg border transition-all ml-1.5 flex items-center justify-center mb-1.5 ${
            theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Plus size={11} />
        </button>
      </div>

      {/* 2. Upper toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b transition-colors shrink-0 ${
        theme === 'dark' ? 'bg-black/20 border-white/5' : 'macos-toolbar border-black/10'
      }`}>
        <div className="flex items-center gap-2">
          <MacIcon id="notepad" className="w-6 h-6" />
          <input 
            type="text"
            value={activeTab.name}
            onChange={(e) => updateActiveTab({ name: e.target.value, isSaved: false })}
            className={`font-semibold text-xs outline-none bg-transparent max-w-[150px] border-b border-transparent focus:border-blue-500 px-1 py-0.5 rounded ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}
            disabled={!!activeTab.fileId} 
          />
          {!activeTab.isSaved && <span className="text-[9px] bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Edited</span>}
          {activeTab.isSaved && <span className="text-[9px] bg-green-500/15 text-green-700 px-2 py-0.5 rounded-full font-semibold">Saved</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Note: Theme toggler removed, now controlled by Settings app */}

          <button 
            onClick={() => setFontSize(f => f >= 24 ? 12 : f + 2)}
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] transition-colors ${
              theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-100'
            }`}
          >
            <Type size={12} />
            <span>{fontSize}px</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button 
            onClick={handleSave}
            className="macos-primary flex items-center gap-1.5 px-3 py-1.5 text-[10px] active:scale-95 rounded-lg font-bold transition-all"
          >
            <Save size={12} /> Save File
          </button>

          <button 
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-lg font-bold border transition-all ${
              theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-100'
            }`}
          >
            <Download size={12} /> Export
          </button>

          <button 
            onClick={handleUploadClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-lg font-bold border transition-all ${
              theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-100'
            }`}
          >
            <Upload size={12} /> Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.js,.ts,.tsx,.json,.css,.html"
          />

          <button 
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 3. Editor Body */}
      <div className={`flex-1 flex overflow-hidden font-mono text-xs leading-relaxed ${theme === 'dark' ? 'bg-[#1a1a1c] text-white' : 'bg-white text-slate-800'}`}>
        <div className={`w-12 text-right pr-3 select-none flex flex-col pt-4 border-r transition-colors shrink-0 ${
          theme === 'dark' ? 'text-white/20 border-white/5 bg-black/15' : 'text-slate-400 border-black/10 bg-white/45'
        }`}>
          {lines.map((_, i) => (
            <span key={i} className="text-[10px] h-6 flex items-center justify-end">{i + 1}</span>
          ))}
        </div>

        <textarea
          value={activeTab.content}
          onChange={handleContentChange}
          className="flex-1 p-4 bg-transparent resize-none outline-none overflow-y-auto w-full h-full select-text cursor-text border-none focus:ring-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5rem', color: 'inherit' }}
          placeholder="Start writing..."
          spellCheck={false}
        />
      </div>

      {/* 4. Bottom Status bar */}
      <div className={`px-5 py-2 border-t text-[9px] font-semibold tracking-wider flex justify-between select-none shrink-0 ${
        theme === 'dark' ? 'bg-black/20 border-white/5 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        <span>UTF-8</span>
        <div className="flex gap-4">
          <span>{lines.length} lines</span>
          <span>{activeTab.content.replace(/\s+/g, '').length} chars</span>
          <span>{activeTab.content.trim() ? activeTab.content.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>

      {/* 5. Warning Modal */}
      {showCloseWarning && (
        <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#1e1f20]/90 backdrop-blur-2xl border border-white/15 rounded-2xl w-[380px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Unsaved Changes in Notepad</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                    One or more of your opened document tabs have unsaved text. How would you like to close?
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleSaveAndCloseAll}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  Save Changes & Close
                </button>
                <button
                  onClick={handleDiscardAndCloseAll}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/25 active:scale-[0.98] font-bold rounded-xl text-xs transition-all"
                >
                  Discard Changes & Close
                </button>
                <button
                  onClick={() => setShowCloseWarning(false)}
                  className="w-full py-2.5 border border-white/10 hover:bg-white/5 text-white/80 active:scale-[0.98] font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
