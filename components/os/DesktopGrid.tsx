// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useOSStore, appsRegistry, AppId } from '@/store/osStore';
import { motion } from 'framer-motion';
import MacIcon from './MacIcon';

export default function DesktopGrid() {
  const { desktopShortcuts, openApp, openContextMenu, customApps, vfs } = useOSStore();

  const handleOpen = (appId: AppId) => {
    openApp(appId);
  };

  const handleRightClick = (e: React.MouseEvent, appId: AppId) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, 'shortcut', { appId });
  };

  return (
    <div className="absolute left-5 top-14 bottom-24 w-32 flex flex-col flex-wrap gap-3 z-10 pointer-events-none select-none">
      {desktopShortcuts.map((appId) => {
        const app = appsRegistry[appId] || customApps[appId];
        if (!app) return null;
        return (
          <motion.div
            key={app.id}
            onDoubleClick={() => handleOpen(app.id)}
            onTouchStart={() => handleOpen(app.id)}
            onContextMenu={(e) => handleRightClick(e, app.id)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 rounded-lg cursor-pointer transition-all duration-150 group pointer-events-auto w-24 p-2 hover:bg-[hsla(var(--system-color-light-hsl),0.2)]"
          >
            <div className="w-14 h-14 app-icon-shadow group-hover:scale-105 transition-all duration-150">
              <MacIcon id={app.id} />
            </div>
            <span className="max-w-full rounded px-1 text-[11px] font-medium text-center tracking-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate select-none">
              {app.name}
            </span>
          </motion.div>
        );
      })}

      {vfs.filter(item => item.parentId === 'desktop').map((item) => (
        <motion.div
          key={item.id}
          onDoubleClick={() => {
            if (item.type === 'folder') {
              openApp('folder', { pathId: item.id });
            } else if (item.ext === 'txt') {
              openApp('notepad', { fileId: item.id });
            } else if (item.ext === 'png' || item.ext === 'jpg') {
              openApp('gallery', { activeImg: item.content });
            }
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu(e.clientX, e.clientY, 'app-folder', item);
          }}
          className="flex flex-col items-center gap-1.5 rounded-lg cursor-pointer transition-all duration-150 group pointer-events-auto w-24 p-2 hover:bg-[hsla(var(--system-color-light-hsl),0.2)]"
        >
          <div className="w-14 h-14 app-icon-shadow group-hover:scale-105 transition-all duration-150 text-white">
            {item.type === 'folder' ? <MacIcon id="folder" /> : <MacIcon id="notepad" />}
          </div>
          <span className="max-w-full rounded px-1 text-[11px] font-medium text-center tracking-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate select-none">
            {item.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
