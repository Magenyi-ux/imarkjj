
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, ExamType, UserProfile, Question, StudyMaterial, StudySession, QuizResult } from './types.ts';
import Layout from './components/Layout.tsx';
import { AI_Service } from './services/gemini.ts';
import { EmailService } from './services/email.ts';

const COMMON_SUBJECTS = ["Use of English", "Mathematics", "Biology", "Chemistry", "Physics", "Economics", "Government", "Commerce", "Literature", "Geography"];

// --- Sub-Components ---

const AuthView: React.FC<{ 
  onAuthInit: (name: string, email: string) => void;
  onVerify: (code: string) => void;
  verificationSent: boolean;
  isProcessing: boolean;
}> = ({ onAuthInit, onVerify, verificationSent, isProcessing }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 lg:p-14 text-center">
          <h2 className="text-2xl font-black text-black mb-2">Code Verification</h2>
          <p className="text-xs font-bold text-slate-400 uppercase mb-10 tracking-widest">Check your email (or alert) for your code</p>
          <input 
            maxLength={5}
            className="w-full text-center text-3xl font-black tracking-[0.5em] px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl mb-6 uppercase text-black placeholder:text-slate-300"
            placeholder="*****"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
          />
          <button 
            onClick={() => onVerify(code)}
            disabled={code.length !== 5 || isProcessing}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all"
          >
            {isProcessing ? "Verifying..." : "Validate Identity"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 lg:p-14 border border-slate-100">
        <h2 className="text-2xl font-black text-black text-center mb-10">EduVantage Gate</h2>
        <form onSubmit={(e) => { e.preventDefault(); onAuthInit(name, email); }} className="space-y-4">
          <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-black placeholder:text-slate-400" placeholder="Username" value={name} onChange={e => setName(e.target.value)} />
          <input required type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-black placeholder:text-slate-400" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" disabled={isProcessing} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            {isProcessing ? "Sending..." : "Request Access"}
          </button>
        </form>
      </div>
    </div>
  );
};

const OnboardingView: React.FC<{ name: string, onComplete: (style: 'CONCISE' | 'DETAILED') => void }> = ({ name, onComplete }) => (
  <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 text-center">
    <div className="w-full max-w-2xl bg-white rounded-[40px] p-10 lg:p-14 shadow-2xl">
      <h2 className="text-3xl font-black text-black mb-4">Initialize Profile, {name}</h2>
      <p className="text-slate-500 font-bold mb-10 leading-relaxed">Select your preferred intellectual throughput logic.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => onComplete('CONCISE')} className="p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-indigo-600 transition-all text-left active:scale-95">
          <h4 className="font-black text-black mb-2">Concise Mode</h4>
          <p className="text-xs font-bold text-slate-400 uppercase">Direct & Rapid</p>
        </button>
        <button onClick={() => onComplete('DETAILED')} className="p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-indigo-600 transition-all text-left active:scale-95">
          <h4 className="font-black text-black mb-2">Detailed Mode</h4>
          <p className="text-xs font-bold text-slate-400 uppercase">Step-by-Step Logic</p>
        </button>
      </div>
    </div>
  </div>
);

const QuizEngine: React.FC<{ 
  questions: Question[]; 
  isExam: boolean; 
  onComplete: (score: number, answers: Record<number, number>, time: number) => void;
  onExit: () => void;
}> = ({ questions, isExam, onComplete, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const startTime = useRef(Date.now());

  const currentQ = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showExplanation && !isExam) return;
    setAnswers({ ...answers, [currentIdx]: idx });
    if (!isExam) setShowExplanation(true);
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
    } else {
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
      onComplete(score, answers, Math.floor((Date.now() - startTime.current) / 1000));
    }
  };

  if (!currentQ) return <div className="p-20 text-center animate-pulse text-black font-black">SYNCHRONIZING RECORDS...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full pb-20">
      <div className="flex justify-between mb-8">
        <button onClick={onExit} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm font-black text-xs text-black">EXIT</button>
        <div className="px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
          {isExam ? "CBT SIMULATOR" : `ITEM ${currentIdx + 1}/${questions.length}`}
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-14 shadow-sm flex-1">
        <h2 className="text-xl font-black text-black mb-12">{currentQ.text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => handleSelect(i)} 
              className={`p-6 rounded-3xl text-left border-2 transition-all ${answers[currentIdx] === i ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-slate-50 border-transparent text-black'}`}
            >
              <span className="font-bold">{opt}</span>
            </button>
          ))}
        </div>
        {showExplanation && !isExam && <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 text-sm font-bold text-black leading-relaxed">{currentQ.explanation}</div>}
      </div>
      <button onClick={next} disabled={answers[currentIdx] === undefined} className="mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
        {currentIdx === questions.length - 1 ? "FINISH" : "NEXT"}
      </button>
    </div>
  );
};

