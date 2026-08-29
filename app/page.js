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
