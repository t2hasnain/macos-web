// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useOSStore, appsRegistry, AppId } from '@/store/osStore';
import { motion } from 'framer-motion';
import { cn } from './Window';
import MacIcon from './MacIcon';
import { useEffect, useRef, useState } from 'react';

const BASE_ICON_SIZE = 57.6;
const DISTANCE_LIMIT = BASE_ICON_SIZE * 6;

function dockSizeFromDistance(distance: number | null) {
  if (distance === null) return BASE_ICON_SIZE;

  const absDistance = Math.min(Math.abs(distance), DISTANCE_LIMIT);
  const influence = 1 - absDistance / DISTANCE_LIMIT;
  return BASE_ICON_SIZE + Math.pow(influence, 2.6) * BASE_ICON_SIZE;
}

export default function Taskbar() {
  const { windows, openApp, activeWindowId, minimizeWindow, customApps, desktopShortcuts, openContextMenu } = useOSStore();
  const [dockMouseX, setDockMouseX] = useState<number | null>(null);

  const handleAppClick = (appId: AppId) => {
    const existingWindows = windows.filter(w => w.appId === appId);
    if (existingWindows.length === 0) {
      openApp(appId);
    } else {
      const win = existingWindows[0];
      if (activeWindowId === win.id && !win.isMinimized) {
        minimizeWindow(win.id);
      } else {
        openApp(appId);
      }
    }
  };

  const handleAppContextMenu = (e: React.MouseEvent, appId: AppId) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, 'dock', { appId });
  };

  return (
    <div className="fixed bottom-0 left-0 z-[9999] flex h-[5.2rem] w-full justify-center p-[0.4rem] pointer-events-none">
      <div
        className="relative flex h-full items-end rounded-[1.2rem] p-[0.3rem] pointer-events-auto transition-transform duration-300 shadow-[inset_0_0_0_0.2px_hsla(var(--system-color-grey-100-hsl),0.7),0_0_0_0.2px_hsla(var(--system-color-grey-900-hsl),0.7),hsla(0,0%,0%,0.3)_2px_5px_19px_7px] before:absolute before:inset-0 before:-z-10 before:rounded-[20px] before:backdrop-blur-[10px]"
        style={{ backgroundColor: 'hsla(var(--system-color-light-hsl), 0.4)' }}
        onMouseMove={(event) => setDockMouseX(event.clientX)}
        onMouseLeave={() => setDockMouseX(null)}
      >
        {desktopShortcuts.map((appId) => {
          const app = appsRegistry[appId] || customApps[appId];
          if (!app) return null;
          const isOpen = windows.some(w => w.appId === app.id && !w.isMinimized);
          const isActive = windows.some(w => w.appId === app.id && w.id === activeWindowId);
          
          return (
            <DockIcon
              key={app.id}
              app={app}
              dockMouseX={dockMouseX}
              isOpen={isOpen}
              isActive={isActive}
              onClick={() => handleAppClick(app.id as AppId)}
              onContextMenu={(e) => handleAppContextMenu(e, app.id as AppId)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DockIcon({
  app,
  dockMouseX,
  isOpen,
  isActive,
  onClick,
  onContextMenu,
}: {
  app: { id: string; name: string };
  dockMouseX: number | null;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(BASE_ICON_SIZE);

  useEffect(() => {
    if (dockMouseX === null || !iconRef.current) {
      setSize(BASE_ICON_SIZE);
      return;
    }

    const rect = iconRef.current.getBoundingClientRect();
    const distance = dockMouseX - (rect.left + rect.width / 2);
    setSize(dockSizeFromDistance(distance));
  }, [dockMouseX]);

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="relative group flex cursor-pointer flex-col items-center justify-end rounded-lg"
    >
      <div
        className="absolute -top-12 hidden rounded-md px-3 py-2 text-[0.8rem] font-normal tracking-[0.3px] opacity-0 shadow-[hsla(0,0%,0%,0.3)_0_1px_5px_2px] backdrop-blur-[5px] group-hover:block group-hover:opacity-100 pointer-events-none whitespace-nowrap"
        style={{
          backgroundColor: 'hsla(var(--system-color-light-hsl), 0.5)',
          color: 'var(--system-color-light-contrast)',
        }}
      >
        {app.name}
      </div>

      <motion.div
        ref={iconRef}
        className="relative flex items-center justify-center"
        animate={{ width: size, height: size }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.6 }}
      >
        <MacIcon id={app.id} />
      </motion.div>

      {isOpen && (
        <div className={cn(
          "h-1 w-1 rounded-full transition-all",
          isActive ? "bg-[var(--system-color-dark)] opacity-100" : "bg-[var(--system-color-dark)] opacity-60"
        )} />
      )}
    </motion.div>
  );
}