const ResultsView: React.FC<{ result: QuizResult, onExit: () => void }> = ({ result, onExit }) => {
  const percentage = Math.round((result.score / result.total) * 100);
  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="bg-white rounded-[40px] p-10 lg:p-14 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12 mb-10">
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * percentage) / 100} className="text-indigo-600 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-black">{percentage}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Accuracy</span>
            </div>
        </div>
        <div>
            <h2 className="text-3xl font-black text-black mb-2">Performance Breakdown</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-6">Successfully resolved {result.score} out of {result.total} items in {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s.</p>
            <button onClick={onExit} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">Back to Dashboard</button>
        </div>
      </div>
      <div className="space-y-6">
        {result.questions.map((q, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-lg font-black text-black mb-4">{q.text}</p>
            <p className="text-sm font-bold text-slate-600 mb-4 italic">Explanation: {q.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimetableView: React.FC<{ 
  materials: StudyMaterial[], 
  onAddMaterials: (files: FileList) => void, 
  onRemoveMaterial: (id: string) => void, 
  sessions: StudySession[], 
  onGenerate: (pref: string) => void 
}> = ({ materials, onAddMaterials, onRemoveMaterial, sessions, onGenerate }) => {
  const [pref, setPref] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGen = async () => {
    setIsGenerating(true);
    await onGenerate(pref);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-black mb-8">Asset Repository</h3>
          <div className="space-y-3 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {materials.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold">No assets uploaded</div>
            ) : (
                materials.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold truncate pr-4 text-black">{m.name}</span>
                        <button onClick={() => onRemoveMaterial(m.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all font-black">DEL</button>
                    </div>
                ))
            )}
          </div>
          <label className="block w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center hover:border-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
            <span className="font-black text-black">Upload Study Materials</span>
            <input type="file" multiple className="hidden" onChange={e => e.target.files && onAddMaterials(e.target.files)} />
          </label>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] text-white">
          <h3 className="text-xl font-black mb-6">Constraints & Synthesis</h3>
          <textarea 
            className="w-full bg-slate-800 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 mb-8 text-white placeholder:text-slate-500" 
            rows={4} 
            placeholder="e.g. 05:00 - 08:00 daily, prioritize Mathematics..."
            value={pref}
            onChange={e => setPref(e.target.value)}
          />
          <button 
            onClick={handleGen}
            disabled={isGenerating || materials.length === 0}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-30"
          >
            {isGenerating ? "Synthesizing Plan..." : "Generate Neural Timetable"}
          </button>
        </div>
      </div>
      {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">{s.day}</p>
                      <h4 className="text-lg font-black text-black mb-4 leading-tight">{s.topic}</h4>
                      <div className="text-slate-400 font-bold text-xs uppercase">{s.startTime} - {s.endTime}</div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

const ComplaintView: React.FC<{ userEmail: string, userName: string, onSent: () => void }> = ({ userEmail, userName, onSent }) => {
  const [msg, setMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setIsSending(true);
    await EmailService.sendComplaint(userEmail, userName, msg);
    setIsSending(false);
    onSent();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-10 lg:p-14 rounded-[40px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-black mb-10">Complaints & Feedback</h2>
        <textarea 
          rows={6}
          className="w-full px-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-black placeholder:text-slate-400"
          placeholder="Describe your issue or request here..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
        />
        <button 
          onClick={handleSend}
          disabled={isSending || !msg.trim()}
          className="w-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          {isSending ? "Dispatching..." : "Send Request"}
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('eduvantage_p');
      return saved ? JSON.parse(saved) : { 
        name: "Scholar", isAuthenticated: false, isVerified: false, hasCompletedOnboarding: false, 
        targetExam: ExamType.JAMB, studyGoal: "Efficiency", memories: [], activities: [], 
        interactionStyle: 'NEUTRAL', isChatbotEnabled: true 
      };
    } catch { return { name: "Scholar", isAuthenticated: false, isVerified: false, hasCompletedOnboarding: false, targetExam: ExamType.JAMB, studyGoal: "Efficiency", memories: [], activities: [], interactionStyle: 'NEUTRAL', isChatbotEnabled: true }; }
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => JSON.parse(localStorage.getItem('eduvantage_m') || '[]'));
  const [sessions, setSessions] = useState<StudySession[]>(() => JSON.parse(localStorage.getItem('eduvantage_s') || '[]'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [isSelectingSubject, setIsSelectingSubject] = useState(false);
  const [isSelectingYear, setIsSelectingYear] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [selectedSessionMode, setSelectedSessionMode] = useState<'PRACTICE' | 'EXAM' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  useEffect(() => { localStorage.setItem('eduvantage_p', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('eduvantage_m', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('eduvantage_s', JSON.stringify(sessions)); }, [sessions]);

  useEffect(() => {
    const handleUnload = () => {
      if (profile.isAuthenticated && profile.isVerified) {
        EmailService.notifyAdminLogout(profile.email || "Unknown", profile.name);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [profile.isAuthenticated, profile.isVerified, profile.email, profile.name]);

  const handleAuthInit = async (name: string, email: string) => {
    setIsProcessing(true);
    const code = EmailService.generateCode();
    setProfile(prev => ({ ...prev, name, email, verificationCode: code, isAuthenticated: true }));
    await EmailService.sendVerificationCode(email, code, name);
    setVerificationSent(true);
    setIsProcessing(false);
  };

  const handleVerify = (enteredCode: string) => {
    if (enteredCode === profile.verificationCode) setProfile(prev => ({ ...prev, isVerified: true }));
    else alert("Invalid code.");
  };

  const loadQuestions = async (type: ExamType, subject: string, year: string) => {
    setIsLoading(true);
    try { 
      const q = await AI_Service.getExamQuestions(type, year, subject); 
      setQuestions(q); 
    } catch (e) { 
      console.error(e); 
      alert("Error loading archive records.");
    }
    setIsLoading(false);
  };

  const handleGenerateTimetable = async (preferences: string) => {
    setIsLoading(true);
    try {
      const plan = await AI_Service.generateTimetable(materials, preferences);
      setSessions(plan);
    } catch (e) { console.error(e); alert("Timetable generation failed."); }
    setIsLoading(false);
  };

  const handleQuizComplete = (score: number, answers: Record<number, number>, time: number) => { 
    setLastResult({ score, total: questions.length, answers, questions, examType: profile.targetExam, timeSpent: time });
    setActiveMode(AppMode.RESULTS); 
  };

  const handleOnboardingComplete = (style: 'CONCISE' | 'DETAILED') => setProfile(prev => ({ ...prev, interactionStyle: style, hasCompletedOnboarding: true }));

  if (!profile.isAuthenticated || !profile.isVerified) {
    return <AuthView onAuthInit={handleAuthInit} onVerify={handleVerify} verificationSent={verificationSent} isProcessing={isProcessing} />;
  }

  if (!profile.hasCompletedOnboarding) {
    return <OnboardingView name={profile.name} onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode}>
      {isLoading && <div className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-xl flex items-center justify-center"><div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}
      
      {activeMode === AppMode.DASHBOARD && (
        <div className="space-y-10">
          <div className="bg-slate-900 p-10 lg:p-14 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <h2 className="text-4xl font-black mb-6">EduVantage Terminal, {profile.name}</h2>
            <p className="text-slate-400 text-lg font-bold mb-10">Choose an exam archival discipline to initiate a session.</p>
            <div className="flex flex-wrap gap-4">
              {[ExamType.JAMB, ExamType.WAEC, ExamType.NECO].map(t => (
                <button key={t} onClick={() => { setSelectedExamType(t); setIsSelectingMode(true); }} className="px-8 py-4 bg-white/10 hover:bg-indigo-600 rounded-2xl font-black text-xs uppercase transition-all active:scale-95">{t} Module</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeMode === AppMode.TIMETABLE && (
        <TimetableView 
          materials={materials} 
          onAddMaterials={m => setMaterials(prev => [...prev, ...Array.from(m).map(f => ({ id: Math.random().toString(36).substr(2,9), name: f.name, type: f.type, content: "" }))])}
          onRemoveMaterial={id => setMaterials(prev => prev.filter(m => m.id !== id))}
          sessions={sessions}
          onGenerate={handleGenerateTimetable}
        />
      )}

      {activeMode === AppMode.RESULTS && lastResult && <ResultsView result={lastResult} onExit={() => setActiveMode(AppMode.DASHBOARD)} />}
      
      {activeMode === AppMode.COMPLAINTS && (
        <ComplaintView userEmail={profile.email!} userName={profile.name} onSent={() => { alert("Feedback sent."); setActiveMode(AppMode.DASHBOARD); }} />
      )}

      {(activeMode === AppMode.STUDY || activeMode === AppMode.EXAM_SIMULATOR) && (
        <QuizEngine 
          questions={questions} 
          isExam={activeMode === AppMode.EXAM_SIMULATOR} 
          onComplete={handleQuizComplete} 
          onExit={() => setActiveMode(AppMode.DASHBOARD)} 
        />
      )}

      {isSelectingMode && <div className="fixed inset-0 z-[250] bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-xl text-center"><h3 className="text-xl font-black mb-10 text-black">Mode Calibration</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => { setSelectedSessionMode('PRACTICE'); setIsSelectingMode(false); setIsSelectingSubject(true); }} className="p-8 bg-slate-50 border rounded-3xl font-black uppercase text-xs text-black hover:border-indigo-600">Study Lab</button><button onClick={() => { setSelectedSessionMode('EXAM'); setIsSelectingMode(false); setIsSelectingSubject(true); }} className="p-8 bg-slate-50 border rounded-3xl font-black uppercase text-xs text-black hover:border-indigo-600">Exam Simulator</button></div></div></div>}
      {isSelectingSubject && <div className="fixed inset-0 z-[250] bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl"><h3 className="text-xl font-black mb-8 text-black">Discipline Synchronization</h3><div className="grid grid-cols-3 gap-3">{COMMON_SUBJECTS.map(s => <button key={s} onClick={() => { setSelectedSubject(s); setIsSelectingSubject(false); setIsSelectingYear(true); }} className="p-4 bg-slate-50 border rounded-2xl text-xs font-black uppercase text-black hover:border-indigo-600">{s}</button>)}</div></div></div>}
      {isSelectingYear && <div className="fixed inset-0 z-[250] bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg"><h3 className="text-xl font-black mb-8 text-center text-black">Temporal Record</h3><div className="grid grid-cols-4 gap-2">{[2024, 2023, 2022, 2021, 2020].map(y => <button key={y} onClick={async () => { setIsSelectingYear(false); await loadQuestions(selectedExamType!, selectedSubject, y.toString()); if (selectedSessionMode === 'EXAM') setActiveMode(AppMode.EXAM_SIMULATOR); else setActiveMode(AppMode.STUDY); }} className="p-4 bg-slate-50 border rounded-2xl font-black text-xs text-black hover:bg-slate-900 hover:text-white">{y}</button>)}</div></div></div>}
    </Layout>
  );
}
