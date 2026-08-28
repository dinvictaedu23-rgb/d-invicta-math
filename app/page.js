"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export default function DInvictaMultigrade() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('simulation');
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');
  
  // Grade 7 Lab State
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);

  // Grade 2 Lab State (Place Value)
  const [blocks, setBlocks] = useState({ hundreds: 0, tens: 0, ones: 0 });
  const [pvMsg, setPvMsg] = useState("Build the number 245");

  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100", "Money & Time"],
    "Grade 5": ["Decimals", "Fractions", "Volume of Prisms"],
    "Grade 7": ["Equations", "Ratios & Proportions", "The Number System"],
    "Grade 10": ["Quadratic Functions", "Trigonometry", "Circle Geometry"]
  };

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

  // G7 Logic
  useEffect(() => {
    if (activeTopic === 'Equations' && leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      saveResult(100, "Equations Mastered");
    }
  }, [leftX, leftUnits, rightUnits]);

  // G2 Logic
  useEffect(() => {
    if (activeTopic === 'Place Value' && blocks.hundreds === 2 && blocks.tens === 4 && blocks.ones === 5) {
      setPvMsg("Correct! 245 = 2 Hundreds, 4 Tens, 5 Ones.");
      saveResult(100, "Place Value Mastered");
    }
  }, [blocks]);

  async function saveResult(score, diagnosis) {
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: score, 
      topic: activeGrade + " - " + activeTopic,
      misconception_detected: diagnosis
    }]);
  }

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center">
          <h1 className="text-4xl font-black italic text-blue-600 mb-2">D-INVICTA</h1>
          <input type="text" placeholder="Your Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10">D-INVICTA</h1>
        <div className="flex-1 space-y-8 overflow-y-auto">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Select Grade</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(curriculum).map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); setActiveTopic(curriculum[g][0])}} className={`px-2 py-3 rounded-xl text-[10px] font-black ${activeGrade === g ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Active Topics</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} onClick={() => setActiveTopic(topic)} className={`w-full text-left p-4 rounded-2xl text-xs font-black mb-2 ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500' : 'text-slate-500'}`}>{topic}</button>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher' ? 'bg-purple-600' : 'bg-slate-800 text-slate-500'}`}>Teacher View</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
           <h2 className="text-3xl font-black">{activeTopic}</h2>
           <div className="flex bg-slate-200 p-1.5 rounded-2xl">
              <button onClick={()=>setActiveTab('simulation')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase ${activeTab === 'simulation' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Lab</button>
              <button onClick={()=>setActiveTab('resources')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase ${activeTab === 'resources' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Vault</button>
           </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto">
            {activeTab === 'simulation' ? (
              <div className="bg-white p-12 rounded-[3.5rem] border-2 shadow-2xl">
                {activeTopic === 'Equations' ? (
                  <div className="text-center">
                    <p className="font-mono text-blue-600 font-black text-2xl mb-10">3x + 15 = 30</p>
                    {/* Simplified Balance for code space */}
                    <div className="h-32 bg-slate-100 rounded-2xl mb-10 flex items-center justify-center font-black text-slate-400">
                        {leftX}X + {leftUnits} UNITS vs {rightUnits} UNITS
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={()=>{setLeftUnits(0); setRightUnits(15)}} className="p-6 bg-blue-600 text-white rounded-3xl font-black">SUBTRACT 15</button>
                      <button onClick={()=>{if(leftUnits===0){setLeftX(1); setRightUnits(5)}}} className="p-6 bg-slate-900 text-white rounded-3xl font-black">DIVIDE BY 3</button>
                    </div>
                  </div>
                ) : activeTopic === 'Place Value' ? (
                  <div className="text-center">
                    <h3 className="text-2xl font-black mb-6">{pvMsg}</h3>
                    <div className="flex justify-center gap-10 mb-10">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-2xl font-black mb-2">{blocks.hundreds}</div>
                            <button onClick={()=>setBlocks({...blocks, hundreds: blocks.hundreds+1})} className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-bold">+ Hundred</button>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-2xl font-black mb-2">{blocks.tens}</div>
                            <button onClick={()=>setBlocks({...blocks, tens: blocks.tens+1})} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-xs font-bold">+ Ten</button>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-2xl font-black mb-2">{blocks.ones}</div>
                            <button onClick={()=>setBlocks({...blocks, ones: blocks.ones+1})} className="bg-emerald-600 text-white px-4 py-1 rounded-lg text-xs font-bold">+ One</button>
                        </div>
                    </div>
                    <button onClick={()=>setBlocks({hundreds:0, tens:0, ones:0})} className="text-slate-400 text-xs font-bold uppercase underline">Reset Blocks</button>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400">Content for {activeTopic} is coming soon...</div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-red-50 p-10 rounded-[3rem] border"><h4 className="text-xl font-black text-red-600">Download {activeTopic} PDF</h4></div>
                <div className="bg-blue-50 p-10 rounded-[3rem] border"><h4 className="text-xl font-black text-blue-600">{activeTopic} Slides</h4></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
             <div className="grid grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
                 <p className="text-xs font-black text-slate-400 uppercase mb-2">Showing results for:</p>
                 <p className="text-2xl font-black text-blue-600">{activeGrade} - {activeTopic}</p>
               </div>
               <button onClick={fetchSubmissions} className="bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl">Refresh Analytics</button>
             </div>
             <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                   <tr><th className="p-8">Student</th><th className="p-8">Score</th><th className="p-8">Diagnosis</th><th className="p-8">Status</th></tr>
                 </thead>
                 <tbody className="divide-y">
                   {submissions.filter(s => s.topic.includes(activeTopic)).map((s, i) => (
                     <tr key={i} className="text-sm font-bold">
                       <td className="p-8">{s.student_name}</td>
                       <td className="p-8 text-emerald-600">{s.score}%</td>
                       <td className="p-8 text-slate-400">{s.misconception_detected}</td>
                       <td className="p-8 text-blue-600">Complete</td>
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
