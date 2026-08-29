"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { Plus, Minus, BookOpen, Activity, LayoutDashboard, Download, RefreshCw } from 'lucide-react';

export default function DInvictaConsistent() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('simulation');
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');

  // Logic & Timing
  const [startTime, setStartTime] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  
  // G7 State
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });
  // G2 State
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });

  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100"],
    "Grade 7": ["Equations", "Ratios & Proportions"]
  };

  // --- DIAGNOSTIC ENGINE (Step 12) ---
  const generateDiagnosis = (timeTaken) => {
    if (errorLog.length > 0) return `Procedural Error: ${errorLog[0]}`;
    if (timeTaken > 60) return "Mastered (Slow Pace - Intervention Recommended)";
    if (timeTaken < 5) return "Mastered (High Fluency)";
    return "Mastered (Secure)";
  };

  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Enter name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role);
    setStartTime(Date.now());
  };

  async function saveResult() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const finalDiagnosis = generateDiagnosis(timeTaken);

    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: 100, 
      topic: `${activeGrade} - ${activeTopic}`,
      misconception_detected: finalDiagnosis,
      time_spent_seconds: timeTaken
    }]);
    
    // Reset for next attempt
    setErrorLog([]);
    setStartTime(Date.now());
  }

  // G7 Logic
  useEffect(() => {
    const tilt = g7.target - ((g7.x * 5) + g7.units);
    setG7(prev => ({ ...prev, balance: tilt }));
    if (g7.x === 1 && g7.units === 0 && g7.target === 5) { saveResult(); }
  }, [g7.x, g7.units, g7.target]);

  // G2 Logic
  useEffect(() => {
    if (g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) { saveResult(); }
  }, [g2]);

  async function fetchSubmissions() {
    const { data } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
  }

  useEffect(() => {
    if (viewMode === 'teacher') fetchSubmissions();
    if (isLive && viewMode === 'teacher') {
      const interval = setInterval(fetchSubmissions, 5000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isLive]);

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center border-b-8 border-blue-600">
          <h1 className="text-4xl font-black italic text-slate-900 mb-2">D-INVICTA</h1>
          <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-bold outline-none focus:border-blue-500" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">D</div>
            <h1 className="text-xl font-black italic text-white tracking-tighter">INVICTA</h1>
        </div>
        <div className="flex-1 overflow-y-auto space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Grades</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(curriculum).map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); setActiveTopic(curriculum[g][0])}} className={`px-2 py-3 rounded-xl text-[10px] font-black transition ${activeGrade === g ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 text-slate-500'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Topics</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} onClick={() => setActiveTopic(topic)} className={`w-full text-left p-4 rounded-2xl text-xs font-black mb-2 transition-all ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500' : 'text-slate-500 hover:text-white'}`}>{topic}</button>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}><Activity size={16}/> Student Lab</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher' ? 'bg-purple-600' : 'bg-slate-800 text-slate-500'}`}><LayoutDashboard size={16}/> Teacher View</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800">{activeTopic}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeGrade} Standard</p>
          </div>
          <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner">
              <button onClick={()=>setActiveTab('simulation')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition ${activeTab === 'simulation' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Simulation</button>
              <button onClick={()=>setActiveTab('resources')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition ${activeTab === 'resources' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Vault</button>
          </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto">
            {activeTab === 'simulation' ? (
              <div className="bg-white p-12 rounded-[3.5rem] border-2 shadow-2xl">
                
                {activeTopic === 'Equations' && (
                  <div className="animate-in zoom-in duration-500">
                    <p className="text-center font-mono text-2xl font-black text-blue-600 mb-10 underline decoration-blue-200 tracking-tighter italic">3x + 15 = 30</p>
                    <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                      <div className="w-full h-2 bg-slate-800 rounded-full transition-transform duration-700" style={{ transform: `rotate(${g7.balance}deg)` }}>
                        <div className="absolute -left-12 -top-24 w-44 flex flex-col items-center">
                          <div className="flex gap-1 mb-4">
                            {[...Array(g7.x)].map((_, i) => <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>)}
                          </div>
                          <div className="bg-blue-50 px-4 py-1 rounded-full text-blue-600 font-black text-[10px] uppercase tracking-widest">+{g7.units} Units</div>
                        </div>
                        <div className="absolute -right-12 -top-24 w-44 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center text-2xl">{g7.target}</div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Target Units</p>
                        </div>
                      </div>
                      <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={()=>{setG7({...g7, units:0, target:15})}} className="p-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200">Subtract 15 (Both)</button>
                       <button onClick={()=>{
                         if(g7.units > 0) setErrorLog(["Order of Operations (Divided before Subtracting)"]);
                         if(g7.units===0){setG7({...g7, x:1, target:5})}
                       }} className="p-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Divide by 3 (Both)</button>
                    </div>
                  </div>
                )}

                {activeTopic === 'Place Value' && (
                  <div className="animate-in fade-in duration-500">
                    <div className="text-center mb-8">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Build this Number</p>
                       <p className="text-5xl font-black text-slate-800 tracking-tighter">245</p>
                    </div>
                    
                    <div className="flex justify-center items-end gap-8 h-48 mb-12 bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200">
                        <div className="flex flex-wrap-reverse w-32 gap-1 content-start">
                           {[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-10 h-10 bg-red-500 rounded border-2 border-red-700 shadow-sm animate-bounce"></div>)}
                        </div>
                        <div className="flex flex-wrap-reverse w-20 gap-1 content-start">
                           {[...Array(g2.tens)].map((_, i) => <div key={i} className="w-3 h-10 bg-blue-500 rounded border border-blue-700"></div>)}
                        </div>
                        <div className="flex flex-wrap-reverse w-20 gap-1 content-start">
                           {[...Array(g2.ones)].map((_, i) => <div key={i} className="w-3 h-3 bg-emerald-500 rounded border border-emerald-700"></div>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <BlockControl label="Hundreds" val={g2.hundreds} onAdd={()=>setG2({...g2, hundreds: g2.hundreds+1})} onSub={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})} color="bg-red-600" />
                        <BlockControl label="Tens" val={g2.tens} onAdd={()=>setG2({...g2, tens: g2.tens+1})} onSub={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})} color="bg-blue-600" />
                        <BlockControl label="Ones" val={g2.ones} onAdd={()=>setG2({...g2, ones: g2.ones+1})} onSub={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})} color="bg-emerald-600" />
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                 <ResourceCard title="Handout PDF" />
                 <ResourceCard title="Lesson Slides" />
              </div>
            )}
          </div>
        ) : (
          /* TEACHER VIEW (Consistently Styled) */
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
               <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Class Analytics</h3>
               <div className="flex gap-4">
                  <button onClick={fetchSubmissions} className="p-3 bg-white border-2 rounded-xl text-slate-400 hover:text-slate-900"><RefreshCw size={20}/></button>
                  <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600' : 'bg-slate-400'} px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all`}>{isLive ? 'Live: ON' : 'Live: OFF'}</button>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b">
                   <tr><th className="p-8">Student</th><th className="p-8">Topic Path</th><th className="p-8">Score</th><th className="p-8">Diagnosis</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {submissions.length > 0 ? submissions.map((s, i) => (
                      <tr key={i} className="text-sm font-bold hover:bg-blue-50/50 transition-colors group">
                        <td className="p-8 text-slate-900">{s.student_name}</td>
                        <td className="p-8 text-slate-400 font-medium">{s.topic}</td>
                        <td className="p-8 text-emerald-600 font-black uppercase tracking-tighter">{s.score}%</td>
                        <td className={`p-8 text-xs font-bold italic tracking-tight ${s.misconception_detected.includes('Error') ? 'text-red-500' : 'text-slate-400'}`}>
                          {s.misconception_detected}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-black italic">Waiting for submissions...</td></tr>
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

const BlockControl = ({ label, val, onAdd, onSub, color }) => (
  <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onSub} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition shadow-sm"><Minus size={18}/></button>
       <span className="text-3xl font-black text-slate-800">{val}</span>
       <button onClick={onAdd} className={`${color} w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg hover:scale-110 transition`}><Plus size={18}/></button>
    </div>
  </div>
);

const ResourceCard = ({ title }) => (
  <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-64">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors"><BookOpen size={24}/></div>
    <h4 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight">{title}</h4>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-slate-200 underline-offset-8">Download PDF →</p>
  </div>
);
