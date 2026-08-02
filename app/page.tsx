"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Volume2, ShieldAlert, Sword, MessageSquare, UserPlus, Smile, Mic, Eye, UsersRound, ShieldCheck, Star
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "bloodline" | "leaderboard" | "ai-coach" | "pro" | "biometrics" | "badges" | "devices" | "social";

interface UserProfile {
  name: string;
  isPro: boolean;
  proType: "solo" | "bloodline" | "none";
  xp: number;
  streak: number;
  weightKg: number;
  somatotype: "ectomorph" | "mesomorph" | "endomorph";
  primaryGoal: "muscle-gain" | "fat-loss" | "recomposition" | "longevity";
  gender: "male" | "female" | "other";
  menstrualPhase: "follicular" | "ovulatory" | "luteal" | "menstrual" | "n/a";
  cycleDay: number;
  league: "Bronze" | "Silver" | "Gold" | "Sapphire" | "Ruby" | "Emerald" | "Diamond";
  leagueRank: number;
  vitalityMode: boolean;
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

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  icon: string;
  unlocked: boolean;
  xpReward: number;
  chatFlair: string;
}

interface BloodlineMember {
  id: string;
  name: string;
  role: string;
  streak: number;
  status: string;
  avatarBg: string;
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
      proType: "none",
      xp: 2840,
      streak: 14,
      weightKg: 75,
      somatotype: "mesomorph",
      primaryGoal: "muscle-gain",
      gender: "female",
      menstrualPhase: "follicular",
      cycleDay: 8,
      league: "Ruby",
      leagueRank: 4,
      vitalityMode: false
    };
  });

  const [steps, setSteps] = useState<number>(8920);
  const [recoveryDebtPct, setRecoveryDebtPct] = useState<number>(user.vitalityMode ? 18 : 38);

  // Real Speech Recognition Hook State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Badges & Bloodline State
  const [badges, setBadges] = useState<BadgeItem[]>([
    { id: "b1", title: "Iron Core Ignition", description: "Complete your first 7-day training streak", rarity: "Common", icon: "🔥", unlocked: true, xpReward: 250, chatFlair: "🔥 [Iron Core]" },
    { id: "b2", title: "Neural Surge Overlord", description: "Log 50,000 cumulative steps in a single week", rarity: "Rare", icon: "⚡", unlocked: true, xpReward: 500, chatFlair: "⚡ [Neural Surge]" },
    { id: "b3", title: "Plate Visionary", description: "Scan 10 meals using the Apex AI Camera", rarity: "Rare", icon: "📸", unlocked: false, xpReward: 600, chatFlair: "📸 [Visual Elite]" },
    { id: "b4", title: "Titan Sovereign", description: "Reach Diamond League rank and defeat 3 Raid Bosses", rarity: "Legendary", icon: "👑", unlocked: false, xpReward: 2000, chatFlair: "👑 [Titan Sovereign]" },
  ]);

  const [bloodlineMembers, setBloodlineMembers] = useState<BloodlineMember[]>([
    { id: "bl1", name: "Alex Vance (You)", role: "Syndicate Commander", streak: 14, status: "Crushing hypertrophy split 💪", avatarBg: "from-emerald-500 to-cyan-500" },
    { id: "bl2", name: "Robert Vance", role: "Vitality Vanguard", streak: 28, status: "Completed Longevity Joint Mobility 🌿", avatarBg: "from-blue-500 to-indigo-500" },
    { id: "bl3", name: "Maya Vance", role: "Alpha Striker", streak: 5, status: "Track sprint intervals completed ⚡", avatarBg: "from-purple-500 to-pink-500" }
  ]);
  const [inviteEmail, setInviteEmail] = useState<string>("");

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

  // AI Chat State
  const [aiChatMessages, setAiChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Welcome to the Apex AI Coach, ${user.name}! Ask me anything about your training splits, nutrition targets, or cycle recovery.` }
  ]);
  const [aiChatInput, setAiChatInput] = useState<string>("");

  // Real Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceTranscript(transcript);
          setIsListening(false);
          handleVoiceCommand(transcript);
        };

        recognitionRef.current.onerror = () => { setIsListening(false); };
        recognitionRef.current.onend = () => { setIsListening(false); };
      }
    }
  }, []);

  const startVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        setIsListening(true);
        setVoiceTranscript("Listening...");
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      setIsListening(true);
      setVoiceTranscript("Simulated Voice: Logging 300 calorie snack...");
      setTimeout(() => {
        setIsListening(false);
        setNutritionLog(prev => [...prev, {
          id: Date.now(),
          name: "Voice Log Snack",
          calories: 300,
          protein: 20,
          carbs: 30,
          fats: 5,
          mealType: "Snack"
        }]);
      }, 2000);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes("log") || lower.includes("food") || lower.includes("calories")) {
      setNutritionLog(prev => [...prev, {
        id: Date.now(),
        name: `Voice: ${command}`,
        calories: 350,
        protein: 25,
        carbs: 40,
        fats: 8,
        mealType: "Snack"
      }]);
      setVoiceTranscript(`Successfully logged: "${command}"`);
    } else {
      setAiChatMessages(prev => [...prev, { role: 'user', text: command }, { role: 'ai', text: `Processed voice command: "${command}". Keep pushing forward!` }]);
    }
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

  const toggleExerciseComplete = (id: number) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    setUser(prev => ({ ...prev, xp: prev.xp + 50 }));
  };

  const claimBadgeReward = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId && !b.unlocked) {
        setUser(u => ({ ...u, xp: u.xp + b.xpReward }));
        return { ...b, unlocked: true };
      }
      return b;
    }));
  };

  const handleSendAiChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    const text = aiChatInput;
    setAiChatMessages(prev => [...prev, { role: 'user', text }]);
    setAiChatInput("");

    setTimeout(() => {
      let reply = `Based on your ${user.somatotype} profile and ${user.primaryGoal} goal, maintain strict 90-second rest intervals and hydrate aggressively.`;
      if (text.toLowerCase().includes("recovery") || text.toLowerCase().includes("fatigue")) {
        reply = `Your recovery debt is currently ${recoveryDebtPct}%. You are cleared for moderate compound movements today!`;
      }
      setAiChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen ${user.vitalityMode ? "bg-slate-900 text-lg" : "bg-slate-950"} text-slate-100 font-sans antialiased flex flex-col transition-all`}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-950/50">
            AX
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              APEX STATE OS {user.vitalityMode && "(Vitality Mode)"}
            </span>
            <p className="text-xs text-slate-400">Cybernetic Fitness & Syndicate Bloodlines</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setUser(prev => ({ ...prev, vitalityMode: !prev.vitalityMode }))}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
              user.vitalityMode 
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30" 
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {user.vitalityMode ? "Vitality: ON" : "Vitality Mode"}
          </button>

          <button 
            onClick={() => setActiveTab("pro")} 
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-950/30"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            {user.isPro ? "PRO ACTIVE" : "GO PRO"}
          </button>
        </div>
      </header>

      {/* Voice Assistant Modal Overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50">
            <Mic className="h-12 w-12 text-emerald-400 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-white">Apex Voice AI Listening</h2>
          <p className="text-emerald-400 mt-2 text-xl font-medium">{voiceTranscript}</p>
          <p className="text-xs text-slate-400 mt-6">Speak clearly (e.g., "Log chicken breast and rice")</p>
        </div>
      )}

      {voiceTranscript && !isListening && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-emerald-400" />
            <span>Voice Event: <strong>{voiceTranscript}</strong></span>
          </div>
          <button onClick={() => setVoiceTranscript("")} className="text-xs underline hover:text-white">Dismiss</button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0 bg-slate-950/40">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview & State", icon: Activity },
              { id: "workout", label: "Workout Hub", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Camera", icon: Utensils },
              { id: "bloodline", label: "Syndicate Bloodline", icon: UsersRound },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
              { id: "badges", label: "Cyber-Sigils", icon: Award },
              { id: "leaderboard", label: "Leagues", icon: Trophy },
              { id: "social", label: "Squad War Room", icon: Users },
              { id: "pro", label: "Pro & Syndicate Pass", icon: Crown },
              { id: "biometrics", label: "Profile & Somatotype", icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    user.vitalityMode ? "text-base" : "text-sm"
                  } ${
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

        {/* Main Interactive Workspace */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl shadow-emerald-950/20">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <Sparkles className="h-3.5 w-3.5" /> {user.vitalityMode ? "Longevity & Mobility Protocol Active" : "Apex Telemetry Optimal"}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Welcome back, {user.name}</h1>
                    <p className="text-sm text-slate-300 mt-2 flex flex-wrap items-center gap-2">
                      <span>XP: <strong className="text-amber-400">{user.xp.toLocaleString()} XP</strong></span>
                      <span>•</span>
                      <span>Streak: <strong className="text-amber-400">{user.streak} Days 🔥</strong></span>
                      <span>•</span>
                      <span>Steps: <strong className="text-cyan-400">{steps.toLocaleString()}</strong></span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={startVoiceRecognition}
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm uppercase shadow-lg shadow-emerald-950/50 hover:scale-105 transition-all"
                  >
                    <Mic className="h-5 w-5" /> Speak AI Command
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Recovery Debt</span>
                  <div className="text-2xl font-black text-white mt-1">{recoveryDebtPct}%</div>
                  <p className="text-xs text-emerald-400 mt-1">{user.vitalityMode ? "Joint loading safe & optimized." : "Ready for heavy compound loading."}</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Syndicate Bloodline</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">3 Members Active</div>
                  <p className="text-xs text-slate-400 mt-1">Robert & Maya completed today's quests!</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Unlocked Cyber-Sigils</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{badges.filter(b => b.unlocked).length} / {badges.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Claim rewards in Badges tab</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase mb-2">
                    <Dumbbell className="h-3.5 w-3.5" /> {user.vitalityMode ? "Joint Mobility & Stability Routine" : "Active Training Session"}
                  </div>
                  <h2 className="text-2xl font-black text-white">Today's Hyper-Customized Protocol</h2>
                  <p className="text-sm text-slate-300 mt-1">Check off exercises to earn XP and advance your Syndicate streak.</p>
                </div>
                <button 
                  onClick={startVoiceRecognition}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase shadow-lg shadow-emerald-950/50 flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" /> Log Set via Voice
                </button>
              </div>

              <div className="space-y-3">
                {exercises.map((ex) => (
                  <div key={ex.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    ex.completed ? "bg-emerald-950/20 border-emerald-500/40 opacity-75" : "bg-slate-900/80 border-slate-800"
                  }`}>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleExerciseComplete(ex.id)}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                          ex.completed ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold" : "border-slate-700 bg-slate-950"
                        }`}
                      >
                        {ex.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <div>
                        <h4 className={`font-bold text-base ${ex.completed ? "line-through text-slate-400" : "text-white"}`}>{ex.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{ex.defaultSets} • Target Weight: <strong className="text-cyan-400">{ex.defaultWeight}</strong></p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      MET {ex.metValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase mb-2">
                    <Utensils className="h-3.5 w-3.5" /> Nutrition & Camera Scanner
                  </div>
                  <h2 className="text-2xl font-black text-white">Daily Macro & Calorie Log</h2>
                  <p className="text-sm text-slate-300 mt-1">Total Consumed: <strong className="text-cyan-400">1,070 kcal</strong> / Target: 2,200 kcal</p>
                </div>
                <button 
                  onClick={startVoiceRecognition}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase shadow-lg shadow-cyan-950/50 flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" /> Scan Plate / Voice Meal
                </button>
              </div>

              <div className="space-y-3">
                {nutritionLog.map((meal) => (
                  <div key={meal.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{meal.mealType}</span>
                      <h4 className="font-bold text-white text-base mt-1">{meal.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Protein: <strong className="text-emerald-400">{meal.protein}g</strong> | Carbs: {meal.carbs}g | Fats: {meal.fats}g</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-lg">{meal.calories}</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-6 max-w-3xl mx-auto flex flex-col h-[75vh]">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                    AI
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Apex Biometric Coach</h3>
                    <p className="text-xs text-emerald-400">Online • Calibrated for {user.somatotype} & {user.primaryGoal}</p>
                  </div>
                </div>
                <button onClick={startVoiceRecognition} className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-emerald-400">
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-4 overflow-y-auto space-y-4">
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none shadow-lg' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAiChat} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask Apex AI about your training, recovery, or nutrition..." 
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 rounded-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase mb-3">
                  <Award className="h-3.5 w-3.5" /> Cyber-Sigil Achievement Hub
                </div>
                <h2 className="text-2xl font-black text-white">Unlock Rare Badges & Chat Flares</h2>
                <p className="text-sm text-slate-300 mt-1">Claim rewards to boost your XP and unlock custom chat flairs for your Syndicate Squad.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                    badge.unlocked ? "bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/30" : "bg-slate-950/40 border-slate-800/80 opacity-75"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{badge.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                        <span className="inline-block mt-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Flair: {badge.chatFlair}
                        </span>
                      </div>
                    </div>
                    <div>
                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Claimed
                        </span>
                      ) : (
                        <button 
                          onClick={() => claimBadgeReward(badge.id)}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md"
                        >
                          Claim +{badge.xpReward} XP
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "bloodline" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase mb-3">
                  <UsersRound className="h-3.5 w-3.5" /> Syndicate Bloodline Pass
                </div>
                <h2 className="text-2xl font-black text-white">Family & Squad Bloodline Syndicate</h2>
                <p className="text-sm text-slate-300 mt-1">Share Pro features with up to 5 members. Grandparents track safe joint mobility while younger members crush heavy athletics.</p>

                <div className="mt-6 flex flex-col md:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter family/partner email..." 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button 
                    onClick={() => {
                      if (!inviteEmail.trim()) return;
                      setBloodlineMembers(prev => [...prev, {
                        id: Date.now().toString(),
                        name: inviteEmail.split("@")[0],
                        role: "Elite Member",
                        streak: 1,
                        status: "Joined via Bloodline link! 🎉",
                        avatarBg: "from-amber-500 to-orange-500"
                      }]);
                      setInviteEmail("");
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg"
                  >
                    Send Invite
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bloodlineMembers.map((member) => (
                  <div key={member.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${member.avatarBg} flex items-center justify-center font-bold text-white shadow-md`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{member.name}</h4>
                        <span className="text-xs text-purple-400 font-medium">{member.role}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{member.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-black text-base">{member.streak}d 🔥</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Crown className="h-4 w-4 text-amber-400" /> Apex Pro & Syndicate Club
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Unlock the Ultimate Multi-Generational Fitness Syndicate</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">Apex Pro Solo</h3>
                    <div className="text-3xl font-black text-amber-400 mt-4">$9.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                    <ul className="space-y-3 mt-6 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited AI Plate Scanner</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Voice-First AI Coaching</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setUser(prev => ({ ...prev, isPro: true, proType: "solo" }));
                      alert("Apex Pro Solo activated successfully!");
                    }}
                    className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all"
                  >
                    Select Solo Plan
                  </button>
                </div>

                <div className="bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-2 border-purple-500/50 p-6 rounded-3xl flex flex-col justify-between shadow-2xl">
                  <div>
                    <h3 className="text-2xl font-black text-white">Apex Bloodline Pro</h3>
                    <div className="text-3xl font-black text-purple-400 mt-4">$14.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                    <ul className="space-y-3 mt-6 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Up to 5 Bloodline Members Included</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Vitality Longevity & Joint Mobility Modes</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setUser(prev => ({ ...prev, isPro: true, proType: "bloodline" }));
                      setActiveTab("bloodline");
                    }}
                    className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg"
                  >
                    Unlock Bloodline Syndicate
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "workout" && activeTab !== "diet" && activeTab !== "ai-coach" && activeTab !== "badges" && activeTab !== "bloodline" && activeTab !== "pro" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{activeTab} Hub</h2>
                <p className="text-slate-400 text-sm mt-2">Telemetry active. Tap the microphone icon above at any time to execute voice commands!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
