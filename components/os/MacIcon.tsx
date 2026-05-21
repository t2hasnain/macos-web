// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS WebOS by hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useOSStore } from '@/store/osStore';

interface MacIconProps {
  id: string;
  className?: string;
}

export default function MacIcon({ id, className = "w-full h-full" }: MacIconProps) {
  const customApp = useOSStore(state => id.startsWith('custom-app-') ? state.customApps[id] : null);

  if (id.startsWith('custom-app-') && customApp) {
    if (customApp.icon) {
      return (
        <div className={`${className} rounded-2xl overflow-hidden shadow-md bg-white flex items-center justify-center border border-white/10 w-full h-full`}>
          <img src={customApp.icon} alt={customApp.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Premium fallback: custom gradient icon with first letter!
    const gradients = [
      'from-pink-500 via-rose-500 to-red-500',
      'from-emerald-400 to-teal-500',
      'from-violet-600 to-indigo-600',
      'from-amber-400 via-orange-500 to-rose-600',
      'from-cyan-400 to-blue-500',
      'from-purple-500 to-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < customApp.name.length; i++) {
      hash = customApp.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    const initial = customApp.name.trim().charAt(0).toUpperCase();

    return (
      <div className={`${className} rounded-2xl shadow-md bg-gradient-to-tr ${gradients[idx]} flex items-center justify-center border border-white/20 select-none relative group overflow-hidden w-full h-full`}>
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <span className="text-white font-black text-xl drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]">{initial}</span>
      </div>
    );
  }

  // Map WebOS app IDs to macOS public/app-icons
  const imageMap: Record<string, string> = {
    browser: '/app-icons/safari/256.png',
    folder: '/app-icons/finder/256.png',
    notepad: '/app-icons/notes/256.png',
    gallery: '/app-icons/photos/256.png',
    settings: '/app-icons/system-preferences/256.png',
    calculator: '/app-icons/calculator/256.png',
    terminal: '/app-icons/terminal/256.png',
    camera: '/app-icons/facetime/256.png',
    game: '/apple-arcade.webp',
    passwords: '/Apple_Passwords_29.webp',
    appstore: '/app-icons/appstore/256.png',
    aboutme: '/cat.png',
    monitor: '/app-icons/activity-monitor/256.svg',
    mail: '/app-icons/mail/256.png',
    calendar: '/app-icons/calendar/256.png',
    contacts: '/app-icons/contacts/256.png',
    messages: '/app-icons/messages/256.png',
    music: '/app-icons/music/256.png',
    podcasts: '/app-icons/podcasts/256.png',
    tv: '/app-icons/tv/256.png',
    vscode: '/app-icons/vscode/256.png'
  };

  if (imageMap[id]) {
    return (
      <img src={imageMap[id]} alt={id} className={`${className} object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]`} />
    );
  }

  // Fallback for custom or missing apps (Gemini, ChatGPT, Game, Passwords, Monitor)
  switch (id) {
    case 'game': // Apple Arcade purple/pink gamepad
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arcadeBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="padBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <filter id="gameShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#gameShadow)">
            <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#arcadeBg)" />
            <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <rect x="14" y="20" width="36" height="24" rx="12" fill="url(#padBody)" />
            <path d="M23 28 H27 V32 H23 Z M25 26 V34 M22 30 H28" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="39" cy="32" r="2.2" fill="#ef4444" />
            <circle cx="43" cy="28" r="2.2" fill="#3b82f6" />
            <circle cx="43" cy="36" r="2.2" fill="#10b981" />
            <circle cx="47" cy="32" r="2.2" fill="#f59e0b" />
            <rect x="29" y="24" width="2.5" height="1" rx="0.5" fill="#94a3b8" />
            <rect x="32.5" y="24" width="2.5" height="1" rx="0.5" fill="#94a3b8" />
          </g>
        </svg>
      );

    case 'passwords': // SafePass Padlock
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="50%" stopColor="#f5b041" />
              <stop offset="100%" stopColor="#b7950b" />
            </linearGradient>
            <linearGradient id="steelShackle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cfd8dc" />
              <stop offset="100%" stopColor="#78909c" />
            </linearGradient>
            <filter id="lockShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#lockShadow)">
            <path 
              d="M20 28 V19 C20 12.3 25.3 7 32 7 C38.7 7 44 12.3 44 19 V28" 
              stroke="url(#steelShackle)" 
              strokeWidth="5" 
              strokeLinecap="round" 
              fill="none" 
            />
            <rect x="12" y="23" width="40" height="32" rx="9" fill="url(#goldPlate)" />
            <rect x="12" y="23" width="40" height="32" rx="9" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <circle cx="32" cy="35" r="3.5" fill="#1e293b" />
            <path d="M30.5 37.5 L33.5 37.5 L34 46 L30 46 Z" fill="#1e293b" />
            <path d="M15 26 H49" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'monitor': // Activity Monitor EKG line
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="monitorBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="ekgLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="monitorShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#monitorShadow)">
            <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#monitorBody)" />
            <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <g opacity="0.15">
              <line x1="4" y1="18" x2="60" y2="18" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="4" y1="32" x2="60" y2="32" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="4" y1="46" x2="60" y2="46" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="18" y1="4" x2="18" y2="60" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="32" y1="4" x2="32" y2="60" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="46" y1="4" x2="46" y2="60" stroke="#ffffff" strokeWidth="0.5" />
            </g>
            <path 
              d="M6 32 H20 L24 20 L28 44 L32 30 L35 34 L38 32 H58" 
              stroke="url(#ekgLine)" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              filter="drop-shadow(0 0 4px rgba(52, 211, 153, 0.4))"
            />
          </g>
        </svg>
      );

    case 'gemini': // Google Gemini Glowing Star Icon
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="geminiBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d0e12" />
              <stop offset="100%" stopColor="#07080a" />
            </linearGradient>
            <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9bc5ff" />
              <stop offset="35%" stopColor="#84b0ff" />
              <stop offset="70%" stopColor="#ea9aff" />
              <stop offset="100%" stopColor="#ffbade" />
            </linearGradient>
            <filter id="geminiShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#geminiShadow)">
            <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#geminiBg)" />
            <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            <path 
              d="M32 14c.7 6.8 5.2 11.2 12 12-6.8.8-11.3 5.2-12 12-.7-6.8-5.2-11.2-12-12 6.8-.8 11.3-5.2 12-12z" 
              fill="url(#geminiGrad)" 
              filter="drop-shadow(0 0 6px rgba(132, 176, 255, 0.5))"
            />
            <path 
              d="M45 37c.4 4.5 3.5 7.5 8 8-4.5.5-7.6 3.5-8 8-.4-4.5-3.5-7.5-8-8 4.5-.5 7.6-3.5 8-8z" 
              fill="url(#geminiGrad)" 
              opacity="0.8"
            />
          </g>
        </svg>
      );

    case 'chatgpt': // ChatGPT Official Green Swirl Icon
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="gptShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#gptShadow)">
            <rect x="4" y="4" width="56" height="56" rx="14" fill="#10a37f" />
            <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <path 
              d="M37.5 24.4c-.6-1-1.8-1.4-2.8-.8l-3.3 1.9v-7c0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2v7l-3.3-1.9c-1-.6-2.3-.2-2.8.8-.6 1-.2 2.3.8 2.8l6 3.5-6 3.5c-1 .6-1.4 1.8-.8 2.8.4.7 1.1 1 1.8 1.1.3 0 .7-.1 1-.3l6-3.5v7c0 1.2 1 2.2 2.2 2.2s2.2-1 2.2-2.2v-7l6 3.5c.3.2.6.3 1 .3.7 0 1.4-.4 1.8-1.1.6-1 .2-2.3-.8-2.8l-6-3.5 6-3.5c1-.6 1.4-1.8.8-2.8z" 
              fill="#ffffff" 
            />
          </g>
        </svg>
      );

    default:
      return null;
  }
}
