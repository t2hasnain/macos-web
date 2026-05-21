'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Power } from 'lucide-react';
import { useOSStore } from '@/store/osStore';

export default function LockScreen() {
  const { isLocked, hasSetupPassword, unlockSystem, setSystemPassword, resetSystem } = useOSStore();
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();

    if (!hasSetupPassword) {
      if (passwordInput.trim().length >= 4) {
        setSystemPassword(passwordInput);
        unlockSystem(passwordInput);
      } else {
        setError(true);
        window.setTimeout(() => setError(false), 1600);
      }
      return;
    }

    if (!unlockSystem(passwordInput)) {
      setError(true);
      setPasswordInput('');
      window.setTimeout(() => setError(false), 1600);
    }
  };

  const handleResetData = () => {
    resetSystem();
    setShowResetWarning(false);
    window.location.reload();
  };

  if (!isLocked && hasSetupPassword) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-between overflow-hidden bg-black/45 p-10 text-white select-none">
      <div className="absolute inset-0 -z-20 bg-[url('/wallpaper.png')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-black/25 backdrop-blur-xl" />

      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mt-10 text-center"
      >
        <h1 className="text-8xl font-thin tracking-wide text-white/95">{time}</h1>
        <p className="mt-3 text-sm font-medium tracking-wide text-white/75">{date}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="flex w-full max-w-sm flex-col items-center gap-5"
      >
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/20 shadow-2xl backdrop-blur-md">
          <div className="h-12 w-12 rounded-full bg-white/75" />
          <div className="absolute bottom-3 h-9 w-16 rounded-t-full bg-white/75" />
        </div>

        <div className="text-center">
          <h2 className="text-sm font-semibold text-white/95">
            {!hasSetupPassword ? 'Welcome to macOS' : 'Mac User'}
          </h2>
          <p className="mt-1 text-[11px] font-medium text-white/55">
            {!hasSetupPassword ? 'Create a login password' : 'Enter password'}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="flex w-full flex-col items-center gap-3">
          <div className="relative flex w-64 items-center">
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder={!hasSetupPassword ? 'Set Password' : 'Password'}
              className={`w-full rounded-full border bg-white/12 px-4 py-2 pr-10 text-center text-xs font-medium tracking-wide text-white outline-none backdrop-blur-md transition-all placeholder-white/35 ${
                error ? 'border-red-400/70 animate-bounce' : 'border-white/15 focus:border-white/35'
              }`}
              autoFocus
            />
            {passwordInput.trim().length > 0 && (
              <button
                type="submit"
                className="absolute right-1.5 rounded-full bg-white p-1 text-black transition-all active:scale-90"
                aria-label="Unlock"
              >
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          {hasSetupPassword && (
            <button
              type="button"
              onClick={() => setShowResetWarning(true)}
              className="text-[10px] font-medium text-white/45 transition-colors hover:text-white/70"
            >
              Forgot Password?
            </button>
          )}
        </form>
      </motion.div>

      <div className="flex items-center gap-6 text-white/45">
        <button className="flex flex-col items-center gap-1 text-[10px]">
          <Power size={18} />
          Sleep
        </button>
        <span className="text-[10px] font-semibold tracking-widest">macOS</span>
      </div>

      {showResetWarning && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#1f1f22]/92 p-5 text-white shadow-2xl backdrop-blur-2xl">
            <h3 className="text-sm font-semibold">Reset Mac?</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              This erases local files, notes, saved passwords, and app data from this browser session.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleResetData}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
              >
                Erase All Data
              </button>
              <button
                onClick={() => setShowResetWarning(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/8"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
