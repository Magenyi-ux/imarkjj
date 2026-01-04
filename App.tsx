
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, ExamType, UserProfile, Question, StudyMaterial, StudySession, QuizResult, AppNotification, ActivitySession, ChatMessage } from './types';
import Layout from './components/Layout';
import { AI_Service } from './services/gemini';
import { EmailService } from './services/email';

const COMMON_SUBJECTS = ["Use of English", "Mathematics", "Biology", "Chemistry", "Physics", "Economics", "Government", "Commerce", "Literature", "Geography"];

// --- Auth & Verification ---

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
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 lg:p-14 border border-slate-100 animate-in zoom-in duration-500 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-8">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Code Verification</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Check your email (or alert) for your 5-character key</p>
          <div className="space-y-6">
            <input 
              maxLength={5}
              className="w-full text-center text-3xl font-black tracking-[0.5em] px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 uppercase"
              placeholder="*****"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <button 
              onClick={() => onVerify(code)}
              disabled={code.length !== 5 || isProcessing}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-30"
            >
              {isProcessing ? "Verifying..." : "Validate Identity"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 lg:p-14 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 text-center mb-1 tracking-tight">EduVantage Gate</h2>
        <p className="text-[10px] font-black text-slate-400 text-center mb-10 uppercase tracking-[0.2em]">Enterprise Prep Authorization</p>
        <form onSubmit={(e) => { e.preventDefault(); onAuthInit(name, email); }} className="space-y-4">
          <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Candidate User Name" value={name} onChange={e => setName(e.target.value)} />
          <input required type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Institutional Email" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" disabled={isProcessing} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50">
            {isProcessing ? "Sending Code..." : "Request Access"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- View: Results Analytics ---

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
                <span className="text-4xl font-black text-slate-800">{percentage}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Accuracy</span>
            </div>
        </div>
        <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Performance Breakdown</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-6">Successfully resolved {result.score} out of {result.total} items in {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s.</p>
            <button onClick={onExit} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">Back to Dashboard</button>
        </div>
      </div>

      <div className="space-y-6">
        {result.questions.map((q, i) => {
          const isCorrect = result.answers[i] === q.correctAnswer;
          return (
            <div key={i} className={`bg-white p-8 rounded-[32px] border ${isCorrect ? 'border-emerald-100' : 'border-rose-100'} shadow-sm`}>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase">Question {i + 1}</span>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
              </div>
              <p className="text-lg font-black text-slate-800 mb-6">{q.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className={`p-4 rounded-2xl text-sm font-bold border ${optIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : optIdx === result.answers[i] ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'}`}>
                    {opt}
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Detailed Analysis (How/Why/Where)</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">{q.explanation}</p>
                <p className="text-xs font-bold text-indigo-500 italic">Context: {q.context}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// --- View: Timetable ---

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
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">Asset Repository</h3>
          <div className="space-y-3 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {materials.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold">No assets uploaded</div>
            ) : (
                materials.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold truncate pr-4">{m.name}</span>
                        <button onClick={() => onRemoveMaterial(m.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                ))
            )}
          </div>
          <label className="block w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center hover:border-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
            <span className="font-black text-slate-800">Upload Study Materials</span>
            <input type="file" multiple className="hidden" onChange={e => e.target.files && onAddMaterials(e.target.files)} />
          </label>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] text-white">
          <h3 className="text-xl font-black mb-6">Constraints & Synthesis</h3>
          <textarea 
            className="w-full bg-slate-800 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 mb-8" 
            rows={4} 
            placeholder="e.g. 05:00 - 08:00 daily, prioritize Mathematics, focus on past questions..."
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
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">{s.day}</p>
                      <h4 className="text-lg font-black text-slate-800 mb-4 leading-tight">{s.topic}</h4>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {s.startTime} - {s.endTime}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

// --- View: Complaints ---

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
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-10 lg:p-14 rounded-[40px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Request & Complaints</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Direct communication with lead developers</p>
        <div className="space-y-6">
          <textarea 
            rows={6}
            className="w-full px-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-700"
            placeholder="Describe your issue or request here..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
          />
          <button 
            onClick={handleSend}
            disabled={isSending || !msg.trim()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30"
          >
            {isSending ? "Dispatching Message..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- High-Fidelity Quiz Engine ---

const QuizEngine: React.FC<{ 
  questions: Question[]; 
  isExam: boolean; 
  onComplete: (score: number, answers: Record<number, number>, time: number) => void;
  onExit: () => void;
  onStartInquiry: (text: string) => void;
}> = ({ questions, isExam, onComplete, onExit, onStartInquiry }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(isExam ? 120 * 60 : 0);
  const startTime = useRef(Date.now());
  const questionStartTime = useRef(Date.now());
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    if (isExam) return;
    const nudgeTimer = setInterval(() => {
        const spent = (Date.now() - questionStartTime.current) / 1000;
        if (spent > 60 && !showExplanation && !nudge) {
            setNudge("You've been on this question for a while. Need a logic breakdown?");
        }
    }, 10000);
    return () => clearInterval(nudgeTimer);
  }, [currentIdx, showExplanation, nudge, isExam]);

  useEffect(() => {
    if (isExam && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isExam && timeLeft === 0) {
        let score = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
        onComplete(score, answers, Math.floor((Date.now() - startTime.current) / 1000));
    }
  }, [isExam, timeLeft, answers, questions, onComplete]);

  const handleSelect = (idx: number) => {
    if (showExplanation && !isExam) return;
    setAnswers({ ...answers, [currentIdx]: idx });
    if (!isExam) {
        setShowExplanation(true);
        setNudge(null);
    }
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
      setNudge(null);
      questionStartTime.current = Date.now();
    } else {
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
      onComplete(score, answers, Math.floor((Date.now() - startTime.current) / 1000));
    }
  };

  const currentQ = questions[currentIdx];
  if (!currentQ) return <div className="p-20 text-center animate-pulse">SYNCING DATA...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
            {isExam ? `Simulator: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : `Item ${currentIdx + 1}/${questions.length}`}
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-14 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="text-xl lg:text-2xl font-black text-slate-800 mb-12 leading-tight">{currentQ.text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => {
              const isSelected = answers[currentIdx] === i;
              const isCorrect = currentQ.correctAnswer === i;
              let style = "bg-slate-50 border-transparent text-slate-600";
              if (showExplanation && !isExam) {
                  if (isCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-900";
                  else if (isSelected) style = "bg-rose-50 border-rose-500 text-rose-900";
                  else style = "opacity-40";
              } else if (isSelected) {
                  style = "bg-indigo-50 border-indigo-600 text-indigo-900";
              }

              return (
                <button 
                    key={i} 
                    onClick={() => handleSelect(i)} 
                    disabled={showExplanation && !isExam}
                    className={`p-6 rounded-3xl text-left border-2 transition-all group ${style}`}
                >
                  <span className={`w-8 h-8 rounded-lg mb-4 flex items-center justify-center font-black text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>{String.fromCharCode(65 + i)}</span>
                  <span className="font-bold text-sm">{opt}</span>
                </button>
              );
          })}
        </div>
        
        {nudge && !isExam && (
            <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 animate-bounce">
                <p className="text-sm font-bold text-amber-800">{nudge}</p>
                <button onClick={() => onStartInquiry(`I'm stuck on this question. Explain the concept of: ${currentQ.text}`)} className="mt-4 text-[10px] font-black uppercase text-indigo-600">Request AI Breakdown</button>
            </div>
        )}

        {showExplanation && !isExam && (
            <div className="mt-10 p-8 bg-slate-50 rounded-[32px] border border-slate-100 animate-in slide-in-from-top-6 duration-500">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Neural Logic Breakdown</h4>
                <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6">{currentQ.explanation}</p>
                <p className="text-xs font-bold text-indigo-500 italic">Historical Context: {currentQ.context}</p>
                <button onClick={() => onStartInquiry(`Deeper dive into: ${currentQ.explanation}`)} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Detailed Query</button>
            </div>
        )}
      </div>
      <button 
        onClick={next} 
        disabled={answers[currentIdx] === undefined} 
        className="mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30"
      >
          {currentIdx === questions.length - 1 ? "FINISH" : "NEXT"}
      </button>
    </div>
  );
};

