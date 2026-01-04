
import React, { useState } from 'react';
import { AppMode } from '../types.ts';

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
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 z-30 transition-all duration-300 shadow-xl ${isCollapsed ? 'w-24' : 'w-[300px]'}`}>
        <div className="p-8">
          <h1 className={`font-black text-indigo-600 transition-all ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>EduVantage</h1>
        </div>
        <div className="flex-1 px-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`w-full flex items-center gap-4 py-4 px-5 rounded-2xl transition-all ${activeMode === item.mode ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} /></svg>
              {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 px-12 bg-white border-b flex justify-between items-center shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeMode.replace('_', ' ')}</span>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 bg-slate-50 rounded-lg lg:block hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1300px] mx-auto p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
