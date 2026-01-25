
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHome?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onHome }) => {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            className={`flex items-center gap-2 ${onHome ? 'cursor-pointer group' : ''}`}
            onClick={onHome}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VoxViral <span className="text-indigo-400">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Podcast Production Engine</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <button onClick={onHome} className="hover:text-white transition-colors">Workspace</button>
            <a href="#" className="hover:text-white transition-colors">Library</a>
            <a href="#" className="hover:text-white transition-colors">Settings</a>
          </nav>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-medium text-slate-400">System Ready</span>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4">
        {children}
      </main>
    </div>
  );
};
