'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, Flame, Trophy, Utensils, BookOpen, User, Plus, 
  CheckCircle2, TrendingUp, Zap, Search, Award, Sparkles, 
  ShieldCheck, Timer, Bluetooth, MessageSquare, Camera, Send, 
  LogOut, LogIn, Globe, Lock, Crown, CreditCard, Smartphone, 
  ExternalLink, Trash2, Check, Calendar, ListOrdered, Activity, ArrowRight,
  Mic, MicOff, Eye, History, Play, Pause, RotateCcw, X, Calculator, Target
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
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderVoice, setScreenReaderVoice] = useState(true);

  const [biometrics, setBiometrics] = useState({
    sex: 'Male',
    age: '24',
    weight: '82',
    height: '180',
    goal: 'Hypertrophy & Lean Muscle'
  });

  const [workoutHistory, setWorkoutHistory] = useState<Array<{ id: number; date: string; title: string; summary: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_history');
      return saved ? JSON.parse(saved) : [
        { id: 1, date: '2026-08-01', title: 'Push Day A', summary: 'Bench Press, Overhead Press, Triceps' }
      ];
    }
    return [];
  });

  const [restSeconds, setRestSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barWeight, setBarWeight] = useState<number>(20);

  const [personalRecords, setPersonalRecords] = useState<Array<{ id: number; lift: string; weight: string; date: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_prs');
      return saved ? JSON.parse(saved) : [
        { id: 1, lift: 'Barbell Bench Press', weight: '95 kg', date: '2026-07-20' },
        { id: 2, lift: 'Barbell Back Squat', weight: '130 kg', date: '2026-07-25' },
        { id: 3, lift: 'Deadlift', weight: '160 kg', date: '2026-07-28' }
      ];
    }
    return [];
  });

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
      targetWeight: 60,
      sets: [
        { setNumber: 1, weight: '60kg', reps: '10', completed: false, lastWeekRef: '57.5kg x 10 (Try +2.5kg)' },
        { setNumber: 2, weight: '65kg', reps: '8', completed: false, lastWeekRef: '62.5kg x 8 (Progressive Overload)' }
      ] 
    }
  ]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    localStorage.setItem('apex_aura', aura.toString());
    localStorage.setItem('apex_streak', streak.toString());
    localStorage.setItem('apex_history', JSON.stringify(workoutHistory));
    localStorage.setItem('apex_prs', JSON.stringify(personalRecords));
  }, [aura, streak, workoutHistory, personalRecords]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds(prev => prev - 1), 1000);
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast("Rest time complete! Get back under the bar.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSeconds]);

  const showToast = (msg: string) => {
    setToast(msg);
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

  const calculatePlates = () => {
    if (targetWeight <= barWeight) return 'Weight must be greater than bar weight.';
    const weightPerSide = (targetWeight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    let remaining = weightPerSide;
    const breakdown: string[] = [];

    for (const plate of availablePlates) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        breakdown.push(`${count}x ${plate}kg`);
        remaining = Number((remaining % plate).toFixed(2));
      }
    }
    return breakdown.join(', ') + ' per side';
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

            <button onClick={() => setActiveTab('workout')} className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
              <div className="flex items-center space-x-3">
                <Dumbbell className="w-6 h-6 text-slate-100" />
                <div className="text-left">
                  <h3 className="font-bold text-sm text-slate-100">Start Workout Session</h3>
                  <p className="text-[10px] text-cyan-200">Track sets & plate calculator</p>
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

            {/* PLATE CALCULATOR WIDGET */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs text-cyan-300 uppercase tracking-wider">Barbell Plate Calculator</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target Weight (kg)</label>
                  <input 
                    type="number" 
                    value={targetWeight} 
                    onChange={(e) => setTargetWeight(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Bar Weight (kg)</label>
                  <select 
                    value={barWeight} 
                    onChange={(e) => setBarWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={20}>20 kg (Standard Olympic)</option>
                    <option value={15}>15 kg (Women's Olympic)</option>
                    <option value={10}>10 kg (Technique Bar)</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Plates Needed:</span>
                <span className="text-xs font-black text-cyan-400">{calculatePlates()}</span>
              </div>
            </div>

            {/* EXERCISES & SETS */}
            <div className="space-y-4">
              {exercises.map((ex) => (
                <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-cyan-300 flex items-center">
                      <Dumbbell className="w-4 h-4 mr-2" /> {ex.name}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-slate-400">Set {set.setNumber}</span>
                          <span className="text-xs font-semibold text-slate-200">{set.weight} × {set.reps} reps</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-cyan-400 hidden sm:inline">{set.lastWeekRef}</span>
                          <button 
                            onClick={() => toggleSetCompletion(ex.id, setIdx)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${set.completed ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-3 z-30 max-w-md mx-auto flex justify-around items-center">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center space-y-1 ${activeTab === 'workout' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Dumbbell className="w-5 h-5" />
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
