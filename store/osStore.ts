// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS WebOS by hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppId = 
  | 'browser' 
  | 'folder' 
  | 'notepad' 
  | 'gallery' 
  | 'settings' 
  | 'game' 
  | 'passwords' 
  | 'calculator' 
  | 'monitor'
  | 'terminal'
  | 'gemini'
  | 'chatgpt'
  | 'camera'
  | 'appstore'
  | 'aboutme'
  | string;

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  isResizable?: boolean;
  url?: string;
}

export const appsRegistry: Record<string, AppConfig> = {
  browser: { id: 'browser', name: 'Safari', icon: 'browser', defaultWidth: 950, defaultHeight: 650 },
  folder: { id: 'folder', name: 'Finder', icon: 'folder', defaultWidth: 800, defaultHeight: 550 },
  notepad: { id: 'notepad', name: 'Notepad', icon: 'notepad', defaultWidth: 850, defaultHeight: 600 },
  gallery: { id: 'gallery', name: 'Photos', icon: 'gallery', defaultWidth: 850, defaultHeight: 600 },
  settings: { id: 'settings', name: 'Settings', icon: 'settings', defaultWidth: 720, defaultHeight: 580 },
  game: { id: 'game', name: 'Arcade', icon: 'game', defaultWidth: 900, defaultHeight: 620 },
  passwords: { id: 'passwords', name: 'Keychain Access', icon: 'passwords', defaultWidth: 600, defaultHeight: 500 },
  calculator: { id: 'calculator', name: 'Calculator', icon: 'calculator', defaultWidth: 350, defaultHeight: 520, isResizable: false },
  monitor: { id: 'monitor', name: 'Activity Monitor', icon: 'monitor', defaultWidth: 650, defaultHeight: 480 },
  terminal: { id: 'terminal', name: 'Terminal', icon: 'terminal', defaultWidth: 700, defaultHeight: 480 },
  camera: { id: 'camera', name: 'Photo Booth', icon: 'camera', defaultWidth: 850, defaultHeight: 640 },
  appstore: { id: 'appstore', name: 'App Store', icon: 'appstore', defaultWidth: 980, defaultHeight: 680 },
  aboutme: { id: 'aboutme', name: 'About Developer', icon: 'aboutme', defaultWidth: 800, defaultHeight: 600 },
};

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

interface SavedPassword {
  id: string;
  title: string;
  username: string;
  passwordVal: string;
  category: string;
}

export interface VFSItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  ext?: string; // 'txt', 'png', 'jpg', 'mp4', 'app'
  appId?: string;
  content?: string; // text content or custom mock URL
  parentId: string;
  tag?: 'Red' | 'Orange' | 'Blue' | null;
}

export interface GameHistoryEntry {
  date: string;
  result: 'Win' | 'Loss' | 'Draw' | 'Score';
  score?: number;
  detail?: string;
}

export interface GameStats {
  highScore: number;
  wins: number;
  losses: number;
  draws: number;
  history: GameHistoryEntry[];
}

