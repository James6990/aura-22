"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Volume2, ShieldAlert, Sword
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "leaderboard" | "ai-coach" | "pro" | "biometrics" | "devices";

interface UserProfile {
  name: string;
  isPro: boolean;
  xp: number;
  streak: number;
  weightKg: number;
  somatotype: "ectomorph" | "mesomorph" | "endomorph";
  primaryGoal: "muscle-gain" | "fat-loss" | "recomposition";
  gender: "male" | "female" | "other";
  menstrualPhase: "follicular" | "ovulatory" | "luteal" | "menstrual" | "n/a";
  cycleDay: number;
  league: "Bronze" | "Silver" | "Gold" | "Sapphire" | "Ruby" | "Emerald" | "Diamond";
  leagueRank: number;
}

interface ExerciseItem {
  id: number;
  name: string;
  category: string;
  metValue: number;
  defaultSets: string;
  defaultWeight: string;
  completed: boolean;
}

interface WorkoutRoutineTemplate {
  id: string;
  title: string;
  targetUser: string;
  style: string;
  guideline: string;
  isProOnly?: boolean;
  exercises: Omit<ExerciseItem, "completed">[];
}

interface NutritionItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
}

interface LeagueUser {
  rank: number;
  name: string;
  xp: number;
  isPro: boolean;
  isUser?: boolean;
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apex_user_profile");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return {
      name: "Alex Vance",
      isPro: false,
      xp: 2840,
      streak: 14,
      weightKg: 75,
      somatotype: "mesomorph",
      primaryGoal: "muscle-gain",
      gender: "female",
      menstrualPhase: "follicular",
      cycleDay: 8,
      league: "Ruby",
      leagueRank: 4
    };
  });

  const [steps, setSteps] = useState<number>(8920);
  const baseCaloriesBurned = 1850;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

  // Boss Battle State (PvE)
  const [bossHp, setBossHp] = useState<number>(34200);
  const bossMaxHp = 50000;

  // Recovery Debt State
  const [recoveryDebtPct, setRecoveryDebtPct] = useState<number>(38);

  // Audio Hype Mode State
  const [hypeActive, setHypeActive] = useState<boolean>(false);
  const [hypeMessage, setHypeMessage] = useState<string>("Ready to ignite your set!");

  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apex_active_exercises");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: 1, name: "Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "90kg", completed: false },
      { id: 2, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "120kg", completed: false },
    ];
  });

  const [nutritionLog, setNutritionLog] = useState<NutritionItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apex_nutrition_log");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: 301, name: "Oatmeal with Whey Protein & Berries", calories: 450, protein: 35, carbs: 55, fats: 8, mealType: "Breakfast" },
      { id: 302, name: "Grilled Chicken Breast & Jasmine Rice", calories: 620, protein: 50, carbs: 65, fats: 10, mealType: "Lunch" }
    ];
  });

  // Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>("");
  const [scannedFoodResult, setScannedFoodResult] = useState<{name: string; cals: number; protein: number} | null>(null);
  const [scanCount, setScanCount] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_user_profile", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_active_exercises", JSON.stringify(exercises));
    }
  }, [exercises]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_nutrition_log", JSON.stringify(nutritionLog));
    }
  }, [nutritionLog]);

  const comprehensiveWorkoutTemplates: WorkoutRoutineTemplate[] = [
    {
      id: "ppl-hypertrophy",
      title: "Push / Pull / Legs (PPL) Hypertrophy Split",
      targetUser: "Intermediate Bodybuilding",
      style: "Hypertrophy",
      guideline: "Perform 6 days a week with 1 rest day. Focus on mechanical tension and progressive overload.",
      exercises: [
        { id: 201, name: "Barbell Overhead Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "60kg" },
        { id: 202, name: "Weighted Pull-Ups", category: "Strength", metValue: 8.0, defaultSets: "4 sets × 8 reps", defaultWeight: "Bodyweight + 15kg" },
        { id: 203, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "110kg" }
      ]
    },
    {
      id: "powerlifting-strength",
      title: "5x5 Powerlifting Strength Foundation",
      targetUser: "Strength Seekers",
      style: "Absolute Strength",
      guideline: "Perform 3 days a week with heavy compound lifts and 2-3 minute rest windows.",
      exercises: [
        { id: 205, name: "Heavy Barbell Squat (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "130kg" },
        { id: 206, name: "Flat Barbell Bench Press (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "100kg" }
      ]
    },
    {
      id: "ai-pro-custom",
      title: "Apex AI Biometric Hyper-Customizer",
      targetUser: "Pro Subscribers Only",
      style: "AI Adaptive",
      guideline: "Generates daily micro-adjustments based on your sleep quality, recovery score, and hormonal cycle.",
      isProOnly: true,
      exercises: [
        { id: 220, name: "AI Curated Compound Sequence", category: "Strength", metValue: 7.0, defaultSets: "4 sets × 8 reps", defaultWeight: "Adaptive" }
      ]
    }
  ];

  const loadRoutineTemplate = (template: WorkoutRoutineTemplate) => {
    if (template.isProOnly && !user.isPro) {
      setActiveTab("pro");
      return;
    }
    const newItems: ExerciseItem[] = template.exercises.map((ex, idx) => ({
      ...ex,
      id: Date.now() + idx,
      completed: false
    }));
    setExercises(newItems);
  };

  const totalNutritionCals = nutritionLog.reduce((acc, item) => acc + item.calories, 0);
  const totalNutritionProtein = nutritionLog.reduce((acc, item) => acc + item.protein, 0);
  const netCalorieTarget = Math.round(2200 + (steps * 0.02));

  const triggerCameraScan = () => {
    if (!user.isPro && scanCount >= 2) {
      setActiveTab("pro");
      return;
    }
    setCameraActive(true);
    setScanningStatus("Analyzing plate via Google Visual Search Engine...");
    setScannedFoodResult(null);

    setTimeout(() => {
      setScanningStatus("Match found: Grilled Salmon Bowl with Quinoa & Avocado");
      setScannedFoodResult({
        name: "Grilled Salmon Bowl & Quinoa",
        cals: 510,
        protein: 38
      });
      setScanCount(prev => prev + 1);
    }, 2000);
  };

  const confirmScannedFood = () => {
    if (!scannedFoodResult) return;
    setNutritionLog([...nutritionLog, {
      id: Date.now(),
      name: scannedFoodResult.name,
      calories: scannedFoodResult.cals,
      protein: scannedFoodResult.protein,
      carbs: 40,
      fats: 16,
      mealType: "Lunch"
    }]);
    setCameraActive(false);
    setScannedFoodResult(null);
  };

  const currentLeagueCohort: LeagueUser[] = [
    { rank: 1, name: "Marcus T.", xp: 3420, isPro: true },
    { rank: 2, name: "Elena R.", xp: 3150, isPro: true },
    { rank: 3, name: "David K.", xp: 2950, isPro: false },
    { rank: 4, name: `${user.name} (You)`, xp: user.xp, isPro: user.isPro, isUser: true },
    { rank: 5, name: "Sarah J.", xp: 2680, isPro: false },
    { rank: 6, name: "Liam W.", xp: 2410, isPro: false },
    { rank: 7, name: "Chloe M.", xp: 2190, isPro: true },
  ];

  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Welcome back, ${user.name}! Your Recovery Debt is currently ${recoveryDebtPct}%. Let's crush today's goals!` }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  useEffect(() => {
    let interval: any;
    if (workoutActive) {
      interval = setInterval(() => setWorkoutTimer(prev => prev + 1), 1000);
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

  const attackBoss = () => {
    const damage = 1250;
    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);
    setUser(prev => ({ ...prev, xp: prev.xp + 150 }));
  };

  const triggerHypeAudio = () => {
    setHypeActive(true);
    const lines = [
      "Lock in! Drive your heels through the floor!",
      "Explosive power! Two more reps in the tank, Alex!",
      "Unstoppable momentum! Keep your core braced!"
    ];
    setHypeMessage(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => setHypeActive(false), 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let aiReply = `Based on your ${user.somatotype} physique and ${user.menstrualPhase} cycle phase, keep your rest intervals strict at 90 seconds.`;
      if (userText.toLowerCase().includes("league") || userText.toLowerCase().includes("rank")) {
        aiReply = `You need about 350 more XP this week to pass David K. and secure promotion in the ${user.league} League!`;
      } else if (userText.toLowerCase().includes("recovery") || userText.toLowerCase().includes("debt")) {
        aiReply = `Your Recovery Debt is at ${recoveryDebtPct}%. You are safe to lift heavy today, but make sure to hydrate aggressively!`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-950/50">
            AX
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              APEX STATE OS
            </span>
            <p className="text-xs text-slate-400">Gamified Fitness & Biometric Leagues</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("pro")} 
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-950/30"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            {user.isPro ? "APEX PRO ACTIVE" : "GO PRO"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0 bg-slate-950/40">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workouts & Guidelines", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Camera", icon: Utensils },
              { id: "leaderboard", label: `${user.league} League`, icon: Trophy },
              { id: "biometrics", label: "Somatotype & Profile", icon: Calendar },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
              { id: "pro", label: "Apex Pro Club", icon: Crown },
              { id: "devices", label: "Connected Devices", icon: Bluetooth }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/50" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Apex Command Header */}
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl shadow-emerald-950/20">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <Sparkles className="h-3.5 w-3.5" /> Apex Core Online
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">{user.name}</h1>
                    <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2">
                      <span>Tier: <strong className="text-amber-400">{user.league} League</strong></span>
                      <span>•</span>
                      <span>Active Streak: <strong className="text-amber-400">{user.streak} Days 🔥</strong></span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 p-2 rounded-2xl backdrop-blur-md">
                    <div className="px-4 py-2 text-center border-r border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
                      <span className="text-xl font-black text-amber-400">{user.streak}d</span>
                    </div>
                    <div className="px-4 py-2 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
                      <span className="text-xl font-black text-cyan-400">{user.xp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CNS Readiness & PvE Boss Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CNS Readiness Gauge */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Neural Biometrics</span>
                      <h3 className="text-lg font-black text-white mt-0.5">CNS Readiness</h3>
                    </div>
                    <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                  
                  <div className="py-6 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        <div className="text-center">
                          <span className="text-3xl font-black text-white">{100 - recoveryDebtPct}%</span>
                          <span className="text-[10px] text-emerald-400 block font-bold uppercase">Optimal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-center text-slate-400 bg-slate-950/60 py-2.5 rounded-xl border border-slate-800/60">
                    Recovery Debt is <span className="text-cyan-400 font-bold">{recoveryDebtPct}%</span>. Heavy load recommended.
                  </p>
                </div>

                {/* PvE Boss Battle Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-purple-950/20">
                  <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                          Weekly PvE Boss Battle
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">Global Raid Tier 3</span>
                      </div>
                      <span className="text-xs font-bold text-purple-400">Phase 1 / 3</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mt-3">The Iron Titan</h3>
                    <p className="text-xs text-slate-400 mt-1">Attack daily through workouts and food logging to deplete boss HP before weekly reset.</p>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-purple-300">Titan HP Remaining</span>
                        <span className="text-white">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
                        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Reward: <strong className="text-amber-400">+150 XP per strike</strong></span>
                    <button 
                      onClick={attackBoss}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <Sword className="h-4 w-4" /> Strike Boss Now
                    </button>
                  </div>
                </div>

              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Daily Step Count</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Footprints className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-3">{steps.toLocaleString()}</p>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Calorie Burn</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Flame className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-3">{activeCaloriesBurned} <span className="text-sm font-normal text-slate-400">kcal</span></p>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (activeCaloriesBurned / 2500) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Protein Progress</span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Utensils className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-3">{totalNutritionProtein} <span className="text-sm font-normal text-slate-400">/ 160g</span></p>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
                    <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (totalNutritionProtein / 160) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Workouts & Routine Guidelines</h1>
                  <p className="text-sm text-slate-400">Select professional templates or build custom routines.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={triggerHypeAudio}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center gap-2 transition-all"
                  >
                    <Volume2 className="h-4 w-4" />
                    Hype Mode
                  </button>
                  <button 
                    onClick={() => setWorkoutActive(!workoutActive)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                      workoutActive ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    {workoutActive ? `End Session (${formatTime(workoutTimer)})` : "Start Live Workout"}
                  </button>
                </div>
              </div>

              {hypeActive && (
                <div className="bg-cyan-950/60 border border-cyan-500/50 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                  <Volume2 className="h-5 w-5 text-cyan-400 animate-bounce" />
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">Apex Audio Motivator</span>
                    <p className="text-sm font-bold text-white">"{hypeMessage}"</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Routine Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comprehensiveWorkoutTemplates.map(template => (
                    <div key={template.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden">
                      {template.isProOnly && !user.isPro && (
                        <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Crown className="h-3 w-3" /> PRO EXCLUSIVE
                        </div>
                      )}
                      <div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                          {template.style}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-2">{template.title}</h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                          {template.guideline}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{template.exercises.length} Exercises</span>
                        <button 
                          onClick={() => loadRoutineTemplate(template)}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {template.isProOnly && !user.isPro ? "Unlock with Pro" : "Load Routine"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Nutrition & Visual Scanner</h1>
                  <p className="text-sm text-slate-400">Scan meals instantly with Google Visual AI or log manually.</p>
                </div>
                <button
                  onClick={triggerCameraScan}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  {user.isPro ? "Visual Scan (Unlimited)" : `Visual Scan (${2 - scanCount} free left)`}
                </button>
              </div>

              {cameraActive && (
                <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Camera className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{scanningStatus}</h3>
                    {scannedFoodResult ? (
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl max-w-md w-full space-y-2">
                        <p className="font-bold text-white">{scannedFoodResult.name}</p>
                        <p className="text-xs text-emerald-400">Macros: {scannedFoodResult.cals} kcal • {scannedFoodResult.protein}g Protein</p>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={confirmScannedFood}
                            className="flex-1 bg-emerald-500 text-slate-950 py-2 rounded-lg text-xs font-bold hover:bg-emerald-400"
                          >
                            Log Meal
                          </button>
                          <button 
                            onClick={() => setCameraActive(false)}
                            className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 animate-bounce">Analyzing plate...</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400 font-bold uppercase">Calories Consumed</span>
                  <p className="text-3xl font-black text-white mt-2">{totalNutritionCals} <span className="text-sm font-normal text-slate-400">kcal</span></p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400 font-bold uppercase">Protein Intake</span>
                  <p className="text-3xl font-black text-white mt-2">{totalNutritionProtein} <span className="text-sm font-normal text-slate-400">g</span></p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400 font-bold uppercase">Calorie Target</span>
                  <p className="text-3xl font-black text-emerald-400 mt-2">{netCalorieTarget} <span className="text-sm font-normal text-slate-400">kcal</span></p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Today's Log</h3>
                <div className="space-y-3">
                  {nutritionLog.map(item => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{item.mealType}</span>
                        <h5 className="font-bold text-white text-sm mt-1">{item.name}</h5>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{item.calories} kcal</p>
                        <p className="text-xs text-slate-400">{item.protein}g protein</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-amber-400" />
                    {user.league} League Tournament
                  </h1>
                  <p className="text-sm text-slate-400">Top 3 users get promoted to the next league at the end of the week. Bottom 2 face demotion.</p>
                </div>
                <div className="bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Time Remaining</span>
                  <span className="text-sm font-black text-white">2 Days 14 Hours</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Rank & Competitor</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Weekly XP</span>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {currentLeagueCohort.map(lb => (
                    <div key={lb.rank} className={`p-4 flex items-center justify-between ${lb.isUser ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          lb.rank === 1 ? "bg-amber-500 text-slate-950" : lb.rank === 2 ? "bg-slate-300 text-slate-950" : lb.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-300"
                        }`}>
                          #{lb.rank}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{lb.name}</span>
                          {lb.isPro && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                          {lb.rank <= 3 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Promotion Zone</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-400 text-sm">{lb.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white">Somatotype & Biometric Profile</h1>
                <p className="text-sm text-slate-400">Customize your physical profile and hormonal cycle tracking.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">User Profile Configuration</h3>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Name</label>
                    <input 
                      type="text" 
                      value={user.name}
                      onChange={e => setUser({...user, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={user.weightKg}
                      onChange={e => setUser({...user, weightKg: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Somatotype</label>
                    <select 
                      value={user.somatotype}
                      onChange={e => setUser({...user, somatotype: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ectomorph">Ectomorph</option>
                      <option value="mesomorph">Mesomorph</option>
                      <option value="endomorph">Endomorph</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">Hormonal & Cycle Tracking</h3>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Gender</label>
                    <select 
                      value={user.gender}
                      onChange={e => setUser({...user, gender: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {user.gender === "female" && (
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Menstrual Phase</label>
                      <select 
                        value={user.menstrualPhase}
                        onChange={e => setUser({...user, menstrualPhase: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="follicular">Follicular Phase</option>
                        <option value="ovulatory">Ovulatory Phase</option>
                        <option value="luteal">Luteal Phase</option>
                        <option value="menstrual">Menstrual Phase</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-6 flex flex-col h-[calc(100vh-12rem)]">
              <div>
                <h1 className="text-2xl font-black text-white">Apex AI Coach</h1>
                <p className="text-sm text-slate-400">Ask questions about your recovery debt, boss battles, and nutrition.</p>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-4 rounded-2xl text-sm ${
                        msg.role === 'user' ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="mt-4 flex gap-2 pt-3 border-t border-slate-800">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about recovery debt, boss battles, or scans..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 rounded-xl font-bold flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div className="text-center space-y-3">
                <div className="inline-flex h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 items-center justify-center text-amber-400">
                  <Crown className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black text-white">Unlock Apex Pro Club</h1>
                <p className="text-sm text-slate-400">Keep core workout and tracking 100% free. Upgrade only when you want superpowers.</p>
              </div>

              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden space-y-6">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-3">
                  {[
                    "Unlimited Google Visual Camera Food Scans",
                    "Advanced Biometric Recovery & Recovery Debt Forecasting",
                    "Exclusive AI Custom Routine Generator",
                    "Double XP Multiplier in Weekly Leagues & Boss Battles"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span className="text-sm text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setUser({...user, isPro: !user.isPro})}
                  className={`w-full py-4 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
                    user.isPro 
                      ? "bg-slate-800 text-amber-400 border border-amber-500/30" 
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  {user.isPro ? "PRO MEMBERSHIP ACTIVE (TOGGLE OFF)" : "START 7-DAY FREE TRIAL • $7.99/MO"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white">Connected Biometric Devices</h1>
                <p className="text-sm text-slate-400">Sync Apple Health, Garmin, Whoop, and smart scales.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Apple Health / Apple Watch", status: "Connected", battery: "84%", icon: Activity },
                  { name: "Whoop 4.0 Strap", status: "Ready to Pair", battery: "--", icon: Radio },
                  { name: "Garmin Fenix 7 Pro", status: "Connected", battery: "92%", icon: BatteryCharging },
                  { name: "Bluetooth Smart Scale", status: "Connected", battery: "78%", icon: Bluetooth }
                ].map((dev, idx) => {
                  const DevIcon = dev.icon;
                  return (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                          <DevIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{dev.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{dev.status} • Battery: {dev.battery}</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                        {dev.status === "Connected" ? "Synced" : "Pair"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

