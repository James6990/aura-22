'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Utensils, 
  BookOpen, 
  User, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Search,
  Award,
  Sparkles,
  ShieldCheck,
  Timer,
  Play,
  RotateCcw
} from 'lucide-react';

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'library' | 'achievements' | 'profile'>('workout');
  const [aura, setAura] = useState(1470);
  const [streak, setStreak] = useState(12);
  const [dailyCalories, setDailyCalories] = useState({ current: 1850, target: 2600 });
  const [macros, setMacros] = useState({ protein: { current: 145, target: 180 }, carbs: { current: 190, target: 250 }, fats: { current: 55, target: 70 } });
  const [toast, setToast] = useState<string | null>(null);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setIsResting(true);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [exercises, setExercises] = useState([
    { id: 1, name: 'Barbell Bench Press', weight: '100kg', reps: '8, 8, 7', pr: 'NEW PR!', logged: false },
    { id: 2, name: 'Incline Dumbbell Press', weight: '36kg', reps: '10, 10, 9', pr: '+2kg vs last week', logged: false },
    { id: 3, name: 'Cable Lateral Raises', weight: '14kg', reps: '12, 12, 12', pr: 'Solid Form', logged: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const library = [
    { name: 'Barbell Back Squat', muscle: 'Legs', difficulty: 'Advanced', tips: 'Keep chest upright, break at hips and knees simultaneously.' },
    { name: 'Conventional Deadlift', muscle: 'Back', difficulty: 'Advanced', tips: 'Keep bar close to shins, engage lats before initiating pull.' },
    { name: 'Overhead Press', muscle: 'Shoulders', difficulty: 'Intermediate', tips: 'Brace core hard, squeeze glutes, press straight overhead.' },
    { name: 'Weighted Pull-Up', muscle: 'Back', difficulty: 'Intermediate', tips: 'Full hang at the bottom, pull chest up to the bar.' },
    { name: 'Barbell Bicep Curl', muscle: 'Arms', difficulty: 'Beginner', tips: 'Keep elbows locked by your sides, avoid swinging.' },
  ];

  const achievements = [
    { title: 'Iron Addict', desc: 'Complete 10 heavy workout sessions', progress: '10/10', unlocked: true, reward: '+250 Aura' },
    { title: '100kg Club', desc: 'Bench press 100kg for working reps', progress: '100kg / 100kg', unlocked: true, reward: '+500 Aura' },
    { title: 'Macro Master', desc: 'Hit your protein target 7 days in a row', progress: '6/7 days', unlocked: false, reward: '+300 Aura' },
    { title: 'Centurion', desc: 'Reach a streak of 100 consecutive days', progress: '12/100 days', unlocked: false, reward: '+2000 Aura' },
  ];

  const logExercise = (id: number) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, logged: true } : ex));
    setAura(prev => prev + 75);
    showToast('⚡ +75 Aura! Rest Timer Started.');
    startRestTimer(90); // Automatically start a 90s rest timer
  };

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || item.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-cyan-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center justify-between animate-bounce">
          <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> {toast}</span>
        </div>
      )}

      {/* Cybernetic Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 p-1.5 rounded-xl font-black tracking-wider text-xs flex items-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-4 h-4 mr-0.5 fill-current" /> APEX
          </div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">STATE</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700/60 text-xs font-semibold shadow-inner">
            <Flame className="w-3.5 h-3.5 text-orange-400 mr-1.5 fill-orange-400 animate-pulse" />
            <span className="text-slate-200">{streak}d</span>
          </div>
          <div className="flex items-center bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40 text-xs font-bold text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Trophy className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>{aura}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        
        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-gradient-to-r from-cyan-950/30 to-slate-900 border border-cyan-500/20 p-4 rounded-2xl shadow-xl">
              <div>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Active Protocol</p>
                <h1 className="text-lg font-black tracking-tight text-slate-100 mt-0.5">Hypertrophy Push A</h1>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-center">
                <span className="text-xs font-bold text-cyan-400">Week 4/8</span>
              </div>
            </div>

            {/* Active Rest Timer Widget */}
            {isResting && (
              <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Timer className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Rest Period Active</p>
                    <p className="text-xl font-black text-slate-100">{Math.floor(restSeconds / 60)}:{('0' + (restSeconds % 60)).slice(-2)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsResting(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  Skip
                </button>
              </div>
            )}

            <div className="space-y-3">
              {exercises.map(ex => (
                <div key={ex.id} className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-md transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-200 text-sm">{ex.name}</h3>
                      <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-1.5 py-0.5 rounded font-bold">{ex.pr}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{ex.weight} • <span className="text-slate-300">{ex.reps}</span></p>
                  </div>
                  <button 
                    onClick={() => logExercise(ex.id)}
                    disabled={ex.logged}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center transition-all ${
                      ex.logged 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 cursor-default' 
                        : 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 mr-1.5 ${ex.logged ? 'text-emerald-400' : 'text-slate-950'}`} />
                    {ex.logged ? 'Done' : 'Log Set'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> Weekly Volume Surge
                </h2>
                <span className="text-xs text-cyan-400 font-bold">78%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 h-full rounded-full w-[78%]"></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">✨ You are lifting 4.2kg heavier on average than last week.</p>
            </div>
          </div>
        )}

        {/* NUTRITION & MACROS TAB */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Fuel & Recovery</h1>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Calories Remaining</p>
                <h2 className="text-3xl font-black text-slate-100 mt-1">{dailyCalories.target - dailyCalories.current} <span className="text-xs font-normal text-slate-400">kcal</span></h2>
                <p className="text-[11px] text-cyan-400 font-medium mt-1">Goal: {dailyCalories.target} kcal bulk</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center bg-cyan-950/40 rounded-full border-4 border-cyan-500/30 shadow-inner">
                <span className="text-xs font-bold text-cyan-400">71%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center shadow-md">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Protein</p>
                <p className="text-lg font-black text-cyan-400 mt-1">{macros.protein.current}g</p>
                <p className="text-[9px] text-slate-500">/ {macros.protein.target}g</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center shadow-md">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Carbs</p>
                <p className="text-lg font-black text-amber-400 mt-1">{macros.carbs.current}g</p>
                <p className="text-[9px] text-slate-500">/ {macros.carbs.target}g</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center shadow-md">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fats</p>
                <p className="text-lg font-black text-rose-400 mt-1">{macros.fats.current}g</p>
                <p className="text-[9px] text-slate-500">/ {macros.fats.target}g</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setDailyCalories(prev => ({ ...prev, current: prev.current + 450 }));
                setMacros(prev => ({ ...prev, protein: { ...prev.protein, current: prev.protein.current + 35 } }));
                showToast('🥗 Meal Logged! +50 Aura');
                setAura(prev => prev + 50);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 p-4 rounded-2xl text-xs font-black flex items-center justify-center text-cyan-400 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" /> Log Elite Meal (+450 kcal, 35g Protein)
            </button>
          </div>
        )}

        {/* EXERCISE LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Exercise Database</h1>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search elite movements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
              {['All', 'Legs', 'Back', 'Shoulders', 'Arms'].map(muscle => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-4 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedMuscle === muscle 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredLibrary.map((item, index) => (
                <div key={index} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-200 text-sm">{item.name}</h3>
                    <span className="text-[9px] bg-slate-800 text-cyan-400 border border-slate-700/80 px-2 py-0.5 rounded font-extrabold">{item.muscle}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    <strong className="text-cyan-400">Biomechanics Tip:</strong> {item.tips}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Badges & Aura</h1>

            <div className="space-y-3">
              {achievements.map((ach, idx) => (
                <div key={idx} className={`border p-4 rounded-2xl flex items-center justify-between shadow-md transition-all ${ach.unlocked ? 'bg-slate-900 border-cyan-500/30 shadow-cyan-500/5' : 'bg-slate-900/40 border-slate-800/60 opacity-70'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-500'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${ach.unlocked ? 'text-slate-100' : 'text-slate-400'}`}>{ach.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ach.desc}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">{ach.progress}</span>
                        <span className="text-[9px] text-cyan-400 font-black">{ach.reward}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Athlete Profile</h1>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-cyan-500/20 rotate-3">
                AS
              </div>
              <div>
                <h2 className="font-black text-base text-slate-100 flex items-center justify-center">
                  Alex Vance <ShieldCheck className="w-4 h-4 text-cyan-400 ml-1.5" />
                </h2>
                <p className="text-[11px] text-cyan-400 font-bold mt-0.5">Elite Tier Athlete • Global Top 3.4%</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-center">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Workouts Logged</p>
                  <p className="text-lg font-black text-slate-100 mt-1">84</p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Aura</p>
                  <p className="text-lg font-black text-cyan-400 mt-1">{aura}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 z-40 max-w-md mx-auto shadow-2xl">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'workout' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Dumbbell className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Workout</span>
          </button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'nutrition' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Utensils className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Nutrition</span>
          </button>
          <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'library' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Library</span>
          </button>
          <button onClick={() => setActiveTab('achievements')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'achievements' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Award className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Badges</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <User className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
