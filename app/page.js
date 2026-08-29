"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Minus, CheckCircle, Award, Zap, RefreshCw, LayoutDashboard, Activity, BookOpen } from 'lucide-react';

export default function DInvictaAppraisal() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('simulation');
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');

  // Mastery & Feedback States
  const [isComplete, setIsComplete] = useState(false);
  const [appraisal, setAppraisal] = useState({ msg: '', sub: '', icon: null });
  const [startTime, setStartTime] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  
  // Simulation States
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  const [submissions, setSubmissions] = useState([]);

  // --- THE APPRAISAL ENGINE ---
  const triggerMastery = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let diagnosis = "";
    let appraisalTitle = "";

    if (errorLog.length > 0) {
      diagnosis = `Procedural Error: ${errorLog[0]}`;
      appraisalTitle = "Mastery Achieved!";
    } else if (timeTaken < 10) {
      diagnosis = "Mastery (High Fluency)";
      appraisalTitle = "Elite Performance!";
    } else {
      diagnosis = "Mastery (Secure)";
      appraisalTitle = "Topic Mastered!";
    }

    setAppraisal({
      msg: appraisalTitle,
      sub: `Time: ${timeTaken}s • Diagnosis: ${diagnosis}`,
      icon: <Award className="text-yellow-500 w-12 h-12" />
    });
    
    setIsComplete(true);

    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, 
      score: 100, 
      topic: `${activeGrade} - ${activeTopic}`,
      misconception_detected: diagnosis,
      time_spent_seconds: timeTaken
    }]);
  };

  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Enter name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role);
    setStartTime(Date.now());
  };

  // G7 Check
  useEffect(() => {
    const tilt = g7.target - ((g7.x * 5) + g7.units);
    setG7(prev => ({ ...prev, balance: tilt }));
    if (!isComplete && g7.x === 1 && g7.units === 0 && g7.target === 5) { triggerMastery(); }
  }, [g7.x, g7.units, g7.target]);

  // G2 Check
  useEffect(() => {
    if (!isComplete && g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) { triggerMastery(); }
  }, [g2]);

  const resetLab = () => {
    setIsComplete(false);
    setStartTime(Date.now());
    setErrorLog([]);
    setG7({ x: 3, units: 15, target: 30, balance: 0 });
    setG2({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-12 shadow-2xl text-center border-t-8 border-blue-600 animate-in zoom-in duration-500">
          <h1 className="text-4xl font-black italic text-slate-900 mb-2">D-INVICTA</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Vertical Intelligence Hub</p>
          <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-bold" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Teacher</button>
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
            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Grades</p>
            <div className="grid grid-cols-2 gap-2">
              {["Grade 2", "Grade 7"].map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); resetLab();}} className={`px-2 py-3 rounded-xl text-[10px] font-black ${activeGrade === g ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={() => setViewMode('student')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}><Activity size={16}/> Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher' ? 'bg-purple-600' : 'bg-slate-800 text-slate-500'}`}><LayoutDashboard size={16}/> Teacher View</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 relative overflow-y-auto">
        
        {/* APPRAISAL OVERLAY */}
        {isComplete && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-12 animate-in fade-in duration-300">
            <div className="bg-white border-4 border-emerald-500 rounded-[4rem] p-12 text-center shadow-2xl max-w-lg w-full">
               <div className="flex justify-center mb-6">{appraisal.icon}</div>
               <h3 className="text-4xl font-black text-slate-800 mb-4">{appraisal.msg}</h3>
               <p className="bg-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-500 mb-8">{appraisal.sub}</p>
               <button onClick={resetLab} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-slate-900 transition">
                 <RefreshCw size={18}/> Practice Again
               </button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{activeTopic}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Goal: 2 Hundreds, 4 Tens, 5 Ones</p>
          </div>
        </header>

        {viewMode === 'student' ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-12 rounded-[4rem] border-2 shadow-2xl">
              
              {activeGrade === 'Grade 7' ? (
                /* EQUATIONS */
                <div className="animate-in zoom-in duration-500">
                  <div className="h-64 flex flex-col items-center justify-center mb-16 relative">
                    <div className="w-full h-2 bg-slate-800 rounded-full transition-all duration-700 shadow-xl" style={{ transform: `rotate(${g7.balance}deg)` }}>
                      <div className="absolute -left-12 -top-24 w-44 text-center">
                        <div className="flex justify-center gap-1 mb-4 h-10 items-end">
                          {[...Array(g7.x)].map((_, i) => <div key={i} className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce">X</div>)}
                        </div>
                        <div className="bg-blue-50 py-2 px-4 rounded-xl text-blue-600 font-black text-xs uppercase tracking-widest">+{g7.units} Units</div>
                      </div>
                      <div className="absolute -right-12 -top-24 w-44 text-center">
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl border-4 border-white text-white font-black flex items-center justify-center text-2xl animate-pulse">{g7.target}</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Target Units</p>
                      </div>
                    </div>
                    <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[80px] border-b-slate-800 mt-[-4px]"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <button onClick={()=>{setG7({...g7, units:0, target:15})}} className="p-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs">Subtract 15 (Both)</button>
                     <button onClick={()=>{if(g7.units===0){setG7({...g7, x:1, target:5})}}} className="p-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs">Divide by 3 (Both)</button>
                  </div>
                </div>
              ) : (
                /* PLACE VALUE */
                <div className="animate-in fade-in duration-500">
                  <div className="flex justify-center items-end gap-8 h-48 mb-12 bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200">
                      <div className="flex flex-wrap-reverse w-32 gap-1 content-start">
                         {[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-10 h-10 bg-red-500 rounded border-2 border-red-700 shadow-sm animate-bounce"></div>)}
                      </div>
                      <div className="flex flex-wrap-reverse w-20 gap-1 content-start">
                         {[...Array(g2.tens)].map((_, i) => <div key={i} className="w-3 h-10 bg-blue-500 rounded border border-blue-700"></div>)}
                      </div>
                      <div className="flex flex-wrap-reverse w-20 gap-1 content-start">
                         {[...Array(g2.ones)].map((_, i) => <div key={i} className="w-3 h-3 bg-emerald-500 rounded border border-emerald-700"></div>)}
                      </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                      <BlockControl label="Hundreds" val={g2.hundreds} onAdd={()=>setG2({...g2, hundreds: g2.hundreds+1})} onSub={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})} color="bg-red-600" />
                      <BlockControl label="Tens" val={g2.tens} onAdd={()=>setG2({...g2, tens: g2.tens+1})} onSub={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})} color="bg-blue-600" />
                      <BlockControl label="Ones" val={g2.ones} onAdd={()=>setG2({...g2, ones: g2.ones+1})} onSub={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})} color="bg-emerald-600" />
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-300 font-black italic">Switching to Teacher Dashboard...</div>
        )}
      </main>
    </div>
  );
}

const BlockControl = ({ label, val, onAdd, onSub, color }) => (
  <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onSub} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition"><Minus size={18}/></button>
       <span className="text-4xl font-black text-slate-800">{val}</span>
       <button onClick={onAdd} className={`${color} w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg hover:scale-110 transition`}><Plus size={18}/></button>
    </div>
  </div>
);
