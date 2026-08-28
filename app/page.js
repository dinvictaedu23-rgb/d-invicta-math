"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export default function DInvictaCurriculumSystem() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('simulation');
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  
  // Simulation & Data State
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Topic: Two-Step Equations (7.EE.B.4)");
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  // CURRICULUM DATA (Step 4 & 5)
  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100", "Money & Time"],
    "Grade 5": ["Decimals", "Fractions", "Volume of Prisms"],
    "Grade 7": ["Equations", "Ratios & Proportions", "The Number System"],
    "Grade 10": ["Quadratic Functions", "Trigonometry", "Circle Geometry"]
  };

  // AUTH & DATA FETCH
  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Enter your name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role);
  };

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

  // SIMULATION LOGIC
  useEffect(() => {
    if (!user.isLoggedIn) return;
    const tilt = (rightUnits) - ((leftX * 5) + leftUnits);
    setBalance(tilt);
    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      saveResult(100);
    }
  }, [leftX, leftUnits, rightUnits]);

  async function saveResult(score) {
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: score, 
      topic: activeGrade + " - Equations" 
    }]);
  }

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(submissions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "D-INVICTA Report");
    XLSX.writeFile(wb, `Class_Report_${activeGrade}.xlsx`);
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center">
          <h1 className="text-4xl font-black italic text-blue-600 mb-2 tracking-tighter">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10 text-slate-500">Curriculum & Assessment Hub</p>
          <input type="text" placeholder="Enter Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500 mb-6" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR: THE CURRICULUM NAVIGATOR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-black italic text-blue-400 tracking-tighter">D-INVICTA</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Grade: {activeGrade}</p>
        </div>
        
        <div className="flex-1 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Select Grade</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {Object.keys(curriculum).map(g => (
                <button key={g} onClick={()=>setActiveGrade(g)} className={`px-2 py-2 rounded-xl text-[10px] font-black transition ${activeGrade === g ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Active Topics</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} className="w-full text-left p-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white mb-1">
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button onClick={() => setViewMode('student')} className={`w-full text-left p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student' ? 'bg-blue-600' : 'text-slate-500'}`}>Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher' ? 'bg-purple-600' : 'text-slate-500'}`}>Dashboard</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-black">{activeTab === 'simulation' ? 'Laboratory' : 'Digital Vault'}</h2>
           <div className="flex bg-slate-200 p-1 rounded-2xl">
              <button onClick={()=>setActiveTab('simulation')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'simulation' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Interactive</button>
              <button onClick={()=>setActiveTab('resources')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'resources' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Resources</button>
           </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto">
            {activeTab === 'simulation' ? (
              <div className="bg-white p-12 rounded-[3rem] border-2 shadow-2xl text-center">
                <p className="font-mono text-blue-600 font-bold text-xl mb-10">3x + 15 = 30</p>
                <div className="h-48 flex flex-col items-center justify-center mb-10 relative">
                  <div className="w-full h-2 bg-slate-800 rounded-full transition-all duration-500" style={{ transform: `rotate(${balance}deg)` }}>
                    <div className="absolute -left-10 -top-16 text-blue-600 font-black">{leftX}X + {leftUnits}</div>
                    <div className="absolute -right-10 -top-16 text-emerald-600 font-black">{rightUnits} Units</div>
                  </div>
                  <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[60px] border-b-slate-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={()=>{setLeftUnits(0); setRightUnits(15)}} className="p-4 bg-blue-600 text-white rounded-2xl font-black">SUBTRACT 15</button>
                  <button onClick={()=>{if(leftUnits===0){setLeftX(1); setRightUnits(5)}}} className="p-4 bg-slate-900 text-white rounded-2xl font-black">DIVIDE BY 3</button>
                </div>
              </div>
            ) : (
              /* THE RESOURCE VAULT (Step 21) */
              <div className="grid grid-cols-2 gap-6 animate-in fade-in zoom-in">
                <ResourceCard type="PDF" title="Topic Handout" color="bg-red-50" textColor="text-red-600" />
                <ResourceCard type="PPT" title="Lesson Presentation" color="bg-orange-50" textColor="text-orange-600" />
                <ResourceCard type="XLS" title="Practice Dataset" color="bg-blue-50" textColor="text-blue-600" />
                <ResourceCard type="KEY" title="Answer Key" color="bg-emerald-50" textColor="text-emerald-600" />
              </div>
            )}
          </div>
        ) : (
          /* TEACHER DASHBOARD */
          <div className="space-y-10">
            <div className="grid grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-3xl border shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase">Class Mastery</p><p className="text-4xl font-black">89%</p></div>
               <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600' : 'bg-slate-400'} p-8 rounded-3xl text-white shadow-xl transition-all`}>
                  <p className="text-[10px] font-bold uppercase">{isLive ? 'Live Sync On' : 'Sync Paused'}</p>
                  <p className="text-2xl font-black mt-1 uppercase">Feedback Feed</p>
               </button>
               <button onClick={downloadExcel} className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Export Analytics</p>
                  <p className="text-xl font-black mt-1">DOWNLOAD EXCEL</p>
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                   <tr><th className="p-6">Student</th><th className="p-6">Topic</th><th className="p-6">Score</th><th className="p-6">Alerts</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {submissions.map((s, i) => (
                     <tr key={i} className="text-sm font-bold">
                       <td className="p-6 text-slate-800">{s.student_name}</td>
                       <td className="p-6 text-slate-400">{s.topic}</td>
                       <td className="p-6 text-emerald-600 font-black">{s.score}%</td>
                       <td className="p-6 text-red-500 underline decoration-red-200">Vertical Gap Detected</td>
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
  <div className={`${color} p-10 rounded-[3rem] border shadow-sm cursor-pointer hover:shadow-xl transition-all group`}>
    <p className={`text-[10px] font-black uppercase tracking-widest ${textColor} mb-2`}>{type}</p>
    <h4 className="text-xl font-black text-slate-800 group-hover:underline decoration-2">{title}</h4>
    <p className="text-xs font-bold text-slate-400 mt-4 uppercase">Download Resource →</p>
  </div>
);
