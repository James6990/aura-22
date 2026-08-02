'use client';
import { useState, useEffect } from 'react';
import { Compass, Utensils, User, Zap, Bookmark, Sparkles, Activity, Trophy, Award, Sliders, Calculator, Droplet, ShieldCheck, RefreshCw, Trash2, ArrowRight, Flame, Dumbbell } from 'lucide-react';

interface CustomRoutineItem {
  day: number;
  focus: string;
  intensity: string;
  aiRecommendedTime: string;
  completed?: boolean;
}

interface LoggedItem {
  id: string;
  name: string;
  calories: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  auraPoints: number;
  league: 'Active' | 'Novice' | 'Challenger' | 'Prodigy' | 'Elite' | 'Legend';
  avatarIcon: string;
  avatarBg: string;
  isUser?: boolean;
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'nutrition' | 'leagues' | 'profile'>('dashboard');
  const [auraPoints, setAuraPoints] = useState<number>(1420);
  const [streakCount, setStreakCount] = useState<number>(5);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState<boolean>(false);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [workoutsLogged, setWorkoutsLogged] = useState<Array<{ id: string; name: string; weight: string; reps: string; time: string }>>([
    { id: '1', name: 'Barbell Bench Press', weight: '80kg', reps: '8', time: 'Today, 08:30 AM' }
  ]);

