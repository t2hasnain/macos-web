// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity } from 'lucide-react';
import MacIcon from '../MacIcon';

export default function MonitorApp() {
  const [cpu, setCpu] = useState(25);
  const [ram, setRam] = useState(58);
  const [netSpeed, setNetSpeed] = useState(82.4);
  const [history, setHistory] = useState<number[]>(Array(20).fill(25));

  // Simulate dynamic resource consumption
  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.max(5, Math.min(95, Math.floor(cpu + (Math.random() * 20 - 10))));
      const newRam = Math.max(40, Math.min(85, Math.floor(ram + (Math.random() * 4 - 2))));
      const newNet = Math.max(10, Math.min(300, Number((netSpeed + (Math.random() * 30 - 15)).toFixed(1))));
      
      setCpu(newCpu);
      setRam(newRam);
      setNetSpeed(newNet);
      setHistory(h => [...h.slice(1), newCpu]);
    }, 1000);

    return () => clearInterval(interval);
  }, [cpu, ram, netSpeed]);

  return (
    <div className="macos-app flex flex-col h-full backdrop-blur-xl p-5 gap-5 overflow-y-auto">
      <div className="flex items-center gap-3">
        <MacIcon id="monitor" className="w-9 h-9" />
        <div>
          <h2 className="text-sm font-semibold">Activity Monitor</h2>
          <p className="text-[11px] text-slate-500">System resources and live process load</p>
        </div>
      </div>
      {/* Top Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MonitorCard 
          icon={<Cpu size={20} className="text-blue-400" />}
          title="CPU Usage"
          value={`${cpu}%`}
          desc="Quantum Engine Speed"
        />
        <MonitorCard 
          icon={<Activity size={20} className="text-emerald-400" />}
          title="RAM Committed"
          value={`${ram}%`}
          desc="System Virtual Space"
        />
        <MonitorCard 
          icon={<Wifi size={20} className="text-purple-400" />}
          title="Network Bandwidth"
          value={`${netSpeed} Mb/s`}
          desc="Connection Ping Rate"
        />
      </div>

      {/* Interactive Activity Graph */}
      <div className="macos-panel rounded-xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">System Load Trace</h3>
          <span className="text-[10px] bg-blue-500/15 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Real Time</span>
        </div>

        {/* SVG Sparkline */}
        <div className="h-32 w-full bg-white/75 border border-black/10 rounded-lg relative overflow-hidden flex items-end">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area Path */}
            <path 
              d={`M 0 100 ${history.map((val, idx) => `L ${(idx / (history.length - 1)) * 100} ${100 - val}`).join(' ')} L 100 100 Z`}
              fill="url(#cpuGrad)"
            />
            {/* Line Path */}
            <path 
              d={history.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx / (history.length - 1)) * 100} ${100 - val}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>

          {/* Grid Helper lines */}
          <div className="absolute inset-x-0 top-1/4 border-b border-white/5 pointer-events-none" />
          <div className="absolute inset-x-0 top-2/4 border-b border-white/5 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 border-b border-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Disk Space & OS Info */}
      <div className="macos-panel rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive className="text-slate-500" size={24} />
          <div>
            <h4 className="font-semibold text-xs">Primary Disk Storage</h4>
            <div className="w-48 bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full w-[45%]" />
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-500">112.5 GB free of 256 GB</span>
      </div>
    </div>
  );
}

function MonitorCard({ icon, title, value, desc }: { icon: React.ReactNode; title: string; value: string; desc: string }) {
  return (
    <div className="macos-card rounded-xl p-4 flex flex-col gap-2 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="macos-label text-[10px] uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight mt-1">{value}</div>
      <span className="text-[10px] text-slate-500">{desc}</span>
    </div>
  );
}
