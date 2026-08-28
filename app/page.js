"use client";
import React, { useState } from 'react';
// Note: We use standard HTML icons since Lucide needs a special setup
export default function DInvicta() {
  const [viewMode, setViewMode] = useState('student');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter">D-INVICTA</h1>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setViewMode('student')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${viewMode === 'student' ? 'bg-blue-600 shadow-lg shadow-blue-900' : 'text-slate-400 hover:bg-slate-800'}`}>Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg shadow-purple-900' : 'text-slate-400 hover:bg-slate-800'}`}>Teacher Dashboard</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="font-black text-slate-800 text-xl">Two-Step Equations</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grade 7 • CCSS 7.EE.B.4</p>
          </div>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase">Active Session</div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          {viewMode === 'student' ? (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border shadow-xl shadow-slate-200">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Assignment #12</span>
                <p className="text-4xl font-black text-slate-800 mt-4 mb-10">Solve for x: <br/> <span className="text-blue-600 italic">3x + 15 = 30</span></p>
                
                <div className="flex gap-4">
                  <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter value of x" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-blue-500 outline-none transition" />
                  <button onClick={() => setFeedback({status: answer === "5" ? "ok" : "err", msg: answer === "5" ? "Excellent! Mastery Level Increased." : "Not quite. Try subtracting 15 first."})} className="bg-slate-900 text-white px-10 rounded-2xl font-black hover:bg-blue-600 transition shadow-lg">SUBMIT</button>
                </div>

                {feedback && (
                  <div className={`mt-8 p-6 rounded-2xl border-2 flex items-center gap-4 ${feedback.status === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="text-2xl">{feedback.status === 'ok' ? '✅' : '❌'}</div>
                    <p className="font-bold text-lg">{feedback.msg}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm border-b-4 border-b-blue-500"><p className="text-xs font-black text-slate-400 uppercase">Class Average</p><p className="text-4xl font-black text-slate-800 mt-2">82%</p></div>
                <div className="bg-white p-8 rounded-3xl border shadow-sm border-b-4 border-b-red-500"><p className="text-xs font-black text-slate-400 uppercase">Active Alerts</p><p className="text-4xl font-black text-red-500 mt-2">3</p></div>
                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col justify-center"><p className="text-xs font-bold text-slate-500 uppercase">Semester Export</p><p className="text-white font-black mt-1">GENERATE EXCEL</p></div>
              </div>

              <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                 <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Triage: Students Requiring Intervention</h3>
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Priority Alpha</span>
                 </div>
                 <div className="p-12 text-center">
                    <p className="text-slate-400 font-bold italic">Real-time submission data will populate this panel.</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