// --- View: Onboarding ---
const OnboardingView: React.FC<{ name: string, onComplete: (style: 'CONCISE' | 'DETAILED') => void }> = ({ name, onComplete }) => {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 lg:p-14 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Welcome, {name}</h2>
        <p className="text-slate-500 font-bold mb-10">Configure your interaction style to optimize the learning interface.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onComplete('CONCISE')}
            className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-left hover:border-indigo-600 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Concise Mode</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">Direct, rapid responses. Best for quick drills and fact checking.</p>
          </button>

          <button 
            onClick={() => onComplete('DETAILED')}
            className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-left hover:border-emerald-600 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Detailed Mode</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">In-depth explanations with logic and real-world context.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Root Component ---

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('eduvantage_p');
    return saved ? JSON.parse(saved) : { 
      name: "Scholar", isAuthenticated: false, isVerified: false, hasCompletedOnboarding: false, 
      targetExam: ExamType.JAMB, studyGoal: "Efficiency", memories: [], activities: [], 
      interactionStyle: 'NEUTRAL', isChatbotEnabled: true 
    };
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

  // Handle BeforeUnload for Admin Notification
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
    if (enteredCode === profile.verificationCode) {
      setProfile(prev => ({ ...prev, isVerified: true }));
    } else {
      alert("Invalid verification code. Please check your email (or the debug alert).");
    }
  };

  const loadQuestions = async (type: ExamType, subject: string, year: string) => {
    setIsLoading(true);
    try { const q = await AI_Service.getExamQuestions(type, year, subject); setQuestions(q); } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  // Add handleGenerateTimetable logic
  const handleGenerateTimetable = async (preferences: string) => {
    setIsLoading(true);
    try {
      const plan = await AI_Service.generateTimetable(materials, preferences);
      setSessions(plan);
    } catch (e) {
      console.error(e);
      alert("Timetable generation failed. Please refine your assets and retry.");
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = (style: 'CONCISE' | 'DETAILED') => setProfile(prev => ({ ...prev, interactionStyle: style, hasCompletedOnboarding: true }));
  
  const handleQuizComplete = (score: number, answers: Record<number, number>, time: number) => { 
      setLastResult({ score, total: questions.length, answers, questions, examType: profile.targetExam, timeSpent: time });
      setActiveMode(AppMode.RESULTS); 
  };
  
  const logout = async () => {
    await EmailService.notifyAdminLogout(profile.email || "Unknown", profile.name);
    setProfile({ ...profile, isAuthenticated: false, isVerified: false, hasCompletedOnboarding: false });
    localStorage.removeItem('eduvantage_p');
    window.location.reload();
  };

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
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="bg-slate-900 p-10 lg:p-14 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            <h2 className="text-4xl font-black mb-6 tracking-tight">System Online, {profile.name}</h2>
            <p className="text-slate-400 text-lg font-bold mb-10 max-w-xl">Your preparatory interface is synchronized. Select an archival discipline to initiate a session.</p>
            <div className="flex flex-wrap gap-4">
              {[ExamType.JAMB, ExamType.WAEC, ExamType.NECO].map(t => (
                <button key={t} onClick={() => { setSelectedExamType(t); setIsSelectingMode(true); }} className="px-8 py-4 bg-white/10 hover:bg-indigo-600 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">{t} Module</button>
              ))}
            </div>
            <button onClick={logout} className="mt-12 text-rose-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">Terminate Authorized Session</button>
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

      {activeMode === AppMode.COMPLAINTS && (
        <ComplaintView userEmail={profile.email!} userName={profile.name} onSent={() => { alert("Complaint dispatched to developers."); setActiveMode(AppMode.DASHBOARD); }} />
      )}

      {activeMode === AppMode.RESULTS && lastResult && <ResultsView result={lastResult} onExit={() => setActiveMode(AppMode.DASHBOARD)} />}

      {(activeMode === AppMode.STUDY || activeMode === AppMode.EXAM_SIMULATOR) && (
          <QuizEngine 
              questions={questions} 
              isExam={activeMode === AppMode.EXAM_SIMULATOR} 
              onComplete={handleQuizComplete} 
              onExit={() => setActiveMode(AppMode.DASHBOARD)} 
              onStartInquiry={() => {}} 
          />
      )}

      {isSelectingMode && <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-xl animate-in zoom-in duration-300 text-center"><h3 className="text-xl font-black mb-10 tracking-tight">Operation Mode Calibration</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => { setSelectedSessionMode('PRACTICE'); setIsSelectingMode(false); setIsSelectingSubject(true); }} className="p-10 bg-slate-50 border border-slate-200 rounded-3xl hover:border-indigo-600 transition-all font-black text-xs uppercase tracking-widest">Interactive Study Lab</button><button onClick={() => { setSelectedSessionMode('EXAM'); setIsSelectingMode(false); setIsSelectingSubject(true); }} className="p-10 bg-slate-50 border border-slate-200 rounded-3xl hover:border-rose-600 transition-all font-black text-xs uppercase tracking-widest">Full CBT Simulator</button></div></div></div>}
      {isSelectingSubject && <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl"><h3 className="text-xl font-black mb-8 tracking-tight">Discipline Synchronization</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] custom-scrollbar p-2">{COMMON_SUBJECTS.map(s => <button key={s} onClick={() => { setSelectedSubject(s); setIsSelectingSubject(false); setIsSelectingYear(true); }} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-600 transition-all text-xs font-black uppercase tracking-widest">{s}</button>)}</div></div></div>}
      {isSelectingYear && <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg"><h3 className="text-xl font-black mb-8 tracking-tight text-center">Temporal Record Matrix</h3><div className="grid grid-cols-4 gap-2">{[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(y => <button key={y} onClick={async () => { setIsSelectingYear(false); await loadQuestions(selectedExamType!, selectedSubject, y.toString()); if (selectedSessionMode === 'EXAM') setActiveMode(AppMode.EXAM_SIMULATOR); else setActiveMode(AppMode.STUDY); }} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white transition-all font-black text-xs">{y}</button>)}</div></div></div>}
    </Layout>
  );
}
