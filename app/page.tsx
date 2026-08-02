'use client';
import { useState } from 'react';
import { Compass, User, Zap, Bookmark, Sparkles, Trophy, Dumbbell, TrendingUp, Users, Plus, Check, Shield, Flame } from 'lucide-react';

interface RoutineItem {
  day: number;
  focus: string;
  intensity: string;
  duration: string;
  completed?: boolean;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  auraPoints: number;
  league: string;
  avatarIcon: string;
  avatarBg: string;
  isUser?: boolean;
}

interface Friend {
  id: string;
  name: string;
  streak: number;
  aura: number;
  status: string;
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'analytics' | 'leagues' | 'profile'>('dashboard');
  const [auraPoints, setAuraPoints] = useState<number>(1420);
  const [streakCount, setStreakCount] = useState<number>(5);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState<boolean>(false);
  
  // Workout Logging state
  const [exerciseName, setExerciseName] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [workoutsLogged, setWorkoutsLogged] = useState<Array<{ id: string; name: string; weight: string; reps: string; time: string }>>([
    { id: '1', name: 'Barbell Bench Press', weight: '80kg', reps: '8', time: 'Today, 08:30 AM' }
  ]);

  // Routines state
  const [routines, setRoutines] = useState<RoutineItem[]>([
    { day: 1, focus: 'Push (Chest, Shoulders, Triceps)', intensity: 'High', duration: '45 mins', completed: true },
    { day: 2, focus: 'Pull (Back, Biceps)', intensity: 'Moderate', duration: '50 mins', completed: false },
    { day: 3, focus: 'Legs & Core', intensity: 'Extreme', duration: '60 mins', completed: false },
  ]);

