// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Volume2, Search, Sliders, Lock, Moon, Sun, Laptop, Power, Bluetooth, Radio, Sparkles, ExternalLink, X } from 'lucide-react';
import { useOSStore } from '@/store/osStore';
import Spotlight from './Spotlight';
import { AppleIcon, SwitchIcon } from './SVGIcons';

export default function Header() {
  const { lockSystem, openApp, showNotch, setShowNotch } = useOSStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  
  // State managers
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Control center stats
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(90);
  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [airdropActive, setAirdropActive] = useState(true);
  
  // Custom screen overlays
  const [isSleeping, setIsSleeping] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // WiFi interactive lists
  const [wifiSelected, setWifiSelected] = useState('AirPort_5G');
  const [wifiNetworks] = useState([
    { name: 'AirPort_5G', signal: 3 },
    { name: 'Home_Net_2.4G', signal: 2 },
    { name: 'Apple_Guest_Net', signal: 3 },
    { name: 'Coffee_Shop_Free_Wifi', signal: 1 },
  ]);

  // Battery interactive hardware integrations
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isCharging, setIsCharging] = useState(false);

  const ccRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Fetch real hardware battery stats using standard browser battery API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }
  }, []);

  // Time & Date Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Global Spotlight Keyboard Shortcut (Cmd+Space / Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setIsControlCenterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Brightness overlay control
  useEffect(() => {
    let overlay = document.getElementById('brightness-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'brightness-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9999999';
      overlay.style.backgroundColor = 'black';
      document.body.appendChild(overlay);
    }
    overlay.style.opacity = String((100 - brightness) / 130);
  }, [brightness]);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const menuItems: Record<string, Array<{ label: string; action: () => void; divider?: boolean }>> = {
    apple: [
      { label: 'About This Mac', action: () => { setShowAbout(true); setActiveDropdown(null); } },
      { label: 'System Settings...', action: () => { openApp('settings'); setActiveDropdown(null); }, divider: true },
      { label: 'Sleep Session', action: () => { setIsSleeping(true); setActiveDropdown(null); } },
      { label: showNotch ? 'Disable Notch' : 'Enable Notch', action: () => { setShowNotch(!showNotch); setActiveDropdown(null); } },
      { label: 'Restart...', action: () => window.location.reload() },
      { label: 'Shut Down...', action: () => { setIsShutDown(true); setActiveDropdown(null); }, divider: true },
      { label: 'Lock Screen', action: () => { lockSystem(); setActiveDropdown(null); } },
    ],
    finder: [
      { label: 'About Finder', action: () => alert('Finder: Simulated Apple file structures.') },
      { label: 'New Finder Window', action: () => openApp('folder') },
      { label: 'Preferences...', action: () => openApp('settings'), divider: true },
      { label: 'Empty Trash', action: () => alert('Trash emptied successfully!') }
    ],
    file: [
      { label: 'New Window', action: () => openApp('folder') },
      { label: 'New Document Note', action: () => openApp('notepad') },
      { label: 'Open Safari Tab', action: () => openApp('browser'), divider: true },
      { label: 'Close Active Window', action: () => alert('Double-click window red traffic light to close.') }
    ],
    edit: [
      { label: 'Undo Action', action: () => {} },
      { label: 'Redo Action', action: () => {}, divider: true },
      { label: 'Cut Selection', action: () => {} },
      { label: 'Copy Clipboard', action: () => {} },
      { label: 'Paste Clipboard', action: () => {} }
    ],
    view: [
      { label: 'Reload Desktop View', action: () => window.location.reload() },
      { label: 'Toggle Full Screen Mode', action: () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }}
    ],
    help: [
      { label: 'macOS Help', action: () => openApp('browser', 'https://support.apple.com/macos') },
      { label: 'Spotlight Quick Search', action: () => setIsSpotlightOpen(true) }
    ]
  };

  return (
    <>
      {/* Top Menu Bar Container */}
      <header className="fixed top-0 inset-x-0 h-[1.8rem] bg-[hsla(var(--system-color-light-hsl),0.3)] backdrop-blur-[12px] text-[color:var(--system-color-light-contrast)] flex items-center justify-between px-4 z-[99999] select-none text-[0.8rem] shadow-[0_0_1px_rgba(0,0,0,0.1)] font-[var(--system-font-family)]" ref={headerRef}>
        
        {/* Left: Logo & Dropdown Menus */}
        <div className="flex items-center gap-1.5 h-full">
          {/* Logo Dropdown (Apple) */}
          <div className="relative h-full flex items-center">
            <span 
              onClick={() => toggleDropdown('apple')}
              className={`cursor-pointer hover:bg-[hsla(var(--system-color-dark-hsl),0.2)] px-2.5 h-[1.4rem] rounded transition-all flex items-center justify-center ${
                activeDropdown === 'apple' ? 'bg-[hsla(var(--system-color-dark-hsl),0.2)]' : ''
              }`}
            >
              <AppleIcon className="w-4 h-4" />
            </span>
            {activeDropdown === 'apple' && <DropdownMenu items={menuItems.apple} />}
          </div>

          {/* Regular menu titles */}
          {['Finder', 'File', 'Edit', 'View', 'Help'].map((item) => {
            const lowerItem = item.toLowerCase();
            return (
              <div key={item} className="relative h-full flex items-center">
                <span 
                  onClick={() => toggleDropdown(lowerItem)}
                  className={`cursor-pointer hover:bg-[hsla(var(--system-color-dark-hsl),0.2)] px-2 h-[1.4rem] flex items-center rounded transition-all ${
                    activeDropdown === lowerItem ? 'bg-[hsla(var(--system-color-dark-hsl),0.2)]' : ''
                  } ${item === 'Finder' ? 'font-semibold ml-1' : 'font-medium'}`}
                >
                  {item}
                </span>
                {activeDropdown === lowerItem && <DropdownMenu items={menuItems[lowerItem]} />}
              </div>
            );
          })}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-3.5 text-white/90">
          
          {/* 1. Real-time Wi-Fi Network Dropdown Selector */}
          <div className="relative">
            <Wifi 
              size={13} 
              className={`cursor-pointer hover:text-white transition-all ${wifiActive ? 'text-blue-400' : 'text-white/40'}`} 
              onClick={() => toggleDropdown('wifi')}
            />
            {activeDropdown === 'wifi' && (
              <div className="absolute right-0 top-6 w-52 bg-[#141822]/90 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl p-3 flex flex-col gap-2.5 text-white text-[11px] font-medium z-[999999] select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 px-1">
                  <span className="text-white/45 font-bold uppercase tracking-wider text-[8px]">Wi-Fi Networks</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setWifiActive(!wifiActive); }}
                    className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                      wifiActive ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/10 hover:bg-white/15 text-white/60'
                    }`}
                  >
                    {wifiActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
                
                {wifiActive ? (
                  <div className="flex flex-col gap-0.5">
                    {wifiNetworks.map((net) => {
                      const isConnected = net.name === wifiSelected;
                      return (
                        <div 
                          key={net.name}
                          onClick={(e) => { e.stopPropagation(); setWifiSelected(net.name); }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                            isConnected ? 'bg-blue-600/20 text-white font-bold' : 'hover:bg-white/5 text-white/70'
                          }`}
                        >
                          <span className="truncate">{net.name}</span>
                          <span className="text-[8px] text-white/40">{isConnected ? 'Connected' : '📶'}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-2.5 text-white/30 text-[9px] font-bold">Wi-Fi is Off</div>
                )}
              </div>
            )}
          </div>

          {/* 2. Interactive Sound Output Control Dropdown */}
          <div className="relative">
            <Volume2 
              size={13} 
              className={`cursor-pointer hover:text-white transition-all ${volume > 0 ? 'text-blue-400' : 'text-white/40'}`} 
              onClick={() => toggleDropdown('sound')}
            />
            {activeDropdown === 'sound' && (
              <div className="absolute right-0 top-6 w-52 bg-[#141822]/90 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl p-3.5 flex flex-col gap-2.5 text-white text-[11px] font-medium z-[999999] select-none animate-in fade-in zoom-in-95 duration-100">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 px-1">
                  <span className="text-white/45 font-bold uppercase tracking-wider text-[8px]">Sound Output</span>
                  <span className="text-blue-400 font-bold">{volume}%</span>
                </div>
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <Volume2 size={12} className="text-blue-400 shrink-0" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 accent-blue-500 h-1.5 rounded-lg cursor-pointer bg-white/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1 mt-1 text-[8px] text-white/70">
                    <span className="text-white/45 font-bold uppercase tracking-wider text-[7px] mb-0.5">Output Device</span>
                    <div className="flex items-center justify-between px-2 py-1 bg-blue-600/20 rounded-md font-bold text-white">
                      <span>Internal Speakers</span>
                      <span>✓</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-md text-white/50 cursor-pointer transition-colors">
                      <span>Studio Display Audio</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Real Hardware Integrated Battery Dropdown */}
          <div className="relative">
            <Battery 
              size={15} 
              className={`cursor-pointer hover:text-white transition-all ${isCharging ? 'text-emerald-400 animate-pulse' : 'text-white'}`} 
              onClick={() => toggleDropdown('battery')}
            />
            {activeDropdown === 'battery' && (
              <div className="absolute right-0 top-6 w-52 bg-[#141822]/90 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl p-3 flex flex-col gap-2.5 text-white text-[11px] font-medium z-[999999] select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 px-1">
                  <span className="text-white/45 font-bold uppercase tracking-wider text-[8px]">Power Source</span>
                  <span className="text-emerald-400 font-bold">{batteryLevel}%</span>
                </div>
                <div className="flex flex-col gap-1.5 px-1 font-semibold text-white/80">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-white/45 font-medium">Source:</span>
                    <span>{isCharging ? 'Power Adapter' : 'Battery'}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-white/45 font-medium">Status:</span>
                    <span>{isCharging ? 'Charging' : 'Discharging'}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-white/45 font-medium">Health:</span>
                    <span className="text-emerald-400">100% (Normal)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-3 w-px bg-white/10 mx-0.5" />

          {/* Search Trigger */}
          <div className="relative h-full flex items-center">
            <button 
              onClick={() => setIsSpotlightOpen(true)}
              className="p-1 hover:bg-[hsla(var(--system-color-dark-hsl),0.2)] rounded transition-all text-inherit"
            >
              <Search size={14} />
            </button>
          </div>
          
          {/* Control Center Panel Trigger */}
          <div className="relative h-full flex items-center" ref={ccRef}>
            <button 
              onClick={() => setIsControlCenterOpen(!isControlCenterOpen)}
              className={`flex items-center justify-center cursor-pointer hover:bg-[hsla(var(--system-color-dark-hsl),0.2)] px-1.5 h-[1.4rem] rounded transition-all ${
                isControlCenterOpen ? 'bg-[hsla(var(--system-color-dark-hsl),0.2)]' : ''
              }`}
            >
              <SwitchIcon className="w-[1rem] h-[1rem]" />
            </button>

            {/* Control Center Panel */}
            {isControlCenterOpen && (
              <div className="absolute right-0 top-6.5 w-64 bg-[#141822]/85 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-3xl p-4.5 flex flex-col gap-3.5 text-white">
                
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setWifiActive(!wifiActive)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                      wifiActive ? 'bg-blue-600' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Radio size={14} />
                    <div className="flex flex-col text-[9px] font-bold">
                      <span>Wi-Fi</span>
                      <span className="opacity-70 text-[8px]">{wifiActive ? 'Connected' : 'Off'}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setBluetoothActive(!bluetoothActive)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                      bluetoothActive ? 'bg-blue-600' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Bluetooth size={14} />
                    <div className="flex flex-col text-[9px] font-bold">
                      <span>Bluetooth</span>
                      <span className="opacity-70 text-[8px]">{bluetoothActive ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex flex-col gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                  {/* Display Brightness */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider flex justify-between">
                      <span>Display Brightness</span>
                      <span>{brightness}%</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Sun size={12} className="text-yellow-400" />
                      <input 
                        type="range" 
                        min="15" 
                        max="100" 
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="flex-1 accent-blue-500 h-1.5 rounded-lg cursor-pointer bg-white/10"
                      />
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider flex justify-between">
                      <span>System Sound</span>
                      <span>{volume}%</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Volume2 size={12} className="text-blue-400" />
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 accent-blue-500 h-1.5 rounded-lg cursor-pointer bg-white/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Session Locks shortcuts */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => { lockSystem(); setIsControlCenterOpen(false); }}
                    className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock size={10} /> Lock
                  </button>
                  <button 
                    onClick={() => { setIsSleeping(true); setIsControlCenterOpen(false); }}
                    className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Moon size={10} /> Sleep
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 cursor-default select-none text-inherit font-medium ml-2">
            <span>{date}</span>
            <span>{time}</span>
          </div>
        </div>
      </header>

      {/* Notch */}
      {showNotch && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[160px] h-[28px] bg-black rounded-b-2xl z-[999999] pointer-events-auto flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] relative">
             {/* Camera lens reflection */}
             <div className="absolute top-[2px] right-[2px] w-[2px] h-[2px] bg-blue-400/30 rounded-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black" />
          </div>
          <div className="w-1 h-1 rounded-full bg-emerald-500 opacity-60 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
        </div>
      )}

      {/* Spotlight Component Mount */}
      <Spotlight isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />

      {/* 1. Sleep Screen overlay */}
      {isSleeping && (
        <div 
          onClick={() => setIsSleeping(false)}
          className="fixed inset-0 z-[99999999] bg-black cursor-pointer flex items-center justify-center select-none"
        >
          <div className="flex flex-col items-center gap-3 text-white/30 animate-pulse">
            <Moon size={40} />
            <span className="text-xs font-semibold uppercase tracking-widest">Click to Wake</span>
          </div>
        </div>
      )}

      {/* 2. Shutdown screen overlay */}
      {isShutDown && (
        <div className="fixed inset-0 z-[99999999] bg-black flex items-center justify-center select-none text-white">
          <div className="flex flex-col items-center gap-6 p-8 bg-[#18181b] border border-white/10 rounded-3xl max-w-sm text-center shadow-2xl">
            <Power className="text-red-500" size={36} />
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm">Mac Shut Down</h3>
              <p className="text-xs text-white/50 leading-relaxed">Your Mac is shut down. Click below to start the session again.</p>
            </div>
            <button 
              onClick={() => setIsShutDown(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              Start Up
            </button>
          </div>
        </div>
      )}

      {/* About This Mac */}
      {showAbout && (
        <div className="fixed inset-0 z-[9999999] bg-black/40 backdrop-blur-sm flex items-center justify-center select-none">
          <div className="bg-[#18181b]/90 border border-white/10 backdrop-blur-2xl p-6.5 rounded-2xl w-full max-w-sm flex flex-col gap-4 text-center shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-black tracking-wider uppercase text-white/40 flex items-center gap-1">
                <Sparkles size={13} className="text-pink-500" /> About This Mac
              </span>
              <button 
                onClick={() => setShowAbout(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <h3 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400">
              macOS
            </h3>
            <span className="text-[9px] text-white/40 font-black tracking-widest uppercase">
              Version 14.5 Sonoma
            </span>
            
            <div className="bg-black/30 rounded-xl p-4 text-left flex flex-col gap-2.5 text-xs font-medium border border-white/5">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Core Framework</span>
                <span>Next.js 16.2 & React 19</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Open Source Try</span>
                <span className="text-emerald-400 font-bold">Yes (Github Sandbox)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">License Terms</span>
                <span className="text-red-400 font-bold">Strictly Non-Copy / Custom</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Storage Engine</span>
                <span className="text-blue-400 font-bold">Zustand & LocalStorage</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <a 
                href="https://github.com/t2hasnain/creaytic-webos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Contribute to Github</span>
                <ExternalLink size={10} />
              </a>
              <button 
                onClick={() => setShowAbout(false)}
                className="py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold transition-all text-white/70"
              >
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DropdownMenu({ items }: { items: Array<{ label: string; action: () => void; divider?: boolean }> }) {
  return (
    <div className="absolute left-0 top-5.5 bg-[#141822]/85 border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl py-1.5 min-w-[170px] flex flex-col gap-0.5 text-white text-[11px] font-medium z-[999999]">
      {items.map((item, idx) => (
        <div key={idx}>
          <div
            onClick={(e) => { e.stopPropagation(); item.action(); }}
            className="px-3.5 py-2 hover:bg-blue-600/20 active:bg-blue-600/30 cursor-pointer transition-all rounded-xl mx-1.5"
          >
            {item.label}
          </div>
          {item.divider && <div className="h-px bg-white/5 my-1 mx-3" />}
        </div>
      ))}
    </div>
  );
}
