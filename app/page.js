"use client";
import React, { useState, useEffect } from 'react';

export default function DInvictaSimulation() {
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('simulation'); // Default to simulation
  
  // Simulation State: 3x + 15 = 30
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); // 0 is balanced
  const [msg, setMsg] = useState("Goal: Isolate 'x' while keeping the scale balanced.");

  // The "Physics" Engine: Updates balance whenever values change
  useEffect(() => {
    const leftTotal = (leftX * 5) + leftUnits; // Assuming x=5 for visual balance
    const rightTotal = rightUnits;
    setBalance(rightTotal - leftTotal);

    if (leftX === 1 && leftUnits === 0 && rightUnits === 5) {
      setMsg("🎉 SUCCESS! You isolated x. x = 5");
    }
  }, [leftX, leftUnits, rightUnits]);

  const performOp = (op, val) => {
    if (op === 'sub') {
      if (leftUnits >= val && rightUnits >= val) {
        setLeftUnits(l => l - val);
        setRightUnits(r => r - val);
        setMsg(`Legal Move: Subtracted ${val} from both sides.`);
      } else {
        setMsg("Illegal Move: Not enough units to subtract!");
      }
    }
    if (op === 'div') {
      if (leftUnits === 0) {
        setLeftX(prev => prev / val);
        setRightUnits(prev => prev / val);
        setMsg(`Legal Move: Divided both sides by ${val}.`);
      } else {
        setMsg("Strategy Tip: Subtract the constant units (15) before dividing!");
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter">D-INVICTA</h1>
        <nav className="flex-1 space-y-4 text-sm uppercase font-bold tracking-widest">
          <button onClick={() => setViewMode('student')} className={`w-full text-left px-4 py-3 rounded-xl transition ${viewMode === 'student' ? 'bg-blue-600 shadow-lg' : 'text-slate-500 hover:text-white'}`}>Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left px-4 py-3 rounded-xl transition ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg' : 'text-slate-500 hover:text-white'}`}>Teacher Dashboard</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-800 text-xl tracking-tight">Two-Step Equations</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">7.EE.B.4 • Linear Modeling</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setActiveTab('simulation')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${activeTab === 'simulation' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Simulation</button>
             <button onClick={() => setActiveTab('practice')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${activeTab === 'practice' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Practice</button>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          {viewMode === 'student' ? (
            <div className="max-w-4xl mx-auto">
              {activeTab === 'simulation' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl flex flex-col items-center">
                    
                    {/* VISUAL SCALE ENGINE */}
                    <div className="relative w-full h-48 flex items-end justify-center mb-16">
                      <div className="absolute w-full h-1.5 bg-slate-800 rounded-full transition-transform duration-700" style={{transform: `rotate(${balance * 1.5}deg)`}}>
                        {/* LEFT PAN */}
                        <div className="absolute -left-4 -top-24 w-32 h-24 border-b-4 border-slate-300 flex flex-wrap content-end justify-center gap-1 p-2">
                          {[...Array(leftX)].map((_, i) => <div key={i} className="w-6 h-6 bg-blue-500 rounded-lg shadow-sm border border-blue-600 flex items-center justify-center text-[8px] text-white font-bold">X</div>)}
                          <div className="w-full text-center text-[10px] font-black text-slate-400">+{leftUnits} UNITS</div>
                        </div>
                        {/* RIGHT PAN */}
                        <div className="absolute -right-4 -top-24 w-32 h-24 border-b-4 border-slate-300 flex flex-col justify-end items-center p-2">
                           <div className="w-12 h-12 bg-emerald-500 rounded-2xl shadow-md border-2 border-emerald-600 flex items-center justify-center text-white font-black">{rightUnits}</div>
                           <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Target Units</p>
                        </div>
                      </div>
                      <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-slate-800"></div>
                    </div>

                    <div className="w-full bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 flex items-center gap-4 mb-8">
                       <span className="text-2xl">💡</span>
                       <p className="text-sm font-bold text-blue-800 italic">{msg}</p>
                    </div>

                    {/* CONTROLS */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <button onClick={() => performOp('sub', 15)} className="p-4 bg-white border-2 border-slate-100 hover:border-red-500 rounded-2xl font-black text-xs text-slate-600 uppercase tracking-widest transition-all">Subtract 15 (Both Sides)</button>
                       <button onClick={() => performOp('div', 3)} className="p-4 bg-white border-2 border-slate-100 hover:border-blue-500 rounded-2xl font-black text-xs text-slate-600 uppercase tracking-widest transition-all">Divide by 3 (Both Sides)</button>
                    </div>
                    <button onClick={() => {setLeftX(3); setLeftUnits(15); setRightUnits(30); setMsg("Simulation Reset.")}} className="mt-8 text-[10px] font-black text-slate-400 uppercase underline underline-offset-8">Reset Laboratory</button>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">Practice Mode: Active</div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
               <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Simulation Analytics</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center">
                     <span className="text-sm font-bold">Successful Isolation Rate</span>
                     <span className="text-emerald-400 font-black">74%</span>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center">
                     <span className="text-sm font-bold text-red-400 underline decoration-red-400/30 underline-offset-4">Common Simulation Error</span>
                     <span className="text-slate-400 text-xs font-bold italic">Division before Subtraction</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
