// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useOSStore, appsRegistry, AppId } from '@/store/osStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Monitor, Trash2, PlusCircle, Pin, PinOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MacDocumentIcon, MacFolderIcon } from './MacFileIcon';
import MacIcon from './MacIcon';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, openApp, deleteDesktopShortcut, addDesktopShortcut, desktopShortcuts, createFolder, createFile, deleteItem } = useOSStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu?.isOpen) {
        closeContextMenu();
        setShowAddMenu(false);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu?.isOpen) return null;

  const { x, y, type, data } = contextMenu;

  const availableShortcuts = Object.keys(appsRegistry).filter(
    (appId) => !desktopShortcuts.includes(appId as AppId)
  ) as AppId[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[99999] bg-[#0c1017]/85 backdrop-blur-3xl rounded-2xl py-2 min-w-[220px] text-xs font-semibold text-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10"
        style={{ top: y, left: x }}
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'desktop' && (
          <>
            <MenuItem 
              icon={<MacFolderIcon className="w-5 h-5" />} 
              label="New Folder" 
              onClick={() => { 
                const name = window.prompt('Enter folder name:', 'New Folder');
                if (name) createFolder(name, 'desktop'); 
                closeContextMenu(); 
              }} 
            />
            <MenuItem 
              icon={<MacDocumentIcon className="w-5 h-5" />} 
              label="New Document" 
              onClick={() => { 
                const name = window.prompt('Enter document name:', 'New Document');
                if (name) createFile(name.endsWith('.txt') ? name : `${name}.txt`, 'txt', '', 'desktop'); 
                closeContextMenu(); 
              }} 
            />
            <MenuItem 
              icon={<PlusCircle size={15} className="text-pink-500" />} 
              label="New App" 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-new-app-modal'));
                closeContextMenu();
              }} 
            />
            <MenuDivider />
            
            {/* Cascade / Expandable Add Application Shortcut submenu */}
            <div className="relative">
              <MenuItem 
                icon={<PlusCircle size={15} className="text-indigo-400" />} 
                label="Add App Shortcut" 
                onClick={() => setShowAddMenu(!showAddMenu)} 
              />
              
              {showAddMenu && (
                <div className="absolute left-[210px] top-0 bg-[#0c1017]/90 border border-white/10 rounded-xl py-1.5 min-w-[150px] shadow-2xl flex flex-col gap-0.5">
                  {availableShortcuts.length === 0 ? (
                    <span className="text-[10px] text-white/40 italic px-3 py-1.5 block">All apps pinned</span>
                  ) : (
                    availableShortcuts.map((appId) => {
                      const app = appsRegistry[appId];
                      return (
                        <button
                          key={appId}
                          onClick={() => {
                            addDesktopShortcut(appId);
                            closeContextMenu();
                            setShowAddMenu(false);
                          }}
                          className="text-left text-[10px] px-3 py-1.5 hover:bg-blue-600/30 text-white font-bold rounded-lg mx-1 transition-colors"
                        >
                          {app.name}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <MenuDivider />
            <MenuItem 
              icon={<RefreshCw size={15} className="text-purple-400" />} 
              label="Reload Desktop" 
              onClick={() => { window.location.reload(); closeContextMenu(); }} 
            />
            <MenuDivider />
            <MenuItem 
              icon={<Monitor size={15} className="text-pink-400" />} 
              label="Change Wallpaper Preset" 
              onClick={() => { openApp('settings'); closeContextMenu(); }} 
            />
            <MenuItem 
              icon={<MacIcon id="settings" className="w-5 h-5" />} 
              label="Settings App" 
              onClick={() => { openApp('settings'); closeContextMenu(); }} 
            />
          </>
        )}

        {type === 'shortcut' && data && (
          <>
            <MenuItem 
              icon={<Trash2 size={15} className="text-red-400" />} 
              label="Delete from Home" 
              onClick={() => { deleteDesktopShortcut(data.appId); closeContextMenu(); }} 
            />
          </>
        )}

        {type === 'dock' && data && (
          <>
            <MenuItem 
              icon={<PinOff size={15} className="text-orange-400" />} 
              label="Remove from Dock" 
              onClick={() => { deleteDesktopShortcut(data.appId); closeContextMenu(); }} 
            />
          </>
        )}

        {type === 'app-folder' && data && (
          <>
            <MenuItem 
              icon={<Pin size={15} className="text-blue-400" />} 
              label="Add to Home" 
              onClick={() => { addDesktopShortcut(data.appId); closeContextMenu(); }} 
            />
            <MenuItem 
              icon={<Pin size={15} className="text-indigo-400" />} 
              label="Pin to Bar (Dock)" 
              onClick={() => { addDesktopShortcut(data.appId); closeContextMenu(); }} 
            />
            <MenuDivider />
            <MenuItem 
              icon={<Trash2 size={15} className="text-red-500" />} 
              label="Delete Data" 
              onClick={() => { deleteItem(data.id); deleteDesktopShortcut(data.appId); closeContextMenu(); }} 
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-600/20 active:bg-blue-600/30 cursor-pointer transition-all rounded-xl mx-1.5"
      onClick={onClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function MenuDivider() {
  return <div className="h-px bg-white/5 my-1.5 mx-3" />;
}
