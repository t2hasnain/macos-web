'use client';

import { Download, Search, Star, CheckCircle } from 'lucide-react';
import MacIcon from '../MacIcon';
import { useState, useMemo } from 'react';
import { useOSStore } from '@/store/osStore';

const arcadeGames = [
  { id: 'snake', name: 'Retro Snake', category: 'Arcade', copy: 'Classic retro snake game experience.', rating: '4.5', url: 'https://playcanv.as/p/2OlkUaxF/', icon: 'https://cdn-icons-png.flaticon.com/512/528/528076.png' },
  { id: 'car3d', name: 'Seemore Racing', category: 'Racing 3D', copy: 'High-speed 3D car racing.', rating: '4.9', url: 'https://playcanv.as/p/44MRmJRU/', icon: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png' },
  { id: 'swooop', name: 'Swooop 3D', category: 'Flying 3D', copy: 'Fly your biplane around a magical 3D world.', rating: '4.8', url: 'https://playcanv.as/p/RqJJ9oU9/', icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' },
  { id: 'asteroids', name: 'Asteroids Space', category: 'Action', copy: 'Blast asteroids in deep space.', rating: '4.6', url: 'https://playcanv.as/p/JtL2iqIH/', icon: 'https://cdn-icons-png.flaticon.com/512/10425/10425391.png' },
  { id: 'platformer', name: 'Platformer', category: 'Adventure', copy: 'Jump and run 2D platformer adventure.', rating: '4.7', url: 'https://playcanv.as/p/bAOsVnN4/', icon: 'https://cdn-icons-png.flaticon.com/512/4836/4836064.png' },
];

const workApps = [
  { id: 'photopea', name: 'Graphic Design Studio', category: 'Design', copy: 'Professional graphic design and photo editing suite.', rating: '4.9', url: 'https://www.photopea.com/', icon: 'https://www.photopea.com/promo/icon512.png' },
  { id: 'vscode', name: 'VS Code Web', category: 'Development', copy: 'Code editor directly in your browser.', rating: '5.0', url: 'https://stackblitz.com/edit/web-platform?embed=1&file=index.html', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg' },
];

export default function AppStoreApp() {
  const [activeTab, setActiveTab] = useState('Discover');
  const [installing, setInstalling] = useState<string | null>(null);
  const { addCustomApp, customApps } = useOSStore();

  const handleInstall = (app: { name: string, url: string, icon: string, id: string }) => {
    // Check if already installed
    const isInstalled = Object.values(customApps).some(a => a.url === app.url);
    if (isInstalled) return;

    setInstalling(app.id);
    setTimeout(() => {
      addCustomApp(app.name, app.url, app.icon);
      setInstalling(null);
    }, 1500); // simulate download time
  };

  // Merge and randomize for Discovery
  const allDiscoverApps = useMemo(() => {
    const combined = [...arcadeGames, ...workApps];
    return combined.sort(() => 0.5 - Math.random());
  }, []);

  const renderAppCard = (app: any) => {
    const isInstalled = Object.values(customApps).some((a: any) => a.url === app.url);
    const isInstalling = installing === app.id;

    return (
      <article key={app.id} className="macos-card flex items-center gap-4 rounded-xl p-4">
        {app.icon.startsWith('http') ? (
          <img src={app.icon} className="h-14 w-14 shrink-0 rounded-2xl shadow-sm object-cover bg-white p-1" alt={app.name} />
        ) : (
          <MacIcon id={app.icon} className="h-14 w-14 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{app.name}</h3>
          <p className="text-[11px] text-[color:var(--mac-muted)]">{app.category}</p>
          <p className="mt-1 line-clamp-1 text-xs text-[color:var(--mac-muted)]">{app.copy}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[color:var(--mac-muted)]">
            <Star size={12} className="fill-current text-yellow-400" />
            {app.rating}
          </div>
        </div>
        <button 
          onClick={() => handleInstall(app)}
          disabled={isInstalled || isInstalling}
          className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-colors ${
            isInstalled 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : isInstalling 
                ? 'bg-white/10 text-white/50 cursor-wait'
                : 'macos-primary'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            {isInstalled ? <><CheckCircle size={12} /> OPEN</> : isInstalling ? 'LOADING...' : <><Download size={12} /> GET</>}
          </span>
        </button>
      </article>
    );
  };

  return (
    <div className="macos-app flex h-full overflow-hidden">
      <aside className="macos-sidebar w-60 border-r p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MacIcon id="appstore" className="h-9 w-9" />
          <div>
            <h2 className="text-sm font-semibold">App Store</h2>
            <p className="text-[11px] text-[color:var(--mac-muted)]">{activeTab}</p>
          </div>
        </div>

        <div className="macos-input flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <Search size={14} className="text-[color:var(--mac-muted)]" />
          <span className="text-[color:var(--mac-muted)]">Search</span>
        </div>

        {['Discover', 'Arcade', 'Work', 'Updates'].map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className="macos-list-item rounded-lg px-3 py-2 text-left text-xs font-semibold"
            data-active={activeTab === item}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="flex-1 overflow-y-auto p-7">
        
        {activeTab === 'Discover' && (
          <>
            <section className="mb-6">
              <p className="text-xs font-semibold text-blue-400">TODAY</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Apps made for this Mac.</h1>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="macos-card col-span-2 rounded-2xl p-6 overflow-hidden relative min-h-44 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/5">
                <p className="text-xs font-semibold text-blue-400">FEATURED</p>
                <h2 className="mt-2 text-2xl font-bold">Discover Everything</h2>
                <p className="mt-2 max-w-md text-sm text-[color:var(--mac-muted)]">
                  Explore our collection of fully integrated, web-native applications and games.
                </p>
                <MacIcon id="appstore" className="absolute right-8 top-8 h-28 w-28 drop-shadow-2xl opacity-80" />
              </div>

              {allDiscoverApps.map(renderAppCard)}
            </section>
          </>
        )}

        {activeTab === 'Arcade' && (
          <>
            <section className="mb-6">
              <p className="text-xs font-semibold text-pink-400">ARCADE</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Play legendary titles.</h1>
              <p className="mt-2 text-sm text-[color:var(--mac-muted)] max-w-lg">
                Discover a collection of amazing 3D and retro games. Downloading adds them to your Applications folder and Desktop.
              </p>
            </section>
            <section className="grid grid-cols-2 gap-4">
              {arcadeGames.map(renderAppCard)}
            </section>
          </>
        )}

        {activeTab === 'Work' && (
          <>
            <section className="mb-6">
              <p className="text-xs font-semibold text-indigo-400">WORK & PRODUCTIVITY</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Tools to build the future.</h1>
              <p className="mt-2 text-sm text-[color:var(--mac-muted)] max-w-lg">
                Professional grade software perfectly optimized for WebOS. Features a powerful Graphic Design tool for your creative needs.
              </p>
            </section>
            <section className="grid grid-cols-2 gap-4">
              {workApps.map(renderAppCard)}
            </section>
          </>
        )}

        {['Updates'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-full text-center text-[color:var(--mac-muted)] opacity-60">
            <Search size={48} className="mb-4 text-white/20" />
            <h2 className="text-xl font-bold text-white">Check back later</h2>
            <p className="mt-2 text-sm">More apps are coming to this category soon.</p>
          </div>
        )}

      </main>
    </div>
  );
}
