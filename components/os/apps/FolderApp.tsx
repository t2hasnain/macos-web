// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { ChevronRight, Image as ImageIcon, Trash2, Edit, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useOSStore, VFSItem, appsRegistry } from '@/store/osStore';
import MacIcon from '../MacIcon';
import { MacDocumentIcon, MacFolderIcon, MacImageFileIcon } from '../MacFileIcon';

export default function FolderApp() {
  const { vfs, createFile, createFolder, deleteItem, renameItem, moveItem, setItemTag, openApp } = useOSStore();
  const [currentFolderId, setCurrentFolderId] = useState<string>('documents');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Modals / Input states
  const [newItemModal, setNewItemModal] = useState<{ isOpen: boolean; type: 'folder' | 'txt' | 'png'; parentId: string } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; id: string; currentName: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  
  // Custom right-click menu within Finder
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string | null } | null>(null);
  const finderRef = useRef<HTMLDivElement>(null);

  // Get current folder details
  const currentFolder = vfs.find(item => item.id === currentFolderId) || vfs[0];

  // Resolve path history list for breadcrumbs
  const getPathHistory = (): VFSItem[] => {
    const path: VFSItem[] = [];
    let current = currentFolder;
    while (current) {
      path.unshift(current);
      if (current.parentId) {
        const parent = vfs.find(item => item.id === current.parentId);
        if (parent) current = parent;
        else break;
      } else {
        break;
      }
    }
    return path;
  };

  const handleItemDoubleClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedItemId(null);
    } else if (item.ext === 'app' && item.appId) {
      openApp(item.appId);
    } else if (item.ext === 'txt') {
      // Open Notepad with this active file ID!
      openApp('notepad', { fileId: item.id });
    } else if (item.ext === 'png' || item.ext === 'jpg') {
      // Open Photos with this active file ID or media URL
      openApp('gallery', { activeImg: item.content });
    }
  };

  const handleRightClick = (e: React.MouseEvent, itemId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = finderRef.current?.getBoundingClientRect();
    if (!rect) return;
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      itemId
    });
  };

  // Close context menu on outside click
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const triggerCreateItem = () => {
    if (!newItemName.trim() || !newItemModal) return;
    const name = newItemName.trim();
    if (newItemModal.type === 'folder') {
      createFolder(name, newItemModal.parentId);
    } else if (newItemModal.type === 'txt') {
      createFile(name.endsWith('.txt') ? name : `${name}.txt`, 'txt', '// Write here...', newItemModal.parentId);
    } else {
      createFile(name.endsWith('.png') ? name : `${name}.png`, 'png', '/wallpaper.png', newItemModal.parentId);
    }
    setNewItemModal(null);
    setNewItemName('');
  };

  const triggerRename = () => {
    if (!renameValue.trim() || !renameModal) return;
    renameItem(renameModal.id, renameValue.trim());
    setRenameModal(null);
    setRenameValue('');
  };

  const getIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <MacFolderIcon className="w-12 h-12" />;
    if (item.ext === 'app' && item.appId) return <MacIcon id={item.appId} className="w-12 h-12" />;
    if (item.ext === 'png' || item.ext === 'jpg') return <MacImageFileIcon className="w-12 h-12" />;
    if (item.ext === 'txt') return <MacDocumentIcon className="w-12 h-12" />;
    return <MacDocumentIcon className="w-12 h-12" />;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== targetFolderId) {
      moveItem(draggedId, targetFolderId);
    }
  };

  // Filter children of current directory
  let currentItems = vfs.filter(item => item.parentId === currentFolderId);
  if (currentFolderId === 'applications') {
    const defaultApps = Object.values(appsRegistry).map((app: any) => ({
      id: `system-app-${app.id}`,
      name: app.name,
      type: 'file',
      ext: 'app',
      appId: app.id,
      parentId: 'applications'
    } as VFSItem));
    currentItems = [...defaultApps, ...currentItems];
  }
  const moveTargets = vfs.filter(item => item.type === 'folder' && item.id !== contextMenu?.itemId);

  return (
    <div 
      className="macos-app flex h-full backdrop-blur-2xl select-none relative" 
      ref={finderRef}
      onContextMenu={(e) => handleRightClick(e, null)}
    >
      {/* Sidebar - macOS Finder style */}
      <div className="macos-sidebar w-52 flex flex-col border-r p-3.5 gap-4">
        
        {/* Favorites section */}
        <div className="flex flex-col gap-1">
          <span className="macos-label text-[9px] uppercase tracking-widest px-2 mb-1.5">Favorites</span>
          
          <SidebarBtn 
            active={currentFolderId === 'applications'} 
            onClick={() => setCurrentFolderId('applications')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'applications')}
            icon={<MacIcon id="launchpad" className="w-4 h-4" />}
            label="Applications"
          />
          <SidebarBtn 
            active={currentFolderId === 'documents'} 
            onClick={() => setCurrentFolderId('documents')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'documents')}
            icon={<MacDocumentIcon className="w-4 h-4" />}
            label="Documents"
          />
          <SidebarBtn 
            active={currentFolderId === 'pictures'} 
            onClick={() => setCurrentFolderId('pictures')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'pictures')}
            icon={<MacIcon id="gallery" className="w-4 h-4" />}
            label="Pictures"
          />
          <SidebarBtn 
            active={currentFolderId === 'downloads'} 
            onClick={() => setCurrentFolderId('downloads')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'downloads')}
            icon={<MacFolderIcon className="w-4 h-4" />}
            label="Downloads"
          />
        </div>

        {/* Action Panel */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="macos-label text-[9px] uppercase tracking-widest px-2 mb-1.5 font-bold">Quick Actions</span>
          <button 
            onClick={() => setNewItemModal({ isOpen: true, type: 'folder', parentId: currentFolderId })}
            className="macos-list-item flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left"
          >
            <MacFolderIcon className="w-4 h-4" /> New Folder
          </button>
          <button 
            onClick={() => setNewItemModal({ isOpen: true, type: 'txt', parentId: currentFolderId })}
            className="macos-list-item flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left"
          >
            <MacDocumentIcon className="w-4 h-4" /> New Document
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white/20" onClick={() => setSelectedItemId(null)}>
        
        {/* Top bar search path */}
        <div className="macos-toolbar h-12 border-b flex items-center justify-between px-5 gap-2.5">
          <div className="macos-input flex items-center text-[10px] px-3 py-1.5 rounded-lg w-full max-w-xl font-semibold tracking-wide">
            {getPathHistory().map((folder, i) => (
              <div key={folder.id} className="flex items-center">
                <span 
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, folder.id)}
                >
                  {folder.name}
                </span>
                {i < getPathHistory().length - 1 && <ChevronRight size={11} className="mx-1 text-white/30" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setNewItemModal({ isOpen: true, type: 'folder', parentId: currentFolderId })}
              className="p-1.5 hover:bg-black/5 rounded-lg text-slate-600 transition-colors"
              title="New Folder"
            >
              <MacFolderIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setNewItemModal({ isOpen: true, type: 'txt', parentId: currentFolderId })}
              className="p-1.5 hover:bg-black/5 rounded-lg text-slate-600 transition-colors"
              title="New File"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Files Grid Pane */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4">
              {currentItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={item.type === 'folder' ? handleDragOver : undefined}
                    onDrop={item.type === 'folder' ? (e) => handleDrop(e, item.id) : undefined}
                    onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item.ext === 'app') {
                        const { openContextMenu } = useOSStore.getState();
                        openContextMenu(e.clientX, e.clientY, 'app-folder', item);
                      } else {
                        handleRightClick(e, item.id);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-150 group active:scale-95 text-center relative ${
                      isSelected 
                        ? 'bg-blue-500/20 border-blue-400/40 text-slate-900 font-semibold' 
                        : 'border-transparent hover:bg-blue-500/10 text-slate-900'
                    }`}
                  >
                    <div className="group-hover:scale-105 group-hover:rotate-1 transition-all duration-200">
                      {getIcon(item)}
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide truncate w-full px-1">{item.name}</span>
                    
                    {item.tag && (
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        item.tag === 'Red' ? 'bg-red-500' : item.tag === 'Orange' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20 select-none">
              <MacFolderIcon className="w-14 h-14 mb-2 opacity-60" />
              <span className="text-xs font-semibold tracking-wide text-slate-500">Empty Folder</span>
            </div>
          )}
        </div>
      </div>

      {/* Internal Custom Right-Click Context Menu */}
      {contextMenu && (
        <div 
          className="absolute bg-[#141822]/90 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.65)] backdrop-blur-3xl py-1.5 min-w-[150px] flex flex-col gap-0.5 text-white text-[10px] font-semibold z-[9999]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.itemId ? (
            <>
              <button 
                onClick={() => {
                  const item = vfs.find(i => i.id === contextMenu.itemId);
                  if (item) setRenameModal({ isOpen: true, id: item.id, currentName: item.name });
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-blue-600/20 text-left rounded-xl mx-1.5 transition-colors"
              >
                <Edit size={12} className="text-blue-400" /> Rename
              </button>
              
              <div className="h-px bg-white/5 my-1 mx-3" />
              
              <div className="px-3.5 py-1 text-[8px] uppercase tracking-widest text-white/30">Set Tag</div>
              <div className="flex gap-2.5 px-3.5 py-1.5 hover:bg-white/5 rounded-xl mx-1.5">
                <button onClick={() => { setItemTag(contextMenu.itemId!, 'Red'); setContextMenu(null); }} className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white/10 active:scale-90" />
                <button onClick={() => { setItemTag(contextMenu.itemId!, 'Orange'); setContextMenu(null); }} className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white/10 active:scale-90" />
                <button onClick={() => { setItemTag(contextMenu.itemId!, 'Blue'); setContextMenu(null); }} className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white/10 active:scale-90" />
                <button onClick={() => { setItemTag(contextMenu.itemId!, null); setContextMenu(null); }} className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-white/10 active:scale-90 flex items-center justify-center text-[8px] text-white">×</button>
              </div>

              <div className="h-px bg-white/5 my-1 mx-3" />

              <div className="px-3.5 py-1 text-[8px] uppercase tracking-widest text-white/30">Move To</div>
              <div className="max-h-36 overflow-y-auto">
                {moveTargets.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      moveItem(contextMenu.itemId!, folder.id);
                      setContextMenu(null);
                      setSelectedItemId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 hover:bg-blue-600/20 text-left rounded-xl mx-1.5 transition-colors"
                  >
                    <MacFolderIcon className="w-4 h-4" /> {folder.name}
                  </button>
                ))}
              </div>

              <div className="h-px bg-white/5 my-1 mx-3" />

              <button 
                onClick={() => { deleteItem(contextMenu.itemId!); setContextMenu(null); }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-red-600/20 text-red-400 text-left rounded-xl mx-1.5 transition-colors"
              >
                <Trash2 size={12} /> Delete Item
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setNewItemModal({ isOpen: true, type: 'folder', parentId: currentFolderId }); setContextMenu(null); }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-blue-600/20 text-left rounded-xl mx-1.5 transition-colors"
              >
                <MacFolderIcon className="w-4 h-4" /> New Folder
              </button>
              <button 
                onClick={() => { setNewItemModal({ isOpen: true, type: 'txt', parentId: currentFolderId }); setContextMenu(null); }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-blue-600/20 text-left rounded-xl mx-1.5 transition-colors"
              >
                <MacDocumentIcon className="w-4 h-4" /> New Document
              </button>
              <button 
                onClick={() => { setNewItemModal({ isOpen: true, type: 'png', parentId: currentFolderId }); setContextMenu(null); }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-blue-600/20 text-left rounded-xl mx-1.5 transition-colors"
              >
                <ImageIcon size={12} className="text-purple-400" /> New Image (PNG)
              </button>
            </>
          )}
        </div>
      )}

      {/* 1. Modal: Create New Item */}
      {newItemModal && (
        <div className="absolute inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 text-center shadow-2xl">
            <h3 className="font-bold text-sm tracking-wide">
              Create New {newItemModal.type === 'folder' ? 'Folder' : newItemModal.type === 'txt' ? 'Text Document' : 'Image'}
            </h3>
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter name...`}
              className="bg-[#242427] border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none text-white w-full"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') triggerCreateItem(); }}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setNewItemModal(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={triggerCreateItem}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Rename Item */}
      {renameModal && (
        <div className="absolute inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 text-center shadow-2xl">
            <h3 className="font-bold text-sm tracking-wide">Rename Item</h3>
            <input 
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={renameModal.currentName}
              className="bg-[#242427] border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none text-white w-full"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') triggerRename(); }}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setRenameModal(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={triggerRename}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarBtn({ active, onClick, icon, label, onDragOver, onDrop }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void; }) {
  return (
    <button 
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`macos-list-item flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all w-full text-left ${
        active 
          ? 'bg-blue-500/15 text-slate-900 font-semibold' 
          : 'text-slate-700 hover:bg-blue-500/10'
      }`}
      data-active={active}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function TagBtn({ color, label, active, onClick }: { color: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
        active ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5'
      }`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
      <span>{label}</span>
    </div>
  );
}
