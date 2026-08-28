"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export default function DInvictaUltimate() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'teacher'
  const [activeTab, setActiveTab] = useState('simulation');
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');
  
  // Laboratory State
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Topic Active: 3x + 15 = 30");
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100", "Money & Time"],
    "Grade 5": ["Decimals", "Fractions", "Volume of Prisms"],
    "Grade 7": ["Equations", "Ratios & Proportions", "The Number System"],
    "Grade 10": ["Quadratic Functions", "Trigonometry", "Circle Geometry"]
  };

  // IDENTITY
  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Enter your name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role);
  };

  // DATA FETCH
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

  // LAB PHYSICS
  useEffect(() => {
    if (!user.isLoggedIn || activeTopic !== 'Equations') return;
    const tilt = (rightUnits) - ((leftX * 5) + leftUnits);
    setBalance(tilt);
    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      saveResult(100);
    }
  }, [leftX, leftUnits, rightUnits, activeTopic]);

  async function saveResult(score) {
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: score, 
      topic: activeGrade + " - " + activeTopic 
    }]);
  }

  // EXCEL
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(submissions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `D-INVICTA_${activeGrade}_Report.xlsx`);
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center animate-in zoom-in duration-500">
          <h1 className="text-4xl font-black italic text-blue-600 mb-2 tracking-tighter">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Mathematics Intelligence</p>
          <input type="text" placeholder="Student Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500 mb-6" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 transition">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 transition">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-black italic text-blue-400 tracking-tighter uppercase">D-INVICTA</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{activeGrade} • {activeTopic}</p>
        </div>
        
        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-[0.2em]">Curriculum Grade</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(curriculum).map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); setActiveTopic(curriculum[g][0])}} className={`px-2 py-3 rounded-xl text-[10px] font-black transition ${activeGrade === g ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-[0.2em]">Active Topics</p>
            <div className="space-y-2">
              {curriculum[activeGrade].map(topic => (
                <button 
                  key={topic} 
                  onClick={() => setActiveTopic(topic)}
                  className={`w-full text-left p-4 rounded-2xl text-xs font-black transition-all ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase transition ${viewMode === 'student' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase transition ${viewMode === 'teacher' ? 'bg-purple-600' : 'bg-slate-800 text-slate-500'}`}>Teacher View</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
           <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeTopic}</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {viewMode === 'student' ? 'Learning Mode' : 'Analytics Mode'}</p>
           </div>
           <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner">
              <button onClick={()=>setActiveTab('simulation')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'simulation' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Lab</button>
              <button onClick={()=>setActiveTab('resources')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'resources' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Vault</button>
           </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto">
            {activeTab === 'simulation' ? (
              <div className="bg-white p-12 rounded-[3.5rem] border-2 shadow-2xl animate-in zoom-in-95 duration-500">
                {activeTopic === 'Equations' ? (
                  <>
                    <div className="text-center mb-10">
                      <p className="font-mono text-blue-600 font-black text-2xl tracking-tighter">3x + 15 = 30</p>
                    </div>
                    <div className="h-56 flex flex-col items-center justify-center mb-16 relative">
                      <div className="w-full h-2.5 bg-slate-800 rounded-full transition-all duration-700 shadow-sm" style={{ transform: `rotate(${balance}deg)` }}>
                        <div className="absolute -left-12 -top-20 w-44 text-center">
                           <div className="flex justify-center gap-1 mb-4">
                             {[...Array(leftX)].map((_, i) => <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>)}
                           </div>
                           <div className="bg-blue-50 py-2 rounded-xl text-blue-600 font-black text-xs uppercase tracking-widest">{leftUnits > 0 ? `+ ${leftUnits} Units` : 'Isolated'}</div>
                        </div>
                        <div className="absolute -right-12 -top-20 w-44 text-center">
                           <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-2xl">{rightUnits}</div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                        </div>
                      </div>
                      <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl text-center font-bold text-blue-800 italic mb-10 shadow-sm">{msg}</div>
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={()=>{setLeftUnits(0); setRightUnits(15)}} className="p-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">SUBTRACT 15</button>
                      <button onClick={()=>{if(leftUnits===0){setLeftX(1); setRightUnits(5)}}} className="p-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95">DIVIDE BY 3</button>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6"><Activity size={40}/></div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Laboratory Offline</h3>
                    <p className="text-slate-400 text-sm font-bold mt-2">The simulation for {activeTopic} is being prepared.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
                <ResourceCard type="PDF" title={`${activeTopic} Handout`} color="bg-red-50" textColor="text-red-600" />
                <ResourceCard type="PPT" title="Lesson Presentation" color="bg-orange-50" textColor="text-orange-600" />
                <ResourceCard type="XLS" title="Practice Exercises" color="bg-blue-50" textColor="text-blue-600" />
                <ResourceCard type="KEY" title="Master Answer Key" color="bg-emerald-50" textColor="text-emerald-600" />
              </div>
            )}
          </div>
        ) : (
          /* TEACHER VIEW */
          <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
            <div className="grid grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Mastery</p><p className="text-5xl font-black text-slate-800">92%</p></div>
               <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-400 shadow-slate-200'} p-10 rounded-[2.5rem] text-white shadow-2xl transition-all text-left`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Live Sync Status</p>
                  <p className="text-3xl font-black mt-2 uppercase">{isLive ? 'ACTIVE' : 'PAUSED'}</p>
               </button>
               <button onClick={downloadExcel} className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl text-left hover:scale-[1.02] transition">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Export Analytics</p>
                  <p className="text-2xl font-black mt-2 tracking-tight uppercase underline decoration-slate-700">Get Excel Report</p>
               </button>
            </div>

            <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                   <tr><th className="p-8">Student</th><th className="p-8">Topic Path</th><th className="p-8">Score</th><th className="p-8">Status</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {submissions.map((s, i) => (
                     <tr key={i} className="text-sm font-bold hover:bg-slate-50 transition">
                       <td className="p-8 text-slate-800">{s.student_name}</td>
                       <td className="p-8 text-slate-400">{s.topic}</td>
                       <td className="p-8 text-emerald-600 font-black">{s.score}%</td>
                       <td className="p-8 text-blue-500">Mastered</td>
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

const ResourceCard = ({ type, title, color, textColor }) => (
  <div className={`${color} p-12 rounded-[3.5rem] border shadow-sm cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group`}>
    <p className={`text-[10px] font-black uppercase tracking-widest ${textColor} mb-4`}>{type} Resource</p>
    <h4 className="text-2xl font-black text-slate-800 group-hover:underline decoration-4 underline-offset-8">{title}</h4>
    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">Download File <ChevronRight size={14}/></div>
  </div>
);
