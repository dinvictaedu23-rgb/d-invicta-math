"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  Plus, Minus, Award, RefreshCw, LayoutDashboard, Activity, 
  CheckCircle, Lightbulb, Users, Download, Zap, TrendingUp,
  Target, ShieldCheck, UserCircle, BookOpen
} from 'lucide-react';

export default function DInvictaOS() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student_portal'); // student_portal, student_dash, teacher_dash
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');

  // Logic States
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);
  
  // Simulation States
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100", "Money & Time"],
    "Grade 7": ["Equations", "Ratios & Proportions", "Geometry"]
  };

  // --- CORE ENGINE ---
  useEffect(() => {
    if (!user.isLoggedIn || isComplete) return;

    if (activeGrade === 'Grade 2' && g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) {
      handleMastery("High Fluency");
    }

    const leftWeight = (g7.x * 5) + g7.units;
    const tilt = g7.target - leftWeight;
    setG7(prev => ({ ...prev, balance: tilt }));
    if (activeGrade === 'Grade 7' && g7.x === 1 && g7.units === 0 && g7.target === 5) {
      handleMastery(Date.now() - startTime > 30000 ? "Secure" : "Elite Fluency");
    }
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

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(submissions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "D-INVICTA Report");
    XLSX.writeFile(wb, "Class_Mastery_Report.xlsx");
  };

  const resetLab = () => {
    setIsComplete(false); setStartTime(Date.now());
    setG2({ hundreds: 0, tens: 0, ones: 0, target: 245 });
    setG7({ x: 3, units: 15, target: 30, balance: 0 });
  };

  // --- LOGIN ---
  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3.5rem] p-12 shadow-2xl text-center border-t-[12px] border-blue-600 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Zap size={40} fill="currentColor"/></div>
          <h1 className="text-4xl font-black italic text-slate-900 mb-2">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Mathematics Intelligence Hub</p>
          <input type="text" placeholder="Enter Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-black text-slate-700 outline-none focus:border-blue-500 transition-all" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => {setUser({name: tempName, role: 'student', isLoggedIn: true}); setViewMode('student_portal'); setStartTime(Date.now());}} className="bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg shadow-blue-200 active:scale-95 transition">Student</button>
            <button onClick={() => {setUser({name: tempName, role: 'teacher', isLoggedIn: true}); setViewMode('teacher_dash');}} className="bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg shadow-slate-200 active:scale-95 transition">Teacher</button>
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
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">D</div>
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
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Active Curriculum</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} onClick={()=>{setActiveTopic(topic); resetLab();}} className={`w-full text-left p-4 rounded-2xl text-xs font-black mb-2 transition-all ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500' : 'text-slate-500 hover:text-white'}`}>{topic}</button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 space-y-3">
          {user.role === 'student' ? (
            <>
              <button onClick={()=>setViewMode('student_portal')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase transition-all ${viewMode === 'student_portal' ? 'bg-blue-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}><Activity size={18}/> Lab Portal</button>
              <button onClick={()=>setViewMode('student_dash')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase transition-all ${viewMode === 'student_dash' ? 'bg-emerald-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}><TrendingUp size={18}/> My Progress</button>
            </>
          ) : (
            <button onClick={()=>setViewMode('teacher_dash')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase transition-all ${viewMode === 'teacher_dash' ? 'bg-purple-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}><LayoutDashboard size={18}/> Analytics Hub</button>
          )}
          <button onClick={()=>window.location.reload()} className="w-full text-center text-[10px] font-black text-slate-600 uppercase pt-4 hover:text-white transition">Exit System</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-12 overflow-y-auto relative bg-[#f8fafc]">
        
        {/* MASTERY OVERLAY */}
        {isComplete && viewMode === 'student_portal' && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-[4rem] p-12 text-center shadow-2xl max-w-lg w-full border-b-[12px] border-emerald-500 animate-in zoom-in duration-300">
               <Award className="text-yellow-500 w-24 h-24 mx-auto mb-6 animate-bounce" />
               <h3 className="text-4xl font-black text-slate-800 mb-2">Topic Mastered!</h3>
               <p className="text-slate-500 font-bold mb-10 italic">Your performance has been logged in the intelligence hub.</p>
               <button onClick={resetLab} className="bg-blue-600 text-white w-full py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition flex items-center justify-center gap-3">
                 <RefreshCw size={20}/> Next Mission
               </button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-1">{activeGrade} • {activeTopic}</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
              {viewMode === 'student_portal' ? 'Laboratory' : viewMode === 'student_dash' ? 'My Insights' : 'Intelligence Hub'}
            </h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active User</p>
                <p className="font-black text-slate-900">{user.name}</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center text-blue-600 font-black italic">D</div>
          </div>
        </header>

        {/* --- STUDENT PORTAL (THE LAB) --- */}
        {viewMode === 'student_portal' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {activeGrade === 'Grade 2' ? (
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border-2 border-slate-100 text-center">
                <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl mb-12">
                   <p className="text-[10px] font-black uppercase opacity-70 mb-1 tracking-widest">Mission Objective</p>
                   <h3 className="text-3xl font-black italic underline decoration-white/30">Build the number: 245</h3>
                </div>
                <div className="flex justify-center items-end gap-6 h-56 mb-12 bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed">
                    <div className="flex flex-wrap-reverse w-44 gap-1 content-start">{[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-12 h-12 bg-red-500 rounded-lg shadow-md border-2 border-red-700 flex items-center justify-center text-[10px] text-white font-black animate-in zoom-in">100</div>)}</div>
                    <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.tens)].map((_, i) => <div key={i} className="w-4 h-12 bg-blue-500 rounded-md border-2 border-blue-700 flex items-center justify-center text-[8px] text-white font-black animate-in slide-in-from-bottom">10</div>)}</div>
                    <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.ones)].map((_, i) => <div key={i} className="w-4 h-4 bg-emerald-500 rounded-sm border-2 border-emerald-700 flex items-center justify-center animate-in zoom-in">1</div>)}</div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <BlockUI label="Hundreds" val={g2.hundreds} color="bg-red-600" onP={()=>setG2({...g2, hundreds: g2.hundreds+1})} onM={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})}/>
                   <BlockUI label="Tens" val={g2.tens} color="bg-blue-600" onP={()=>setG2({...g2, tens: g2.tens+1})} onM={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})}/>
                   <BlockUI label="Ones" val={g2.ones} color="bg-emerald-600" onP={()=>setG2({...g2, ones: g2.ones+1})} onM={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})}/>
                </div>
              </div>
            ) : (
              <div className="bg-white p-16 rounded-[4rem] shadow-xl border-2 border-slate-100 text-center relative overflow-hidden">
                <div className="bg-slate-900 text-white py-4 px-10 rounded-2xl inline-block mb-16 font-mono text-3xl font-black tracking-[0.2em] shadow-2xl">3x + 15 = 30</div>
                <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                  <div className="w-full h-3 bg-slate-800 rounded-full transition-all duration-1000 shadow-xl" style={{ transform: `rotate(${g7.balance}deg)` }}>
                    <div className="absolute -left-16 -top-28 w-52 flex flex-col items-center">
                       <div className="flex gap-1 mb-4 h-12 items-end">{[...Array(g7.x)].map((_, i) => <div key={i} className="w-12 h-12 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce text-xl">X</div>)}</div>
                       <div className="bg-blue-50 px-6 py-2 rounded-2xl border-2 border-blue-100 text-blue-600 font-black text-xs uppercase tracking-widest shadow-sm">+{g7.units} Units</div>
                    </div>
                    <div className="absolute -right-16 -top-28 w-52 text-center">
                       <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] shadow-2xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-4xl animate-pulse">{g7.target}</div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Target State</p>
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[50px] border-r-[40px] border-b-[90px] border-b-slate-800 mt-[-4px]"></div>
                </div>
                <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                   <button onClick={()=>setG7({...g7, units:0, target:15})} className="p-7 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition active:scale-95">Subtract 15 (Both)</button>
                   <button onClick={()=>{if(g7.units===0)setG7({...g7, x:1, target:5})}} className="p-7 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition active:scale-95">Divide by 3 (Both)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STUDENT DASHBOARD (MY INSIGHTS) --- */}
        {viewMode === 'student_dash' && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
             <div className="grid grid-cols-4 gap-6">
                <MetricCard icon={<Award className="text-yellow-500"/>} label="Global Rank" val="Explorer" sub="Top 15% this week" />
                <MetricCard icon={<Zap className="text-blue-500"/>} label="Total XP" val="4,250" sub="+100 Today" />
                <MetricCard icon={<Target className="text-emerald-500"/>} label="Topics Mastered" val="12" sub="of 22 assigned" />
                <MetricCard icon={<ShieldCheck className="text-purple-500"/>} label="Streak" val="6 Days" sub="Longest: 12 days" />
             </div>
             <div className="bg-white p-12 rounded-[4rem] border shadow-sm text-center py-32 border-dashed border-slate-300">
                <p className="text-slate-300 font-black text-2xl uppercase italic tracking-widest">Visual Mastery Radar Map Loading...</p>
             </div>
          </div>
        )}

        {/* --- TEACHER DASHBOARD (HUB) --- */}
        {viewMode === 'teacher_dash' && (
          <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Mastery</p>
                   <p className="text-6xl font-black text-slate-900">92<span className="text-2xl text-blue-500">%</span></p>
                   <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-xs"><TrendingUp size={16}/> +4% vs last week</div>
                </div>
                <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-slate-400 shadow-slate-200'} p-10 rounded-[3rem] text-white shadow-2xl text-left transition-all hover:scale-[1.02] active:scale-95`}>
                   <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Live Sync Status</p>
                   <p className="text-3xl font-black mt-2 uppercase">{isLive ? 'ACTIVE FEED' : 'SYNC PAUSED'}</p>
                   <p className="text-[10px] mt-2 font-bold italic opacity-50">{isLive ? 'Auto-refreshing every 5s' : 'Click to enable real-time'}</p>
                </button>
                <button onClick={downloadExcel} className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl text-left group hover:bg-black transition-all">
                   <Download className="mb-4 text-blue-400 group-hover:animate-bounce" size={32}/>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">School Records</p>
                   <p className="text-2xl font-black mt-1">GENERATE EXCEL</p>
                </button>
             </div>

             <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                   <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Student Triage Table</h4>
                   <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Target: Grade 2–10 Progression</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                    <tr><th className="p-10">Student Identity</th><th className="p-10">Topic Path</th><th className="p-10 text-center">Score</th><th className="p-10">System Diagnosis</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.length > 0 ? submissions.map((s, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-10 flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center font-black text-slate-400 uppercase text-sm group-hover:text-blue-600 transition-colors">{s.student_name.charAt(0)}</div>
                           <span className="font-black text-slate-800 text-lg">{s.student_name}</span>
                        </td>
                        <td className="p-10 text-slate-400 font-bold text-sm tracking-tight">{s.topic}</td>
                        <td className="p-10 text-center"><span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-lg">{s.score}%</span></td>
                        <td className={`p-10 font-bold italic text-sm ${s.misconception_detected.includes('Elite') ? 'text-blue-500' : 'text-red-500 underline decoration-red-200'}`}>{s.misconception_detected}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-32 text-center text-slate-300 font-black italic text-xl tracking-tighter">System Idle. Waiting for submissions...</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const BlockUI = ({ label, val, color, onP, onM }) => (
  <div className="bg-white border-4 border-slate-50 p-8 rounded-[3rem] shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onM} className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90"><Minus/></button>
       <span className="text-5xl font-black text-slate-800 tracking-tighter">{val}</span>
       <button onClick={onP} className={`${color} w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all`}><Plus/></button>
    </div>
  </div>
);

const MetricCard = ({ icon, label, val, sub }) => (
  <div className="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-xl transition-all">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{val}</p>
    <p className="text-[10px] font-bold text-slate-400 mt-2 italic">{sub}</p>
  </div>
);
