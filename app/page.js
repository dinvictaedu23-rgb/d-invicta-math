"use client";
import React, { useState, useEffect } from 'react';

export default function DInvictaFinalSim() {
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Step 1: Subtract 15 from both sides to clear the units.");

  useEffect(() => {
    // Math: 3(5) + 15 = 30. If this is true, tilt is 0.
    const leftSide = (leftX * 5) + leftUnits;
    const rightSide = rightUnits;
    
    if (leftSide === rightSide) {
      setBalance(0);
    } else if (leftSide > rightSide) {
      setBalance(-20); // Tilt Left
    } else {
      setBalance(20); // Tilt Right
    }

    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      setMsg("🎉 MISSION COMPLETE! x = 5. The equation is solved and balanced.");
    }
  }, [leftX, leftUnits, rightUnits]);

  const handleAction = (type) => {
    if (type === 'sub_both') {
      if (leftUnits >= 15 && rightUnits >= 15) {
        setLeftUnits(prev => prev - 15);
        setRightUnits(prev => prev - 15);
        setMsg("Good! Units cleared. Now divide by 3 to isolate X.");
      }
    }
    if (type === 'sub_left') {
      setLeftUnits(prev => Math.max(0, prev - 15));
      setMsg("Oops! You only changed the left. The scale is imbalanced!");
    }
    if (type === 'div_both') {
      if (leftUnits === 0) {
        setLeftX(1);
        setRightUnits(prev => prev / 3);
        setMsg("Perfect division!");
      } else {
        setMsg("Error: You must subtract the +15 units before you can divide.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter">D-INVICTA</h1>
        <div className="space-y-4">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigation</div>
            <button onClick={() => setViewMode('student')} className={`w-full text-left p-4 rounded-2xl font-bold transition ${viewMode === 'student' ? 'bg-blue-600 shadow-xl' : 'text-slate-400'}`}>Student Lab</button>
            <button onClick={() => setViewMode('teacher')} className={`w-full text-left p-4 rounded-2xl font-bold transition ${viewMode === 'teacher' ? 'bg-purple-600 shadow-xl' : 'text-slate-400'}`}>Teacher View</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl relative">
            
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Equation Balance Lab</h2>
                <p className="font-mono text-blue-600 font-bold text-xl mt-2 tracking-widest">3x + 15 = 30</p>
            </div>

            {/* SCALE AREA */}
            <div className="flex flex-col items-center justify-center h-64 mb-16">
              <div 
                className="relative w-full h-2 bg-slate-800 rounded-full transition-all duration-700"
                style={{ transform: `rotate(${balance}deg)` }}
              >
                {/* LEFT PAN */}
                <div className="absolute -left-10 -top-28 w-44 text-center">
                  <div className="flex justify-center gap-1 mb-4 h-10 items-end">
                    {[...Array(leftX)].map((_, i) => (
                      <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>
                    ))}
                  </div>
                  <div className="bg-blue-50 py-2 px-4 rounded-2xl border border-blue-100 font-black text-blue-600 text-sm italic">
                    {leftUnits > 0 ? `+ ${leftUnits} Units` : 'Isolated'}
                  </div>
                </div>

                {/* RIGHT PAN */}
                <div className="absolute -right-10 -top-28 w-44 text-center">
                  <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse">
                    {rightUnits}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Units</div>
                </div>
              </div>
              {/* Pillar */}
              <div className="w-1 h-32 bg-slate-200 absolute z-[-1]"></div>
              <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-slate-800"></div>
            </div>

            {/* GUIDANCE BOX */}
            <div className={`p-6 rounded-[2rem] border-2 mb-10 flex items-center gap-4 transition-all ${balance === 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
               <span className="text-2xl">{balance === 0 ? '✅' : '⚠️'}</span>
               <p className="font-bold text-lg leading-tight tracking-tight">{msg}</p>
            </div>

            {/* ACTION CENTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <button onClick={() => handleAction('sub_left')} className="p-5 bg-slate-50 border-2 border-slate-100 hover:border-red-400 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 transition-all">Subtract 15 (Left Only)</button>
               <button onClick={() => handleAction('sub_both')} className="p-5 bg-blue-600 text-white hover:bg-blue-700 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 transition-all">Subtract 15 (Both Sides)</button>
               <button onClick={() => handleAction('div_both')} className="p-5 bg-slate-900 text-white hover:bg-blue-600 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all">Divide by 3 (Both Sides)</button>
            </div>

            <button onClick={() => {setLeftX(3); setLeftUnits(15); setRightUnits(30); setMsg("Restarting lab...");}} className="w-full mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-slate-900 transition">Reset Experiment</button>
          </div>
        </div>
      </main>
    </div>
  );
}
