import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function AboutMeApp() {
  return (
    <div className="flex h-full bg-[#1e1e1e] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#333] p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
            <Image src="/cat.png" alt="Hasnain" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Hasnain</h2>
            <p className="text-xs text-gray-400">Full Stack Developer & Founder</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Connect</h3>
          <a href="https://linkedin.com/in/t2hasnain" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm p-2 rounded hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#0a66c2]"><path d="M22.225 0H1.77C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.77 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0zM7.12 20.452H3.558V8.995H7.12v11.457zM5.34 7.433c-1.138 0-2.062-.924-2.062-2.065 0-1.139.924-2.063 2.062-2.063 1.139 0 2.063.924 2.063 2.063 0 1.141-.924 2.065-2.063 2.065zm15.112 13.019h-3.559v-5.568c0-1.328-.027-3.037-1.85-3.037-1.85 0-2.133 1.446-2.133 2.94v5.665H9.352V8.995h3.415v1.565h.049c.475-.9 1.636-1.85 3.367-1.85 3.604 0 4.269 2.371 4.269 5.454v6.288z"/></svg> LinkedIn
          </a>
          <a href="https://github.com/t2hasnain" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm p-2 rounded hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg> GitHub
          </a>
          <a href="https://x.com/t2hasnain" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm p-2 rounded hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X (Twitter)
          </a>
          <a href="https://youtube.com/@t2hasnain" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm p-2 rounded hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#ff0000]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YouTube
          </a>
        </div>

        <div className="mt-auto">
          <a href="https://github.com/t2hasnain/macos-web" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs font-semibold transition-colors">
            <ExternalLink size={14} /> Open Source Repo
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Hi, I am Hasnain.</h1>
        <div className="prose prose-invert max-w-2xl">
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            I am a passionate Full Stack Developer and the founder behind macOS WebOS by hasnain. My goal is to push the boundaries of web experiences, creating beautifully crafted interfaces that feel native and fast.
          </p>
          <div className="bg-[#2d2d2d] rounded-xl p-6 border border-[#3e3e42]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image src="/cat.png" alt="Founder" fill className="object-cover" />
              </div>
              About Developer
            </h2>
            <p className="text-gray-300">
              Welcome to my digital playground. This macOS WebOS by hasnain clone is fully open source. Try it out, explore the apps, run terminal commands, and customize your workspace!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
