"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  Plus, Minus, Award, RefreshCw, LayoutDashboard, Activity, 
  CheckCircle, Lightbulb, Users, Download, Zap, TrendingUp,
  Target, ShieldCheck, UserCircle, BookOpen, FileText, ChevronRight, HelpCircle
} from 'lucide-react';

export default function DInvictaStandardized() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student_portal'); 
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');
  const [topicTab, setTopicTab] = useState('learn'); // learn, lab, assess

  // Logic States
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);
  
  // Simulation States
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100"],
    "Grade 7": ["Equations", "Ratios & Proportions"]
  };

  // --- DATABASE SYNC ---
  useEffect(() => {
    if (!user.isLoggedIn || isComplete) return;
    if (activeGrade === 'Grade 2' && g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) handleMastery("Place Value Mastery");
    if (activeGrade === 'Grade 7' && g7.x === 1 && g7.units === 0 && g7.target === 5) handleMastery("Algebraic Mastery");
  }, [g2, g7]);

  async function handleMastery(diag) {
    setIsComplete(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, score: 100, topic: `${activeGrade} - ${activeTopic}`,
      misconception_detected: diag, time_spent_seconds: timeTaken
    }]);
  }

  async function fetchSubmissions() {
    const { data } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
  }

  useEffect(() => {
    if (viewMode === 'teacher_dash') fetchSubmissions();
    if (isLive && viewMode === 'teacher_dash') {
      const interval = setInterval(fetchSubmissions, 5000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isLive]);

  const resetLab = () => {
    setIsComplete(false); setStartTime(Date.now()); setTopicTab('learn');
    setG2({ hundreds: 0, tens: 0, ones: 0, target: 245 });
    setG7({ x: 3, units: 15, target: 30, balance: 0 });
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3.5rem] p-12 shadow-2xl text-center border-t-[12px] border-blue-600 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Zap size={40} fill="currentColor"/></div>
          <h1 className="text-4xl font-black italic text-slate-900 mb-2 tracking-tighter uppercase">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Math Intelligence Platform</p>
          <input type="text" placeholder="Enter Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-black text-slate-700 outline-none focus:border-blue-500 transition-all" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => {setUser({name: tempName, role: 'student', isLoggedIn: true}); setViewMode('student_portal'); setStartTime(Date.now());}} className="bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition">Student</button>
            <button onClick={() => {setUser({name: tempName, role: 'teacher', isLoggedIn: true}); setViewMode('teacher_dash');}} className="bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg shadow-slate-200 hover:bg-black active:scale-95 transition">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl relative z-20">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic">D</div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">INVICTA</h1>
        </div>
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Mastery Level</p>
            <div className="grid grid-cols-2 gap-2">
              {["Grade 2", "Grade 7"].map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); setActiveTopic(curriculum[g][0]); resetLab();}} className={`px-2 py-3 rounded-xl text-[10px] font-black transition-all ${activeGrade === g ? 'bg-blue-600 shadow-lg shadow-blue-500/40' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Active Topics</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} onClick={()=>{setActiveTopic(topic); resetLab();}} className={`w-full text-left p-4 rounded-2xl text-xs font-black mb-2 transition-all ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500 shadow-inner' : 'text-slate-500 hover:text-white'}`}>{topic}</button>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={()=>setViewMode(user.role === 'student' ? 'student_portal' : 'teacher_dash')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase transition-all ${viewMode.includes('portal') || viewMode.includes('teacher') ? 'bg-blue-600 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}><Activity size={18}/> Home Portal</button>
          {user.role === 'student' && <button onClick={()=>setViewMode('student_dash')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase transition-all ${viewMode === 'student_dash' ? 'bg-emerald-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}><TrendingUp size={18}/> My Insights</button>}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto relative bg-[#f8fafc]">
        
        {/* MASTERY APPRAISAL OVERLAY */}
        {isComplete && viewMode === 'student_portal' && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl max-w-lg w-full border-b-[16px] border-emerald-500 transform transition-all scale-100 shadow-emerald-500/20">
               <Award className="text-yellow-500 w-24 h-24 mx-auto mb-6 animate-bounce" />
               <h3 className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">UNCONQUERABLE!</h3>
               <p className="text-slate-500 font-bold mb-10 italic text-lg leading-relaxed">"Congratulations {user.name}, you have mastered {activeTopic}. Data transmitted to dashboard."</p>
               <button onClick={resetLab} className="bg-blue-600 text-white w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 transition flex items-center justify-center gap-3">
                 <RefreshCw size={24}/> Restart Mission
               </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-2">{activeGrade} • Standardized Roadmap</h2>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">{activeTopic}</h3>
          </div>
          {viewMode === 'student_portal' && (
            <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
                <TabBtn active={topicTab === 'learn'} onClick={()=>setTopicTab('learn')} label="Learn" icon={<BookOpen size={16}/>}/>
                <TabBtn active={topicTab === 'simulation'} onClick={()=>setTopicTab('simulation')} label="Lab" icon={<Zap size={16}/>}/>
                <TabBtn active={topicTab === 'assess'} onClick={()=>setTopicTab('assess')} label="Assess" icon={<Target size={16}/>}/>
            </div>
          )}
        </header>

        {/* --- STUDENT PORTAL WORKFLOW --- */}
        {viewMode === 'student_portal' && (
          <div className="max-w-5xl mx-auto space-y-10">
            
            {topicTab === 'learn' && (
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Lightbulb size={24}/></div>
                    <h4 className="text-2xl font-black text-slate-800">Concept Explanation</h4>
                 </div>
                 <div className="prose prose-slate max-w-none mb-12">
                    <p className="text-xl text-slate-600 leading-relaxed font-medium">
                      {activeGrade === 'Grade 7' ? 
                      "To solve an equation like 3x + 15 = 30, we must isolate the variable. This means undoing operations in reverse order. First, we remove the constant (+15) by subtracting it from both sides." : 
                      "Place value is the value of each digit in a number. For a 3-digit number, the first digit is Hundreds, the second is Tens, and the third is Ones. (Ex: 245 = 200 + 40 + 5)"}
                    </p>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Worked Example</p>
                    <div className="text-center font-mono text-3xl font-black text-blue-600 italic">
                      {activeGrade === 'Grade 7' ? "3x = 30 - 15  =>  3x = 15  =>  x = 5" : "2 Hundreds (200) + 4 Tens (40) + 5 Ones (5) = 245"}
                    </div>
                 </div>
                 <button onClick={()=>setTopicTab('simulation')} className="mt-12 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 mx-auto shadow-xl hover:bg-slate-900 transition">
                    Open Interactive Lab <ChevronRight size={20}/>
                 </button>
              </div>
            )}

            {topicTab === 'simulation' && (
              <div className="animate-in zoom-in-95 duration-500">
                {activeGrade === 'Grade 2' ? (
                  <div className="bg-white p-12 rounded-[4rem] shadow-xl border-2 border-slate-100 text-center">
                    <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl mb-12 flex justify-between items-center">
                       <p className="text-3xl font-black italic">Mission: Build 245</p>
                       <div className="bg-white/20 p-4 rounded-3xl"><Activity/></div>
                    </div>
                    <div className="flex justify-center items-end gap-6 h-56 mb-12 bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed">
                        <div className="flex flex-wrap-reverse w-44 gap-1 content-start">{[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-12 h-12 bg-red-500 rounded-lg shadow-md border-2 border-red-700 flex items-center justify-center text-[10px] text-white font-black animate-bounce">100</div>)}</div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.tens)].map((_, i) => <div key={i} className="w-4 h-12 bg-blue-500 rounded-md border-2 border-blue-700 flex items-center justify-center text-[8px] text-white font-black animate-in slide-in-from-bottom">10</div>)}</div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.ones)].map((_, i) => <div key={i} className="w-4 h-4 bg-emerald-500 rounded-sm border-2 border-emerald-700 flex items-center justify-center">1</div>)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       <BlockControl label="Hundreds" val={g2.hundreds} color="bg-red-600" onP={()=>setG2({...g2, hundreds: g2.hundreds+1})} onM={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})}/>
                       <BlockControl label="Tens" val={g2.tens} color="bg-blue-600" onP={()=>setG2({...g2, tens: g2.tens+1})} onM={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})}/>
                       <BlockControl label="Ones" val={g2.ones} color="bg-emerald-600" onP={()=>setG2({...g2, ones: g2.ones+1})} onM={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})}/>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-16 rounded-[4rem] shadow-xl border-2 border-slate-100 text-center">
                    <div className="bg-slate-900 text-white py-4 px-10 rounded-2xl inline-block mb-16 font-mono text-3xl font-black tracking-[0.2em] shadow-2xl italic text-blue-400">3x + 15 = 30</div>
                    <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                      <div className="w-full h-3 bg-slate-800 rounded-full transition-all duration-1000 shadow-xl" style={{ transform: `rotate(${g7.balance}deg)` }}>
                        <div className="absolute -left-16 -top-28 w-52 flex flex-col items-center">
                           <div className="flex gap-1 mb-4 h-12 items-end">{[...Array(g7.x)].map((_, i) => <div key={i} className="w-12 h-12 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce text-xl">X</div>)}</div>
                           <div className="bg-blue-50 px-6 py-2 rounded-2xl border-2 border-blue-100 text-blue-600 font-black text-xs uppercase shadow-sm">+{g7.units} Units</div>
                        </div>
                        <div className="absolute -right-16 -top-28 w-52 text-center">
                           <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] shadow-2xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-4xl animate-pulse">{g7.target}</div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Target State</p>
                        </div>
                      </div>
                      <div className="w-0 h-0 border-l-[50px] border-r-[40px] border-b-[90px] border-b-slate-800 mt-[-4px]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                       <button onClick={()=>setG7({...g7, units:0, target:15})} className="p-7 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition">Subtract 15 (Both Sides)</button>
                       <button onClick={()=>{if(g7.units===0)setG7({...g7, x:1, target:5})}} className="p-7 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition">Divide by 3 (Both Sides)</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {topicTab === 'assess' && (
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in">
                 <h4 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">✏️ Quick Assessment</h4>
                 <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-200">
                    <p className="text-xl font-bold text-slate-700 mb-6">Final Mastery Check: If you build a number with 3 Hundreds and 2 Ones, what is the number?</p>
                    <input type="text" placeholder="Your Answer" className="w-full bg-white border-2 p-5 rounded-2xl text-xl font-black outline-none focus:border-emerald-500 transition-all" />
                    <button onClick={()=>alert("Assessment logic ready for Phase 8.")} className="mt-8 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest">Submit Mastery Check</button>
                 </div>
              </div>
            )}

          </div>
        )}

        {/* --- TEACHER DASHBOARD --- */}
        {viewMode === 'teacher_dash' && (
          <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border shadow-sm border-b-[8px] border-blue-500">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Class Mastery Avg</p>
                   <p className="text-6xl font-black text-slate-900">92<span className="text-2xl text-blue-500">%</span></p>
                </div>
                <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-slate-400 shadow-slate-200'} p-10 rounded-[3rem] text-white shadow-2xl text-left transition-all hover:scale-[1.02] active:scale-95`}>
                   <p className="text-[10px] font-black uppercase opacity-70">Auto-Update</p>
                   <p className="text-3xl font-black mt-2 uppercase">{isLive ? 'FEED LIVE' : 'FEED OFF'}</p>
                </button>
                <button onClick={downloadExcel} className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl text-left group hover:bg-black transition-all">
                   <Download className="mb-4 text-blue-400 group-hover:animate-bounce" size={32}/>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Export Report</p>
                   <p className="text-2xl font-black mt-1">EXCEL .XLSX</p>
                </button>
             </div>

             <div className="bg-white rounded-[4rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b tracking-widest">
                    <tr><th className="p-10">Student</th><th className="p-10">Topic Path</th><th className="p-10">System Diagnosis</th><th className="p-10 text-center">Score</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((s, i) => (
                      <tr key={i} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="p-10 flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center font-black text-slate-400 uppercase text-sm group-hover:text-blue-600 transition-colors">{s.student_name.charAt(0)}</div>
                           <span className="font-black text-slate-800 text-lg">{s.student_name}</span>
                        </td>
                        <td className="p-10 text-slate-400 font-bold text-sm">{s.topic}</td>
                        <td className={`p-10 font-bold italic text-sm ${s.misconception_detected.includes('Elite') ? 'text-blue-500' : 'text-red-500 underline decoration-red-200'}`}>{s.misconception_detected}</td>
                        <td className="p-10 text-center"><span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-lg">{s.score}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---
const TabBtn = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${active ? 'bg-[#0f172a] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}>
    {icon} {label}
  </button>
);

const BlockControl = ({ label, val, color, onP, onM }) => (
  <div className="bg-white border-4 border-slate-50 p-8 rounded-[3rem] shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onM} className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-inner"><Minus/></button>
       <span className="text-5xl font-black text-slate-800 tracking-tighter">{val}</span>
       <button onClick={onP} className={`${color} w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all`}><Plus/></button>
    </div>
  </div>
);

const MetricCard = ({ icon, label, val, sub }) => (
  <div className="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-2xl transition-all">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{val}</p>
    <p className="text-[10px] font-bold text-slate-400 mt-2 italic tracking-tight">{sub}</p>
  </div>
);
