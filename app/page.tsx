"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Volume2, ShieldAlert, Sword, MessageSquare, UserPlus, Smile
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "leaderboard" | "ai-coach" | "pro" | "biometrics" | "devices" | "social";

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

interface FriendItem {
  id: string;
  name: string;
  status: string;
  streak: number;
  avatarColor: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
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

  // Social & Friends State
  const [friends, setFriends] = useState<FriendItem[]>([
    { id: "f1", name: "Marcus T.", status: "Just crushed Leg Day 🔥", streak: 21, avatarColor: "from-emerald-500 to-cyan-500" },
    { id: "f2", name: "Elena R.", status: "Rest day recovery stretching", streak: 12, avatarColor: "from-purple-500 to-pink-500" },
    { id: "f3", name: "David K.", status: "Logging 10,000 steps sprint", streak: 8, avatarColor: "from-amber-500 to-orange-500" }
  ]);

  const [squadMessages, setSquadMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "Marcus T.", text: "Who is hitting heavy squats today? Let's get these reps in!", timestamp: "10:42 AM" },
    { id: "m2", sender: "Elena R.", text: "I'm doing mobility, but sending massive hype your way! ⚡", timestamp: "10:45 AM" }
  ]);
  const [squadInput, setSquadInput] = useState<string>("");

  // Leaderboard & Chat Hype Reactions State (Free Kinetic & Pro Holographic Emojis)
  const [hypeReactions, setHypeReactions] = useState<Record<string, string[]>>({
    "Marcus T.": ["⚡ CNS Surge", "🔥 Hyper-Burn"],
    "Elena R.": ["🛡️ Iron Shield"]
  });

  const freeFitnessEmojis = [
    { symbol: "🔥", name: "Hyper-Burn", category: "Standard Kinetic" },
    { symbol: "⚡", name: "CNS Shock", category: "Standard Kinetic" },
    { symbol: "💪", name: "Flex-Pulse", category: "Standard Kinetic" },
    { symbol: "🛡️", name: "Iron Shield", category: "Standard Kinetic" },
    { symbol: "🏃", name: "Sprint-Vector", category: "Standard Kinetic" },
    { symbol: "💧", name: "Hydration Drop", category: "Standard Kinetic" },
    { symbol: "🦍", name: "Primal Peak", category: "Standard Kinetic" },
    { symbol: "🎯", name: "Precision Lock", category: "Standard Kinetic" },
    { symbol: "🔋", name: "Battery Charge", category: "Standard Kinetic" },
    { symbol: "⚔️", name: "PvE Strike", category: "Standard Kinetic" }
  ];

  const proHolographicEmojis = [
    { symbol: "👑", name: "Titan Crown (3D Gold)", category: "Apex Pro" },
    { symbol: "🌌", name: "Quantum Aura", category: "Apex Pro" },
    { symbol: "⚡PRO", name: "God-Tier Voltage", category: "Apex Pro" },
    { symbol: "🏆", name: "League Overlord Trophy", category: "Apex Pro" }
  ];

  const sendHypeReaction = (targetName: string, reactionLabel: string, isProOnly: boolean = false) => {
    if (isProOnly && !user.isPro) {
      setActiveTab("pro");
      return;
    }
    setHypeReactions(prev => {
      const current = prev[targetName] || [];
      return { ...prev, [targetName]: [...current, reactionLabel] };
    });
    setUser(prev => ({ ...prev, xp: prev.xp + (isProOnly ? 50 : 25) }));
  };

  const handleSendSquadMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: `${user.name} (You)`,
      text: squadInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };
    setSquadMessages(prev => [...prev, newMsg]);
    setSquadInput("");
  };

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
              { id: "social", label: "Squad War Room & Friends", icon: Users },
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
                    <p className="text-xs text-slate-400 mt-1">Every workout rep and completed set inflicts raw physical damage to defeat the Boss before Monday reset.</p>
                    
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Boss HP Pool</span>
                        <span className="text-purple-300">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Strike boss with completed training sets (+150 XP)</span>
                    <button 
                      onClick={attackBoss}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-950/50"
                    >
                      <Sword className="h-4 w-4" /> Strike Boss (-1,250 HP)
                    </button>
                  </div>
                </div>

              </div>

              {/* Quick Actions & Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Daily Step Vector</span>
                    <h4 className="text-xl font-black text-white mt-0.5">{steps.toLocaleString()} <span className="text-xs font-normal text-emerald-400">steps</span></h4>
                  </div>
                  <Footprints className="h-8 w-8 text-emerald-400/80" />
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Calorie Burn</span>
                    <h4 className="text-xl font-black text-white mt-0.5">{activeCaloriesBurned.toLocaleString()} <span className="text-xs font-normal text-amber-400">kcal</span></h4>
                  </div>
                  <Flame className="h-8 w-8 text-amber-400/80" />
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Audio Hype Mode</span>
                    <h4 className="text-sm font-bold text-cyan-400 mt-1">Neural Voice Ready</h4>
                  </div>
                  <button 
                    onClick={triggerHypeAudio}
                    className="h-10 w-10 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-all shadow-lg shadow-cyan-950/30"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {hypeActive && (
                <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
                  <Volume2 className="h-6 w-6 text-cyan-400 animate-bounce" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Apex Hype Audio Broadcast</span>
                    <p className="text-sm font-bold text-white">"{hypeMessage}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                      Training Execution Deck
                    </span>
                    <h2 className="text-2xl font-black text-white mt-2">Active Workout & Guidelines</h2>
                    <p className="text-sm text-slate-400 mt-1">Execute your customized compound movements with real-time timers and strict form guidelines.</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Timer</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">{formatTime(workoutTimer)}</span>
                    </div>
                    <button
                      onClick={() => setWorkoutActive(!workoutActive)}
                      className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                        workoutActive 
                          ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 shadow-red-950/50" 
                          : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-950/50"
                      }`}
                    >
                      {workoutActive ? "Pause Session" : "Start Session"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Routine Templates Selector */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Select Training Protocol</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comprehensiveWorkoutTemplates.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => loadRoutineTemplate(template)}
                      className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                            {template.style}
                          </span>
                          {template.isProOnly && (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Crown className="h-3 w-3" /> Pro Only
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base mt-3 group-hover:text-emerald-400 transition-colors">{template.title}</h4>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{template.guideline}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>{template.exercises.length} Movements</span>
                        <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Load Routine <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Exercise List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Active Routine Exercises</h3>
                  </div>
                  <span className="text-xs text-slate-400">{exercises.filter(e => e.completed).length} / {exercises.length} Completed</span>
                </div>

                <div className="space-y-3">
                  {exercises.map(ex => (
                    <div key={ex.id} className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      ex.completed ? "bg-emerald-950/10 border-emerald-500/30 text-slate-300" : "bg-slate-950/60 border-slate-800/80 text-slate-100"
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">{ex.category}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-400 font-mono">MET: {ex.metValue}</span>
                        </div>
                        <h4 className="font-bold text-base mt-0.5">{ex.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">Target: <strong className="text-slate-200">{ex.defaultSets}</strong> at <strong className="text-emerald-400">{ex.defaultWeight}</strong></p>
                      </div>

                      <button
                        onClick={() => {
                          setExercises(exercises.map(item => item.id === ex.id ? { ...item, completed: !item.completed } : item));
                          if (!ex.completed) setUser(prev => ({ ...prev, xp: prev.xp + 50 }));
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          ex.completed 
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50" 
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {ex.completed ? "Completed" : "Mark Complete"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                      AI Computer Vision Nutrition
                    </span>
                    <h2 className="text-2xl font-black text-white mt-2">Nutrition & Camera Scanner</h2>
                    <p className="text-sm text-slate-400 mt-1">Scan your plates instantly using visual AI or log macronutrients precisely to match your goals.</p>
                  </div>

                  <button
                    onClick={triggerCameraScan}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-cyan-950/50"
                  >
                    <Camera className="h-4 w-4" /> Scan Meal with Camera
                  </button>
                </div>
              </div>

              {cameraActive && (
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 text-center space-y-4">
                  <div className="h-48 w-full bg-slate-950 rounded-2xl border border-dashed border-cyan-500/40 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                    <Camera className="h-10 w-10 text-cyan-400 mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-cyan-300">{scanningStatus}</p>
                  </div>

                  {scannedFoodResult && (
                    <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">AI Recognition Match</span>
                        <h4 className="font-bold text-white text-base">{scannedFoodResult.name}</h4>
                        <p className="text-xs text-slate-400">{scannedFoodResult.cals} kcal • {scannedFoodResult.protein}g Protein</p>
                      </div>
                      <button
                        onClick={confirmScannedFood}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-lg"
                      >
                        Add to Log
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Macro Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Calories Logged</span>
                  <h4 className="text-2xl font-black text-white mt-1">{totalNutritionCals} <span className="text-xs font-normal text-slate-400">/ {netCalorieTarget} kcal</span></h4>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Protein Intake</span>
                  <h4 className="text-2xl font-black text-emerald-400 mt-1">{totalNutritionProtein}g <span className="text-xs font-normal text-slate-400">/ 160g target</span></h4>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Primary Goal</span>
                  <h4 className="text-lg font-black text-amber-400 mt-1 uppercase">{user.primaryGoal}</h4>
                </div>
              </div>

              {/* Nutrition Log List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-white">Today's Meal Log</h3>
                <div className="space-y-3">
                  {nutritionLog.map(item => (
                    <div key={item.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 uppercase">{item.mealType}</span>
                        <h4 className="font-bold text-white text-sm mt-1.5">{item.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white text-sm">{item.calories} kcal</span>
                        <span className="text-xs text-emerald-400 block font-semibold">{item.protein}g Protein</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 lg:p-8">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                  Competitive Biometric League
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{user.league} League Cohort</h2>
                <p className="text-sm text-slate-400 mt-1">Rank in the top 3 by Sunday midnight to secure promotion into the next tier.</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
                {currentLeagueCohort.map(competitor => (
                  <div key={competitor.rank} className={`p-4 rounded-2xl border flex items-center justify-between ${
                    competitor.isUser 
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/30" 
                      : "bg-slate-950/60 border-slate-800/80 text-slate-200"
                  }`}>
                    <div className="flex items-center gap-4">
                      <span className={`h-8 w-8 rounded-xl font-black text-xs flex items-center justify-center ${
                        competitor.rank === 1 ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50" :
                        competitor.rank === 2 ? "bg-slate-300 text-slate-950" :
                        competitor.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        #{competitor.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          {competitor.name}
                          {competitor.isPro && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                        </h4>
                        <span className="text-xs text-slate-400">Weekly XP Earned</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-cyan-400 text-sm">{competitor.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                      Squad War Room & Emoji Economy
                    </span>
                    <h2 className="text-2xl font-black text-white mt-2">Active Friends & Kinetic Hypes</h2>
                    <p className="text-sm text-slate-400 mt-1">Send free biometric reactions or unlock high-tier holographic Pro badges.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-950/50">
                    <UserPlus className="h-4 w-4" /> Add Friend
                  </button>
                </div>
              </div>

              {/* Friends Activity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {friends.map(friend => (
                  <div key={friend.id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${friend.avatarColor} flex items-center justify-center font-black text-slate-950`}>
                            {friend.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{friend.name}</h4>
                            <span className="text-xs text-amber-400 font-semibold">{friend.streak} Day Streak 🔥</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 italic">
                        "{friend.status}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Quick Kinetic Hypes (Free)</span>
                      <div className="flex flex-wrap gap-1">
                        {freeFitnessEmojis.slice(0, 4).map((emo, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendHypeReaction(friend.name, `${emo.symbol} ${emo.name}`)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold transition-all border border-slate-700"
                            title={emo.name}
                          >
                            {emo.symbol}
                          </button>
                        ))}
                      </div>

                      <span className="text-[10px] uppercase font-bold text-amber-400 block pt-1">Apex Pro Holographic</span>
                      <div className="flex flex-wrap gap-1">
                        {proHolographicEmojis.slice(0, 2).map((emo, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendHypeReaction(friend.name, `${emo.symbol} ${emo.name}`, true)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs rounded-lg font-semibold transition-all border border-amber-500/30 flex items-center gap-1"
                            title={emo.name}
                          >
                            <span>{emo.symbol}</span>
                            {!user.isPro && <Lock className="h-2.5 w-2.5 text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {hypeReactions[friend.name] && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-800/50">
                        {hypeReactions[friend.name].map((rx, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20 font-medium">
                            {rx}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Squad Chat Stream */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Squad Tactical Chat</h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> 3 Online
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                  {squadMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">{msg.sender}</span>
                        <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm max-w-md ${
                        msg.isUser 
                          ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none" 
                          : "bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendSquadMessage} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={squadInput}
                    onChange={(e) => setSquadInput(e.target.value)}
                    placeholder="Broadcast hype or training tips to your squad..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50">
                    <Send className="h-4 w-4" /> Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Biometric Profile & Somatotype</h2>
                  <p className="text-sm text-slate-400 mt-1">Configure your physiological parameters to let the Apex AI engine customize your caloric targets and training volume.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-400">Somatotype Classification</label>
                    <select
                      value={user.somatotype}
                      onChange={(e: any) => setUser({ ...user, somatotype: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="mesomorph">Mesomorph (Athletic / Muscular)</option>
                      <option value="ectomorph">Ectomorph (Lean / Fast Metabolism)</option>
                      <option value="endomorph">Endomorph (Solid / Tendency to Store Fat)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-400">Primary Objective</label>
                    <select
                      value={user.primaryGoal}
                      onChange={(e: any) => setUser({ ...user, primaryGoal: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="muscle-gain">Muscle Hypertrophy (Bulk)</option>
                      <option value="fat-loss">Fat Loss / Shred</option>
                      <option value="recomposition">Body Recomposition</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-400">Hormonal Cycle Tracking</label>
                    <select
                      value={user.menstrualPhase}
                      onChange={(e: any) => setUser({ ...user, menstrualPhase: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="follicular">Follicular Phase (High Energy)</option>
                      <option value="ovulatory">Ovulatory Phase (Peak Strength)</option>
                      <option value="luteal">Luteal Phase (Recovery Focus)</option>
                      <option value="menstrual">Menstrual Phase (Rest & Mobility)</option>
                      <option value="n/a">N/A / Male / Non-Applicable</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-400">Body Weight (kg)</label>
                    <input
                      type="number"
                      value={user.weightKg}
                      onChange={(e) => setUser({ ...user, weightKg: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col h-[600px]">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <Bot className="h-6 w-6 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-base">Apex AI Neural Coach</h3>
                    <p className="text-xs text-slate-400">Trained on biometric telemetry, recovery debt, and exercise science.</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.role === 'user' ? "items-end" : "items-start"}`}>
                      <div className={`p-4 rounded-2xl text-sm max-w-xl ${
                        msg.role === 'user' 
                          ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-emerald-950/30" 
                          : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="pt-4 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your lifts, recovery score, or meal plan..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50">
                    <Send className="h-4 w-4" /> Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-8 overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 max-w-xl">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                    Apex Pro Club Membership
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-black text-white mt-3">Unlock Maximum Kinetic Potential</h2>
                  <p className="text-sm text-slate-300 mt-2">Get unlimited AI visual plate scanning, holographic Pro emojis, adaptive hormonal training routines, and priority league matchmaking.</p>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={() => setUser(prev => ({ ...prev, isPro: !prev.isPro }))}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-amber-950/50"
                    >
                      {user.isPro ? "Manage Pro Membership" : "Upgrade to Apex Pro ($14.99/mo)"}
                    </button>
                    <span className="text-xs text-amber-400 font-bold">7-Day Free Trial Available</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Connected Biometric Hardware</h2>
                  <p className="text-sm text-slate-400 mt-1">Sync your smartwatch, smart ring, or chest strap to feed real-time telemetry into Apex State OS.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bluetooth className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Apple Watch Ultra / Whoop 4.0</h4>
                        <span className="text-xs text-emerald-400 font-semibold">Connected & Streaming HR</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg">Active</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Radio className="h-6 w-6 text-slate-500" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Garmin HRM-Pro Plus</h4>
                        <span className="text-xs text-slate-400">Ready to Pair</span>
                      </div>
                    </div>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
