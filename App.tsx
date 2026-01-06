
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, ExamType, UserProfile, Question, StudyMaterial, StudySession, Activity } from './types';
import Layout from './components/Layout';
import { AI_Service } from './services/gemini';

// --- Focus Timer Modal ---

const FocusMode: React.FC<{ topic: string, onFinish: () => void, onCancel: () => void }> = ({ topic, onFinish, onCancel }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[400] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="absolute inset-0 bg-indigo-600/10 animate-pulse pointer-events-none"></div>
      <div className="relative z-10 space-y-12">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Deep Work Protocol</p>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">{topic}</h2>
        </div>
        <div className="text-[120px] lg:text-[200px] font-black tracking-tighter tabular-nums leading-none">
          {formatTime(seconds)}
        </div>
        <div className="flex gap-6 justify-center">
          <button onClick={() => setIsActive(!isActive)} className="px-12 py-6 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-widest text-xs shadow-3xl">
            {isActive ? 'Pause Neural Flow' : 'Resume Sync'}
          </button>
          <button onClick={onCancel} className="px-12 py-6 bg-slate-900 border border-white/10 text-white/60 rounded-3xl font-black uppercase tracking-widest text-xs">
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Timetable Logic ---

const TimetableView: React.FC<{ 
  materials: StudyMaterial[]; 
  onAddMaterials: (files: FileList) => void;
  onRemoveMaterial: (id: string) => void;
  sessions: StudySession[];
  setSessions: React.Dispatch<React.SetStateAction<StudySession[]>>;
  onGenerate: (preferences: string) => Promise<void>;
}> = ({ materials, onAddMaterials, onRemoveMaterial, sessions, setSessions, onGenerate }) => {
  const [pref, setPref] = useState("");
  const [activeFocus, setActiveFocus] = useState<StudySession | null>(null);
  const [searchingId, setSearchingId] = useState<string | null>(null);

  const handleSearch = async (session: StudySession) => {
    setSearchingId(session.id);
    try {
      const links = await AI_Service.searchTopicResources(session.topic);
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, resources: links } : s));
    } catch (e) {
      console.error(e);
    }
    setSearchingId(null);
  };

  const updateMastery = (id: string, val: number) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, mastery: val } : s));
  };

  return (
    <div className="space-y-10 lg:space-y-16 animate-in fade-in duration-1000 pb-20">
      {activeFocus && <FocusMode topic={activeFocus.topic} onCancel={() => setActiveFocus(null)} onFinish={() => { updateMastery(activeFocus.id, 100); setActiveFocus(null); }} />}

      <div className="bg-white dark:bg-slate-900 rounded-[32px] lg:rounded-[64px] p-6 lg:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8 lg:mb-12">Neural Roadmap</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-10 lg:mb-16">
          <label className="flex flex-col items-center justify-center p-8 lg:p-14 border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[24px] lg:rounded-[48px] cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all group text-center">
            <div className="w-12 h-12 lg:w-20 lg:h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Add Data</span>
            <input type="file" multiple className="hidden" onChange={(e) => e.target.files && onAddMaterials(e.target.files)} />
          </label>
          {materials.map(m => (
            <div key={m.id} className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-800 rounded-[24px] lg:rounded-[48px] border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
              <div className="flex items-center gap-4 lg:gap-6 overflow-hidden">
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center text-slate-300 shrink-0 group-hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="truncate">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm lg:text-lg truncate">{m.name}</h4>
                </div>
              </div>
              <button onClick={() => onRemoveMaterial(m.id)} className="p-2 text-rose-300 hover:text-rose-600 transition-all shrink-0">
                <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <textarea 
            value={pref} 
            onChange={e => setPref(e.target.value)}
            placeholder="Constraints (e.g., focus on Organic Chemistry)..." 
            className="w-full p-6 lg:p-10 bg-slate-50 dark:bg-slate-800 rounded-[20px] lg:rounded-[48px] border border-slate-100 dark:border-slate-700 text-sm lg:text-lg font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-600/10 min-h-[120px] transition-all"
          />
          <button 
            onClick={() => onGenerate(pref)}
            disabled={materials.length === 0}
            className="w-full py-6 lg:py-10 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-2xl lg:rounded-[40px] font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-3xl hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-all disabled:opacity-20"
          >
            Synthesize Roadmap
          </button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-8 duration-700">
          {sessions.map((s) => (
            <div key={s.id} className="group p-6 lg:p-10 bg-white dark:bg-slate-900 rounded-[32px] lg:rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${s.mastery}%` }} />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                <div className="lg:w-32 text-indigo-600 dark:text-indigo-400 font-black text-[10px] lg:text-[11px] uppercase tracking-widest lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
                  {s.day}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest">{s.startTime} - {s.endTime}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.mastery}% Mastered</span>
                  </div>
                  <h4 className="text-lg lg:text-3xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-indigo-600 transition-colors">{s.topic}</h4>
                  
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setActiveFocus(s)} className="px-6 py-3 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl lg:rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Start Focus Lab
                    </button>
                    <button 
                      onClick={() => handleSearch(s)}
                      disabled={searchingId === s.id}
                      className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl lg:rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      {searchingId === s.id ? 'Archiving...' : 'Deep Resource Search'}
                    </button>
                  </div>
                </div>

                {s.resources && s.resources.length > 0 && (
                  <div className="lg:w-72 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Neural Assets</p>
                    <div className="space-y-3">
                      {s.resources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" className="flex items-center gap-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline line-clamp-1">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {r.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Dashboard View ---

const DashboardView: React.FC<{ onStartExam: (type: ExamType) => void, profile: UserProfile }> = ({ onStartExam, profile }) => (
  <div className="space-y-10 lg:space-y-16 animate-in fade-in duration-1000 pb-20">
    <div className="bg-slate-950 p-8 lg:p-24 rounded-[32px] lg:rounded-[64px] text-white shadow-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-64 lg:w-[600px] h-64 lg:h-[600px] bg-indigo-600/20 rounded-full blur-[80px] lg:blur-[120px]"></div>
      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 lg:gap-3 px-4 py-1.5 lg:px-6 lg:py-2 bg-white/5 border border-white/10 rounded-full mb-6 lg:mb-10 backdrop-blur-md">
           <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
           <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-[0.5em] text-white/60">Neural Network Active</span>
        </div>
        <h2 className="text-3xl lg:text-7xl font-black mb-6 lg:mb-10 leading-[1.1] tracking-tight">Your cognitive <br/><span className="text-indigo-500">evolution.</span></h2>
        <p className="text-slate-400 text-sm lg:text-2xl font-medium leading-relaxed mb-10 lg:mb-16 max-w-2xl italic">Verify your JAMB, WAEC, and NECO archival patterns.</p>
        <button onClick={() => onStartExam(ExamType.JAMB)} className="w-full sm:w-auto px-10 py-5 lg:px-12 lg:py-6 bg-indigo-600 text-white rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform">Initiate Protocol</button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {[ExamType.JAMB, ExamType.WAEC, ExamType.NECO].map((type) => (
        <button
          key={type}
          onClick={() => onStartExam(type)}
          className="group relative flex flex-row lg:flex-col items-center lg:items-start p-6 lg:p-12 bg-white dark:bg-slate-900 rounded-[24px] lg:rounded-[56px] border border-slate-100 dark:border-slate-800 card-hover"
        >
          <div className={`w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex items-center justify-center font-black text-lg lg:text-2xl tracking-tighter mr-5 lg:mr-0 lg:mb-10 shadow-sm transition-all group-hover:rotate-6 ${type === 'JAMB' ? 'bg-orange-50 text-orange-600' : type === 'WAEC' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {type}
          </div>
          <div className="flex-1 lg:flex-none text-left">
            <h4 className="font-black text-slate-900 dark:text-white text-xl lg:text-3xl lg:mb-4 tracking-tight">{type} Archival</h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest hidden lg:block">Neural Path Required</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// --- Quiz Engine ---

const QuizEngine: React.FC<{ 
  questions: Question[]; 
  isExam: boolean; 
  onComplete: (score: number, answers: Record<number, number>) => void;
  onExit: () => void;
  onSaveSnippet: (title: string, content: string) => void;
  onMiniChat: (text: string) => void;
}> = ({ questions, isExam, onComplete, onExit, onSaveSnippet, onMiniChat }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState<'LOGIC' | 'MNEMONIC' | 'ATOMIC' | 'ROADMAP' | 'SCENARIO'>('LOGIC');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQ = questions[currentIdx];
  const handleSelect = (idx: number) => {
    if (showExplanation && !isExam) return;
    setAnswers({ ...answers, [currentIdx]: idx });
    if (!isExam) { 
      setShowExplanation(true); 
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
      setActiveTab('LOGIC');
    } else {
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
      onComplete(score, answers);
    }
  };

  if (!currentQ) return <div className="p-16 text-center font-black text-slate-200 uppercase animate-pulse">Syncing Lab...</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col pb-32 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8 sticky top-0 py-4 bg-[#F8FAFC]/90 dark:bg-slate-950/90 backdrop-blur-md z-40">
        <button onClick={onExit} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <span className="px-6 py-3 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{currentIdx + 1} / {questions.length}</span>
        <button onClick={() => onSaveSnippet(`Note Q${currentIdx+1}`, currentQ.text)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-indigo-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg></button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[64px] p-8 lg:p-16 shadow-2xl border border-slate-50 dark:border-slate-800 mb-12">
        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-16 select-text">{currentQ.text}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentQ.options.map((opt, i) => {
            const isCorrect = i === currentQ.correctAnswer;
            const isSelected = answers[currentIdx] === i;
            let style = "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300";
            if (showExplanation && !isExam) {
              if (isCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-900";
              else if (isSelected) style = "bg-rose-50 border-rose-500 text-rose-900";
              else style = "opacity-30 blur-[1px]";
            } else if (isSelected) {
              style = "bg-indigo-600 border-indigo-600 text-white shadow-xl";
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={showExplanation && !isExam} className={`p-8 rounded-[40px] text-left border-2 transition-all duration-300 flex items-start gap-6 ${style}`}>
                <span className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl text-[10px] font-black flex items-center justify-center shrink-0">{String.fromCharCode(65+i)}</span>
                <span className="text-sm lg:text-lg font-bold pt-1.5">{opt}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && !isExam && (
          <div ref={scrollRef} className="mt-20 space-y-8 animate-in slide-in-from-bottom-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-12 rounded-[48px] border border-slate-100 dark:border-slate-700">
               <div className="flex flex-wrap gap-2 mb-8">
                 {(['LOGIC', 'MNEMONIC', 'ATOMIC', 'ROADMAP', 'SCENARIO'] as const).map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest ${activeTab === tab ? 'bg-slate-950 text-white' : 'text-slate-400'}`}>{tab}</button>
                 ))}
               </div>
               <div className="min-h-[100px] text-base lg:text-xl font-bold leading-relaxed italic">
                 {activeTab === 'LOGIC' && currentQ.deconstruction.logic}
                 {activeTab === 'MNEMONIC' && <span className="text-3xl text-indigo-600">"{currentQ.deconstruction.mnemonic}"</span>}
                 {activeTab === 'ATOMIC' && <ul className="list-disc pl-6 space-y-2">{currentQ.deconstruction.atomic.map((a,i)=><li key={i}>{a}</li>)}</ul>}
                 {activeTab === 'ROADMAP' && currentQ.deconstruction.roadmap}
                 {activeTab === 'SCENARIO' && currentQ.deconstruction.scenario}
               </div>
               <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <button onClick={() => onMiniChat(`${currentQ.text} - ${currentQ.deconstruction.logic}`)} className="text-[10px] font-black text-indigo-600 uppercase underline underline-offset-8">Deep Sync</button>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Lab Module Ref: {currentQ.id.slice(0,8)}</span>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto w-full">
        <button onClick={next} disabled={answers[currentIdx] === undefined} className="w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[32px] font-black shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-20 uppercase tracking-[0.4em] text-[10px]">Commit Neural Logic</button>
      </div>
    </div>
  );
};

// --- Floating Agent UI ---

const FloatingChat: React.FC<{ 
  profile: UserProfile, 
  miniContext?: string, 
  onUpdateMemory: (m: string) => void, 
  onSaveSnippet: (t: string, c: string) => void, 
  onClose: () => void 
}> = ({ profile, miniContext, onUpdateMemory, onSaveSnippet, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
    setMessages([{ role: 'bot', text: `Agent ready for ${profile.name}. Send context for analysis.` }]);
  }, []);

  useEffect(() => {
    if (miniContext) {
      setIsOpen(true);
      handleAutoSend(`Analyze context: "${miniContext}"`);
    }
  }, [miniContext]);

  useEffect(() => { if (isOpen) scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStart.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const newX = Math.max(40, Math.min(window.innerWidth - 40, clientX - dragStart.current.x));
      const newY = Math.max(40, Math.min(window.innerHeight - 40, clientY - dragStart.current.y));
      setPos({ x: newX, y: newY });
      const distToDrop = Math.sqrt(Math.pow(newX - window.innerWidth/2, 2) + Math.pow(newY - (window.innerHeight - 80), 2));
      setIsOverDropZone(distToDrop < 80);
    };
    const handleUp = () => { if (isDragging) { if (isOverDropZone) onClose(); setIsDragging(false); setIsOverDropZone(false); } };
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleUp); };
  }, [isDragging, isOverDropZone, onClose]);

  const handleAutoSend = async (txt: string) => {
    setMessages(prev => [...prev, { role: 'user', text: txt }]);
    setIsTyping(true);
    const response = await AI_Service.chatWithAgent(txt, profile, onUpdateMemory);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input; setInput("");
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    const response = await AI_Service.chatWithAgent(msg, profile, onUpdateMemory);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsTyping(false);
  };

  return (
    <>
      {isDragging && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[998] w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center transition-all ${isOverDropZone ? 'scale-150 bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/10 border-white/40 text-white'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
      )}
      <div style={{ left: pos.x, top: pos.y, position: 'fixed', transform: 'translate(-50%, -50%)' }} className="z-[999] flex flex-col items-end pointer-events-none">
        <button onMouseDown={onDragStart} onTouchStart={onDragStart} onClick={() => !isDragging && setIsOpen(!isOpen)} className={`pointer-events-auto w-16 h-16 rounded-[24px] shadow-3xl flex items-center justify-center transition-all cursor-grab border-2 border-white/50 dark:border-slate-800 touch-none ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 animate-float'} ${isDragging ? 'scale-110 opacity-80' : ''}`}>
          <svg className="w-8 h-8 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
        {isOpen && !isDragging && (
          <div className="pointer-events-auto mt-4 w-[400px] bg-white dark:bg-slate-900 rounded-[32px] shadow-3xl border border-slate-50 dark:border-slate-800 flex flex-col h-[500px] animate-in zoom-in overflow-hidden fixed bottom-20 right-4 lg:relative lg:right-0">
             <div className="p-5 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-950 text-white rounded-xl flex items-center justify-center text-[10px] font-black">AI</div>
                   <span className="font-black text-xs uppercase tracking-widest">Agentic Mentor</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
             </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-[20px] text-[11px] font-bold shadow-sm ${m.role === 'user' ? 'bg-slate-950 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'}`}>
                      {m.text}
                   </div>
                 </div>
               ))}
               {isTyping && <div className="ml-2 flex gap-1 animate-pulse"><div className="w-1 h-1 bg-indigo-300 rounded-full" /><div className="w-1 h-1 bg-indigo-300 rounded-full" /><div className="w-1 h-1 bg-indigo-300 rounded-full" /></div>}
               <div ref={scrollRef} />
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none" placeholder="Sync message..." />
                <button onClick={handleSend} className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

// --- Main App ---

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('eduvantage_v2_darkmode') === 'true');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('eduvantage_v2_profile');
    return saved ? JSON.parse(saved) : { name: "Scholar", targetExam: ExamType.JAMB, studyGoal: "Mastery", memories: [], interactionStyle: 'NEUTRAL', activities: [], chatbotEnabled: true };
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => JSON.parse(localStorage.getItem('eduvantage_v2_materials') || '[]'));
  const [sessions, setSessions] = useState<StudySession[]>(() => JSON.parse(localStorage.getItem('eduvantage_v2_sessions') || '[]'));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [miniChatContext, setMiniChatContext] = useState<string | undefined>();

  useEffect(() => {
    localStorage.setItem('eduvantage_v2_darkmode', String(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => localStorage.setItem('eduvantage_v2_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem('eduvantage_v2_materials', JSON.stringify(materials)), [materials]);
  useEffect(() => localStorage.setItem('eduvantage_v2_sessions', JSON.stringify(sessions)), [sessions]);

  const saveActivity = (title: string, content: string, type: Activity['type'] = 'CHAT_SNIPPET') => {
    const newAct: Activity = { id: Math.random().toString(36).substr(2,9), type, title, content, timestamp: Date.now() };
    setProfile(prev => ({ ...prev, activities: [newAct, ...prev.activities].slice(0, 50) }));
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)}>
      {isLoading && <div className="fixed inset-0 z-[300] bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl flex items-center justify-center"><div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}

      {activeMode === AppMode.DASHBOARD && <DashboardView onStartExam={async (t) => { setIsLoading(true); setQuestions(await AI_Service.getExamQuestions(t, "2024")); setIsLoading(false); setActiveMode(AppMode.STUDY); }} profile={profile} />}
      {activeMode === AppMode.STUDY && <QuizEngine questions={questions} isExam={false} onComplete={() => setActiveMode(AppMode.DASHBOARD)} onExit={() => setActiveMode(AppMode.DASHBOARD)} onSaveSnippet={saveActivity} onMiniChat={setMiniChatContext} />}
      {/* Fixed: Added explicit typing for f (FileList) and x (File) to resolve property name/type not found errors */}
      {activeMode === AppMode.TIMETABLE && <TimetableView materials={materials} sessions={sessions} setSessions={setSessions} onAddMaterials={(f: FileList)=>setMaterials(p=>[...p,...Array.from(f).map((x: File)=>({id:Math.random().toString(36),name:x.name,type:x.type,content:''}))])} onRemoveMaterial={(id)=>setMaterials(p=>p.filter(x=>x.id!==id))} onGenerate={async (p)=>{setIsLoading(true); setSessions(await AI_Service.generateTimetable(materials,p)); setIsLoading(false);}} />}
      {activeMode === AppMode.PROFILE && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[64px] shadow-2xl flex items-center gap-12 border border-slate-100 dark:border-slate-800">
             <div className="w-32 h-32 bg-slate-950 text-white rounded-[40px] flex items-center justify-center text-6xl font-black">{profile.name.charAt(0)}</div>
             <div className="flex-1">
                <h2 className="text-4xl font-black mb-4">{profile.name}</h2>
                <button onClick={() => setProfile({...profile, chatbotEnabled: !profile.chatbotEnabled})} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] ${profile.chatbotEnabled ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-600 text-white'}`}>{profile.chatbotEnabled ? 'Disable AI Agent' : 'Activate AI Agent'}</button>
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-indigo-600 p-12 rounded-[56px] text-white shadow-2xl"><h3 className="text-2xl font-black mb-6">Neural Patterns</h3><div className="space-y-4">{profile.memories.map((m,i)=>(<div key={i} className="p-4 bg-white/10 rounded-2xl font-bold">{m}</div>))}</div></div>
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] shadow-2xl border border-slate-100 dark:border-slate-800"><h3 className="text-2xl font-black mb-6">Activity Feed</h3><div className="space-y-4">{profile.activities.map(a=>(<div key={a.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl"><span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{a.type}</span><h4 className="font-black text-xl mb-1">{a.title}</h4></div>))}</div></div>
          </div>
        </div>
      )}

      {profile.chatbotEnabled && <FloatingChat profile={profile} miniContext={miniChatContext} onClose={() => setProfile(p => ({ ...p, chatbotEnabled: false }))} onUpdateMemory={(m) => setProfile(p => ({ ...p, memories: [...p.memories, m].slice(-10) }))} onSaveSnippet={saveActivity} />}
    </Layout>
  );
}
