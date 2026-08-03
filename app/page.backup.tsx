"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Volume2, ShieldAlert, Sword, Eye, Mic, Layers, Smile, UserPlus
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "bloodline" | "leaderboard" | "ai-coach" | "biometrics" | "devices" | "badges" | "social" | "pro" | "family-hub";

type UserArchetype = "bodybuilder" | "fatloss" | "athlete" | "endurance" | "vitality";
type DietaryRestriction = "standard" | "plant-based" | "gluten-free" | "keto" | "dairy-free";
type LeagueTier = "Pawn" | "Scout" | "Gladiator" | "Centurion" | "Spartan" | "Titan" | "Warlord" | "Immortal" | "Mythic Iron" | "Apex Colosseum Sovereign";

interface FamilyMember {
  id: string;
  name: string;
  archetype: string;
  streak: number;
  activeToday: boolean;
}

interface UserProfile {
  name: string;
  isPro: boolean;
  isFamilyManager: boolean;
  familySlotsTotal: number;
  familyMembers: FamilyMember[];
  xp: number;
  streak: number;
  weightKg: number;
  archetype: UserArchetype;
  dietaryRestriction: DietaryRestriction;
  somatotype: "ectomorph" | "mesomorph" | "endomorph";
  primaryGoal: "muscle-gain" | "fat-loss" | "recomposition";
  gender: "male" | "female" | "other";
  menstrualPhase: "follicular" | "ovulatory" | "luteal" | "menstrual" | "n/a";
  cycleDay: number;
  league: LeagueTier;
  leagueRank: number;
  streakShieldActive: boolean;
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

interface NutritionItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  claimed: boolean;
  xpReward: number;
  iconName: string;
}

interface SquadMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
}

