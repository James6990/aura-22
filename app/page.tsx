"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "leaderboard" | "ai-coach" | "pro" | "biometrics" | "devices";

interface UserProfile {
  name: string;
  isPro: boolean;
  xp: number;
  streak: number;
  weightClass: string;
  ageGroup: string;
  region: string;
  gender: "male" | "female" | "other";
  menstrualPhase: "follicular" | "ovulatory" | "luteal" | "menstrual" | "n/a";
  cycleDay: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  score: string;
  region: string;
  ageGroup: string;
  weightClass: string;
  isPro: boolean;
  badge: string;
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [user, setUser] = useState<UserProfile>({
    name: "Alex Vance",
    isPro: false,
    xp: 2450,
    streak: 12,
    weightClass: "75-85kg",
    ageGroup: "25-34",
    region: "North America",
    gender: "female",
    menstrualPhase: "follicular",
    cycleDay: 8
  });

  const [steps, setSteps] = useState<number>(8420);
  const baseCaloriesBurned = 1850;
  const stepBurnMultiplier = 0.04; 
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * stepBurnMultiplier));

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [watchConnected, setWatchConnected] = useState<boolean>(true);
  const [watchBattery, setWatchBattery] = useState<number>(88);
  const [watchHeartRate, setWatchHeartRate] = useState<number>(128);

  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  const [exercises, setExercises] = useState([
    { id: 1, name: "Barbell Bench Press", sets: "4 sets × 8-10 reps", completed: false, weight: "90kg" },
    { id: 2, name: "Incline Dumbbell Press", sets: "3 sets × 10-12 reps", completed: false, weight: "32kg" },
    { id: 3, name: "Weighted Dips", sets: "3 sets × 12 reps", completed: false, weight: "+15kg" },
    { id: 4, name: "Cable Lateral Raises", sets: "4 sets × 15 reps", completed: false, weight: "12kg" },
  ]);

  const [macros, setMacros] = useState({ protein: 165, carbs: 210, fats: 65, baseTarget: 2150 });
  const netCalorieTarget = Math.round(macros.baseTarget + (steps * 0.02)); 
  const [dietLogged, setDietLogged] = useState<string[]>(["Oats & Whey Protein Shake", "Grilled Chicken & Rice Bowl"]);

  const [lbFilterRegion, setLbFilterRegion] = useState<string>("Global");
  const [lbFilterWeight, setLbFilterWeight] = useState<string>("All");
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Hello Alex! As your Apex AI Coach, I've integrated your current ${user.gender === 'female' ? `${user.menstrualPhase} cycle phase` : 'physiological profile'} and real-time step burn into your daily metrics. How can I optimize your protocol today?` }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (workoutActive) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [workoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rawLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: "Marcus 'The Titan' Vance", score: "14,820 XP", region: "Europe", ageGroup: "25-34", weightClass: "85kg+", isPro: true, badge: "Apex Elite 🏆" },
    { rank: 2, name: "Elena Rostova", score: "14,100 XP", region: "Europe", ageGroup: "18-24", weightClass: "55-65kg", isPro: true, badge: "Powerhouse 🔥" },
    { rank: 3, name: "David 'Kage' Miller", score: "13,450 XP", region: "North America", ageGroup: "25-34", weightClass: "75-85kg", isPro: true, badge: "Ghost Runner ⚡" },
    { rank: 4, name: "Sarah Jenkins", score: "12,900 XP", region: "North America", ageGroup: "25-34", weightClass: "65-75kg", isPro: false, badge: "Consistent 🚀" },
    { rank: 5, name: "Kenji Sato", score: "12,110 XP", region: "Asia", ageGroup: "35-44", weightClass: "75-85kg", isPro: true, badge: "Master Tactician 🎯" },
    { rank: 6, name: "Alex Vance (You)", score: "2,450 XP", region: "North America", ageGroup: "25-34", weightClass: "75-85kg", isPro: user.isPro, badge: "Rising Contender 🌱" },
  ];

  const filteredLeaderboard = rawLeaderboard.filter(item => {
    if (lbFilterRegion !== "Global" && item.region !== lbFilterRegion) return false;
    if (lbFilterWeight !== "All" && item.weightClass !== lbFilterWeight) return false;
    return true;
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      let aiReply = "I've analyzed your biometric telemetry and active step burn. Maintain your current intensity vector!";
      if (userText.toLowerCase().includes("cycle") || userText.toLowerCase().includes("hormone") || userText.toLowerCase().includes("phase")) {
        aiReply = `Current phase: ${user.menstrualPhase.toUpperCase()}. Estrogen is rising, which optimizes your pain tolerance and explosive strength output. Great window for heavy compound lifts!`;
      } else if (userText.toLowerCase().includes("step") || userText.toLowerCase().includes("calorie")) {
        aiReply = `Your ${steps} daily steps have expanded your energy expenditure budget by roughly ~${Math.round(steps * 0.04)} kcal. You can safely incorporate an extra carbohydrate source today.`;
      } else if (userText.toLowerCase().includes("watch") || userText.toLowerCase().includes("bluetooth")) {
        aiReply = watchConnected ? "Smartwatch connection is stable via BLE 5.3. Heart rate telemetry streaming smoothly at 128 BPM peak." : "Smartwatch is currently offline. Navigate to the Devices tab to re-scan.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      setIsAiThinking(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Cpu className="h-6 w-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                APEX STATE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Gen-Next OS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Autonomous Fitness & Longevity</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs font-medium">
            <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
            <span>{user.streak} Day Streak</span>
            <span className="text-slate-600">|</span>
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-emerald-400 font-bold">{user.xp} XP</span>
          </div>

          <button 
            onClick={() => setActiveTab("pro")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              user.isPro 
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20" 
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            {user.isPro ? "Apex Pro Active" : "Upgrade to Pro"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <aside className="w-full lg:w-64 border-r border-slate-800/80 bg-slate-900/30 p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 hidden lg:block mb-1">
            Core Modules
          </div>

          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workout & Ghost", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Steps", icon: Utensils },
              { id: "biometrics", label: "Biometrics & Cycle", icon: Calendar },
              { id: "devices", label: "Smartwatch BLE", icon: Bluetooth, badge: watchConnected ? "Live" : "Off" },
              { id: "leaderboard", label: "Global Arena", icon: Trophy },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot, highlight: true },
              { id: "pro", label: "Pro Membership", icon: Crown, proBadge: !user.isPro },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal w-full ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${watchConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse hidden lg:block" />
                  )}
                  {tab.proBadge && (
                    <span className="text-[9px] uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold hidden lg:block">
                      Unlock
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    <Zap className="h-3.5 w-3.5" /> Welcome back, {user.name}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    Biometric & Energy Budgets Balanced
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">
                    {user.gender === 'female' ? `Currently in your ${user.menstrualPhase} phase (Day ${user.cycleDay}). AI has adjusted carbohydrate timing.` : 'Standard endocrine profile active.'} Watch telemetry linked successfully.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab("workout")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
                >
                  Start Workout <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Daily Steps", value: steps.toLocaleString(), change: "Auto-synced via BLE", icon: Footprints, color: "text-emerald-400" },
                  { label: "Active Energy Burn", value: `${activeCaloriesBurned} kcal`, change: `Base + ${steps} steps deduction`, icon: Flame, color: "text-orange-400" },
                  { label: "Watch Heart Rate", value: `${watchHeartRate} BPM`, change: watchConnected ? "Connected BLE 5.3" : "Disconnected", icon: Radio, color: "text-cyan-400" },
                  { label: "Endocrine Phase", value: user.gender === 'female' ? user.menstrualPhase : 'Standard', change: user.gender === 'female' ? `Day ${user.cycleDay} of 28` : 'Optimized profile', icon: Calendar, color: "text-teal-400" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                        <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-white mb-1 capitalize">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.change}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Session</span>
                  <h1 className="text-2xl font-black text-white">Push Hypertrophy & Ghost Racing</h1>
                  <p className="text-xs text-slate-400 mt-1">AI-guided execution with live watch heart rate integration.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center font-mono text-xl font-bold text-emerald-400">
                    {formatTime(workoutTimer)}
                  </div>
                  <button 
                    onClick={() => setWorkoutActive(!workoutActive)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      workoutActive 
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30" 
                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                    }`}
                  >
                    {workoutActive ? "Pause Session" : "Start Session"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Scheduled Routine</h3>
                <div className="space-y-3">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setExercises(exercises.map(item => item.id === ex.id ? {...item, completed: !item.completed} : item));
                          }}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                            ex.completed ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700 bg-slate-900"
                          }`}
                        >
                          {ex.completed && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className={`font-bold text-sm ${ex.completed ? "line-through text-slate-500" : "text-white"}`}>{ex.name}</div>
                          <div className="text-xs text-slate-400">{ex.sets} • Target: <span className="text-emerald-400">{ex.weight}</span></div>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
                        Live HR: {watchHeartRate} BPM
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Metabolic Control</span>
                  <h1 className="text-2xl font-black text-white">Dynamic Step-Adjusted Calorie Budget</h1>
                  <p className="text-xs text-slate-400 mt-1">Your daily calorie allowance automatically scales based on smart watch step telemetry.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-right">
                  <div className="text-xs text-slate-400">Total Net Calorie Target</div>
                  <div className="text-2xl font-black text-emerald-400">{netCalorieTarget} kcal</div>
                  <div className="text-[10px] text-slate-500">Base ({macros.baseTarget}) + Steps ({Math.round(steps * 0.02)})</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Protein Target</div>
                  <div className="text-2xl font-black text-white">{macros.protein}g</div>
                  <div className="text-xs text-emerald-400 mt-2">Optimal muscle protein synthesis</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Carbohydrates</div>
                  <div className="text-2xl font-black text-white">{macros.carbs}g</div>
                  <div className="text-xs text-teal-400 mt-2">Adjusted for follicular phase & steps</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Dietary Fats</div>
                  <div className="text-2xl font-black text-white">{macros.fats}g</div>
                  <div className="text-xs text-cyan-400 mt-2">Hormonal baseline regulation</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Endocrine Optimization</span>
                <h1 className="text-2xl font-black text-white">Biometric & Menstrual Cycle Matrix</h1>
                <p className="text-xs text-slate-400 mt-1">Autonomous tuning of recovery metrics based on physiological data inputs.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gender Profile</label>
                    <select 
                      value={user.gender} 
                      onChange={(e) => setUser({...user, gender: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="female">Female (Cycle Tracking Active)</option>
                      <option value="male">Male (Standard Endocrine Profile)</option>
                      <option value="other">Custom / Non-Binary</option>
                    </select>
                  </div>

                  {user.gender === 'female' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Current Menstrual Phase</label>
                      <select 
                        value={user.menstrualPhase} 
                        onChange={(e) => setUser({...user, menstrualPhase: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 capitalize"
                      >
                        <option value="follicular">Follicular (High Energy / Strength Peak)</option>
                        <option value="ovulatory">Ovulatory (Peak Estrogen / Power)</option>
                        <option value="luteal">Luteal (Progesterone Dominant / Endurance Focus)</option>
                        <option value="menstrual">Menstrual (Recovery & Deload Focus)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">BLE 5.3 Protocol</span>
                  <h1 className="text-2xl font-black text-white">Smartwatch & Hardware Hub</h1>
                  <p className="text-xs text-slate-400 mt-1">Live telemetry streaming for heart rate, steps, and sleep debt.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
                  <BatteryCharging className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold">{watchBattery}% Watch Battery</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Apex Smart Ring Gen-2 / Watch OS</div>
                      <div className="text-xs text-slate-400">{watchConnected ? "Connected via Bluetooth Low Energy" : "Device Disconnected"}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setWatchConnected(!watchConnected)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      watchConnected ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500 text-slate-950"
                    }`}
                  >
                    {watchConnected ? "Disconnect" : "Connect Device"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Global Arena</span>
                  <h1 className="text-2xl font-black text-white">Apex Global Leaderboard</h1>
                  <p className="text-xs text-slate-400 mt-1">Filter competitors by region and weight class.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={lbFilterRegion} 
                    onChange={(e) => setLbFilterRegion(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Global">All Regions</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                  </select>

                  <select 
                    value={lbFilterWeight} 
                    onChange={(e) => setLbFilterWeight(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="All">All Weight Classes</option>
                    <option value="55-65kg">55-65kg</option>
                    <option value="65-75kg">65-75kg</option>
                    <option value="75-85kg">75-85kg</option>
                    <option value="85kg+">85kg+</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-800/80">
                  {filteredLeaderboard.map((item) => (
                    <div key={item.rank} className={`p-4 flex items-center justify-between gap-4 ${item.name.includes("You") ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${item.rank <= 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                          #{item.rank}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            {item.name}
                            {item.isPro && <Crown className="h-3 w-3 text-amber-400" />}
                          </div>
                          <div className="text-xs text-slate-400">{item.badge} • {item.region} ({item.weightClass})</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                        {item.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shrink-0">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Autonomous AI Matrix</span>
                <h1 className="text-2xl font-black text-white">Apex Neural AI Coach</h1>
                <p className="text-xs text-slate-400 mt-1">Direct integration with your sleep telemetry, hormone cycle, and step expenditure.</p>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 flex flex-col">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-500 text-slate-950 font-medium' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 animate-pulse">
                      Analyzing biometrics and generating response...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 shrink-0">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your cycle phase, step macros, or watch metrics..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-xl font-bold transition-all">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 text-slate-950">
                <Crown className="h-8 w-8 font-black" />
              </div>
              <h1 className="text-3xl font-black text-white">Apex State PRO Access</h1>
              <p className="text-slate-400 text-sm">Unlock fully autonomous AI coaching, advanced biometric hormone analysis, live BLE ring telemetry, and global arena priority matching.</p>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-left space-y-3">
                {[
                  "Advanced Menstrual Cycle & Hormone Biometric Periodization",
                  "Continuous Bluetooth Smartwatch & Smart Ring Telemetry Stream",
                  "Unlimited Autonomous AI Neural Coach Prompting",
                  "Priority Global Leaderboard Badge Matching & Multipliers"
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setUser({...user, isPro: !user.isPro})}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all"
              >
                {user.isPro ? "Disable Pro Mode (Test Free Paywall)" : "Activate Apex Pro Membership Now"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