  // AI Generator state
  const [goal, setGoal] = useState<string>('Hypertrophy');
  const [equipment, setEquipment] = useState<string>('Full Gym');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRoutineMsg, setGeneratedRoutineMsg] = useState<string>('');

  // Leaderboard & Friends state
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, name: 'Marcus Vance', auraPoints: 3420, league: 'Legend', avatarIcon: '⚡', avatarBg: 'bg-amber-500/20 text-amber-400' },
    { rank: 2, name: 'Elena Rostova', auraPoints: 2980, league: 'Elite', avatarIcon: '🔥', avatarBg: 'bg-rose-500/20 text-rose-400' },
    { rank: 3, name: 'You (Apex Athlete)', auraPoints: 1420, league: 'Prodigy', avatarIcon: '💎', avatarBg: 'bg-cyan-500/20 text-cyan-400', isUser: true },
    { rank: 4, name: 'David Chen', auraPoints: 1250, league: 'Prodigy', avatarIcon: '⚡', avatarBg: 'bg-purple-500/20 text-purple-400' },
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Sarah Connor', streak: 12, aura: 2150, status: 'Completed Pull Day' },
    { id: '2', name: 'Alex Rivera', streak: 4, aura: 1100, status: 'Rest Day' },
  ]);
  const [newFriendName, setNewFriendName] = useState<string>('');

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName || !weight || !reps) return;
    
    setWorkoutsLogged([{
      id: Date.now().toString(),
      name: exerciseName,
      weight: `${weight}kg`,
      reps,
      time: 'Just now'
    }, ...workoutsLogged]);
    
    setAuraPoints(prev => prev + 50);
    setExerciseName('');
    setWeight('');
    setReps('');
    setIsLoggingWorkout(false);
  };

  const handleGenerateRoutine = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedRoutineMsg(`Generated custom ${goal} split optimized for ${equipment}! Added to your active schedules.`);
      setRoutines([
        { day: 1, focus: `${goal} - Upper Power`, intensity: 'High', duration: '50 mins', completed: false },
        { day: 2, focus: `${goal} - Lower Hypertrophy`, intensity: 'Extreme', duration: '55 mins', completed: false },
        { day: 3, focus: `${goal} - Functional Core`, intensity: 'Moderate', duration: '40 mins', completed: false },
      ]);
      setAuraPoints(prev => prev + 150);
    }, 1000);
  };

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName) return;
    setFriends([...friends, { id: Date.now().toString(), name: newFriendName, streak: 1, aura: 500, status: 'Just joined ApexState' }]);
    setNewFriendName('');
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

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/20 p-5 shadow-xl">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Zero Friction Logger
                </div>
                <h2 className="text-xl font-bold tracking-tight">Crush your personal records today.</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log your sets instantly, track live progress curves, and compete with elite lifters.
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
                    AI Routine
                  </button>
                </div>
              </div>
            </div>

            {/* LOG MODAL */}
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
                        placeholder="e.g. Squat / Deadlift" 
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
                          placeholder="100" 
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reps</label>
                        <input 
                          type="number" 
                          placeholder="5" 
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

            {/* RECENT LOGS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Recent Activity Logs</h3>
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

        {/* ROUTINES & AI GENERATOR TAB */}
        {activeTab === 'routines' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold">Smart AI Routine Generator</h2>
              <p className="text-xs text-slate-400">Instantly generate custom splits customized for your goals.</p>
            </div>

            {/* AI Generator Box */}
            <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Primary Goal</label>
                  <select 
                    value={goal} 
                    onChange={e => setGoal(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-cyan-400 font-semibold focus:outline-none">
                    <option value="Hypertrophy">Hypertrophy (Size)</option>
                    <option value="Raw Strength">Raw Strength</option>
                    <option value="Fat Loss / Shred">Fat Loss / Shred</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Equipment</label>
                  <select 
                    value={equipment} 
                    onChange={e => setEquipment(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-cyan-400 font-semibold focus:outline-none">
                    <option value="Full Gym">Full Commercial Gym</option>
                    <option value="Dumbbells Only">Dumbbells Only</option>
                    <option value="Bodyweight">Bodyweight / Calisthenics</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerateRoutine}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-4 h-4" /> {isGenerating ? 'Synthesizing Split...' : 'Generate AI Split (+150 AP)'}
              </button>
              {generatedRoutineMsg && <p className="text-xs text-emerald-400 text-center font-medium">{generatedRoutineMsg}</p>}
            </div>

            {/* Active Schedules */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Schedule</h3>
              {routines.map((routine) => (
                <div key={routine.day} className="p-4 rounded-2xl border bg-slate-900 border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Day {routine.day} • {routine.intensity}</span>
                    <h4 className="font-bold text-sm text-slate-100 mt-0.5">{routine.focus}</h4>
                    <p className="text-xs text-slate-400 mt-1">Duration: {routine.duration}</p>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold rounded-xl">Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS & PROGRESS CHARTS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Progress & Analytics</h2>
              <p className="text-xs text-slate-400">Visualize estimated 1-Rep Max curves and volume progression.</p>
            </div>

            {/* Main Visual Progress Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Estimated 1RM Trend</span>
                  <h3 className="font-bold text-base text-slate-100">Barbell Bench Press</h3>
                </div>
                <span className="text-sm font-black text-emerald-400">+12.5% this month</span>
              </div>

              {/* CSS Visual Bar Chart Mockup */}
              <div className="h-32 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
                <div className="w-1/6 bg-cyan-950/60 hover:bg-cyan-500/40 rounded-t-lg h-[40%] flex flex-col justify-between items-center py-1 transition-all"><span className="text-[9px] text-slate-400">W1</span><span className="text-[10px] font-bold text-cyan-400">72kg</span></div>
                <div className="w-1/6 bg-cyan-900/60 hover:bg-cyan-500/40 rounded-t-lg h-[55%] flex flex-col justify-between items-center py-1 transition-all"><span className="text-[9px] text-slate-400">W2</span><span className="text-[10px] font-bold text-cyan-400">76kg</span></div>
                <div className="w-1/6 bg-cyan-800/60 hover:bg-cyan-500/40 rounded-t-lg h-[70%] flex flex-col justify-between items-center py-1 transition-all"><span className="text-[9px] text-slate-400">W3</span><span className="text-[10px] font-bold text-cyan-400">82kg</span></div>
                <div className="w-1/6 bg-cyan-500 rounded-t-lg h-[95%] flex flex-col justify-between items-center py-1 shadow-lg shadow-cyan-500/20"><span className="text-[9px] text-slate-950 font-bold">NOW</span><span className="text-[10px] font-black text-slate-950">90kg</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Total Volume</span>
                  <p className="text-sm font-black text-cyan-400 mt-0.5">14,280 kg</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Workouts</span>
                  <p className="text-sm font-black text-amber-400 mt-0.5">18 Sessions</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Consistency</span>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">94%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEAGUES & FRIENDS TAB */}
        {activeTab === 'leagues' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-500/30 p-4 rounded-2xl space-y-1">
              <h2 className="text-base font-bold text-purple-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Prodigy League
              </h2>
              <p className="text-xs text-slate-400">Weekly leaderboard. Top 5 promote to the Elite Tier.</p>
            </div>

            {/* Leaderboard list */}
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div key={user.rank} className={`p-3 rounded-xl border flex items-center justify-between ${user.isUser ? 'bg-cyan-950/30 border-cyan-500/40 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-black text-sm text-center text-amber-400">#{user.rank}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${user.avatarBg}`}>{user.avatarIcon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{user.name} {user.isUser && <span className="text-[10px] text-cyan-400 font-normal bg-cyan-500/10 px-1 py-0.5 rounded ml-1">You</span>}</h4>
                      <p className="text-[10px] text-slate-400">{user.league} League</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-400">{user.auraPoints}</span>
                    <p className="text-[9px] text-slate-500 uppercase">AP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Friends system */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Friends & Accountability
              </h3>
              <form onSubmit={addFriend} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add friend username..." 
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md">
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {friends.map(friend => (
                  <div key={friend.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{friend.name}</h4>
                      <p className="text-[10px] text-slate-400">Status: <span className="text-cyan-400">{friend.status}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">🔥 {friend.streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center text-2xl font-black shadow-xl">
                💎
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-100">Apex Athlete</h2>
                <p className="text-xs text-slate-400">Prodigy Tier Member</p>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-800">
                <div className="bg-slate-950 p-3 rounded-xl">
                  <span className="text-lg font-black text-cyan-400">{auraPoints}</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Aura Points</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl">
                  <span className="text-lg font-black text-amber-400">{streakCount} Days</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Streak Count</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Compass className="w-5 h-5" /><span className="text-[9px] font-semibold">Today</span>
        </button>
        <button onClick={() => setActiveTab('routines')} className={`flex flex-col items-center gap-1 ${activeTab === 'routines' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Bookmark className="w-5 h-5" /><span className="text-[9px] font-semibold">AI Split</span>
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 ${activeTab === 'analytics' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <TrendingUp className="w-5 h-5" /><span className="text-[9px] font-semibold">Analytics</span>
        </button>
        <button onClick={() => setActiveTab('leagues')} className={`flex flex-col items-center gap-1 ${activeTab === 'leagues' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <Trophy className="w-5 h-5" /><span className="text-[9px] font-semibold">Leagues</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-400'}`}>
          <User className="w-5 h-5" /><span className="text-[9px] font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
