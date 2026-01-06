
import React, { useState } from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange, darkMode, onToggleDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { mode: AppMode.DASHBOARD, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Hub", desktopLabel: "Learning Hub" },
    { mode: AppMode.STUDY, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Lab", desktopLabel: "Interactive Lab" },
    { mode: AppMode.EXAM_SIMULATOR, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Exam", desktopLabel: "Exam Simulator" },
    { mode: AppMode.TIMETABLE, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Road", desktopLabel: "Neural Roadmap" },
    { mode: AppMode.PROFILE, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "Me", desktopLabel: "Identity & Logic" }
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)] ${isCollapsed ? 'w-[100px]' : 'w-[280px]'}`}
      >
        <div className="p-8 h-28 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onModeChange(AppMode.DASHBOARD)}>
            <div className="w-11 h-11 bg-indigo-600 rounded-[16px] flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">EduVantage</h1>
            )}
          </div>
        </div>

        <nav className="flex-1 px-5 space-y-2 pt-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-[22px] transition-all group relative ${
                activeMode === item.mode 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <svg className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-110 ${activeMode === item.mode ? 'text-indigo-400 dark:text-indigo-600' : 'text-slate-300 dark:text-slate-700 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
              </svg>
              {!isCollapsed && <span className="font-bold text-[13px] tracking-tight">{item.desktopLabel}</span>}
              {activeMode === item.mode && (
                <div className={`absolute right-4 w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-600 rounded-full ${isCollapsed ? 'hidden' : 'block'}`}></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 shrink-0">
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)} 
             className="w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
           >
              <svg className={`w-6 h-6 transform transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/20 dark:border-slate-800 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-around p-2 pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all relative ${
                activeMode === item.mode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
              {activeMode === item.mode && (
                <div className="absolute -top-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_#4f46e5]"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="h-20 lg:h-24 px-6 lg:px-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[60] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-0.5 lg:mb-1">Central Intelligence</span>
              <h2 className="text-xs lg:text-sm font-black text-slate-800 dark:text-white tracking-tight">{activeMode.replace('_', ' ')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
             {/* Enhanced Dark Mode Toggle with subtle fade animation */}
             <button 
               onClick={onToggleDarkMode}
               className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all shadow-sm overflow-hidden group"
               aria-label="Toggle Dark Mode"
             >
               <div className={`theme-toggle-icon flex items-center justify-center animate-in fade-in duration-500 ${darkMode ? 'rotate' : ''}`}>
                 {darkMode ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                 )}
               </div>
             </button>
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm lg:text-base cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition-all shadow-sm">
               S
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar pb-32 lg:pb-0 overscroll-contain">
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