  const [routines, setRoutines] = useState<CustomRoutineItem[]>([
    { day: 1, focus: 'Push (Chest, Shoulders, Triceps)', intensity: 'High', aiRecommendedTime: '45 mins', completed: true },
    { day: 2, focus: 'Pull (Back, Biceps)', intensity: 'Moderate', aiRecommendedTime: '50 mins', completed: false },
    { day: 3, focus: 'Legs & Core', intensity: 'Extreme', aiRecommendedTime: '60 mins', completed: false },
    { day: 4, focus: 'Active Recovery & Mobility', intensity: 'Light', aiRecommendedTime: '30 mins', completed: false }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, name: 'Marcus Vance', auraPoints: 3420, league: 'Legend', avatarIcon: '⚡', avatarBg: 'bg-amber-500/20 text-amber-400' },
    { rank: 2, name: 'Elena Rostova', auraPoints: 2980, league: 'Elite', avatarIcon: '🔥', avatarBg: 'bg-rose-500/20 text-rose-400' },
    { rank: 3, name: 'You (Apex Athlete)', auraPoints: 1420, league: 'Prodigy', avatarIcon: '💎', avatarBg: 'bg-cyan-500/20 text-cyan-400', isUser: true },
    { rank: 4, name: 'David Chen', auraPoints: 1250, league: 'Prodigy', avatarIcon: '⚡', avatarBg: 'bg-purple-500/20 text-purple-400' },
  ]);

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName || !weight || !reps) return;
    
    const newEntry = {
      id: Date.now().toString(),
      name: exerciseName,
      weight: `${weight}kg`,
      reps,
      time: 'Just now'
    };
    
    setWorkoutsLogged([newEntry, ...workoutsLogged]);
    setAuraPoints(prev => prev + 50);
    setExerciseName('');
    setWeight('');
    setReps('');
    setIsLoggingWorkout(false);
  };

  const toggleRoutineCompletion = (day: number) => {
    setRoutines(routines.map(r => {
      if (r.day === day) {
        const nextState = !r.completed;
        if (nextState) setAuraPoints(p => p + 100);
        return { ...r, completed: nextState };
      }
      return r;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/20">
            AS
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg">
              APEX STATE
            </h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">Performance OS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-400">{streakCount}d</span>
          </div>
          <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">{auraPoints} AP</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* WELCOME / QUICK ACTION HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/20 p-5 shadow-xl">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
                </div>
                <h2 className="text-xl font-bold tracking-tight">Ready to elevate your performance today?</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log your sets quickly with zero friction, follow your adaptive routine, and climb the Prodigy league.
                </p>
                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => setIsLoggingWorkout(true)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                    <Dumbbell className="w-4 h-4" /> Quick Log Set
                  </button>
                  <button 
                    onClick={() => setActiveTab('routines')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-sm border border-slate-700 transition-all">
                    View Routine
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK LOG MODAL OVERLAY */}
            {isLoggingWorkout && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-cyan-400" /> Log Workout Set
                    </h3>
                    <button onClick={() => setIsLoggingWorkout(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
                  </div>
                  <form onSubmit={handleLogWorkout} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exercise Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Incline Dumbbell Press" 
                        value={exerciseName}
                        onChange={e => setExerciseName(e.target.value)}
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                        <input 
                          type="number" 
                          placeholder="80" 
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reps</label>
                        <input 
                          type="number" 
                          placeholder="10" 
                          value={reps}
                          onChange={e => setReps(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20">
                      Save & Earn +50 AP
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* RECENT LOGS & PROGRESS */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Recent Activity Logs</h3>
                <span className="text-xs text-cyan-400 font-semibold">Zero Friction</span>
              </div>
              <div className="space-y-2">
                {workoutsLogged.map((log) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{log.name}</h4>
                      <p className="text-xs text-slate-400">{log.weight} • {log.reps} reps • <span className="text-cyan-400">{log.time}</span></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/25">Logged</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROUTINES TAB */}
        {activeTab === 'routines' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Smart Routines</h2>
                <p className="text-xs text-slate-400">AI-optimized schedule for maximum hypertrophy & strength.</p>
              </div>
            </div>
            <div className="space-y-3">
              {routines.map((routine) => (
                <div key={routine.day} className={`p-4 rounded-2xl border transition-all ${routine.completed ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Day {routine.day} • {routine.intensity} Intensity</span>
                      <h3 className="font-bold text-sm text-slate-100 mt-0.5">{routine.focus}</h3>
                      <p className="text-xs text-slate-400 mt-1">Est. Duration: {routine.aiRecommendedTime}</p>
                    </div>
                    <button 
                      onClick={() => toggleRoutineCompletion(routine.day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${routine.completed ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {routine.completed ? 'Completed ✓' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEAGUES TAB */}
        {activeTab === 'leagues' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-500/30 p-4 rounded-2xl space-y-1">
              <h2 className="text-base font-bold text-purple-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Prodigy League
              </h2>
              <p className="text-xs text-slate-400">Compete weekly. Top 5 promote to the Elite League.</p>
            </div>
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div key={user.rank} className={`p-3.5 rounded-xl border flex items-center justify-between ${user.isUser ? 'bg-cyan-950/30 border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 font-black text-sm text-center ${user.rank === 1 ? 'text-amber-400' : user.rank === 2 ? 'text-slate-300' : user.rank === 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                      #{user.rank}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${user.avatarBg}`}>
                      {user.avatarIcon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{user.name} {user.isUser && <span className="text-[10px] text-cyan-400 font-normal bg-cyan-500/10 px-1.5 py-0.5 rounded ml-1">You</span>}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.league} League</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-400">{user.auraPoints}</span>
                    <p className="text-[10px] text-slate-500 uppercase">AP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center text-2xl font-black shadow-xl shadow-cyan-500/20">
                💎
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-100">Apex Athlete</h2>
                <p className="text-xs text-slate-400">Prodigy Tier Member</p>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-800">
                <div className="bg-slate-950 p-3 rounded-xl">
                  <span className="text-lg font-black text-cyan-400">{auraPoints}</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Aura Points</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl">
                  <span className="text-lg font-black text-amber-400">{streakCount} Days</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Current Streak</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Today</span>
        </button>
        <button 
          onClick={() => setActiveTab('routines')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'routines' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Routines</span>
        </button>
        <button 
          onClick={() => setActiveTab('leagues')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'leagues' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Leagues</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
