"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // The connection we just made

export default function DInvictaLive() {
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Goal: Isolate x while keeping the scale balanced.");
  const [liveData, setLiveData] = useState([]);

  // PHYSICS ENGINE
  useEffect(() => {
    const leftSide = (leftX * 5) + leftUnits;
    const rightSide = rightUnits;
    setBalance(rightSide - leftSide);

    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      setMsg("🎉 SUCCESS! Saving result to Teacher Dashboard...");
      saveToDatabase(100, "None");
    }
  }, [leftX, leftUnits, rightUnits]);

  // DATA SAVING LOGIC
  async function saveToDatabase(score, error) {
    await supabase.from('student_submissions').insert([
      { student_name: "Ahmed Ibrahim", score: score, misconception_detected: error }
    ]);
    fetchClassData(); // Refresh the teacher's view immediately
  }

  // TEACHER DATA FETCHING
  async function fetchClassData() {
    const { data } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
    setLiveData(data || []);
  }

  useEffect(() => { if (viewMode === 'teacher') fetchClassData(); }, [viewMode]);

  const handleAction = (type) => {
    if (type === 'sub_both' && leftUnits >= 15) {
        setLeftUnits(prev => prev - 15);
        setRightUnits(prev => prev - 15);
    } else if (type === 'div_both' && leftUnits === 0) {
        setLeftX(1);
        setRightUnits(5);
    } else {
        setMsg("Illegal move! Tipping scale.");
        setBalance(20);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter">D-INVICTA</h1>
        <nav className="space-y-4">
          <button onClick={() => setViewMode('student')} className={`w-full text-left p-4 rounded-2xl font-bold transition ${viewMode === 'student' ? 'bg-blue-600 shadow-xl' : 'text-slate-400'}`}>Student Lab</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left p-4 rounded-2xl font-bold transition ${viewMode === 'teacher' ? 'bg-purple-600 shadow-xl' : 'text-slate-400'}`}>Teacher View</button>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-hidden">
        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] border-2 shadow-2xl">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-black">Interactive Balance Lab</h2>
                <p className="text-blue-600 font-bold">3x + 15 = 30</p>
            </div>
            
            <div className="flex flex-col items-center h-48 mb-10">
              <div className="relative w-full h-2 bg-slate-800 rounded-full transition-all duration-500" style={{ transform: `rotate(${balance}deg)` }}>
                <div className="absolute -left-10 -top-20 w-32 text-center font-black text-blue-600">{leftX}X + {leftUnits}</div>
                <div className="absolute -right-10 -top-20 w-32 text-center font-black text-emerald-600">{rightUnits} Units</div>
              </div>
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-slate-800 mt-[-4px]"></div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mb-6 text-center font-bold text-blue-800 italic">{msg}</div>
            
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => handleAction('sub_both')} className="p-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Subtract 15 (Both)</button>
               <button onClick={() => handleAction('div_both')} className="p-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Divide by 3 (Both)</button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-black">Live Intervention Feed</h2>
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr><th className="p-4">Student</th><th className="p-4">Mastery</th><th className="p-4">Misconception</th><th className="p-4">Time</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {liveData.map((row, i) => (
                      <tr key={i} className="text-sm font-bold animate-in slide-in-from-top duration-300">
                        <td className="p-4">{row.student_name}</td>
                        <td className="p-4 text-emerald-600">{row.score}%</td>
                        <td className="p-4 text-slate-400">{row.misconception_detected}</td>
                        <td className="p-4 text-slate-400 tracking-tighter">{new Date(row.created_at).toLocaleTimeString()}</td>
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
