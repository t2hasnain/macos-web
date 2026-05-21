// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/store/osStore';

interface HistoryLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
}

export default function TerminalApp() {
  const { vfs, createFile, createFolder, deleteItem, windows } = useOSStore();
  const [currentDirId, setCurrentDirId] = useState('root');
  
  // Custom shell accent theme
  const [termColor, setTermColor] = useState<'emerald' | 'amber' | 'purple' | 'cyan' | 'white'>('emerald');
  
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize terminal last login on mount
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toString().split(' ').slice(0, 5).join(' ');
    setHistory([
      { text: `Last login: ${dateStr} on ttys002`, type: 'system' },
      { text: 'Apple macOS zsh 5.9', type: 'success' },
      { text: 'Type "help" to list available command-line shell utilities.', type: 'output' },
      { text: '', type: 'output' }
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);


  const getPathString = () => {
    if (currentDirId === 'root') return '~';
    const activeDir = vfs.find(item => item.id === currentDirId);
    return `~/${activeDir?.name.toLowerCase() || ''}`;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const commandLine = inputVal.trim();
    if (!commandLine) return;

    // Echo input
    setHistory(prev => [...prev, { text: `macbook-pro:${getPathString()} user$ ${commandLine}`, type: 'input' }]);
    setInputVal('');

    const parts = commandLine.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const currentItems = vfs.filter(item => item.parentId === currentDirId);

    switch (cmd) {
      case 'help':
        setHistory(prev => [
          ...prev,
          { text: 'macOS Core Shell Utilities:', type: 'success' },
          { text: '  help              - Display this list of shell utilities', type: 'output' },
          { text: '  ls / dir          - List folder contents', type: 'output' },
          { text: '  cd [folder]       - Change current working folder (e.g. cd documents or cd ..)', type: 'output' },
          { text: '  pwd               - Print name of current directory', type: 'output' },
          { text: '  cat [file]        - Display file content', type: 'output' },
          { text: '  touch [name.txt]  - Create a new file', type: 'output' },
          { text: '  mkdir [folder]    - Create a new folder', type: 'output' },
          { text: '  rm [name]         - Remove file or folder', type: 'output' },
          { text: '  whoami            - Print current user identity', type: 'output' },
          { text: '  date              - Display date and time', type: 'output' },
          { text: '  uname -a          - Print system kernel configurations', type: 'output' },
          { text: '  neofetch          - Render Apple specifications and logo', type: 'output' },
          { text: '  ps / top          - Display active system window processes', type: 'output' },
          { text: '  theme [color]     - Toggle accent color (emerald, amber, purple, cyan, white)', type: 'output' },
          { text: '  clear             - Clear terminal scroll history', type: 'output' },
          { text: '  /open [appId]     - Open an application (e.g. /open calculator)', type: 'output' }
        ]);
        break;

      case 'ls':
      case 'dir':
        if (currentItems.length === 0) {
          setHistory(prev => [...prev, { text: 'total 0', type: 'output' }]);
        } else {
          setHistory(prev => [...prev, { text: `total ${currentItems.length}`, type: 'output' }]);
          currentItems.forEach((item) => {
            const isFolder = item.type === 'folder';
            setHistory(prev => [
              ...prev,
              { 
                text: `${isFolder ? 'drwxr-xr-x' : '-rw-r--r--'}   1 user   staff   ${isFolder ? '64' : '1024'} May 19 14:35 ${item.name}`, 
                type: isFolder ? 'success' : 'output' 
              }
            ]);
          });
        }
        break;

      case 'cd':
        if (!arg) {
          setCurrentDirId('root');
        } else if (arg === '..') {
          if (currentDirId === 'root') {
            setHistory(prev => [...prev, { text: 'Already in root folder.', type: 'output' }]);
          } else {
            const activeDir = vfs.find(item => item.id === currentDirId);
            setCurrentDirId(activeDir?.parentId || 'root');
          }
        } else {
          const targetDir = currentItems.find(
            item => item.type === 'folder' && item.name.toLowerCase() === arg.toLowerCase()
          );
          if (targetDir) {
            setCurrentDirId(targetDir.id);
          } else {
            setHistory(prev => [...prev, { text: `cd: no such file or directory: ${arg}`, type: 'error' }]);
          }
        }
        break;

      case 'pwd':
        {
          if (currentDirId === 'root') {
            setHistory(prev => [...prev, { text: '/Users/cupertino', type: 'output' }]);
          } else {
            const activeDir = vfs.find(item => item.id === currentDirId);
            setHistory(prev => [...prev, { text: `/Users/cupertino/${activeDir?.name.toLowerCase() || ''}`, type: 'output' }]);
          }
        }
        break;

      case 'cat':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: cat [filename.txt]', type: 'error' }]);
        } else {
          const targetFile = currentItems.find(
            item => item.type === 'file' && item.name.toLowerCase() === arg.toLowerCase()
          );
          if (targetFile) {
            setHistory(prev => [...prev, { text: targetFile.content || '(Empty File)', type: 'output' }]);
          } else {
            setHistory(prev => [...prev, { text: `cat: ${arg}: No such file or directory`, type: 'error' }]);
          }
        }
        break;

      case 'touch':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: touch [filename.txt]', type: 'error' }]);
        } else {
          const extension = arg.includes('.') ? arg.split('.').pop() || 'txt' : 'txt';
          createFile(arg, extension, 'Created via Terminal Client.', currentDirId);
          setHistory(prev => [...prev, { text: `touch: created file '${arg}'`, type: 'success' }]);
        }
        break;

      case 'mkdir':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: mkdir [directory_name]', type: 'error' }]);
        } else {
          createFolder(arg, currentDirId);
          setHistory(prev => [...prev, { text: `mkdir: created directory '${arg}'`, type: 'success' }]);
        }
        break;

      case 'rm':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: rm [item_name]', type: 'error' }]);
        } else {
          const targetItem = currentItems.find(
            item => item.name.toLowerCase() === arg.toLowerCase()
          );
          if (targetItem) {
            deleteItem(targetItem.id);
            setHistory(prev => [...prev, { text: `rm: deleted '${arg}'`, type: 'success' }]);
          } else {
            setHistory(prev => [...prev, { text: `rm: ${arg}: No such file or directory`, type: 'error' }]);
          }
        }
        break;

      case 'whoami':
        setHistory(prev => [...prev, { text: 'cupertino-user', type: 'output' }]);
        break;

      case 'date':
        setHistory(prev => [...prev, { text: new Date().toString(), type: 'output' }]);
        break;

      case 'uname':
      case 'uname -a':
        setHistory(prev => [...prev, { text: 'Darwin Kernel Version 23.4.0: Wed Feb 28 22:20:05 PST 2024; root:xnu-10089.101.21.1~1/RELEASE_ARM64_T8112 arm64', type: 'output' }]);
        break;

      case 'ps':
      case 'top':
        {
          const activeWins = windows.filter(w => w.isOpen);
          setHistory(prev => [
            ...prev,
            { text: 'PID     COMMAND             STATE       Z-INDEX', type: 'success' },
            ...activeWins.map((win, idx) => ({
              text: `${1000 + idx * 42}    ${(win.title + '.app').padEnd(19)} ${win.isMinimized ? 'Minimized' : 'Active   '}  ${win.zIndex}`,
              type: 'output' as const
            }))
          ]);
        }
        break;

      case 'theme':
        if (['emerald', 'amber', 'purple', 'cyan', 'white'].includes(arg)) {
          setTermColor(arg as any);
          setHistory(prev => [...prev, { text: `Terminal accent theme successfully changed to ${arg}!`, type: 'success' }]);
        } else {
          setHistory(prev => [...prev, { text: 'Usage: theme [emerald | amber | purple | cyan | white]', type: 'error' }]);
        }
        break;

      case 'neofetch':
        setHistory(prev => [
          ...prev,
          { text: '                    user@macbook-pro', type: 'success' },
          { text: '                ----------------', type: 'success' },
          { text: '       macOS        OS: macOS Sonoma', type: 'output' },
          { text: '      Terminal      Host: MacBook Pro', type: 'output' },
          { text: '        Kernel: Darwin 23.4.0', type: 'output' },
          { text: '        Shell: zsh 5.9 (x86_64-apple-darwin23.0)', type: 'output' },
          { text: '      Native        Theme: macOS', type: 'output' },
          { text: '       Shell        Terminal.app', type: 'output' },
          { text: '       Chip         CPU: Apple Silicon', type: 'output' },
          { text: '                    RAM: 16 GB unified storage', type: 'output' },
          { text: '', type: 'output' }
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'ping':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: ping [destination_host]', type: 'error' }]);
        } else {
          setHistory(prev => [
            ...prev,
            { text: `PING ${arg} (142.250.190.46): 56 data bytes`, type: 'output' },
            { text: '64 bytes from 142.250.190.46: icmp_seq=0 ttl=116 time=14.2 ms', type: 'output' },
            { text: '64 bytes from 142.250.190.46: icmp_seq=1 ttl=116 time=12.8 ms', type: 'output' },
            { text: `--- ${arg} ping statistics ---`, type: 'success' },
            { text: '2 packets transmitted, 2 packets received, 0.0% packet loss', type: 'success' }
          ]);
        }
        break;

      case '/open':
      case 'open':
        if (!arg) {
          setHistory(prev => [...prev, { text: 'Usage: /open [appId]', type: 'error' }]);
        } else {
          setHistory(prev => [...prev, { text: `Opening application '${arg}'...`, type: 'success' }]);
          window.dispatchEvent(new CustomEvent('open-app-from-terminal', { detail: arg }));
        }
        break;

      default:
        setHistory(prev => [...prev, { text: `zsh: command not found: ${cmd}`, type: 'error' }]);
        break;
    }
  };

  const getAccentClass = () => {
    switch (termColor) {
      case 'emerald': return 'text-emerald-400';
      case 'amber': return 'text-amber-400';
      case 'purple': return 'text-purple-400';
      case 'cyan': return 'text-cyan-400';
      case 'white': return 'text-white';
    }
  };

  const getBgClass = () => {
    switch (termColor) {
      case 'emerald': return 'bg-emerald-400';
      case 'amber': return 'bg-amber-400';
      case 'purple': return 'bg-purple-400';
      case 'cyan': return 'bg-cyan-400';
      case 'white': return 'bg-white';
    }
  };

  return (
    <div className="terminal-native flex flex-col h-full overflow-hidden p-4 font-mono select-text relative">
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 pr-1.5 scrollbar-none text-[11px] leading-relaxed">
        {history.map((line, idx) => (
          <div 
            key={idx} 
            className={`${
              line.type === 'input' 
                ? 'text-white' 
                : line.type === 'success' 
                ? `${getAccentClass()} font-bold` 
                : line.type === 'error' 
                ? 'text-rose-400 font-bold' 
                : line.type === 'system'
                ? 'text-white/40 italic'
                : 'text-white/70'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row prompt */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-white/5 pt-3 select-none">
        <span className={`${getAccentClass()} font-bold text-[11px] shrink-0`}>
          macbook-pro:${getPathString()} user$
        </span>
        <div className="flex-1 relative flex items-center">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-transparent outline-none text-white text-[11px] font-mono border-none focus:ring-0 p-0"
            autoFocus
            placeholder="Type a command..."
            spellCheck={false}
          />
          {/* Real retro blinking block cursor */}
          <span className={`w-2 h-3.5 ${getBgClass()} opacity-75 animate-ping ml-1 absolute pointer-events-none`} style={{ left: `${Math.min(inputVal.length * 6.6, 500)}px` }} />
        </div>
      </form>
    </div>
  );
}
