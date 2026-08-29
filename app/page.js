"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  Plus, Minus, Award, RefreshCw, LayoutDashboard, Activity, 
  CheckCircle, Lightbulb, Download, Zap, TrendingUp,
  Target, BookOpen, ChevronRight, Hash, ArrowDownCircle, AlertCircle
} from 'lucide-react';

export default function DInvictaValidated() {
  const [user, setUser] = useState({ name: '', role: '', isLoggedIn: false });
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('student_portal'); 
  const [activeGrade, setActiveGrade] = useState('Grade 7');
  const [activeTopic, setActiveTopic] = useState('Equations');
  const [topicTab, setTopicTab] = useState('learn'); 
  const [exampleIndex, setExampleIndex] = useState(0);

  // Mastery States
  const [assessInput, setAssessInput] = useState('');
  const [assessFeedback, setAssessFeedback] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLive, setIsLive] = useState(false);
  
  // Simulation States
  const [g2, setG2] = useState({ hundreds: 0, tens: 0, ones: 0, target: 245 });
  const [g7, setG7] = useState({ x: 3, units: 15, target: 30, balance: 0 });

  const curriculum = {
    "Grade 2": ["Place Value", "Addition to 100"],
    "Grade 7": ["Equations", "Ratios & Proportions"]
  };

  const g7Examples = [
    { eq: "3x + 15 = 30", steps: [
      { math: "3x + 15 = 30", reason: "Current State", desc: "Start with the original equation." },
      { math: "3x = 30 - 15", reason: "Inverse Add", desc: "Move 15 to the other side (subtract)." },
      { math: "3x = 15", reason: "Simplify", desc: "Calculate the right side result." },
      { math: "x = 15 / 3", reason: "Inverse Mult", desc: "Divide by 3 to isolate the x variable." },
      { math: "x = 5", reason: "Solution", desc: "The value that makes the equation true." }
    ]},
    { eq: "4x - 8 = 12", steps: [
      { math: "4x - 8 = 12", reason: "Current State", desc: "Subtraction present in the equation." },
      { math: "4x = 12 + 8", reason: "Inverse Sub", desc: "Undo subtraction by adding 8 to both sides." },
      { math: "4x = 20", reason: "Simplify", desc: "Combine the constants." },
      { math: "x = 20 / 4", reason: "Inverse Mult", desc: "Isolate x by dividing by the coefficient 4." },
      { math: "x = 5", reason: "Solution", desc: "x equals 5." }
    ]}
  ];

  // --- VALIDATION ENGINE ---
  const verifyAssessment = () => {
    const cleanInput = assessInput.trim();
    let isCorrect = false;

    if (activeGrade === 'Grade 7') {
      if (cleanInput === '5') isCorrect = true;
    } else {
      if (cleanInput === '302') isCorrect = true;
    }

    if (isCorrect) {
      setAssessFeedback(null);
      handleMastery("Assessment Verified");
    } else {
      setAssessFeedback("Incorrect. Review the vertical steps in the 'Learn' tab and try again!");
    }
  };

  // --- ENGINE LOGIC ---
  useEffect(() => {
    if (!user.isLoggedIn || isComplete) return;
    if (activeGrade === 'Grade 2' && g2.hundreds === 2 && g2.tens === 4 && g2.ones === 5) handleMastery("Lab Mastered");
    const leftWeight = (g7.x * 5) + g7.units;
    const tilt = g7.target - leftWeight;
    setG7(prev => ({ ...prev, balance: tilt }));
    if (activeGrade === 'Grade 7' && g7.x === 1 && g7.units === 0 && g7.target === 5) handleMastery("Lab Mastered");
  }, [g2, g7]);

  async function handleMastery(diag) {
    setIsComplete(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    await supabase.from('student_submissions').insert([{ 
      student_name: user.name, score: 100, topic: `${activeGrade} - ${activeTopic}`,
      misconception_detected: diag, time_spent_seconds: timeTaken
    }]);
  }

  const handleLogin = (role) => {
    if (!tempName.trim()) return alert("Enter name");
    setUser({ name: tempName, role: role, isLoggedIn: true });
    setViewMode(role === 'student' ? 'student_portal' : 'teacher_dash');
    setStartTime(Date.now());
  };

  const resetLab = () => {
    setIsComplete(false); setStartTime(Date.now()); setTopicTab('learn'); setAssessInput(''); setAssessFeedback(null);
    setG2({ hundreds: 0, tens: 0, ones: 0, target: 245 });
    setG7({ x: 3, units: 15, target: 30, balance: 0 });
  };

  if (!user.isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[3.5rem] p-12 shadow-2xl text-center border-t-[12px] border-blue-600 animate-in zoom-in">
          <h1 className="text-4xl font-black italic text-slate-900 mb-2 uppercase tracking-tighter">D-INVICTA</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Mathematics Intelligence</p>
          <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 mb-6 font-black outline-none focus:border-blue-500 transition-all" onChange={(e)=>setTempName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('student')} className="bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition">Student</button>
            <button onClick={() => handleLogin('teacher')} className="bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-lg transition">Teacher</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-white flex flex-col p-8 shadow-2xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">D</div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">INVICTA</h1>
        </div>
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest text-white opacity-40">Grade Level</p>
            <div className="grid grid-cols-2 gap-2">
              {["Grade 2", "Grade 7"].map(g => (
                <button key={g} onClick={()=>{setActiveGrade(g); setActiveTopic(curriculum[g][0]); resetLab();}} className={`px-2 py-3 rounded-xl text-[10px] font-black transition-all ${activeGrade === g ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest text-white opacity-40">Topics</p>
            {curriculum[activeGrade].map(topic => (
              <button key={topic} onClick={()=>{setActiveTopic(topic); resetLab();}} className={`w-full text-left p-4 rounded-2xl text-xs font-black mb-2 transition-all ${activeTopic === topic ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500 shadow-inner' : 'text-slate-500'}`}>{topic}</button>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <button onClick={()=>setViewMode('student_portal')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'student_portal' ? 'bg-blue-600 shadow-lg' : 'text-slate-500'}`}><Activity size={18}/> Home Portal</button>
          <button onClick={()=>setViewMode('teacher_dash')} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase ${viewMode === 'teacher_dash' ? 'bg-purple-600 shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={18}/> Analytics</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-12 overflow-y-auto relative bg-[#f8fafc]">
        
        {isComplete && viewMode === 'student_portal' && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-[4rem] p-12 text-center shadow-2xl max-w-lg w-full border-b-[12px] border-emerald-500 animate-in zoom-in">
               <Award className="text-yellow-500 w-24 h-24 mx-auto mb-6 animate-bounce" />
               <h3 className="text-5xl font-black text-slate-800 mb-2 tracking-tighter uppercase italic">Unconquerable!</h3>
               <p className="text-slate-500 font-bold mb-10 italic">Mathematics mastery confirmed. Data synced to intelligence hub.</p>
               <button onClick={resetLab} className="bg-blue-600 text-white w-full py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition flex items-center justify-center gap-3"><RefreshCw size={20}/> New Mission</button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-2">{activeGrade} • Standardized Roadmap</h2>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">{activeTopic}</h3>
          </div>
          {viewMode === 'student_portal' && (
            <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
                <button onClick={()=>setTopicTab('learn')} className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition ${topicTab === 'learn' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Learn</button>
                <button onClick={()=>setTopicTab('simulation')} className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition ${topicTab === 'simulation' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Lab</button>
                <button onClick={()=>setTopicTab('assess')} className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition ${topicTab === 'assess' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Assess</button>
            </div>
          )}
        </header>

        {viewMode === 'student_portal' && (
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* LEARN TAB: Polished Vertical Alignment */}
            {topicTab === 'learn' && (
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 animate-in fade-in duration-500">
                 <div className="flex items-center justify-between mb-10 border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Lightbulb size={24}/></div>
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Step-By-Step Reasoning</h4>
                    </div>
                    <button onClick={()=>setExampleIndex((exampleIndex + 1) % g7Examples.length)} className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-black text-blue-600 border uppercase tracking-widest hover:bg-white transition shadow-sm flex items-center gap-2">Next Example <RefreshCw size={12}/></button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                          {activeGrade === 'Grade 7' ? 
                          "To find the value of x, we must work backwards. We use inverse operations to peel away the layers until x is by itself." : 
                          "Numbers are built using places. 10 Ones make 1 Ten. 10 Tens make 1 Hundred."}
                        </p>
                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border-2 border-blue-100 relative overflow-hidden">
                           <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase">Rule</div>
                           <p className="text-sm font-bold text-blue-800 mb-2 underline decoration-blue-200">The Golden Property of Equality:</p>
                           <p className="text-sm text-blue-600 italic">"Whatever operation you perform on one side, you must perform on the other to maintain balance."</p>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-10 rounded-[3.5rem] shadow-2xl relative border-t-8 border-blue-500">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-10 text-center opacity-60">Vertical Execution Path</p>
                        <div className="space-y-6">
                           {(activeGrade === 'Grade 7' ? g7Examples[exampleIndex].steps : [{math: "200 + 40 + 5", reason: "Expanded Form", desc: "Break it down."}, {math: "245", reason: "Standard Form", desc: "Combine digits."}]).map((step, i) => (
                             <div key={i} className="flex gap-8 items-start animate-in slide-in-from-left duration-300">
                                <div className="text-slate-100 font-mono text-3xl font-black pt-1 min-w-[160px] text-right tracking-tighter drop-shadow-sm">{step.math}</div>
                                <div className="pt-2">
                                   <div className="bg-blue-900/50 border border-blue-700 px-3 py-1 rounded-lg inline-block text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">{step.reason}</div>
                                   <p className="text-[10px] text-slate-500 font-bold leading-tight">{step.desc}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                 </div>
                 <button onClick={()=>setTopicTab('simulation')} className="mt-12 bg-blue-600 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 mx-auto shadow-2xl hover:bg-slate-900 transition active:scale-95">Open Lab Mission <ChevronRight/></button>
              </div>
            )}

            {/* LAB TAB: MAINTAINED STATUS QUO */}
            {topicTab === 'simulation' && (
               <div className="bg-white p-12 rounded-[4rem] shadow-xl border-2 border-slate-100 text-center animate-in zoom-in-95">
                 {activeGrade === 'Grade 2' ? (
                   <div className="space-y-12">
                      <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl"><h3 className="text-3xl font-black italic">Build: 245</h3></div>
                      <div className="flex justify-center items-end gap-6 h-56 bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed">
                        <div className="flex flex-wrap-reverse w-44 gap-1 content-start">{[...Array(g2.hundreds)].map((_, i) => <div key={i} className="w-12 h-12 bg-red-500 rounded-lg shadow-md border-2 border-red-700 flex items-center justify-center text-[10px] text-white font-black animate-bounce">100</div>)}</div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.tens)].map((_, i) => <div key={i} className="w-4 h-12 bg-blue-500 rounded-md border-2 border-blue-700 flex items-center justify-center text-[8px] text-white font-black">10</div>)}</div>
                        <div className="flex flex-wrap-reverse w-24 gap-1 content-start">{[...Array(g2.ones)].map((_, i) => <div key={i} className="w-4 h-4 bg-emerald-500 rounded-sm border-2 border-emerald-700 flex items-center justify-center">1</div>)}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <BlockUI label="Hundreds" val={g2.hundreds} color="bg-red-600" onP={()=>setG2({...g2, hundreds: g2.hundreds+1})} onM={()=>setG2({...g2, hundreds: Math.max(0, g2.hundreds-1)})}/>
                        <BlockUI label="Tens" val={g2.tens} color="bg-blue-600" onP={()=>setG2({...g2, tens: g2.tens+1})} onM={()=>setG2({...g2, tens: Math.max(0, g2.tens-1)})}/>
                        <BlockUI label="Ones" val={g2.ones} color="bg-emerald-600" onP={()=>setG2({...g2, ones: g2.ones+1})} onM={()=>setG2({...g2, ones: Math.max(0, g2.ones-1)})}/>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-16">
                      <div className="bg-slate-900 text-white py-4 px-10 rounded-2xl inline-block font-mono text-3xl font-black tracking-[0.2em] italic text-blue-400 shadow-2xl">3x + 15 = 30</div>
                      <div className="h-64 flex flex-col items-center justify-center relative">
                        <div className="w-full h-3 bg-slate-800 rounded-full transition-all duration-1000 shadow-xl" style={{ transform: `rotate(${g7.balance}deg)` }}>
                          <div className="absolute -left-16 -top-28 w-52 flex flex-col items-center">
                             <div className="flex gap-1 mb-4 h-12 items-end">{[...Array(g7.x)].map((_, i) => <div key={i} className="w-12 h-12 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-400 text-white font-black flex items-center justify-center animate-bounce text-xl">X</div>)}</div>
                             <div className="bg-blue-50 px-6 py-2 rounded-2xl border-2 border-blue-100 text-blue-600 font-black text-xs uppercase shadow-sm">+{g7.units} Units</div>
                          </div>
                          <div className="absolute -right-16 -top-28 w-52 text-center">
                             <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] shadow-2xl border-4 border-white text-white font-black flex items-center justify-center mx-auto mb-4 text-4xl animate-pulse">{g7.target}</div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Target State</p>
                          </div>
                        </div>
                        <div className="w-0 h-0 border-l-[50px] border-r-[40px] border-b-[90px] border-b-slate-800 mt-[-4px]"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <button onClick={()=>setG7({...g7, units:0, target:15})} className="p-7 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition">Subtract 15 (Both)</button>
                        <button onClick={()=>{if(g7.units===0)setG7({...g7, x:1, target:5})}} className="p-7 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition">Divide by 3 (Both)</button>
                      </div>
                   </div>
                 )}
               </div>
            )}

            {/* ASSESS TAB: REAL VALIDATION LOGIC */}
            {topicTab === 'assess' && (
              <div className="bg-white p-16 rounded-[4rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
                 <h4 className="text-4xl font-black text-slate-800 mb-10 flex items-center gap-4 tracking-tighter">✏️ Mastery Certification</h4>
                 <div className="p-12 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Mastery Check #1</p>
                    <p className="text-3xl font-bold text-slate-800 leading-tight mb-10">
                        {activeGrade === 'Grade 7' ? 
                        "Final Challenge: To isolate x in the equation 5x + 10 = 35, what is the value of x?" : 
                        "Final Challenge: You have 3 Hundreds, 0 Tens, and 2 Ones. What number did you build?"}
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <input 
                              type="text" 
                              value={assessInput}
                              onChange={(e)=>setAssessInput(e.target.value)}
                              placeholder="Enter Numeric Value" 
                              className="flex-1 bg-white border-4 border-slate-100 p-8 rounded-3xl text-4xl font-black outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-200" 
                            />
                            <button onClick={verifyAssessment} className="bg-emerald-600 text-white px-12 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95">Verify Answer</button>
                        </div>
                        {assessFeedback && (
                          <div className="flex items-center gap-3 p-5 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold animate-in shake-in duration-300">
                             <AlertCircle size={20}/>
                             <p>{assessFeedback}</p>
                          </div>
                        )}
                    </div>
                 </div>
              </div>
            )}

          </div>
        )}

        {/* TEACHER DASHBOARD */}
        {viewMode === 'teacher_dash' && (
          <div className="max-w-7xl mx-auto space-y-10">
             <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border shadow-sm border-b-[8px] border-blue-500"><p className="text-[10px] font-black text-slate-400 mb-2 uppercase">Avg Mastery</p><p className="text-6xl font-black text-slate-900">92%</p></div>
                <button onClick={()=>setIsLive(!isLive)} className={`${isLive ? 'bg-emerald-600' : 'bg-slate-400'} p-10 rounded-[3rem] text-white shadow-2xl text-left transition-all`}>
                   <p className="text-[10px] font-black uppercase opacity-70">Live Feed</p><p className="text-3xl font-black mt-2 uppercase">{isLive ? 'SYNCED' : 'OFF'}</p>
                </button>
                <button className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl text-left hover:bg-black transition-all" onClick={downloadExcel}><Download className="mb-4 text-blue-400" size={32}/><p className="text-2xl font-black uppercase underline decoration-blue-500/20">Get Excel Report</p></button>
             </div>
             <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden animate-in fade-in duration-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b tracking-[0.2em]">
                    <tr><th className="p-10">Student Identity</th><th className="p-10">Topic Path</th><th className="p-10 text-center">Score</th><th className="p-10">Diagnosis</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((s, i) => (
                      <tr key={i} className="hover:bg-blue-50/20 group">
                        <td className="p-10 font-black text-slate-800 text-lg">{s.student_name}</td>
                        <td className="p-10 text-slate-400 font-bold text-sm tracking-tight">{s.topic}</td>
                        <td className="p-10 text-center"><span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-lg">100%</span></td>
                        <td className={`p-10 font-bold italic text-sm ${s.misconception_detected.includes('Elite') ? 'text-blue-500' : 'text-red-500 underline decoration-red-200'}`}>{s.misconception_detected}</td>
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

const BlockUI = ({ label, val, color, onP, onM }) => (
  <div className="bg-white border-4 border-slate-50 p-8 rounded-[3rem] shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{label}</p>
    <div className="flex items-center justify-between gap-4">
       <button onClick={onM} className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><Minus/></button>
       <span className="text-5xl font-black text-slate-800 tracking-tighter">{val}</span>
       <button onClick={onP} className={`${color} w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all`}><Plus/></button>
    </div>
  </div>
);
