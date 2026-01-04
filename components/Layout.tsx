
import React, { useState } from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  hasUnreadNotifications?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange, hasUnreadNotifications = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { mode: AppMode.DASHBOARD, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Learning Hub" },
    { mode: AppMode.STUDY, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Interactive Study" },
    { mode: AppMode.EXAM_SIMULATOR, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Exam Simulator" },
    { mode: AppMode.TIMETABLE, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Study Roadmap" },
    { mode: AppMode.COMPLAINTS, icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", label: "Complaints & Feedback" },
    { mode: AppMode.PROFILE, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "Candidate Profile" }
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 overflow-hidden font-sans">
      {/* Premium Desktop Sidebar with Toggle */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 z-30 transition-all duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.02)] ${isCollapsed ? 'w-24' : 'w-[300px]'}`}>
        <div className={`p-8 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3.5 group">
            <div 
              onClick={() => onModeChange(AppMode.DASHBOARD)}
              className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white shadow-xl shadow-indigo-200 cursor-pointer hover:scale-105 transition-transform shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-300 overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">EduVantage</h1>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Prep</span>
              </div>
            )}
          </div>
        </div>

        <div className={`px-6 mb-6 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : 'flex justify-end'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h16M4 18h7"} />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Core Navigation</p>}
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`w-full flex items-center gap-4 py-4 rounded-[20px] transition-all group relative ${
                isCollapsed ? 'justify-center px-0' : 'px-5'
              } ${
                activeMode === item.mode 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <svg className={`w-5 h-5 transition-colors shrink-0 ${activeMode === item.mode ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
              </svg>
              {!isCollapsed && <span className="font-bold text-sm animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 lg:h-24 px-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex justify-between items-center shrink-0">
          <div className="lg:hidden flex items-center gap-3">
             <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h1 className="text-lg font-black text-slate-800 tracking-tight">EduVantage</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Workplace Management</h2>
            <div className="h-1 w-8 bg-indigo-600/20 rounded-full"></div>
            <span className="text-xs font-bold text-slate-600 capitalize">{activeMode.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onModeChange(AppMode.NOTIFICATIONS)}
              className={`p-3 bg-white border border-slate-200 rounded-2xl transition-all relative ${activeMode === AppMode.NOTIFICATIONS ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               {hasUnreadNotifications && (
                 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
               )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          <div className="max-w-[1300px] mx-auto p-6 lg:p-12 pb-32 lg:pb-12">
            {children}
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-panel rounded-[32px] p-2 flex justify-around items-center z-40 border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`flex flex-col items-center justify-center w-[54px] h-[54px] rounded-[22px] transition-all duration-300 ${
                activeMode === item.mode 
                  ? 'bg-slate-900 text-white shadow-xl scale-110' 
                  : 'text-slate-400'
              }`}
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
