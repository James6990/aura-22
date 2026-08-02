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

  // Smartwatch telemetry states
  const [watchConnected, setWatchConnected] = useState<boolean>(true);
  const [watchHeartRate, setWatchHeartRate] = useState<number>(132);

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
                    <p className="text-xs text-slate-300 mt-1">
                      Complete workouts, log meals, and log steps to deal massive damage and earn bonus XP!
                    </p>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Boss HP Remaining</span>
                        <span className="text-purple-400 font-mono">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP</span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Reward Pool:</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                        +1,000 XP & Titanium Badge
                      </span>
                    </div>
                    <button
                      onClick={attackBoss}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-950/50 hover:scale-105"
                    >
                      <Sword className="h-4 w-4" /> Strike Boss (-1,250 HP)
                    </button>
                  </div>
                </div>

              </div>

              {/* Quick Telemetry Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Steps</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{steps.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Goal: 10,000 steps</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Calories</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{activeCaloriesBurned}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">BMR + NEAT + Exercise</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nutrition Logged</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{totalNutritionCals} kcal</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{totalNutritionProtein}g Protein</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Phase</span>
                  <div className="text-2xl font-black text-pink-400 mt-1 capitalize">{user.menstrualPhase}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Day {user.cycleDay} of 28</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                    AI Workout Generator & Timer
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">Active Training Protocol</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Tailored for your <strong className="text-emerald-400">{user.somatotype}</strong> somatotype and <strong className="text-emerald-400">{user.primaryGoal}</strong> goal.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Timer</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{formatTime(workoutTimer)}</span>
                  </div>
                  <button 
                    onClick={() => setWorkoutActive(!workoutActive)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                      workoutActive 
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-950/50" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-950/50"
                    }`}
                  >
                    {workoutActive ? "Pause Timer" : "Start Session"}
                  </button>
                </div>
              </div>

              {/* Audio Hype Assistant Banner */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Volume2 className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Apex Audio Hype Assistant</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{hypeMessage}</p>
                  </div>
                </div>
                <button
                  onClick={triggerHypeAudio}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Zap className="h-3.5 w-3.5 text-cyan-400" /> Trigger Hype Boost
                </button>
              </div>

              {/* Workout Routine Template Selector */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Select Training Routine Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comprehensiveWorkoutTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                            {template.style}
                          </span>
                          {template.isProOnly && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Crown className="h-3 w-3" /> Pro
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base">{template.title}</h4>
                        <p className="text-xs text-slate-400 mt-2">{template.guideline}</p>
                      </div>

                      <button
                        onClick={() => loadRoutineTemplate(template)}
                        className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700/80"
                      >
                        {template.isProOnly && !user.isPro ? "Unlock with Pro" : "Load Routine"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Exercise List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-bold text-white">Today's Exercises</h3>
                {exercises.map(ex => (
                  <div key={ex.id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{ex.category}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">MET: {ex.metValue}</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-0.5">{ex.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Target: {ex.defaultSets} | Load: {ex.defaultWeight}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setExercises(prev => prev.map(item => item.id === ex.id ? { ...item, completed: !item.completed } : item));
                          setUser(prev => ({ ...prev, xp: prev.xp + 50 }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                          ex.completed 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        }`}
                      >
                        {ex.completed ? "Completed (+50 XP)" : "Mark Complete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                    AI Visual Camera Scanner & Macros
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">Nutrition Telemetry</h2>
                  <p className="text-sm text-slate-400 mt-1">Scan your plate instantly with Google Visual AI or log your meals manually.</p>
                </div>

                <button
                  onClick={triggerCameraScan}
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-slate-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-950/50"
                >
                  <Camera className="h-4 w-4" /> Open Camera Scanner
                </button>
              </div>

              {/* Camera Scanner Simulation Modal */}
              {cameraActive && (
                <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/40 mx-auto flex items-center justify-center">
                    <Camera className="h-8 w-8 text-teal-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-white">{scanningStatus}</h3>

                  {scannedFoodResult ? (
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl max-w-md mx-auto text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">{scannedFoodResult.name}</h4>
                        <span className="text-emerald-400 font-bold text-sm">{scannedFoodResult.cals} kcal</span>
                      </div>
                      <p className="text-xs text-slate-400">Estimated Protein: <strong className="text-slate-200">{scannedFoodResult.protein}g</strong></p>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={confirmScannedFood}
                          className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all"
                        >
                          Confirm & Log Meal
                        </button>
                        <button
                          onClick={() => setCameraActive(false)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                        >
                          Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 animate-pulse">Position plate in frame...</p>
                  )}
                </div>
              )}

              {/* Nutrition Log Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nutritionLog.map(item => (
                  <div key={item.id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                        {item.mealType}
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">{item.calories} kcal</span>
                    </div>
                    <h4 className="font-bold text-white text-base">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>Protein: <strong className="text-slate-200">{item.protein}g</strong></span>
                      <span>Carbs: <strong className="text-slate-200">{item.carbs}g</strong></span>
                      <span>Fats: <strong className="text-slate-200">{item.fats}g</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-3xl">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                  {user.league} League Cohort
                </span>
                <h2 className="text-2xl font-black text-white mt-2">Global Weekly Rankings</h2>
                <p className="text-sm text-slate-400 mt-1">Top 3 athletes get promoted to the next league tier at the end of the weekly cycle.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden">
                {currentLeagueCohort.map(u => (
                  <div 
                    key={u.rank} 
                    className={`flex items-center justify-between p-4 border-b border-slate-800/80 last:border-0 ${
                      u.isUser ? "bg-emerald-500/10 border-l-4 border-l-emerald-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-black w-6 text-center ${u.rank <= 3 ? "text-amber-400" : "text-slate-400"}`}>
                        #{u.rank}
                      </span>
                      <span className="font-bold text-white text-sm">{u.name}</span>
                      {u.isPro && (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="font-black text-emerald-400 text-sm">{u.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div>
                <h2 className="text-2xl font-black text-white">Somatotype & Biometric Profile</h2>
                <p className="text-xs text-slate-400">Configure your physiological parameters for AI calibration.</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={e => setUser({ ...user, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Somatotype</label>
                  <select
                    value={user.somatotype}
                    onChange={e => setUser({ ...user, somatotype: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ectomorph">Ectomorph (Lean / Hard Gainer)</option>
                    <option value="mesomorph">Mesomorph (Athletic / Muscular)</option>
                    <option value="endomorph">Endomorph (Robust / Sturdy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Primary Goal</label>
                  <select
                    value={user.primaryGoal}
                    onChange={e => setUser({ ...user, primaryGoal: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="muscle-gain">Muscle Gain (Hypertrophy)</option>
                    <option value="fat-loss">Fat Loss & Shredding</option>
                    <option value="recomposition">Body Recomposition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Menstrual Cycle Phase</label>
                  <select
                    value={user.menstrualPhase}
                    onChange={e => setUser({ ...user, menstrualPhase: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="follicular">Follicular (High Energy / Strength Peak)</option>
                    <option value="ovulatory">Ovulatory (Peak Estrogen)</option>
                    <option value="luteal">Luteal (Progesterone Elevation)</option>
                    <option value="menstrual">Menstrual (Rest & Recovery)</option>
                    <option value="n/a">N/A</option>
                  </select>
                </div>

                <button
                  onClick={() => alert("Biometrics successfully updated!")}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 mt-2"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-4 flex flex-col h-[calc(100vh-160px)]">
              <div>
                <h2 className="text-2xl font-black text-white">Apex Neural AI Coach</h2>
                <p className="text-xs text-slate-400">Ask questions regarding your hypertrophy split, macros, or recovery debt.</p>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? "bg-emerald-500 text-slate-950 font-bold rounded-tr-none" 
                        : "bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask Apex AI Coach..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition-all">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto py-4 text-center">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                Apex Pro Club
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Unlock Full Biometric Supremacy</h2>
              <p className="text-sm text-slate-400">
                Get unlimited AI camera scans, custom biometric periodization, and exclusive holographic reactions.
              </p>

              <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-8 text-left space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-xl">Apex Pro Annual Pass</h3>
                  <span className="text-2xl font-black text-amber-400">$9.99 <span className="text-xs font-normal text-slate-400">/mo</span></span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Unlimited AI Camera Plate Scans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Advanced Hormonal Cycle & Somatotype AI Adjustment</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Exclusive Holographic Squad Emojis & Badges</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Priority PvE Boss Battle Raid Rewards (+50% XP)</li>
                </ul>
                <button
                  onClick={() => {
                    setUser({ ...user, isPro: true });
                    setActiveTab("dashboard");
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/50 mt-2"
                >
                  {user.isPro ? "Apex Pro Already Active!" : "Activate Apex Pro Pass"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div>
                <h2 className="text-2xl font-black text-white">Connected Biometric Hardware</h2>
                <p className="text-xs text-slate-400">Sync Apple Watch, Whoop, Oura Ring, or smart scales via Bluetooth LE.</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Bluetooth className="h-6 w-6 text-cyan-400 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Apple Watch Series 9</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">Connected • Heart Rate {watchHeartRate} BPM</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Syncing active</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Radio className="h-6 w-6 text-slate-500" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Whoop Strap 4.0</h4>
                      <span className="text-[10px] text-slate-400">Ready to Pair</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all">
                    Pair Device
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


