// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState } from 'react';
import { useOSStore } from '@/store/osStore';
import { Plus, Trash2, Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import MacIcon from '../MacIcon';

export default function PasswordApp() {
  const { savedPasswords, addPassword, deletePassword } = useOSStore();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [category, setCategory] = useState('Personal');
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  // Generator State
  const [genLength, setGenLength] = useState(16);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let result = '';
    for (let i = 0; i < genLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordVal(result);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !username || !passwordVal) return;
    addPassword({ title, username, passwordVal, category });
    setTitle('');
    setUsername('');
    setPasswordVal('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="macos-app flex h-full backdrop-blur-xl">
      {/* Left panel: Saved Vault */}
      <div className="macos-sidebar w-72 border-r p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <MacIcon id="passwords" className="w-7 h-7" />
          <h2 className="text-md font-semibold">Keychain Access</h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {savedPasswords.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">
              No passwords saved yet
            </div>
          ) : (
            savedPasswords.map((item) => (
              <div 
                key={item.id} 
                className="macos-card rounded-xl p-3.5 flex flex-col gap-2 relative group hover:bg-blue-500/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-blue-500/15 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-sm mt-1 text-slate-900">{item.title}</h3>
                  </div>
                  <button 
                    onClick={() => deletePassword(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  <span>User: <strong className="text-slate-900">{item.username}</strong></span>
                  <div className="macos-input flex items-center gap-1.5 mt-1 p-1.5 rounded-lg">
                    <span className="font-mono text-slate-900 truncate flex-1">
                      {showPass[item.id] ? item.passwordVal : '••••••••••••'}
                    </span>
                    <button 
                      onClick={() => setShowPass(p => ({ ...p, [item.id]: !p[item.id] }))}
                      className="text-white/40 hover:text-white"
                    >
                      {showPass[item.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button 
                      onClick={() => handleCopy(item.passwordVal, item.id)}
                      className="text-white/40 hover:text-white"
                    >
                      {copiedId === item.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Generator & Creator */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        <form onSubmit={handleAdd} className="macos-panel rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-sm border-b border-black/10 pb-2">Add New Password</h3>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text"
              placeholder="Application Title (e.g. Google)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="macos-input rounded-lg px-3.5 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="text"
              placeholder="Username / Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="macos-input rounded-lg px-3.5 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Password"
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              className="macos-input flex-1 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="macos-input rounded-lg px-3.5 py-2 text-xs outline-none"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Finance">Finance</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <button 
            type="submit"
            className="macos-primary active:scale-95 text-xs py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={14} /> Save to Vault
          </button>
        </form>

        {/* Password Generator */}
        <div className="macos-panel rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-black/10 pb-2">
            <h3 className="font-semibold text-sm">Generator</h3>
            <button 
              onClick={handleGenerate}
              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
            >
              <RefreshCw size={12} /> Generate
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Length: {genLength}</span>
              <input 
                type="range"
                min={8}
                max={32}
                value={genLength}
                onChange={(e) => setGenLength(Number(e.target.value))}
                className="w-32 accent-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useNumbers} 
                  onChange={(e) => setUseNumbers(e.target.checked)}
                  className="accent-blue-500"
                />
                Numbers
              </label>
              
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useSymbols} 
                  onChange={(e) => setUseSymbols(e.target.checked)}
                  className="accent-blue-500"
                />
                Symbols
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
