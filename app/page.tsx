'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, Flame, Trophy, Utensils, BookOpen, User, Plus, 
  CheckCircle2, TrendingUp, Zap, Search, Award, Sparkles, 
  ShieldCheck, Timer, Bluetooth, MessageSquare, Camera, Send, 
  LogOut, LogIn, Globe, Lock, Crown, CreditCard, Smartphone, 
  ExternalLink, Trash2, Check, Calendar, ListOrdered, Activity, ArrowRight,
  Mic, MicOff, Eye, History, Play, Pause, RotateCcw, X, Calculator, Target, HeartPulse, Layers
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
      return saved ? Number(saved) : 480;
    }
    return 480;
  });

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_streak');
      return saved ? Number(saved) : 6;
    }
    return 6;
  });

  const [toast, setToast] = useState<string | null>(null);

  // Accessibility & Account State
  const [highContrast, setHighContrast] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Profile & Biometrics (Including Hormonal, Menstrual & Menopause Adaptations)
  const [biometrics, setBiometrics] = useState({
    sex: 'Female',
    age: '29',
    weight: '63',
    height: '168',
    goal: 'Hypertrophy & Bone Density Optimization',
    cyclePhase: 'Follicular (High Energy Window)',
    menopauseStatus: 'N/A (Pre-menopausal / Cycling)'
  });

  // Nutrition / Calorie Tracker State
  const [caloriesEaten, setCaloriesEaten] = useState<number>(1950);
  const [proteinEaten, setProteinEaten] = useState<number>(150);
  const calorieTarget = 2300;
  const proteinTarget = 160;

  // Bluetooth Heart Rate State
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  // Workout History Log
  const [workoutHistory, setWorkoutHistory] = useState<Array<{ id: number; date: string; title: string; summary: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_history');
      return saved ? JSON.parse(saved) : [
        { id: 1, date: '2026-08-01', title: 'Lower Body Strength', summary: 'Back Squat, Romanian Deadlifts, Calf Raises' },
        { id: 2, date: '2026-07-30', title: 'Upper Body Hypertrophy', summary: 'Bench Press, Lat Pulldowns, Lateral Raises' }
      ];
    }
    return [];
  });

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState<number>(85);
  const [barWeight, setBarWeight] = useState<number>(20);

  // PR Tracker State
  const [personalRecords, setPersonalRecords] = useState<Array<{ id: number; lift: string; weight: string; date: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_prs');
      return saved ? JSON.parse(saved) : [
        { id: 1, lift: 'Barbell Back Squat', weight: '95 kg', date: '2026-07-28' },
        { id: 2, lift: 'Barbell Bench Press', weight: '65 kg', date: '2026-07-25' },
        { id: 3, lift: 'Conventional Deadlift', weight: '125 kg', date: '2026-07-20' }
      ];
    }
    return [];
  });

  // Leaderboard League Tabs & State
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends' | 'gym'>('global');
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alex "Titan" V.', aura: 1540, tier: 'Apex Titan' },
    { rank: 2, name: 'Elena Rostova', aura: 1390, tier: 'Apex Titan' },
    { rank: 3, name: 'You (Apex Athlete)', aura: aura, tier: 'Rising Challenger', isUser: true },
    { rank: 4, name: 'Marcus Brody', aura: 1150, tier: 'Alpha Predator' },
    { rank: 5, name: 'Sarah "Iron" L.', aura: 980, tier: 'Alpha Predator' }
  ]);

  // Custom Routines Builder State
  const [customRoutines, setCustomRoutines] = useState<Array<{ id: number; title: string; exercisesList: string[] }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_custom_routines');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Menstrual Phase 1: High Energy Split', exercisesList: ['Squats 4x6', 'Hip Thrusts 3x10', 'Bulgarian Split Squats 3x10'] }
      ];
    }
    return [];
  });
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineExercise, setNewRoutineExercise] = useState('');
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);

  useEffect(() => {
    setLeaderboard(prev => prev.map(item => item.isUser ? { ...item, aura } : item));
  }, [aura]);

  const getApexTitle = (auraScore: number) => {
    if (auraScore >= 1200) return '👑 Apex Titan (Legendary Elite)';
    if (auraScore >= 700) return '⚡ Alpha Predator';
    if (auraScore >= 350) return '🔥 Rising Challenger';
    return '🌱 Novice Athlete';
  };

  // AI Coach Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState([
    { sender: 'ai', text: `Greetings, athlete. Biometric profile loaded: Sex: ${biometrics.sex}, Status: ${biometrics.cyclePhase}. Ask me for customized macro adjustments, cycle volume scaling, or movement cues!`, hasAction: false }
  ]);

  const [exercises, setExercises] = useState([
    { 
      id: 1, name: 'Barbell Back Squat', 
      targetWeight: 75,
      sets: [
        { setNumber: 1, weight: '75kg', reps: '8', completed: false, lastWeekRef: '70kg x 8 (Progressive Overload Achieved)' },
        { setNumber: 2, weight: '80kg', reps: '6', completed: false, lastWeekRef: '75kg x 6 (Peak Strength Window)' },
        { setNumber: 3, weight: '80kg', reps: '6', completed: false, lastWeekRef: '75kg x 6 (RPE 8.5 Target)' }
      ] 
    }
  ]);

  useEffect(() => {
    localStorage.setItem('apex_aura', aura.toString());
    localStorage.setItem('apex_streak', streak.toString());
    localStorage.setItem('apex_history', JSON.stringify(workoutHistory));
    localStorage.setItem('apex_prs', JSON.stringify(personalRecords));
    localStorage.setItem('apex_custom_routines', JSON.stringify(customRoutines));
  }, [aura, streak, workoutHistory, personalRecords, customRoutines]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds(prev => prev - 1), 1000);
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast("Rest interval complete! Time to crush the next set.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSeconds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
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
    setAura(prev => prev + 30);
    setRestSeconds(120);
    setIsTimerRunning(true);
    showToast("Set logged successfully! +30 Aura. 120s Rest Timer started.");
  };

  const logCompletedWorkout = () => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: `Apex Workout Session #${workoutHistory.length + 1}`,
      summary: exercises.map(ex => ex.name).join(', ')
    };
    setWorkoutHistory([newSession, ...workoutHistory]);
    setAura(prev => prev + 150);
    showToast("Workout finalized and archived! +150 Aura earned.");
  };

  const connectBluetoothWatch = () => {
    setIsBluetoothConnected(true);
    setHeartRate(136);
    showToast("Successfully synchronized with Smart Band 4HR via WebBluetooth!");
  };

  // Graphical Plate Stacker Logic
  const calculatePlatesVisual = () => {
    if (targetWeight <= barWeight) return [];
    const weightPerSide = (targetWeight - barWeight) / 2;
    const availablePlates = [
      { weight: 25, color: 'bg-red-600 border-red-400', label: '25kg' },
      { weight: 20, color: 'bg-blue-600 border-blue-400', label: '20kg' },
      { weight: 15, color: 'bg-yellow-500 border-yellow-300', label: '15kg' },
      { weight: 10, color: 'bg-green-600 border-green-400', label: '10kg' },
      { weight: 5, color: 'bg-white border-slate-300 text-slate-950', label: '5kg' },
      { weight: 2.5, color: 'bg-black border-slate-600', label: '2.5kg' }
    ];
    let remaining = weightPerSide;
    const stackedPlates: Array<{ label: string; color: string }> = [];

    for (const plate of availablePlates) {
      while (remaining >= plate.weight) {
        stackedPlates.push({ label: plate.label, color: plate.color });
        remaining = Number((remaining - plate.weight).toFixed(2));
      }
    }
    return stackedPlates;
  };

  const saveNewCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    const newEntry = {
      id: Date.now(),
      title: newRoutineTitle,
      exercisesList: newRoutineExercise ? [newRoutineExercise] : ['Custom compound movement block']
    };
    setCustomRoutines([...customRoutines, newEntry]);
    setNewRoutineTitle('');
    setNewRoutineExercise('');
    setIsAddingRoutine(false);
    showToast("Custom workout routine successfully created!");
  };

  const sendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const userMsg = aiQuery;
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg, hasAction: false }]);
    setAiQuery('');

    setTimeout(() => {
      let advice = "Optimal neural drive detected. Focus on explosive concentric execution with 2-second eccentric phases.";
      if (biometrics.cyclePhase.includes('Follicular')) {
        advice = `Since you are in your ${biometrics.cyclePhase}, estrogen levels support high pain tolerance, enhanced glycogen storage, and rapid force production. Capitalize on this window for heavy personal records.`;
      } else if (biometrics.cyclePhase.includes('Luteal')) {
        advice = `During your ${biometrics.cyclePhase}, core body temperature is elevated and perceived exertion is higher. Prioritize hydration, add 30g complex intra-workout carbs, and allow an extra 30 seconds of rest between compound working sets.`;
      } else if (biometrics.menopauseStatus.includes('Post-menopausal')) {
        advice = "Post-menopausal training protocol engaged: Emphasize high bone-loading axial loads (RPE 8-9), heavy axial resistance movements, and optimized daily protein distribution (35g+ per meal) to protect lean tissue mass.";
      }
      setAiChat(prev => [...prev, { sender: 'ai', text: advice, hasAction: true }]);
    }, 700);
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
          {!isPro && (
            <button onClick={() => setIsPaywallOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center shadow-md animate-pulse">
              <Crown className="w-3 h-3 mr-1" /> PRO
            </button>
          )}
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
        
        {/* ================= HOME TAB ================= */}
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

            {/* HORMONAL & BIOMETRIC ADAPTIVE STATUS WIDGET */}
            {biometrics.sex === 'Female' && (
              <div className="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-2xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300 flex items-center">
                    <HeartPulse className="w-4 h-4 mr-1.5 text-pink-400" /> Hormonal Adaptation Engine
                  </h3>
                  <span className="text-[10px] bg-indigo-900/80 px-2 py-0.5 rounded text-indigo-200 font-semibold">{biometrics.cyclePhase}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {biometrics.cyclePhase.includes('Follicular') ? 'High estrogen state: Pain threshold and explosive output are at their peak. Push working sets.' : 'Luteal phase: Core temp elevated and recovery slower. Increase hydration and rest duration.'}
                </p>
              </div>
            )}

            {/* NUTRITION & MACROS WIDGET */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center">
                  <Utensils className="w-4 h-4 mr-1.5" /> Nutrition & Macros
                </h3>
                <span className="text-[10px] text-slate-400">Target: {calorieTarget} kcal</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Calories Consumed</span>
                  <span className="text-lg font-black text-cyan-300">{caloriesEaten} <span className="text-xs font-normal text-slate-400">/ {calorieTarget}</span></span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Protein Intake</span>
                  <span className="text-lg font-black text-indigo-300">{proteinEaten}g <span className="text-xs font-normal text-slate-400">/ {proteinTarget}g</span></span>
                </div>
              </div>
              <button 
                onClick={() => { setCaloriesEaten(prev => prev + 350); setProteinEaten(prev => prev + 30); showToast("Logged meal: +350 kcal, +30g Protein"); }}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 py-2 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Log Quick Meal (+350 kcal)
              </button>
            </div>

            {/* BLUETOOTH SMARTWATCH SYNC WIDGET */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-950/80 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-400">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-cyan-300">Smartwatch Heart Rate</h4>
                  <p className="text-[10px] text-slate-400">
                    {isBluetoothConnected ? `Live HR: ${heartRate} BPM` : 'No device connected'}
                  </p>
                </div>
              </div>
              <button 
                onClick={connectBluetoothWatch} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isBluetoothConnected ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500 text-slate-950'}`}
              >
                {isBluetoothConnected ? 'Synced' : 'Connect'}
              </button>
            </div>

            {/* MULTI-TIERED LEADERBOARD LEAGUE */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center">
                  <Trophy className="w-4 h-4 mr-1.5" /> Apex League Leaderboard
                </h3>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                <button onClick={() => setLeaderboardTab('global')} className={`flex-1 py-1.5 rounded-lg transition-all ${leaderboardTab === 'global' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Global Elite</button>
                <button onClick={() => setLeaderboardTab('friends')} className={`flex-1 py-1.5 rounded-lg transition-all ${leaderboardTab === 'friends' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Friends</button>
                <button onClick={() => setLeaderboardTab('gym')} className={`flex-1 py-1.5 rounded-lg transition-all ${leaderboardTab === 'gym' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Gym Tier</button>
              </div>
              <div className="space-y-2">
                {leaderboard.map((user) => (
                  <div key={user.rank} className={`p-2.5 rounded-xl flex items-center justify-between border ${user.isUser ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-black ${user.rank === 1 ? 'text-amber-400' : user.rank === 2 ? 'text-slate-300' : user.rank === 3 ? 'text-amber-600' : 'text-slate-500'}`}>#{user.rank}</span>
                      <div>
                        <h4 className={`text-xs font-bold ${user.isUser ? 'text-cyan-300' : 'text-slate-200'}`}>{user.name}</h4>
                        <p className="text-[9px] text-slate-400">{user.tier}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-cyan-400">{user.aura} Aura</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setIsAiOpen(true)} className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-slate-100" />
                <div className="text-left">
                  <h3 className="font-bold text-sm text-slate-100">Consult AI Coach</h3>
                  <p className="text-[10px] text-cyan-200">Hormone-aware intelligent coaching assistant</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-100" />
            </button>
          </div>
        )}

        {/* ================= WORKOUT TAB ================= */}
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

            {/* GRAPHICAL PLATE CALCULATOR WIDGET */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs text-cyan-300 uppercase tracking-wider">Barbell Plate Stack Visualizer</h3>
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

              {/* Graphical Plate Render */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Plate Breakdown Per Side:</span>
                <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                  <div className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">Bar ({barWeight}kg)</div>
                  <span className="text-slate-600">|</span>
                  {calculatePlatesVisual().length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Target exceeds bar weight</span>
                  ) : (
                    calculatePlatesVisual().map((plate, idx) => (
                      <div key={idx} className={`${plate.color} border px-2 py-1.5 rounded text-[10px] font-black shadow`}>
                        {plate.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CUSTOM ROUTINES BUILDER WIDGET */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5" /> Custom Routine Builder
                </h3>
                <button onClick={() => setIsAddingRoutine(!isAddingRoutine)} className="text-[10px] text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-bold">
                  {isAddingRoutine ? 'Cancel' : '+ New Split'}
                </button>
              </div>

              {isAddingRoutine && (
                <form onSubmit={saveNewCustomRoutine} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                  <input 
                    type="text" 
                    placeholder="Routine Title (e.g. Upper Power)" 
                    value={newRoutineTitle}
                    onChange={(e) => setNewRoutineTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Key Movement (e.g. Bench Press 4x5)" 
                    value={newRoutineExercise}
                    onChange={(e) => setNewRoutineExercise(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" className="w-full bg-cyan-500 text-slate-950 py-1.5 rounded-lg font-bold text-xs">Save Routine</button>
                </form>
              )}

              <div className="space-y-2">
                {customRoutines.map((routine) => (
                  <div key={routine.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300">{routine.title}</h4>
                      <p className="text-[10px] text-slate-400">{routine.exercisesList.join(', ')}</p>
                    </div>
                  </div>
                ))}
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

        {/* ================= HISTORY TAB ================= */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Workout History & PRs</h1>
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center">
                <Award className="w-4 h-4 mr-1.5" /> Personal Records (PRs)
              </h3>
              <div className="space-y-2">
                {personalRecords.map((pr) => (
                  <div key={pr.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{pr.lift}</h4>
                      <p className="text-[10px] text-slate-400">{pr.date}</p>
                    </div>
                    <span className="text-xs font-black text-cyan-400">{pr.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center">
                <History className="w-4 h-4 mr-1.5" /> Past Sessions
              </h3>
              <div className="space-y-2">
                {workoutHistory.map((session) => (
                  <div key={session.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-cyan-300">{session.title}</h4>
                      <span className="text-[10px] text-slate-400">{session.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-300">{session.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PROFILE TAB ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Athlete Profile & Biometrics</h1>
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400">Biological & Hormonal Settings</h3>
              
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Biological Sex</label>
                <select 
                  value={biometrics.sex} 
                  onChange={(e) => setBiometrics({...biometrics, sex: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              {biometrics.sex === 'Female' && (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Menstrual Cycle Phase</label>
                    <select 
                      value={biometrics.cyclePhase} 
                      onChange={(e) => setBiometrics({...biometrics, cyclePhase: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="Follicular (High Energy Window)">Follicular Phase (Days 1–14)</option>
                      <option value="Luteal (Recovery Focus)">Luteal Phase (Days 15–28)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Menopause Status</label>
                    <select 
                      value={biometrics.menopauseStatus} 
                      onChange={(e) => setBiometrics({...biometrics, menopauseStatus: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="N/A (Pre-menopausal / Cycling)">Pre-menopausal / Cycling</option>
                      <option value="Perimenopausal">Perimenopausal</option>
                      <option value="Post-menopausal">Post-menopausal</option>
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={biometrics.weight} 
                    onChange={(e) => setBiometrics({...biometrics, weight: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={biometrics.height} 
                    onChange={(e) => setBiometrics({...biometrics, height: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PAYWALL / PRO UPGRADE MODAL */}
      {isPaywallOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setIsPaywallOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="bg-amber-500/10 border border-amber-500/30 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-100">Unlock Apex State PRO</h2>
              <p className="text-xs text-slate-400">Get unlimited AI Coach access, hormonal adaptation analytics, and multi-tiered league leaderboards.</p>
            </div>
            <div className="space-y-2.5">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 text-xs">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Advanced Menstrual & Menopause Training Scaling Protocols</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 text-xs">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Unlimited Gemini AI Performance Coaching & Macros</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 text-xs">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Global & Gym Elite League Leaderboard Access</span>
              </div>
            </div>
            <button 
              onClick={() => { setIsPro(true); setIsPaywallOpen(false); showToast("Apex PRO Unlocked Successfully!"); }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              Upgrade to PRO Now ($9.99/mo)
            </button>
          </div>
        </div>
      )}

      {/* AI COACH MODAL */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col h-[80vh] shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Apex AI Performance Coach</h3>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiChat.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.sender === 'user' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'bg-slate-950 border border-slate-800 text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendAiMessage} className="p-3 border-t border-slate-800 flex items-center space-x-2 bg-slate-900/80">
              <input 
                type="text" 
                placeholder="Ask for hormonal phase volume scaling or meal plans..." 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="bg-cyan-500 text-slate-950 p-2.5 rounded-xl font-bold">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

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
