"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Minus, Award, RefreshCw, LayoutDashboard, Activity, CheckCircle, Lightbulb } from 'lucide-react';

export default function DInvictaUserExperience() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [activeGrade, setActiveGrade] = useState('Grade 2');
  const [activeTopic, setActiveTopic] = useState('Place Value');

  // Mastery & Feedback
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  // Grade 2 State
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  // Grade 7 State
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });

  const [submissions, setSubmissions] = useState([]);

  // --- LOGIC: AUTO-DETECT SUCCESS ---
  useEffect(() => {
    if (!user.isLoggedIn || isComplete) return;

    // Grade 2 Logic
    if (activeGrade === 'Grade 2' && g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) {
      handleSuccess("Mastery: Place Value Fluency");
    }

    // Grade 7 Logic
    const leftWeight = (g7.x * 5) + g7.units;
    const tilt = g7.target - leftWeight;
    setG7(prev => ({ ...prev, balance: tilt }));
    if (activeGrade === 'Grade 7' && g7.x === 1 && g7.units === 0 && g7.target === 5) {
      handleSuccess("Mastery: Algebraic Isolate");
    }
  }, [g2, g7, activeGrade]);

  async function handleSuccess(diagnosis) {
    setIsComplete(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: 100, 
      topic: `${activeGrade} - ${activeTopic}`,
      misconception_detected: timeTaken < 15 ? "High Fluency" : "Secure",
      time_spent_seconds: timeTaken
    }]);
  }

  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Please enter your name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setStartTime(Date.now());
  };

  const resetLab = () => {
    setIsComplete(false);
    setStartTime(Date.now());
    setG2({ hundreds: 0, tens: 0, ones: 0, target: 245 });
    setG7({ x: 3, units: 15, target: 30, balance: 0 });
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center border-t-8 border-blue-600">
          <h1 className="text-4xl font-black italic text-slate-900 mb-2">D-INVICTA</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Math Learning System</p>
          <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-bold outline-none" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8">
        <h1 className="text-2xl font-black italic text-blue-400 mb-10 tracking-tighter uppercase">D-INVICTA</h1>
        <div className="flex-1 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Select Grade</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>{setActiveGrade('Grade 2'); setActiveTopic('Place Value'); resetLab();}} className={`px-2 py-3 rounded-xl text-[10px] font-black ${activeGrade === 'Grade 2' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>Grade 2</button>
              <button onClick={()=>{setActiveGrade('Grade 7'); setActiveTopic('Equations'); resetLab();}} className={`px-2 py-3 rounded-xl text-[10px] font-black ${activeGrade === 'Grade 7' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>Grade 7</button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student' ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 text-slate-500'}`}><Activity size={16}/> Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher' ? 'bg-purple-600 shadow-lg' : 'bg-slate-800 text-slate-500'}`}><LayoutDashboard size={16}/> Dashboard</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-12 relative overflow-y-auto">
        
        {/* SUCCESS OVERLAY */}
        {isComplete && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[4rem] p-12 text-center shadow-2xl max-w-lg w-full border-b-8 border-emerald-500">
               <Award className="text-yellow-500 w-20 h-20 mx-auto mb-6 animate-bounce" />
               <h3 className="text-4xl font-black text-slate-800 mb-2">Mastery Unlocked!</h3>
               <p className="text-slate-500 font-bold mb-8 italic">"Great work, {user.name}! You've demonstrated perfect conceptual understanding."</p>
               <button onClick={resetLab} className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-slate-900 transition">
                 <RefreshCw size={20}/> Try New Mission
               </button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{activeGrade === 'Grade 2' ? 'Place Value Lab' : 'Equation Balance Lab'}</h2>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Status: Active Learning Session</p>
          </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-5xl mx-auto">
            {activeGrade === 'Grade 2' ? (
              /* --- GRADE 2 INTERFACE --- */
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl flex items-center justify-between">
                   <div>
                     <p className="text-xs font-black uppercase opacity-70 tracking-[0.2em] mb-1">Current Command</p>
                     <h3 className="text-3xl font-black italic">Build the number: 245</h3>
                   </div>
                   <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
                      <Lightbulb size={24}/>
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border-2 shadow-sm relative overflow-hidden">
                   <div className="flex justify-center items-end gap-6 h-56 mb-12 bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed border-slate-200">
                        {/* THE VISUAL BLOCKS */}
                        <div className="flex flex-wrap-reverse w-44 gap-1 content-start border-r-2 border-slate-100 pr-4">
                           {[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-12 h-12 bg-red-500 rounded-lg shadow-md border-2 border-red-700 flex items-center justify-center text-[10px] text-white font-black">100</div>)}
                        </div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start border-r-2 border-slate-100 pr-4">
                           {[...Array(g2.tens)].map((_, i) => <div key={i} className="w-4 h-12 bg-blue-500 rounded-md border-2 border-blue-700 flex items-center justify-center text-[8px] text-white font-black">10</div>)}
                        </div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start">
                           {[...Array(g2.ones)].map((_, i) => <div key={i} className="w-4 h-4 bg-emerald-500 rounded-sm border-2 border-emerald-700 flex items-center justify-center text-[6px] text-white font-black">1</div>)}
                        </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <BlockBtn label="Hundreds" val={g2.hundreds} color="bg-red-600" onPlus={()=>setG2({...g2, hundreds: g2.hundreds+1})} onMinus={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})} />
                      <BlockBtn label="Tens" val={g2.tens} color="bg-blue-600" onPlus={()=>setG2({...g2, tens: g2.tens+1})} onMinus={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})} />
                      <BlockBtn label="Ones" val={g2.ones} color="bg-emerald-600" onPlus={()=>setG2({...g2, ones: g2.ones+1})} onMinus={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})} />
                   </div>
                </div>
              </div>
            ) : (
              /* --- GRADE 7 INTERFACE --- */
              <div className="bg-white p-12 rounded-[4rem] border-2 shadow-2xl animate-in zoom-in duration-500 text-center">
                <div className="bg-slate-900 text-white py-3 px-6 rounded-2xl inline-block mb-12 font-mono text-2xl font-bold tracking-[0.3em]">3x + 15 = 30</div>
                <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                  <div className="w-full h-2 bg-slate-800 rounded-full transition-all duration-1000 shadow-xl" style={{ transform: `rotate(${g7.balance}deg)` }}>
                    <div className="absolute -left-12 -top-24 w-44">
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(g7.x)].map((_, i) => <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>)}
                      </div>
                      <div className="bg-blue-50 py-2 rounded-xl text-blue-600 font-black text-xs uppercase">+{g7.units} Units</div>
                    </div>
                    <div className="absolute -right-12 -top-24 w-44">
                      <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse">{g7.target}</div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={()=>{setG7({...g7, units:0, target:15})}} className="p-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">Subtract 15 (Both)</button>
                  <button onClick={()=>{if(g7.units===0){setG7({...g7, x:1, target:5})}}} className="p-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">Divide by 3 (Both)</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-300 font-black italic">Dashboard Logic Connected. Run simulation to see live data.</div>
        )}
      </main>
    </div>
  );
}

const BlockBtn = ({ label, val, color, onPlus, onMinus }) => (
  <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-sm text-center hover:border-blue-200 transition-all">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onMinus} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Minus/></button>
       <span className="text-4xl font-black text-slate-800">{val}</span>
       <button onClick={onPlus} className={`${color} w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}><Plus/></button>
    </div>
  </div>
);
