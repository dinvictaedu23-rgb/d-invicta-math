"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function DInvictaMaster() {
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Step 1: Subtract 15 from both sides.");
  const [submissions, setSubmissions] = useState([]);
  const [startTime] = useState(Date.now());

  // 1. PHYSICS & AUTO-SAVE
  useEffect(() => {
    const leftSide = (leftX * 5) + leftUnits;
    const rightSide = rightUnits;
    setBalance(rightSide - leftSide);

    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      setMsg("🎉 MISSION COMPLETE! Saving to Teacher Dashboard...");
      handleFinalSave();
    }
  }, [leftX, leftUnits, rightUnits]);

  async function handleFinalSave() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    // Logic: If they took > 60 seconds for this simple sim, flag a gap
    const gap = timeTaken > 60 ? "Foundational Gap: Integer Operations" : "None";
    
    await supabase.from('student_submissions').insert([
      { 
        student_name: "Ahmed Ibrahim", 
        score: 100, 
        misconception_detected: gap,
        time_spent_seconds: timeTaken 
      }
    ]);
    if (viewMode === 'teacher') fetchSubmissions();
  }

  // 2. TEACHER DATA FETCH
  async function fetchSubmissions() {
    const { data } = await supabase
      .from('student_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data || []);
  }

  useEffect(() => {
    if (viewMode === 'teacher') fetchSubmissions();
  }, [viewMode]);

  const move = (type) => {
    if (type === 'sub') {
      setLeftUnits(0);
      setRightUnits(15);
      setMsg("Units cleared! Now divide to find x.");
    }
    if (type === 'div' && leftUnits === 0) {
      setLeftX(1);
      setRightUnits(5);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic text-blue-400 tracking-tighter">D-INVICTA</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Math Intelligence</p>
        </div>
        <nav className="space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'student' ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span>Student Lab</span>
          </button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span>Teacher Dashboard</span>
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl">
              <header className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-800">Equation Balance Lab</h2>
                <div className="mt-2 inline-block bg-blue-50 px-4 py-1 rounded-full text-blue-600 font-mono font-bold text-lg">3x + 15 = 30</div>
              </header>

              <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                <div className="w-full h-2 bg-slate-800 rounded-full transition-transform duration-700" style={{ transform: `rotate(${balance}deg)` }}>
                  <div className="absolute -left-10 -top-20 w-40 text-center font-black text-blue-600 text-xl">{leftX}X + {leftUnits}</div>
                  <div className="absolute -right-10 -top-20 w-40 text-center font-black text-emerald-600 text-xl">{rightUnits} UNITS</div>
                </div>
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl text-center font-bold text-blue-800 italic mb-10">{msg}</div>

              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => move('sub')} className="p-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200">Subtract 15 (Both)</button>
                <button onClick={() => move('div')} className="p-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition">Divide by 3 (Both)</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800">Class Performance</h2>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Live Intervention Feed</p>
              </div>
              <button onClick={fetchSubmissions} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition">Refresh Data</button>
            </div>

            <div className="grid grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase">Avg. Mastery</p><p className="text-4xl font-black text-slate-800">100%</p></div>
               <div className="bg-white p-8 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase">Class Pace</p><p className="text-4xl font-black text-blue-600">Optimal</p></div>
               <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl"><p className="text-xs font-bold text-slate-500 uppercase">Semester Export</p><p className="text-xl font-black mt-2">GENERATE EXCEL</p></div>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <tr>
                     <th className="p-6">Student</th>
                     <th className="p-6">Score</th>
                     <th className="p-6">Diagnosis</th>
                     <th className="p-6">Time (Sec)</th>
                     <th className="p-6">Submission Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {submissions.length > 0 ? submissions.map((s, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                       <td className="p-6 font-bold text-slate-700">{s.student_name}</td>
                       <td className="p-6 text-emerald-600 font-black">{s.score}%</td>
                       <td className={`p-6 text-xs font-bold ${s.misconception_detected !== 'None' ? 'text-red-500 underline' : 'text-slate-400'}`}>
                         {s.misconception_detected}
                       </td>
                       <td className="p-6 font-mono text-slate-500">{s.time_spent_seconds}s</td>
                       <td className="p-6 text-xs text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
                     </tr>
                   )) : (
                     <tr><td colSpan="5" className="p-20 text-center text-slate-400 italic font-bold">No data yet. Solve the lab as a student first!</td></tr>
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
