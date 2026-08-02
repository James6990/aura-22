


'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, Flame, Trophy, Utensils, BookOpen, User, Plus, 
  CheckCircle2, TrendingUp, Zap, Search, Award, Sparkles, 
  ShieldCheck, Timer, Bluetooth, MessageSquare, Camera, Send, 
  LogOut, LogIn, Globe, Lock, Crown, CreditCard, Smartphone, 
  ExternalLink, Trash2, Check, Calendar, ListOrdered, Activity, ArrowRight,
  Mic, MicOff, Eye, History, Play, Pause, RotateCcw, X
} from 'lucide-react';

function ApexLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L90 85H10L50 5Z" fill="url(#apexGrad)" stroke="#06b6d4" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M50 30L70 70H30L50 30Z" fill="#020617"/>
      <circle cx="50" cy="55" r="8" fill="#06b6d4" />
      <defs>
        <linearGradient id="apexGrad" x1="10" y1="5" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'history' | 'profile'>('home');
  
  // Persistent State with LocalStorage
  const [aura, setAura] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_aura');
      return saved ? Number(saved) : 320;
    }
    return 320;
  });

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_streak');
      return saved ? Number(saved) : 4;
    }
    return 4;
  });

  const [toast, setToast] = useState<string | null>(null);

  // Accessibility State
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderVoice, setScreenReaderVoice] = useState(true);

  // Profile & Biometrics
  const [selectedAvatar, setSelectedAvatar] = useState('🦁 Lion Apex');
  const [biometrics, setBiometrics] = useState({
    sex: 'Male',
    age: '24',
    weight: '82',
    height: '180',
    goal: 'Hypertrophy & Lean Muscle'
  });

  // Workout History Log
  const [workoutHistory, setWorkoutHistory] = useState<Array<{ id: number; date: string; title: string; summary: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_history');
      return saved ? JSON.parse(saved) : [
        { id: 1, date: '2026-08-01', title: 'Push Day A', summary: 'Bench Press, Overhead Press, Triceps' }
      ];
    }
    return [];
  });

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const getApexTitle = (auraScore: number) => {
    if (auraScore >= 1000) return '👑 Apex Titan (Legendary)';
    if (auraScore >= 600) return '⚡ Alpha Predator';
    if (auraScore >= 300) return '🔥 Rising Challenger';
    return '🌱 Novice Athlete';
  };

  const [customRoutines, setCustomRoutines] = useState([
    { id: 1, name: 'Morning Hypertrophy Focus', items: ['500ml Electrolytes', '15 Min Dynamic Warmup', 'High-Protein Breakfast'] }
  ]);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState([
    { sender: 'ai', text: 'Hello athlete. I am your persistent Apex AI Coach. Ask me for a routine or meal plan!', hasAction: false }
  ]);

  const [exercises, setExercises] = useState([
    { 
      id: 1, name: 'Barbell Bench Press', 
      sets: [
        { setNumber: 1, weight: '60kg', reps: '10', completed: false },
        { setNumber: 2, weight: '65kg', reps: '8', completed: false }
      ] 
    }
  ]);
  const [isListening, setIsListening] = useState(false);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('apex_aura', aura.toString());
    localStorage.setItem('apex_streak', streak.toString());
    localStorage.setItem('apex_history', JSON.stringify(workoutHistory));
  }, [aura, streak, workoutHistory]);

  // Rest Timer Interval Logic with Audio Beep
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds(prev => prev - 1), 1000);
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playBeep();
      showToast("Rest time complete! Get back under the bar.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSeconds]);

  const playBeep = () => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context fallback if restricted
    }
  };

  const speakText = (text: string) => {
    if (!screenReaderVoice || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    speakText(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSetCompletion = (exerciseId: number, setIndex: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = [...ex.sets];
        updatedSets[setIndex].completed = !updatedSets[setIndex].completed;
        return { ...ex, sets: updatedSets };
      }
      return ex;
    }));
    setAura(prev => prev + 25);
    setRestSeconds(90);
    setIsTimerRunning(true);
    showToast("Set complete. Rest timer started for 90 seconds.");
  };

  const logCompletedWorkout = () => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: `Workout Session #${workoutHistory.length + 1}`,
      summary: exercises.map(ex => ex.name).join(', ')
    };
    setWorkoutHistory([newSession, ...workoutHistory]);
    setAura(prev => prev + 100);
    showToast("Workout session saved to history! Plus 100 Aura");
  };

  const startVoiceLogger = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast("Voice recognition not supported in this browser.");
      return;
    }
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    // @ts-ignore
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setIsListening(false);
      setExercises(prev => [{ id: Date.now(), name: speech, sets: [{ setNumber: 1, weight: 'Logged', reps: 'Logged', completed: true }] }, ...prev]);
      setAura(prev => prev + 50);
      showToast(`Voice logged: "${speech}"`);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const userMsg = aiQuery;
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg, hasAction: false }]);
    setAiQuery('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, biometrics })
      });
      const data = await res.json();
      setAiChat(prev => [...prev, { sender: 'ai', text: data.reply || "Generated protocol tailored for your goals.", hasAction: true }]);
      speakText("AI protocol generated.");
    } catch (err) {
      setAiChat(prev => [...prev, { sender: 'ai', text: "Here is your customized macro & training split: Focus on progressive overload with 4 core compound movements weekly.", hasAction: true }]);
      speakText("AI protocol generated offline fallback.");
    }
  };

  const handleApplyAiPlan = () => {
    setCustomRoutines(prev => [{ id: Date.now(), name: `AI ${biometrics.goal} Protocol`, items: [`Weight: ${biometrics.weight}kg`, 'Optimized Hypertrophy Routine'] }, ...prev]);
    setAura(prev => prev + 150);
    setIsAiOpen(false);
    showToast("AI Plan saved to routines!");
  };

  return (
    <div className={`min-h-screen flex flex-col pb-32 select-none transition-colors duration-200 ${highContrast ? 'bg-black text-white font-sans text-lg' : 'bg-slate-950 text-slate-100'}`}>
      
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-cyan-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center justify-between animate-bounce">
          <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> {toast}</span>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between shadow-lg ${highContrast ? 'bg-black border-white' : 'bg-slate-900/90 border-slate-800/80'}`}>
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-slate-950 border border-cyan-500/40 p-1.5 rounded-xl shadow-lg flex items-center justify-center">
            <ApexLogo className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-sm tracking-widest bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">APEX</span>
            <span className="font-extrabold text-xs text-slate-300 ml-1">STATE</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700/60 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-orange-400 mr-1.5 fill-orange-400" />
            <span className="text-slate-200">{streak}d</span>
          </div>
          <div className="flex items-center bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40 text-xs font-bold text-cyan-400">
            <Trophy className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>{aura}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            <div className={`border p-5 rounded-2xl shadow-xl space-y-3 ${highContrast ? 'bg-zinc-900 border-white' : 'bg-gradient-to-br from-slate-900 to-cyan-950/30 border-cyan-500/30'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{getApexTitle(aura)}</p>
                  <h1 className="text-xl font-black mt-0.5">Welcome Back, Athlete</h1>
                </div>
                <div className="bg-slate-950 border border-cyan-500/40 p-2 rounded-xl shadow-md">
                  <ApexLogo className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* QUICK VOICE LOG */}
            <div className={`border p-4 rounded-2xl flex items-center justify-between shadow-xl ${highContrast ? 'bg-zinc-900 border-white' : 'bg-slate-900 border-slate-800'}`}>
              <div>
                <h4 className="font-bold text-xs text-cyan-300">Voice-to-Text Logger</h4>
                <p className="text-[10px] text-slate-400">Log sets hands-free while lifting</p>
              </div>
              <button onClick={startVoiceLogger} className={`p-3 rounded-xl font-bold flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-cyan-500 text-slate-950'}`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* ROUTINES */}
            <div className={`border p-5 rounded-2xl space-y-3 shadow-xl ${highContrast ? 'bg-zinc-900 border-white' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className="font-bold text-xs uppercase tracking-widest flex items-center text-cyan-400">
                <ListOrdered className="w-4 h-4 mr-1.5" /> Active Daily Protocols
              </h3>
              <div className="space-y-2.5">
                {customRoutines.map((routine) => (
                  <div key={routine.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs text-cyan-300">{routine.name}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {routine.items.map((item, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded-lg">• {item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setIsAiOpen(true)} className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-slate-100" />
                <div className="text-left">
                  <h3 className="font-bold text-sm text-slate-100">Consult AI Coach</h3>
                  <p className="text-[10px] text-cyan-200">Persistent intelligent training partner</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-100" />
            </button>
          </div>
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-black tracking-tight">Active Workout</h1>
              <button onClick={logCompletedWorkout} className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                Finish Workout
              </button>
            </div>

            {/* REST TIMER WIDGET */}
            {isTimerRunning && (
              <div className="bg-cyan-950/60 border border-cyan-500/50 p-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <Timer className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h4 className="font-bold text-xs text-cyan-300">Rest Timer Active</h4>
                    <p className="text-sm font-black text-slate-100">{restSeconds} seconds remaining</p>
                  </div>
                </div>
                <button onClick={() => setIsTimerRunning(false)} className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                  Skip
                </button>
              </div>
            )}

            <div className="space-y-4">
              {exercises.map((ex) => (
                <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center">
                    <Dumbbell className="w-4 h-4 mr-2" /> {ex.name}
                  </h3>
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className={`flex items-center justify-between p-2.5 rounded-xl border ${set.completed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800'}`}>
                        <span className="text-xs font-bold">Set #{set.setNumber} - {set.weight} x {set.reps}</span>
                        <button onClick={() => toggleSetCompletion(ex.id, setIdx)} className={`px-3 py-1 rounded-lg text-xs font-bold ${set.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                          {set.completed ? 'Done' : 'Complete'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKOUT HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Workout History & Logs</h1>
            <p className="text-xs text-slate-400">Review your past sessions securely stored on your device.</p>

            <div className="space-y-3">
              {workoutHistory.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs text-cyan-300">{item.title}</h3>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Athlete Profile & Settings</h1>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg">
                {selectedAvatar.split(' ')[0]}
              </div>
              <h3 className="font-bold text-sm text-cyan-300">{getApexTitle(aura)}</h3>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center">
                <Eye className="w-4 h-4 mr-2" /> Accessibility Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">High Contrast Mode</h4>
                  </div>
                  <button onClick={() => setHighContrast(!highContrast)} className={`w-12 h-6 rounded-full p-1 transition-colors ${highContrast ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transform transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">Audio Screen Reader</h4>
                  </div>
                  <button onClick={() => setScreenReaderVoice(!screenReaderVoice)} className={`w-12 h-6 rounded-full p-1 transition-colors ${screenReaderVoice ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transform transition-transform ${screenReaderVoice ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* AI Modal Drawer */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-cyan-500/40 rounded-t-3xl p-5 max-w-md w-full mx-auto max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm">Apex AI Coach</h3>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {aiChat.map((msg, index) => (
                <div key={index} className={`p-3 rounded-xl text-xs space-y-2 ${msg.sender === 'user' ? 'bg-cyan-950/60 border border-cyan-500/30 ml-8 text-cyan-100' : 'bg-slate-950 border border-slate-800 mr-8 text-slate-300'}`}>
                  <p>{msg.text}</p>
                  {msg.hasAction && (
                    <button onClick={handleApplyAiPlan} className="bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 mt-2">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Save Plan to Protocols
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={sendAiMessage} className="pt-3 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={aiQuery} 
                onChange={(e) => setAiQuery(e.target.value)} 
                placeholder="Ask for custom meal or training split..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="bg-cyan-500 text-slate-950 px-4 rounded-xl font-bold flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-6 py-3 flex justify-between items-center max-w-md mx-auto shadow-2xl ${highContrast ? 'bg-black border-white' : 'bg-slate-900/90 border-slate-800/80'}`}>
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center space-y-1 ${activeTab === 'workout' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold">Workout</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center space-y-1 ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

    </div>
  );
}
