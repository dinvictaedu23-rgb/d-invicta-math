"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx'; // New library for Excel

export default function DInvictaPro() {
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Step 1: Subtract 15 from both sides.");
  const [submissions, setSubmissions] = useState([]);
  const [startTime] = useState(Date.now());

  // PHYSICS & DATA
  useEffect(() => {
    const leftSide = (leftX * 5) + leftUnits;
    const rightSide = rightUnits;
    setBalance(rightSide - leftSide);
    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      handleFinalSave();
    }
  }, [leftX, leftUnits, rightUnits]);

  async function handleFinalSave() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    await supabase.from('student_submissions').insert([
      { student_name: "Ahmed Ibrahim", score: 100, misconception_detected: "None", time_spent_seconds: timeTaken }
    ]);
    if (viewMode === 'teacher') fetchSubmissions();
  }

  async function fetchSubmissions() {
    const { data } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
  }

  // --- EXCEL EXPORT LOGIC ---
  const downloadExcel = () => {
    if (submissions.length === 0) return alert("No data to export!");
    
    // 1. Format the data for Excel
    const worksheetData = submissions.map(s => ({
      "Student Name": s.student_name,
      "Topic": s.topic,
      "Score (%)": s.score,
      "Diagnosis": s.misconception_detected,
      "Time (Sec)": s.time_spent_seconds,
      "Date": new Date(s.created_at).toLocaleDateString()
    }));

    // 2. Create Workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Semester Report");

    // 3. Trigger Download
    XLSX.writeFile(workbook, "D-INVICTA_Semester_Report.xlsx");
  };

  useEffect(() => { if (viewMode === 'teacher') fetchSubmissions(); }, [viewMode]);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter">D-INVICTA</h1>
        <nav className="space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'student' ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>Student Lab</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>Teacher Dashboard</button>
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] border-2 shadow-2xl">
              <h2 className="text-3xl font-black text-center mb-10">3x + 15 = 30</h2>
              <div className="flex flex-col items-center h-48 mb-10">
                <div className="w-full h-2 bg-slate-800 rounded-full transition-transform" style={{ transform: `rotate(${balance}deg)` }}></div>
                <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[60px] border-b-slate-800 mt-[-4px]"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => {setLeftUnits(0); setRightUnits(15)}} className="p-4 bg-blue-600 text-white rounded-xl font-bold">Subtract 15</button>
                <button onClick={() => {if(leftUnits===0){setLeftX(1); setRightUnits(5)}}} className="p-4 bg-slate-900 text-white rounded-xl font-bold">Divide by 3</button>
              </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black">Class Analytics</h2>
              <button 
                onClick={downloadExcel}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-200"
              >
                Generate Excel
              </button>
            </div>
            
            <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <tr><th className="p-6">Student</th><th className="p-6">Score</th><th className="p-6">Diagnosis</th><th className="p-6">Date</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {submissions.map((s, i) => (
                     <tr key={i} className="hover:bg-slate-50">
                       <td className="p-6 font-bold">{s.student_name}</td>
                       <td className="p-6 text-emerald-600 font-black">{s.score}%</td>
                       <td className="p-6 text-slate-400 font-bold">{s.misconception_detected}</td>
                       <td className="p-6 text-slate-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
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
