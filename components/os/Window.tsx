// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Minus, X, Maximize } from 'lucide-react';
import { useOSStore } from '@/store/osStore';
import { useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface WindowProps {
  id: string;
  children: React.ReactNode;
}

export default function Window({ id, children }: WindowProps) {
  const windowState = useOSStore((state) => state.windows.find((w) => w.id === id));
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, activeWindowId } = useOSStore();
  const windowRef = useRef<HTMLDivElement>(null);
  
  if (!windowState) return null;
  
  const { title, isMinimized, isMaximized, zIndex, x, y, width, height, appId } = windowState;
  const isActive = activeWindowId === id;

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          ref={windowRef}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: isMaximized ? 0 : x,
            y: isMaximized ? 0 : y,
            width: isMaximized ? '100vw' : width,
            height: isMaximized ? 'calc(100vh - 64px)' : height, // 64px for taskbar
          }}
          exit={{ opacity: 0, scale: 0.86 }}
          transition={{ duration: 0.3, ease: [0.37, 0, 0.63, 1] }}
          drag={!isMaximized}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            if (!isMaximized) updateWindowPos(id, info.point.x, info.point.y);
          }}
          onPointerDown={() => focusWindow(id)}
          className={cn(
            "absolute flex flex-col rounded-xl overflow-hidden glass-panel border transition-shadow duration-300",
            isActive 
              ? "shadow-[0_8.5px_10px_rgba(0,0,0,0.28),0_68px_80px_rgba(0,0,0,0.56)]" 
              : "shadow-[0_8.5px_10px_rgba(0,0,0,0.115),0_68px_80px_rgba(0,0,0,0.23)]"
          )}
          style={{ zIndex }}
        >
          {/* Title Bar */}
          <div
            className={cn(
              "flex h-11 items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-black/5 relative backdrop-blur-xl",
              isActive ? "bg-[hsla(var(--system-color-light-hsl),0.35)]" : "bg-[hsla(var(--system-color-light-hsl),0.22)]"
            )}
            onDoubleClick={() => maximizeWindow(id)}
          >
            {/* Traffic Lights */}
            <div className={cn("flex items-center gap-2.5 z-10 group/traffic", !isActive && "opacity-75")}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  if (appId === 'notepad') {
                    window.dispatchEvent(new CustomEvent('notepad-try-close', { detail: { windowId: id } }));
                  } else {
                    closeWindow(id);
                  }
                }}
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-transform duration-100 shadow-[0_0_0_0.5px_#e0443e] group-hover/traffic:scale-110",
                  isActive ? "bg-[#ff5f56]" : "bg-[#b6b6b7] shadow-[0_0_0_0.5px_hsla(var(--system-color-dark-hsl),0.5)]"
                )}
              >
                <X className="w-2 h-2 text-red-950 opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => minimizeWindow(id)}
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-transform duration-100 shadow-[0_0_0_0.5px_#dea123] group-hover/traffic:scale-110",
                  isActive ? "bg-[#ffbd2e]" : "bg-[#b6b6b7] shadow-[0_0_0_0.5px_hsla(var(--system-color-dark-hsl),0.5)]"
                )}
              >
                <Minus className="w-2 h-2 text-yellow-950 opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => maximizeWindow(id)}
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-transform duration-100 shadow-[0_0_0_0.5px_#1aab29] group-hover/traffic:scale-110",
                  isActive ? "bg-[#27c93f]" : "bg-[#b6b6b7] shadow-[0_0_0_0.5px_hsla(var(--system-color-dark-hsl),0.5)]"
                )}
              >
                <Maximize className="w-2 h-2 text-green-950 opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Centered Title */}
            <div
              className="absolute left-1/2 -translate-x-1/2 text-[0.78rem] font-medium tracking-[0.2px] select-none"
              style={{ color: 'color-mix(in srgb, var(--system-color-light-contrast) 80%, transparent)' }}
            >
              {title}
            </div>

            {/* Spacer */}
            <div className="w-[60px]" />
          </div>

          {/* Window Content */}
          <div className="flex-1 overflow-hidden bg-[hsla(var(--system-color-light-hsl),0.56)] backdrop-blur-md relative cursor-default text-[color:var(--system-color-light-contrast)]">
            {children}
            {!isActive && <div className="absolute inset-0 z-50" onPointerDown={() => focusWindow(id)} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