interface OSState {
  wallpaper: string;
  setWallpaper: (url: string) => void;
  windows: WindowState[];
  activeWindowId: string | null;
  highestZIndex: number;
  openApp: (appId: AppId, data?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPos: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  
  // Customization Accent & Theme
  accentColor: 'blue' | 'graphite' | 'pink' | 'purple' | 'green' | 'yellow';
  setAccentColor: (color: 'blue' | 'graphite' | 'pink' | 'purple' | 'green' | 'yellow') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Sound & Brightness Controls
  systemVolume: number;
  setSystemVolume: (vol: number) => void;
  displayBrightness: number;
  setDisplayBrightness: (brightness: number) => void;

  // Display Notch
  showNotch: boolean;
  setShowNotch: (show: boolean) => void;

  // Desktop Shortcut Manager
  desktopShortcuts: AppId[];
  deleteDesktopShortcut: (id: AppId) => void;
  addDesktopShortcut: (id: AppId) => void;

  // Custom Created Apps
  customApps: Record<string, AppConfig>;
  addCustomApp: (name: string, url: string, iconUrl?: string) => void;

  // Security Lock
  isLocked: boolean;
  sysPassword: string;
  lockSystem: () => void;
  unlockSystem: (password: string) => boolean;
  setSystemPassword: (password: string) => void;
  hasSetupPassword: boolean;
  
  // SafePass Manager
  savedPasswords: SavedPassword[];
  addPassword: (p: Omit<SavedPassword, 'id'>) => void;
  deletePassword: (id: string) => void;

  // Context Menu
  contextMenu: { isOpen: boolean; x: number; y: number; type: 'desktop' | 'window' | 'taskbar' | 'shortcut' | 'dock' | 'app-folder' | null; data?: any } | null;
  openContextMenu: (x: number, y: number, type: 'desktop' | 'window' | 'taskbar' | 'shortcut' | 'dock' | 'app-folder', data?: any) => void;
  closeContextMenu: () => void;
  
  // Virtual File System (VFS)
  vfs: VFSItem[];
  createFile: (name: string, ext: string, content: string, parentId: string) => void;
  createFolder: (name: string, parentId: string) => void;
  deleteItem: (id: string) => void;
  renameItem: (id: string, name: string) => void;
  moveItem: (id: string, parentId: string) => void;
  setItemTag: (id: string, tag: 'Red' | 'Orange' | 'Blue' | null) => void;
  saveFileContent: (id: string, content: string) => void;

  // Game Statistics
  gameStats: Record<string, GameStats>;
  updateGameStats: (gameId: string, result: 'Win' | 'Loss' | 'Draw' | 'Score', score?: number, detail?: string) => void;
  resetGameStats: (gameId: string) => void;

  // Clean State Reset
  resetSystem: () => void;
}

const defaultVFS: VFSItem[] = [
  { id: 'root', name: 'Root', type: 'folder', parentId: '' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root' },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'root' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'root' },
  { id: 'applications', name: 'Applications', type: 'folder', parentId: 'root' },
  
  { id: 'doc-welcome', name: 'Welcome.txt', type: 'file', ext: 'txt', content: 'Welcome to macOS.\n\nThis Finder-style file system lets you write notes, save files, create folders, rename items, and keep changes in local storage.', parentId: 'documents' },
  { id: 'doc-commands', name: 'Spotlight_Guide.txt', type: 'file', ext: 'txt', content: ' SPOTLIGHT SEARCH GUIDE:\n\n1. Press Cmd+Space or Ctrl+Space to toggle.\n2. Type mathematical expressions like "25 * 4" for live calculations.\n3. Type app names like "Safari" or "Arcade" and hit Enter to launch.\n4. Type any other text to search on Google.', parentId: 'documents' },
  
  { id: 'app-safari', name: 'Safari.app', type: 'file', ext: 'app', appId: 'browser', parentId: 'applications' },
  { id: 'app-arcade', name: 'Arcade.app', type: 'file', ext: 'app', appId: 'game', parentId: 'applications' },
  { id: 'app-calc', name: 'Calculator.app', type: 'file', ext: 'app', appId: 'calculator', parentId: 'applications' },
  { id: 'app-notes', name: 'Notepad.app', type: 'file', ext: 'app', appId: 'notepad', parentId: 'applications' },
  { id: 'app-term', name: 'Terminal.app', type: 'file', ext: 'app', appId: 'terminal', parentId: 'applications' },
  { id: 'app-camera', name: 'Photo Booth.app', type: 'file', ext: 'app', appId: 'camera', parentId: 'applications' },
  { id: 'app-store', name: 'App Store.app', type: 'file', ext: 'app', appId: 'appstore', parentId: 'applications' },

  { id: 'pic-abstract', name: 'Abstract_Wave.png', type: 'file', ext: 'png', content: '/wallpaper.png', parentId: 'pictures' },
];

const initialGameStats = {
  highScore: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  history: []
};

const defaultShortcuts: AppId[] = [
  'browser', 'folder', 'notepad', 'gallery', 'camera', 'settings', 'appstore', 'game', 'passwords', 'calculator', 'terminal', 'aboutme'
];

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      wallpaper: '/wallpaper.png',
      setWallpaper: (url) => set({ wallpaper: url }),
      windows: [],
      activeWindowId: null,
      highestZIndex: 10,

      // Accent and theme
      accentColor: 'blue',
      setAccentColor: (color) => set({ accentColor: color }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Sound/Brightness Controls
      systemVolume: 80,
      setSystemVolume: (vol) => set({ systemVolume: vol }),
      displayBrightness: 90,
      setDisplayBrightness: (brightness) => {
        set({ displayBrightness: brightness });
        // Update opacity of global overlay directly
        if (typeof document !== 'undefined') {
          let overlay = document.getElementById('brightness-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'brightness-overlay';
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.backgroundColor = 'black';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '999999';
            document.body.appendChild(overlay);
          }
          overlay.style.opacity = String((100 - brightness) * 0.0065);
        }
      },

      // Display Notch
      showNotch: true,
      setShowNotch: (show) => set({ showNotch: show }),

      // Shortcuts
      desktopShortcuts: defaultShortcuts,
      deleteDesktopShortcut: (id) => set((state) => ({
        desktopShortcuts: state.desktopShortcuts.filter(appId => appId !== id)
      })),
      addDesktopShortcut: (id) => set((state) => {
        if (state.desktopShortcuts.includes(id)) return {};
        return { desktopShortcuts: [...state.desktopShortcuts, id] };
      }),

      // Custom Created Apps
      customApps: {},
      addCustomApp: (name, url, iconUrl) => {
        const id = `custom-app-${Date.now()}`;
        const newApp: AppConfig = {
          id,
          name,
          icon: iconUrl || '',
          defaultWidth: 900,
          defaultHeight: 600,
          url: url,
        };
        set((state) => ({
          customApps: { ...state.customApps, [id]: newApp },
          desktopShortcuts: [...state.desktopShortcuts, id],
          vfs: [...state.vfs, {
            id: `app-${id}`,
            name: `${name}.app`,
            type: 'file',
            ext: 'app',
            appId: id,
            parentId: 'applications'
          }]
        }));
      },

      openApp: (appId, data) => {
        const config = appsRegistry[appId] || get().customApps[appId];
        if (!config) return;

        const existing = get().windows.find((w) => w.appId === appId);
        if (existing) {
          if (existing.isMinimized) {
            set((state) => ({
              windows: state.windows.map((w) => w.id === existing.id ? { ...w, isMinimized: false } : w)
            }));
          }
          if (data !== undefined) {
            set((state) => ({
              windows: state.windows.map((w) => w.id === existing.id ? { ...w, data } : w)
            }));
          }
          get().focusWindow(existing.id);
          return;
        }

        const newZIndex = get().highestZIndex + 1;
        const newWindow: WindowState = {
          id: `${appId}-${Date.now()}`,
          appId,
          title: config.name,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZIndex,
          x: Math.max(20, (typeof window !== 'undefined' ? window.innerWidth - config.defaultWidth : 800) / 2 + (Math.random() * 40 - 20)),
          y: Math.max(60, (typeof window !== 'undefined' ? window.innerHeight - config.defaultHeight : 600) / 2 + (Math.random() * 40 - 20)),
          width: config.defaultWidth,
          height: config.defaultHeight,
          data,
        };

        set((state) => ({
          windows: [...state.windows, newWindow],
          activeWindowId: newWindow.id,
          highestZIndex: newZIndex,
        }));
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
          activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        }));
      },

      minimizeWindow: (id) => {
        set((state) => {
          const activeWindows = state.windows.filter(w => w.id !== id && !w.isMinimized);
          const nextActive = activeWindows.length > 0 ? activeWindows[activeWindows.length - 1].id : null;
          return {
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
            activeWindowId: state.activeWindowId === id ? nextActive : state.activeWindowId,
          };
        });
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
        }));
        get().focusWindow(id);
      },

      focusWindow: (id) => {
        if (get().activeWindowId === id) return;
        const newZIndex = get().highestZIndex + 1;
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w)),
          activeWindowId: id,
          highestZIndex: newZIndex,
        }));
      },

      updateWindowPos: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      updateWindowSize: (id, width, height) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
        }));
      },

      // Security Settings
      isLocked: false,
      sysPassword: '',
      hasSetupPassword: false,
      lockSystem: () => set({ isLocked: true }),
      unlockSystem: (password) => {
        const storedPassword = get().sysPassword;
        if (!get().hasSetupPassword || password === storedPassword) {
          set({ isLocked: false });
          return true;
        }
        return false;
      },
      setSystemPassword: (password) => set({ sysPassword: password, hasSetupPassword: password.length > 0 }),

      // SafePass Database
      savedPasswords: [],
      addPassword: (p) => set((state) => ({
        savedPasswords: [...state.savedPasswords, { ...p, id: `${Date.now()}` }]
      })),
      deletePassword: (id) => set((state) => ({
        savedPasswords: state.savedPasswords.filter(p => p.id !== id)
      })),

      // Context Menu
      contextMenu: null,
      openContextMenu: (x, y, type, data) => set({ contextMenu: { isOpen: true, x, y, type, data } }),
      closeContextMenu: () => set({ contextMenu: null }),

      // Virtual File System (VFS)
      vfs: defaultVFS,
      createFile: (name, ext, content, parentId) => {
        const newFile: VFSItem = {
          id: `file-${Date.now()}`,
          name,
          type: 'file',
          ext,
          content,
          parentId
        };
        set((state) => ({ vfs: [...state.vfs, newFile] }));
      },
      createFolder: (name, parentId) => {
        const newFolder: VFSItem = {
          id: `folder-${Date.now()}`,
          name,
          type: 'folder',
          parentId
        };
        set((state) => ({ vfs: [...state.vfs, newFolder] }));
      },
      deleteItem: (id) => {
        if (id === 'root' || id === 'documents' || id === 'pictures' || id === 'downloads' || id === 'applications') return;
        set((state) => ({ vfs: state.vfs.filter(item => item.id !== id) }));
      },
      renameItem: (id, name) => {
        if (id === 'root' || id === 'documents' || id === 'pictures' || id === 'downloads' || id === 'applications') return;
        set((state) => ({
          vfs: state.vfs.map(item => item.id === id ? { ...item, name } : item)
        }));
      },
      moveItem: (id, parentId) => {
        if (id === 'root' || id === parentId) return;
        const target = get().vfs.find(item => item.id === parentId && item.type === 'folder');
        if (!target) return;
        set((state) => ({
          vfs: state.vfs.map(item => item.id === id ? { ...item, parentId } : item)
        }));
      },
      setItemTag: (id, tag) => {
        set((state) => ({
          vfs: state.vfs.map(item => item.id === id ? { ...item, tag } : item)
        }));
      },
      saveFileContent: (id, content) => {
        set((state) => ({
          vfs: state.vfs.map(item => item.id === id ? { ...item, content } : item)
        }));
      },

      // Game Statistics
      gameStats: {
        tictactoe: { ...initialGameStats },
        snake: { ...initialGameStats },
        minesweeper: { ...initialGameStats },
        cookie: { ...initialGameStats },
        memory: { ...initialGameStats }
      },
      updateGameStats: (gameId, result, score, detail) => {
        set((state) => {
          const current = state.gameStats[gameId] || { ...initialGameStats };
          const entry: GameHistoryEntry = {
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
            result,
            score,
            detail
          };

          const newWins = result === 'Win' ? current.wins + 1 : current.wins;
          const newLosses = result === 'Loss' ? current.losses + 1 : current.losses;
          const newDraws = result === 'Draw' ? current.draws + 1 : current.draws;
          const newHighScore = score !== undefined ? Math.max(current.highScore, score) : current.highScore;

          return {
            gameStats: {
              ...state.gameStats,
              [gameId]: {
                highScore: newHighScore,
                wins: newWins,
                losses: newLosses,
                draws: newDraws,
                history: [entry, ...current.history].slice(0, 50)
              }
            }
          };
        });
      },
      resetGameStats: (gameId) => {
        set((state) => ({
          gameStats: {
            ...state.gameStats,
            [gameId]: { ...initialGameStats }
          }
        }));
      },

      resetSystem: () => {
        localStorage.clear();
        set({
          wallpaper: '/wallpaper.png',
          windows: [],
          activeWindowId: null,
          highestZIndex: 10,
          accentColor: 'blue',
          theme: 'dark',
          systemVolume: 80,
          displayBrightness: 90,
          showNotch: true,
          isLocked: false,
          sysPassword: '',
          hasSetupPassword: false,
          savedPasswords: [],
          desktopShortcuts: defaultShortcuts,
          customApps: {},
          vfs: defaultVFS,
          gameStats: {
            tictactoe: { ...initialGameStats },
            snake: { ...initialGameStats },
            minesweeper: { ...initialGameStats },
            cookie: { ...initialGameStats },
            memory: { ...initialGameStats }
          }
        });
      }
    }),
    {
      name: 'web-os-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