export default function ApexStateOS() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  // Accessibility & Cognitive Toggles
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceLogActive, setVoiceLogActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("Listening for voice commands (e.g., 'Log 500ml water' or 'Log cardio')...");

  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apex_user_profile_v4");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return {
      name: "Alex Vance",
      isPro: false,
      isFamilyManager: true,
      familySlotsTotal: 5,
      familyMembers: [
        { id: "f1", name: "Valerie Vance", archetype: "bodybuilder", streak: 18, activeToday: true },
        { id: "f2", name: "Kurosh_X", archetype: "athlete", streak: 12, activeToday: false }
      ],
      xp: 2840,
      streak: 14,
      weightKg: 75,
      archetype: "bodybuilder",
      dietaryRestriction: "standard",
      somatotype: "mesomorph",
      primaryGoal: "muscle-gain",
      gender: "female",
      menstrualPhase: "follicular",
      cycleDay: 8,
      league: "Titan",
      leagueRank: 4,
      streakShieldActive: true
    };
  });

  const [steps, setSteps] = useState<number>(8920);
  const baseCaloriesBurned = 1850;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

  // Boss Battle State (PvE)
  const [bossHp, setBossHp] = useState<number>(34200);
  const bossMaxHp = 50000;

  // Recovery Debt State & Pacing Safeguards
  const [recoveryDebtPct, setRecoveryDebtPct] = useState<number>(38);
  const [pacingSafeguardEnabled, setPacingSafeguardEnabled] = useState<boolean>(true);

  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { id: 1, name: "Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "90kg", completed: false },
    { id: 2, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "120kg", completed: false },
    { id: 3, name: "Weighted Pull-Ups", category: "Strength", metValue: 8.0, defaultSets: "3 sets × 8 reps", defaultWeight: "Bodyweight + 15kg", completed: false }
  ]);

  const [nutritionLog, setNutritionLog] = useState<NutritionItem[]>([
    { id: 301, name: "Oatmeal with Whey Protein & Berries", calories: 450, protein: 35, carbs: 55, fats: 8, mealType: "Breakfast" },
    { id: 302, name: "Grilled Chicken Breast & Jasmine Rice", calories: 620, protein: 50, carbs: 65, fats: 10, mealType: "Lunch" }
  ]);

  // Badges System State
  const [badges, setBadges] = useState<BadgeItem[]>([
    { id: "iron-goliath", title: "Iron Goliath", description: "Inflict over 10,000 total damage to Raid Bosses.", unlocked: true, claimed: false, xpReward: 500, iconName: "Sword" },
    { id: "macro-master", title: "Macro Master", description: "Successfully log custom meals for 7 consecutive days.", unlocked: true, claimed: true, xpReward: 300, iconName: "Utensils" },
    { id: "bloodline-sentinel", title: "Bloodline Sentinel", description: "Maintain a 14-day training streak with zero recovery debt penalties.", unlocked: true, claimed: false, xpReward: 750, iconName: "Shield" }
  ]);

  // Squad / Social Feed State
  const [squadMessages, setSquadMessages] = useState<SquadMessage[]>([
    { id: 1, sender: "Valerie Vance", text: "Just hit a new PR on deadlifts! 160kg locked in 🔥", timestamp: "10m ago" },
    { id: 2, sender: "Kurosh_X", text: "Completed the morning cardio session. Raid boss HP is dropping fast!", timestamp: "45m ago" }
  ]);
  const [squadInput, setSquadInput] = useState<string>("");

  // AI Coach Chat State
  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Welcome back, ${user.name}! Your Recovery Debt is ${recoveryDebtPct}%. Pacing safeguards are active to protect your CNS.` }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_user_profile_v4", JSON.stringify(user));
    }
  }, [user]);

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

  const claimBadgeXP = (badgeId: string, reward: number) => {
    setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, claimed: true } : b));
    setUser(prev => ({ ...prev, xp: prev.xp + reward }));
  };

  const triggerVoiceLogSimulation = () => {
    setVoiceLogActive(true);
    setVoiceTranscript("Listening... Say 'Log water' or 'Log 30m cardio'");
    setTimeout(() => {
      setVoiceTranscript("Recognized command: 'Logged 500ml Water & +200 XP Cardio Session!'");
      setUser(prev => ({ ...prev, xp: prev.xp + 200 }));
      setNutritionLog(prev => [...prev, {
        id: Date.now(),
        name: "Hydration Boost (Voice Log)",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        mealType: "Snack"
      }]);
      setTimeout(() => setVoiceLogActive(false), 2500);
    }, 2000);
  };

  const generateDynamicMealPlan = () => {
    let sampleMeal = { name: "Adaptive Grilled Chicken & Rice", cals: 650, protein: 45, carbs: 60, fats: 12 };
    
    if (user.dietaryRestriction === "plant-based") {
      sampleMeal = { name: "Organic Tofu & Quinoa Power Bowl", cals: 580, protein: 38, carbs: 65, fats: 14 };
    } else if (user.dietaryRestriction === "keto") {
      sampleMeal = { name: "Avocado, Macadamia & Salmon Skillet", cals: 710, protein: 42, carbs: 8, fats: 55 };
    } else if (user.dietaryRestriction === "gluten-free") {
      sampleMeal = { name: "Lean Grass-Fed Beef & Sweet Potato Mash", cals: 620, protein: 48, carbs: 50, fats: 15 };
    }

    if (user.archetype === "fatloss") {
      sampleMeal.cals -= 150;
    } else if (user.archetype === "endurance") {
      sampleMeal.carbs += 25;
    }

    setNutritionLog(prev => [...prev, {
      id: Date.now(),
      name: `[AI ${user.archetype.toUpperCase()}] ${sampleMeal.name}`,
      calories: sampleMeal.cals,
      protein: sampleMeal.protein,
      carbs: sampleMeal.carbs,
      fats: sampleMeal.fats,
      mealType: "Lunch"
    }]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let aiReply = `Analyzing your ${user.archetype} protocol with ${user.dietaryRestriction} nutrition parameters. Everything looks optimal.`;
      if (userText.toLowerCase().includes("recovery") || userText.toLowerCase().includes("debt")) {
        aiReply = `Your Recovery Debt is at ${recoveryDebtPct}%. Because pacing safeguards are ${pacingSafeguardEnabled ? 'active' : 'disabled'}, your training load is dynamically regulated.`;
      } else if (userText.toLowerCase().includes("family") || userText.toLowerCase().includes("bloodline")) {
        aiReply = `Your Bloodline Family Pass is active with ${user.familyMembers.length} members linked. The 20% XP squad multiplier is fully engaged!`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    }, 1000);
  };

  const handleSendSquadMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadInput.trim()) return;
    setSquadMessages(prev => [...prev, {
      id: Date.now(),
      sender: `${user.name} (You)`,
      text: squadInput,
      timestamp: "Just now"
    }]);
    setSquadInput("");
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors duration-300 ${
      highContrast 
        ? "bg-black text-yellow-300" 
        : focusMode 
          ? "bg-slate-950 text-slate-200" 
          : "bg-slate-950 text-slate-100"
    }`}>
      
      {/* ARIA Landmark Header & Navigation */}
      <header role="banner" className={`border-b sticky top-0 z-50 px-6 py-3 flex items-center justify-between backdrop-blur-md ${
        highContrast ? "bg-black border-yellow-500/50" : "bg-slate-900/80 border-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div 
            tabIndex={0} 
            aria-label="Apex State OS Logo"
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-950/50 focus:ring-4 focus:ring-emerald-400"
          >
            AX
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              APEX STATE OS
            </span>
            <p className="text-xs text-slate-400">Accessible Gamified Biometric Fitness Engine</p>
          </div>
        </div>

        {/* Global Accessibility Controls Bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFocusMode(!focusMode)}
            aria-label="Toggle ADHD Focus Mode"
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] min-w-[44px] flex items-center gap-1.5 ${
              focusMode ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
          >
            <Eye className="h-4 w-4" /> {focusMode ? "Focus Mode ON" : "Focus Mode"}
          </button>

          <button 
            onClick={() => setHighContrast(!highContrast)}
            aria-label="Toggle High Contrast Mode"
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] min-w-[44px] flex items-center gap-1.5 ${
              highContrast ? "bg-yellow-400 text-black border-yellow-300" : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            <Sparkles className="h-4 w-4" /> High Contrast
          </button>

          <button 
            onClick={() => setActiveTab("pro")} 
            aria-label="Go to Pro Membership"
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all min-h-[44px]"
          >
            <Crown className="h-4 w-4 text-amber-400" />
            {user.isPro ? "PRO ACTIVE" : "GO PRO"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Expanded 12-Tab Sidebar Navigation */}
        <aside role="navigation" aria-label="Main App Modules" className="w-full lg:w-72 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0 bg-slate-950/60">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workouts & Pacing", icon: Dumbbell },
              { id: "diet", label: "Nutrition & AI Engine", icon: Utensils },
              { id: "bloodline", label: "Bloodline Squads", icon: Users },
              { id: "family-hub", label: "Family Pass Hub", icon: Shield },
              { id: "leaderboard", label: `${user.league} Arena`, icon: Trophy },
              { id: "biometrics", label: "Somatotype & Profile", icon: Calendar },
              { id: "badges", label: "Milestones & Badges", icon: Award },
              { id: "social", label: "Squad Comms", icon: Globe },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
              { id: "devices", label: "Connected Wearables", icon: Bluetooth },
              { id: "pro", label: "Apex Pro Club", icon: Crown }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap min-h-[44px] focus:ring-2 focus:ring-emerald-400 ${
                    isActive 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/50 font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Voice-First Logging Widget inside Sidebar */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hidden lg:block">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
              <Mic className="h-3 w-3" /> Voice-First Engine
            </span>
            <p className="text-xs text-slate-300 mb-3">Hands-free control for motor impairments.</p>
            <button 
              onClick={triggerVoiceLogSimulation}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all min-h-[44px]"
            >
              {voiceLogActive ? "Listening..." : "Trigger Voice Command"}
            </button>
            <p className="text-[10px] text-slate-400 mt-2 italic">{voiceTranscript}</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main role="main" className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* ================= 1. OVERVIEW / DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {!focusMode && (
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl">
                  <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                        <Sparkles className="h-3.5 w-3.5" /> Archetype: <span className="uppercase text-white">{user.archetype}</span>
                      </div>
                      <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">{user.name}</h1>
                      <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2">
                        <span>Colosseum Tier: <strong className="text-amber-400">{user.league} Arena</strong></span>
                        <span>•</span>
                        <span>Streak: <strong className="text-amber-400">{user.streak} Days 🔥</strong></span>
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
              )}

              {/* CNS Readiness & Raid Boss */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recovery Debt & Pacing Safeguard */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Cognitive & Physical Load</span>
                      <h3 className="text-lg font-black text-white mt-0.5">Recovery Debt</h3>
                    </div>
                    <ShieldAlert className="h-5 w-5 text-emerald-400" />
                  </div>
                  
                  <div className="py-6 text-center">
                    <span className="text-4xl font-black text-white">{recoveryDebtPct}%</span>
                    <span className="text-xs text-slate-400 block mt-1">Fatigue Safeguard Active</span>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Auto-Scale Intensity</span>
                      <button 
                        onClick={() => setPacingSafeguardEnabled(!pacingSafeguardEnabled)}
                        className={`px-3 py-1 rounded-lg font-bold min-h-[32px] ${pacingSafeguardEnabled ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}
                      >
                        {pacingSafeguardEnabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Protects chronic fatigue or injury recovery by lowering volume targets.</p>
                  </div>
                </div>

                {/* Goliath Raid Boss (PvE) */}
                {!focusMode && (
                  <div className="lg:col-span-2 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                          Weekly PvE Boss Battle
                        </span>
                        <span className="text-xs font-bold text-purple-400">Goliath Engine Tier 3</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-3">Goliath of Tartarus</h3>
                      <p className="text-xs text-slate-400 mt-1">Check off workout tasks and log steps to deal structural damage.</p>
                    </div>

                    <div className="space-y-3 py-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase">Boss HP Pool</span>
                        <span className="text-lg font-black text-rose-400">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP</span>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-800 h-4 rounded-full overflow-hidden p-0.5">
                        <div className="bg-gradient-to-r from-rose-600 to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <button 
                        onClick={attackBoss}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold px-6 py-3 rounded-2xl text-sm min-h-[44px] flex items-center justify-center gap-2"
                      >
                        <Sword className="h-4 w-4" /> Strike Boss Now (+150 XP)
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ================= 2. WORKOUT & PACING ================= */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Progressive Overload & Pacing</span>
                  <h1 className="text-2xl font-black text-white mt-1">Daily Workout Matrix</h1>
                  <p className="text-xs text-slate-400 mt-1">Volume is dynamically scaled based on your Recovery Debt ({recoveryDebtPct}%).</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800">
                  <Clock className="h-5 w-5 text-emerald-400 animate-spin" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Timer</span>
                    <span className="text-lg font-black text-white">{formatTime(workoutTimer)}</span>
                  </div>
                  <button 
                    onClick={() => setWorkoutActive(!workoutActive)}
                    className={`ml-3 px-4 py-2 rounded-xl text-xs font-bold min-h-[44px] ${workoutActive ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-emerald-500 text-slate-950"}`}
                  >
                    {workoutActive ? "Pause" : "Start"}
                  </button>
                </div>
              </div>

              {/* Active Exercise List with High Target Tap Zones */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-white text-lg">Active Set Checklist</h3>
                <div className="space-y-3">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            const updated = exercises.map(item => item.id === ex.id ? {...item, completed: !item.completed} : item);
                            setExercises(updated);
                            if (!ex.completed) {
                              setUser(prev => ({ ...prev, xp: prev.xp + 50 }));
                              setBossHp(hp => Math.max(0, hp - 400));
                            }
                          }}
                          aria-label={`Mark ${ex.name} as complete`}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                            ex.completed ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold" : "border-slate-700 bg-slate-900"
                          }`}
                        >
                          {ex.completed && <CheckCircle2 className="h-5 w-5" />}
                        </button>
                        <div>
                          <h4 className={`font-bold text-sm ${ex.completed ? "line-through text-slate-500" : "text-white"}`}>{ex.name}</h4>
                          <span className="text-xs text-slate-400">{ex.category} • {ex.defaultSets} • <strong className="text-emerald-400">{ex.defaultWeight}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. NUTRITION & AI ENGINE ================= */}
          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Macro Synthesis Engine</span>
                  <h1 className="text-2xl font-black text-white mt-1">Adaptive Nutrition & Meal Plan</h1>
                  <p className="text-xs text-slate-400 mt-1">Current Archetype: <strong className="text-white uppercase">{user.archetype}</strong> | Diet Filter: <strong className="text-white uppercase">{user.dietaryRestriction}</strong></p>
                </div>
                <button 
                  onClick={generateDynamicMealPlan}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-sm shadow-lg min-h-[44px]"
                >
                  Generate AI Meal Plan
                </button>
              </div>

              {/* Nutrition Log List */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-white text-lg">Logged Nutritional Intake</h3>
                <div className="space-y-3">
                  {nutritionLog.map((meal) => (
                    <div key={meal.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{meal.mealType}</span>
                        <h4 className="font-bold text-white text-sm mt-1">{meal.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-white text-sm block">{meal.calories} kcal</span>
                        <span className="text-xs text-emerald-400 font-semibold">{meal.protein}g Protein</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. BLOODLINE SQUADS ================= */}
          {activeTab === "bloodline" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Bloodline Squad Comms</span>
                <h1 className="text-2xl font-black text-white mt-1">Partner Streaks & Family Sync</h1>
                <p className="text-xs text-slate-400 mt-1">Collaborate with your squad members to sustain joint multipliers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-base">Active Squad Members</h3>
                  <div className="space-y-3">
                    {user.familyMembers.map((member) => (
                      <div key={member.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{member.name}</h4>
                          <span className="text-xs text-emerald-400">Streak: {member.streak} Days 🔥 ({member.archetype})</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${member.activeToday ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-300"}`}>
                          {member.activeToday ? "Active" : "Resting"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Bloodline Multiplier</h3>
                    <p className="text-xs text-slate-400 mt-1">Squad sync grants a <strong className="text-emerald-400">+20% XP Bonus</strong> on all completed workout sets.</p>
                  </div>
                  <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-3xl font-black text-cyan-400">1.20x Multiplier</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Active across all bloodline links</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. FAMILY PASS HUB ================= */}
          {activeTab === "family-hub" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Duolingo-Style Family & Squad Pass</span>
                  <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">Apex Bloodline Family Hub</h1>
                  <p className="text-xs text-slate-300 mt-1">Share Pro benefits and sync streaks with up to 5 family members or workout partners.</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Slots Occupied</span>
                  <span className="text-xl font-black text-indigo-400">{user.familyMembers.length} / {user.familySlotsTotal}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">Linked Pass Members</h3>
                  <button 
                    onClick={() => {
                      const newName = prompt("Enter new squad member name:");
                      if (newName) {
                        setUser(prev => ({
                          ...prev,
                          familyMembers: [...prev.familyMembers, { id: Date.now().toString(), name: newName, archetype: "athlete", streak: 1, activeToday: true }]
                        }));
                      }
                    }}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs min-h-[44px]"
                  >
                    <UserPlus className="h-4 w-4" /> Invite Member Slot
                  </button>
                </div>

                <div className="space-y-3">
                  {user.familyMembers.map((mem) => (
                    <div key={mem.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                          {mem.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{mem.name}</h4>
                          <span className="text-xs text-slate-400">Streak: {mem.streak}d • Pro Unlocked via Manager</span>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">Active Pass</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. LEADERBOARD (Gladiator & Iron Athlete Tiers) ================= */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Gladiator & Iron Athlete Colosseum</span>
                  <h1 className="text-2xl font-black text-white mt-1">{user.league} Arena Cohort</h1>
                  <p className="text-xs text-slate-400 mt-1">Top 7 warriors promote at Monday colosseum reset. Bottom 5 face exile.</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Your Standing</span>
                  <span className="text-xl font-black text-white">Rank #{user.leagueRank}</span>
                </div>
              </div>

              {/* Tier Selector for Preview */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(["Pawn", "Scout", "Gladiator", "Centurion", "Spartan", "Titan", "Warlord", "Immortal", "Mythic Iron", "Apex Colosseum Sovereign"] as LeagueTier[]).map(tier => (
                  <button 
                    key={tier}
                    onClick={() => setUser({...user, league: tier})}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap min-h-[36px] ${user.league === tier ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
                {[
                  { rank: 1, name: "Marcus T.", xp: 3420, zone: "promotion" },
                  { rank: 2, name: "Elena R.", xp: 3150, zone: "promotion" },
                  { rank: 3, name: "David K.", xp: 2950, zone: "promotion" },
                  { rank: 4, name: `${user.name} (You)`, xp: user.xp, zone: "safe", user: true },
                  { rank: 5, name: "Sarah J.", xp: 2680, zone: "safe" },
                  { rank: 26, name: "Caleb W.", xp: 1100, zone: "relegation" },
                  { rank: 27, name: "Zack M.", xp: 950, zone: "relegation" }
                ].map(item => (
                  <div key={item.rank} className={`p-4 rounded-2xl flex items-center justify-between border ${item.user ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-950 border-slate-800"}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-xl font-black flex items-center justify-center text-xs ${item.zone === 'promotion' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : item.zone === 'relegation' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-900 text-white'}`}>
                        #{item.rank}
                      </span>
                      <span className="font-bold text-white text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400">{item.xp} XP</span>
                      {item.zone === 'promotion' && <span className="text-[10px] text-amber-400 font-bold uppercase hidden md:inline">Promoting ↗</span>}
                      {item.zone === 'relegation' && <span className="text-[10px] text-rose-400 font-bold uppercase hidden md:inline">Exile ↘</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 7. BIOMETRICS & PROFILE ================= */}
          {activeTab === "biometrics" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <h1 className="text-2xl font-black text-white">Physiological Profile & Archetypes</h1>
                <p className="text-xs text-slate-400 mt-1">Configure your training style and dietary filters to power the AI engine.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-base">Training Archetype</h3>
                  <select 
                    value={user.archetype} 
                    onChange={(e) => setUser({...user, archetype: e.target.value as UserArchetype})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white min-h-[44px]"
                  >
                    <option value="bodybuilder">Bodybuilder (Hypertrophy Focus)</option>
                    <option value="fatloss">Fat Loss & Shred</option>
                    <option value="athlete">Athletic Performance</option>
                    <option value="endurance">Endurance & Stamina</option>
                    <option value="vitality">General Vitality & Longevity</option>
                  </select>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-base">Dietary Restriction Filter</h3>
                  <select 
                    value={user.dietaryRestriction} 
                    onChange={(e) => setUser({...user, dietaryRestriction: e.target.value as DietaryRestriction})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white min-h-[44px]"
                  >
                    <option value="standard">Standard Omnivore</option>
                    <option value="plant-based">Plant-Based / Vegan</option>
                    <option value="keto">Ketogenic (High Fat, Low Carb)</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="dairy-free">Dairy-Free</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= 8. BADGES & MILESTONES ================= */}
          {activeTab === "badges" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <h1 className="text-2xl font-black text-white">Milestones & XP Badges</h1>
                <p className="text-xs text-slate-400 mt-1">Unlock game-fi badges and claim bonus XP.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Award className="h-6 w-6 text-amber-400" />
                        <span className="text-xs font-bold text-cyan-400">+{badge.xpReward} XP</span>
                      </div>
                      <h3 className="font-bold text-white text-base">{badge.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                      {badge.claimed ? (
                        <span className="text-xs font-bold text-emerald-400 block text-center">Claimed ✓</span>
                      ) : (
                        <button 
                          onClick={() => claimBadgeXP(badge.id, badge.xpReward)}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs min-h-[44px]"
                        >
                          Claim XP Reward
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 9. SQUAD COMMS ================= */}
          {activeTab === "social" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col h-[550px]">
              <h1 className="text-xl font-black text-white mb-1">Squad Comms Feed</h1>
              <p className="text-xs text-slate-400 mb-4">Real-time messaging between bloodline squad members.</p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {squadMessages.map(msg => (
                  <div key={msg.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-emerald-400">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendSquadMessage} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <input 
                  type="text" 
                  value={squadInput}
                  onChange={(e) => setSquadInput(e.target.value)}
                  placeholder="Broadcast message to squad..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white min-h-[44px]"
                />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm min-h-[44px]">Send</button>
              </form>
            </div>
          )}

          {/* ================= 10. AI COACH ================= */}
          {activeTab === "ai-coach" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col h-[550px]">
              <h1 className="text-xl font-black text-white mb-1">Apex Neural AI Coach</h1>
              <p className="text-xs text-slate-400 mb-4">Ask about pacing safeguards, recovery debt, or macro splits.</p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-2xl text-sm ${msg.role === 'user' ? "bg-emerald-500 text-slate-950 font-medium" : "bg-slate-950 border border-slate-800 text-slate-200"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI Coach..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white min-h-[44px]"
                />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm min-h-[44px]">Send</button>
              </form>
            </div>
          )}

          {/* ================= 11. CONNECTED WEARABLES ================= */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <h1 className="text-2xl font-black text-white">Connected Wearables & Telemetry</h1>
                <p className="text-xs text-slate-400 mt-1">Manage sync strings for smart rings and biometric monitors.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Apex Smart Ring v2</h3>
                  <p className="text-xs text-emerald-400">Connected • Battery 88% • Live Heart Rate Sync Active</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl font-bold">Synced</span>
              </div>
            </div>
          )}

          {/* ================= 12. PRO CLUB & PAYWALL ================= */}
          {activeTab === "pro" && (
            <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 lg:p-12 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Crown className="h-3.5 w-3.5" /> Apex Pro Sovereign Tier
              </span>
              <h1 className="text-3xl lg:text-4xl font-black text-white">Unlock Full Biometric & AI Supremacy</h1>
              <p className="text-sm text-slate-300 max-w-xl">Get unlimited AI macro camera scans, custom hyper-adaptive routines, automated CNS recovery balancing, and exclusive League badges.</p>
              
              <button 
                onClick={() => setUser({...user, isPro: true})}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm shadow-xl min-h-[44px]"
              >
                {user.isPro ? "Apex Pro Active 👑" : "Activate Apex Pro ($19.99/mo) or Family Pass ($29.99/mo)"}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
