"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export default function DInvictaFinal() {
  // --- LOGIN & IDENTITY STATE ---
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');

  // --- SYSTEM STATE ---
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Step 1: Subtract 15 from both sides.");
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false); // Live Feedback Toggle
  const [startTime, setStartTime] = useState(null);

  // --- LOGIN LOGIC ---
  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Please enter your name.");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role);
    setStartTime(Date.now());
  };

  // --- PHYSICS & AUTO-SAVE ---
  useEffect(() => {
    if (!user.isLoggedIn) return;
    const leftSide = (leftX * 5) + leftUnits;
    const rightSide = rightUnits;
    setBalance(rightSide - leftSide);

    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      setMsg("🎉 MISSION COMPLETE! Saving result...");
      handleFinalSave();
    }
  }, [leftX, leftUnits, rightUnits, user.isLoggedIn]);

  async function handleFinalSave() {
    const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const gap = timeTaken > 60 ? "Foundational Gap Detected" : "None";
    
    await supabase.from('student_submissions').insert([
      { 
        student_name: user.name, 
        score: 100, 
        misconception_detected: gap,
        time_spent_seconds: timeTaken 
      }
    ]);
    if (viewMode === 'teacher') fetchSubmissions();
  }

  // --- DATA FETCH & LIVE MODE ---
  async function fetchSubmissions() {
    const { data } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
  }

  useEffect(() => {
    let interval;
    if (isLive && viewMode === 'teacher') {
      interval = setInterval(fetchSubmissions, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive, viewMode]);

  useEffect(() => { if (viewMode === 'teacher') fetchSubmissions(); }, [viewMode]);

  // --- EXCEL EXPORT ---
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(submissions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "D-INVICTA Data");
    XLSX.writeFile(wb, "D-INVICTA_Class_Report.xlsx");
  };

  const move = (type) => {
    if (type === 'sub') { setLeftUnits(0); setRightUnits(15); setMsg("Units cleared! Now divide."); }
    if (type === 'div' && leftUnits === 0) { setLeftX(1); setRightUnits(5); }
  };

  // --- LOGIN OVERLAY ---
  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl animate-in fade-in zoom-in duration-500 text-center">
          <h1 className="text-4xl font-black italic text-blue-600 mb-2 tracking-tighter">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Mathematics Intelligence System</p>
          
          <input 
            type="text" 
            placeholder="Enter Full Name" 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500 mb-6 transition-all"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic text-blue-400 tracking-tighter">D-INVICTA</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 uppercase">User: {user.name}</p>
        </div>
        <nav className="space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'student' ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}>Student Lab</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800'}`}>Teacher Dashboard</button>
        </nav>
        <button onClick={() => window.location.reload()} className="mt-auto text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest">Logout</button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl">
              <header className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Equation Balance Lab</h2>
                <div className="mt-2 inline-block bg-blue-50 px-4 py-1 rounded-full text-blue-600 font-mono font-bold text-lg">3x + 15 = 30</div>
              </header>

              <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                <div className="w-full h-2 bg-slate-800 rounded-full transition-transform duration-700" style={{ transform: `rotate(${balance}deg)` }}>
                  <div className="absolute -left-10 -top-20 w-44 text-center">
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(leftX)].map((_, i) => <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>)}
                    </div>
                    <div className="bg-blue-50 py-2 px-4 rounded-xl text-blue-600 font-black text-sm italic">{leftUnits > 0 ? `+ ${leftUnits} Units` : 'Isolated'}</div>
                  </div>
                  <div className="absolute -right-10 -top-20 w-44 text-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-2xl">{rightUnits}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Units</p>
                  </div>
                </div>
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl text-center font-bold text-blue-800 italic mb-10">{msg}</div>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => move('sub')} className="p-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg">Subtract 15 (Both)</button>
                <button onClick={() => move('div')} className="p-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg">Divide by 3 (Both)</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <h2 className="text-4xl font-black text-slate-800">Class Analytics</h2>
              <div className="flex gap-4">
                <button onClick={fetchSubmissions} className="bg-white border-2 px-6 py-2 rounded-xl font-bold hover:bg-slate-50">Manual Refresh</button>
                <button onClick={downloadExcel} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Generate Excel</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase">Avg. Mastery</p><p className="text-4xl font-black text-slate-800">100%</p></div>
               <div className="bg-white p-8 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase">Class Pace</p><p className="text-4xl font-black text-blue-600">Optimal</p></div>
               {/* NEW INTERACTIVE BUTTON BELOW */}
               <button 
                 onClick={() => setIsLive(!isLive)}
                 className={`${isLive ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-400 shadow-slate-200'} p-8 rounded-[2rem] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left`}
               >
                 <p className="text-xs font-bold uppercase tracking-widest text-white/70">Live Feedback</p>
                 <p className="text-2xl font-black mt-2 uppercase">{isLive ? 'SYSTEM LIVE' : 'SYSTEM OFF'}</p>
                 <p className="text-[10px] mt-1 font-bold italic text-white/50">{isLive ? 'Refreshing every 5s' : 'Click to start sync'}</p>
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                   <tr><th className="p-6">Student</th><th className="p-6">Score</th><th className="p-6">Diagnosis</th><th className="p-6">Time (Sec)</th><th className="p-6">Date</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {submissions.map((s, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                       <td className="p-6 font-bold">{s.student_name}</td>
                       <td className="p-6 text-emerald-600 font-black">{s.score}%</td>
                       <td className="p-6 text-xs font-bold text-slate-400">{s.misconception_detected}</td>
                       <td className="p-6 font-mono text-slate-500">{s.time_spent_seconds}s</td>
                       <td className="p-6 text-xs text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
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
