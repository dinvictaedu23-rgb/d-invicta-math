"use client";
import React, { useState, useEffect } from 'react';

export default function DInvictaPhysicsSim() {
  const [viewMode, setViewMode] = useState('student');
  const [leftX, setLeftX] = useState(3);
  const [leftUnits, setLeftUnits] = useState(15);
  const [rightUnits, setRightUnits] = useState(30);
  const [balance, setBalance] = useState(0); 
  const [msg, setMsg] = useState("Try subtracting 15 from ONLY the left side to see what happens.");

  useEffect(() => {
    // We calculate the weight. If weight is unequal, the scale tips.
    const leftWeight = (leftX * 10) + leftUnits; 
    const rightWeight = rightUnits;
    
    // This formula creates the tilt angle
    const tilt = (rightWeight - leftWeight) * 2; 
    setBalance(tilt);

    if (leftX === 1 && leftUnits === 0 && rightUnits === 10 && tilt === 0) {
      setMsg("🌟 PERFECT BALANCE! You found x = 10 (adjusted for this test)");
    }
  }, [leftX, leftUnits, rightUnits]);

  const move = (side, amount) => {
    if (side === 'left') setLeftUnits(prev => Math.max(0, prev - amount));
    if (side === 'right') setRightUnits(prev => Math.max(0, prev - amount));
    if (side === 'both') {
        setLeftUnits(prev => Math.max(0, prev - amount));
        setRightUnits(prev => Math.max(0, prev - amount));
    }
    setMsg(side === 'both' ? "Balanced Move!" : `Warning: Scale tipped! You only changed the ${side}.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10">D-INVICTA</h1>
        <button onClick={() => setViewMode('student')} className="w-full text-left p-3 rounded-xl bg-blue-600 font-bold shadow-lg">Student Lab</button>
      </aside>

      <main className="flex-1 flex flex-col p-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white p-12 rounded-[3rem] border-4 border-slate-100 shadow-2xl relative overflow-hidden">
            
            {/* THE PHYSICS SCALE */}
            <div className="flex flex-col items-center justify-center h-64 mb-12">
              <div 
                className="relative w-full h-2 bg-slate-800 rounded-full transition-transform duration-1000 cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                style={{ transform: `rotate(${balance}deg)` }}
              >
                {/* LEFT PAN */}
                <div className="absolute -left-10 -top-24 w-40 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(leftX)].map((_, i) => <div key={i} className="w-8 h-8 bg-blue-500 rounded-lg shadow-lg border-2 border-blue-600 text-white font-black flex items-center justify-center">X</div>)}
                  </div>
                  <div className="bg-slate-100 py-1 px-3 rounded-full text-[10px] font-black text-slate-500 inline-block">+{leftUnits} UNITS</div>
                  <div className="w-full h-1 bg-slate-300 mt-2"></div>
                </div>

                {/* RIGHT PAN */}
                <div className="absolute -right-10 -top-24 w-40 text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl shadow-lg border-2 border-emerald-600 text-white font-black flex items-center justify-center mx-auto mb-2 text-xl">{rightUnits}</div>
                  <div className="bg-slate-100 py-1 px-3 rounded-full text-[10px] font-black text-slate-500 inline-block">TOTAL UNITS</div>
                  <div className="w-full h-1 bg-slate-300 mt-2"></div>
                </div>
              </div>
              {/* Base */}
              <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
            </div>

            {/* MESSAGE SYSTEM */}
            <div className={`p-6 rounded-2xl border-2 mb-8 transition-colors ${Math.abs(balance) > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
               <p className="font-black text-center italic tracking-tight">{msg}</p>
            </div>

            {/* EXPERIMENT CONTROLS */}
            <div className="grid grid-cols-3 gap-4">
               <button onClick={() => move('left', 15)} className="p-4 bg-slate-100 hover:bg-red-100 rounded-2xl font-black text-[10px] uppercase tracking-tighter">Subtract 15 (Left Only)</button>
               <button onClick={() => move('both', 15)} className="p-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg">Subtract 15 (Balanced)</button>
               <button onClick={() => move('right', 15)} className="p-4 bg-slate-100 hover:bg-red-100 rounded-2xl font-black text-[10px] uppercase tracking-tighter">Subtract 15 (Right Only)</button>
            </div>

            <button onClick={() => {setLeftUnits(15); setRightUnits(30); setMsg("Reset complete.")}} className="w-full mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition">Reset Experiment</button>
          </div>
        </div>
      </main>
    </div>
  );
}
