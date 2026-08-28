"use client";
import React, { useState } from 'react';
import { BookOpen, Activity, Edit3, Home, CheckCircle, AlertCircle, Award, Users, Zap, FileText, PieChart, ChevronRight } from 'lucide-react';

export default function DInvictaUnified() {
  const [viewMode, setViewMode] = useState('student');
  const [activeTab, setActiveTab] = useState('learn');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold text-blue-400 mb-8 italic">D-INVICTA</h1>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setViewMode('student')} className={`w-full text-left p-3 rounded ${viewMode === 'student' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>Student Portal</button>
          <button onClick={() => setViewMode('teacher')} className={`w-full text-left p-3 rounded ${viewMode === 'teacher' ? 'bg-purple-600' : 'hover:bg-slate-800'}`}>Teacher Dashboard</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Topic: Two-Step Equations</h2>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest">7.EE.B.4</div>
        </header>

        {viewMode === 'student' ? (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">Classwork Challenge</h3>
                <p className="text-3xl font-bold mb-8">Solve for x: 3x + 15 = 30</p>
                <div className="flex gap-4">
                  <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="x = ?" className="flex-1 border-2 p-4 rounded-xl text-xl outline-none focus:border-blue-500" />
                  <button onClick={() => setFeedback({status: answer === "5" ? "success" : "error", msg: answer === "5" ? "Correct! Mastery +1" : "Try again. Did you subtract 15?"})} className="bg-slate-900 text-white px-8 rounded-xl font-bold">Submit</button>
                </div>
                {feedback && (
                  <div className={`mt-6 p-4 rounded-xl flex gap-3 ${feedback.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {feedback.status === 'success' ? <CheckCircle /> : <AlertCircle />}
                    <p className="font-bold">{feedback.msg}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 overflow-y-auto">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border shadow-sm text-center"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Class Average</p><p className="text-3xl font-black text-slate-800">82%</p></div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm text-center"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Alerts</p><p className="text-3xl font-black text-red-500">3</p></div>
              <div className="bg-slate-900 p-6 rounded-2xl text-center text-white"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Reports</p><p className="text-sm font-bold">Generate Excel</p></div>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               <div className="p-4 bg-slate-50 border-b font-bold text-slate-700">Triage: Students Requiring Intervention</div>
               <div className="p-4 text-sm text-slate-500 italic text-center">Data will appear here after student submissions.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
