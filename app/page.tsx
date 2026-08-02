"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight
} from "lucide-react";

// --- TYPES ---
type TabType = "dashboard" | "workout" | "diet" | "leaderboard" | "ai-coach" | "pro";

interface UserProfile {
  name: string;
  isPro: boolean;
  xp: number;
  streak: number;
  weightClass: string;
  ageGroup: string;
  region: string;
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
    region: "North America"
  });

  // Interactive Workout State
  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  const [exercises, setExercises] = useState([
    { id: 1, name: "Barbell Bench Press", sets: "4 sets × 8-10 reps", completed: false, weight: "90kg" },
    { id: 2, name: "Incline Dumbbell Press", sets: "3 sets × 10-12 reps", completed: false, weight: "32kg" },
    { id: 3, name: "Weighted Dips", sets: "3 sets × 12 reps", completed: false, weight: "+15kg" },
    { id: 4, name: "Cable Lateral Raises", sets: "4 sets × 15 reps", completed: false, weight: "12kg" },
  ]);

  // Diet & Macro State
  const [macros, setMacros] = useState({ protein: 165, carbs: 210, fats: 65, calories: 2150 });
  const [dietLogged, setDietLogged] = useState<string[]>(["Oats & Whey Protein Shake", "Grilled Chicken & Rice Bowl"]);

  // Leaderboard Filtering & State
  const [lbFilterRegion, setLbFilterRegion] = useState<string>("Global");
  const [lbFilterWeight, setLbFilterWeight] = useState<string>("All");
  
  // AI Coach Chat State
  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: "Hello Alex! I'm your Apex AI Coach. Based on your recovery metrics and recent plateau on bench press, I've recalibrated your routine. What would you like to focus on today?" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Timer Effect
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

  // Raw Leaderboard Data with Segment attributes
  const rawLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: "Marcus 'The Titan' Vance", score: "14,820 XP", region: "Europe", ageGroup: "25-34", weightClass: "85kg+", isPro: true, badge: "Apex Elite 🏆" },
    { rank: 2, name: "Elena Rostova", score: "14,100 XP", region: "Europe", ageGroup: "18-24", weightClass: "55-65kg", isPro: true, badge: "Powerhouse 🔥" },
    { rank: 3, name: "David 'Kage' Miller", score: "13,450 XP", region: "North America", ageGroup: "25-34", weightClass: "75-85kg", isPro: true, badge: "Ghost Runner ⚡" },
    { rank: 4, name: "Sarah Jenkins", score: "12,900 XP", region: "North America", ageGroup: "25-34", weightClass: "65-75kg", isPro: false, badge: "Consistent 🚀" },
    { rank: 5, name: "Kenji Sato", score: "12,110 XP", region: "Asia", ageGroup: "35-44", weightClass: "75-85kg", isPro: true, badge: "Master Tactician 🎯" },
    { rank: 6, name: "Alex Vance (You)", score: "2,450 XP", region: "North America", ageGroup: "25-34", weightClass: "75-85kg", isPro: user.isPro, badge: "Rising Contender 🌱" },
  ];

  // Filter logic for Leaderboard
  const filteredLeaderboard = rawLeaderboard.filter(item => {
    if (lbFilterRegion !== "Global" && item.region !== lbFilterRegion) return false;
    if (lbFilterWeight !== "All" && item.weightClass !== lbFilterWeight) return false;
    return true;
  });

  // AI Chat Handler
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      let aiReply = "I've analyzed your biometric feedback. Keep pushing with progressive overload, and make sure your protein intake hits your target today!";
      if (userText.toLowerCase().includes("plateau") || userText.toLowerCase().includes("stuck")) {
        aiReply = "Plateau detected on pressing movements! Try implementing a micro-deload week or shifting rep ranges from 8 to 5 for explosive strength adaptation.";
      } else if (userText.toLowerCase().includes("diet") || userText.toLowerCase().includes("food")) {
        aiReply = "Your current macro split of 165g protein is solid for your lean mass retention. Try adding complex carbs 90 minutes pre-workout for maximum energy output.";
      } else if (userText.toLowerCase().includes("ghost")) {
        aiReply = "Activating Ghost Mode simulation against David 'Kage' Miller's split. Your pacing needs to be 4% faster on set 3 to match his velocity!";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      setIsAiThinking(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      
      {/* TOP NAVIGATION HEADER */}
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

        {/* User XP & Pro Status Pill */}
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

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 border-r border-slate-800/80 bg-slate-900/30 p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 hidden lg:block mb-1">
            Core Modules
          </div>

          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workout & Ghost", icon: Dumbbell },
              { id: "diet", label: "Nutrition OS", icon: Utensils },
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

          {/* Quick AI status card in sidebar */}
          <div className="mt-auto hidden lg:block bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">AI Neural Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Real-time recovery analysis active. Adaptation likelihood: <strong className="text-emerald-400">94.2%</strong>
            </p>
            <button 
              onClick={() => setActiveTab("ai-coach")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              Consult AI <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT CONTAINER */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* ================= 1. DASHBOARD OVERVIEW ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    <Zap className="h-3.5 w-3.5" /> Welcome back, {user.name}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    Your Physiological State is Optimized
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">
                    Ready for today's Push hypertrophy session. The AI model suggests increasing working weight on bench press by 2.5kg.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab("workout")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
                >
                  Start Workout <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Weekly Volume", value: "48,290 kg", change: "+12% vs last week", icon: TrendingUp, color: "text-emerald-400" },
                  { label: "Recovery Index", value: "92 / 100", change: "Optimal Sleep Quality", icon: Activity, color: "text-cyan-400" },
                  { label: "Global Rank", value: "#6 (Your Cohort)", change: "Top 4% of region", icon: Trophy, color: "text-amber-400" },
                  { label: "Calorie Target", value: "2,150 kcal", change: "68% consumed today", icon: Utensils, color: "text-teal-400" },
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
                      <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.change}</div>
                    </div>
                  );
                })}
              </div>

              {/* Active AI Suggestion Banner */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shrink-0">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">AI Ghost Simulation Ready</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Compete directly against David 'Kage' Miller's split time today in real-time. Upgrade to Pro to unlock Ghost pacing.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("leaderboard")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Explore Leaderboards
                </button>
              </div>
            </div>
          )}

          {/* ================= 2. WORKOUT & GHOST RACING ================= */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Session</span>
                  <h1 className="text-2xl font-black text-white">Push Hypertrophy & Ghost Racing</h1>
                  <p className="text-xs text-slate-400 mt-1">AI-guided execution with real-time velocity tracking.</p>
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

              {/* Ghost Racing Banner */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Ghost Opponent: David 'Kage' Miller</h4>
                    <p className="text-xs text-slate-400">Target Pace: 4 exercises in under 45 minutes.</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                  {user.isPro ? "Ghost Active ⚡" : "Pro Feature 🔒"}
                </span>
              </div>

              {/* Exercise Log List */}
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
                            ex.completed 
                              ? "bg-emerald-500 border-emerald-500 text-slate-950" 
                              : "border-slate-700 bg-slate-900 hover:border-slate-500"
                          }`}
                        >
                          {ex.completed && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className={`font-bold text-sm ${ex.completed ? "line-through text-slate-500" : "text-white"}`}>{ex.name}</div>
                          <div className="text-xs text-slate-400">{ex.sets} • Target: <span className="text-emerald-400">{ex.weight}</span></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
                          AI Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. NUTRITION OS ================= */}
          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Metabolic Control</span>
                <h1 className="text-2xl font-black text-white">Nutrition & Biomarker OS</h1>
                <p className="text-xs text-slate-400 mt-1">Dynamically adjusted macros based on daily energy expenditure.</p>
              </div>

              {/* Macro Progress Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Calories", current: "1,460", target: "2,150 kcal", color: "bg-emerald-500" },
                  { label: "Protein", current: "120g", target: "165g", color: "bg-cyan-500" },
                  { label: "Carbohydrates", current: "145g", target: "210g", color: "bg-teal-500" },
                  { label: "Fats", current: "42g", target: "65g", color: "bg-amber-500" },
                ].map((mac, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs text-slate-400 mb-1">{mac.label}</div>
                    <div className="text-xl font-black text-white">{mac.current} <span className="text-xs text-slate-500 font-normal">/ {mac.target}</span></div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full ${mac.color} w-3/4`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Logged Meals */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Today's Logged Nutrition</h3>
                <div className="space-y-2">
                  {dietLogged.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl text-sm">
                      <span className="text-slate-200 font-medium">{meal}</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">Logged</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setDietLogged([...dietLogged, "Post-Workout Isolate & Banana"])}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Utensils className="h-4 w-4 text-emerald-400" /> Log Next Meal via AI Photo Recognition
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. GLOBAL ARENA & LEADERBOARD ================= */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Global Arena</span>
                  <h1 className="text-2xl font-black text-white">Apex Leaderboard & Cohorts</h1>
                  <p className="text-xs text-slate-400 mt-1">Free global standings with advanced segmented filtering unlocked for Pro athletes.</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    <select 
                      value={lbFilterRegion} 
                      onChange={(e) => setLbFilterRegion(e.target.value)}
                      className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="Global">Region: Global</option>
                      <option value="North America">North America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia">Asia</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <Filter className="h-3.5 w-3.5 text-cyan-400" />
                    <select 
                      value={lbFilterWeight} 
                      onChange={(e) => {
                        if (!user.isPro) {
                          setActiveTab("pro");
                        } else {
                          setLbFilterWeight(e.target.value);
                        }
                      }}
                      className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="All">Weight: All Classes {!user.isPro && "(Pro 🔒)"}</option>
                      <option value="75-85kg">75-85kg Bracket</option>
                      <option value="55-65kg">55-65kg Bracket</option>
                      <option value="85kg+">85kg+ Heavyweight</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Athlete Rank & Details</span>
                  <span>Total XP Score</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {filteredLeaderboard.map((item) => (
                    <div key={item.rank} className={`p-4 flex items-center justify-between transition-colors ${item.name.includes("You") ? "bg-emerald-500/10 border-l-4 border-emerald-500" : "hover:bg-slate-800/30"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                          item.rank === 1 ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20" :
                          item.rank === 2 ? "bg-slate-300 text-slate-950" :
                          item.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-300"
                        }`}>
                          #{item.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.name}</span>
                            {item.isPro && (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                                PRO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{item.badge}</span>
                            <span>•</span>
                            <span>{item.region}</span>
                            <span>•</span>
                            <span>{item.weightClass}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                        {item.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!user.isPro && (
                <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Want to filter by Age, Gym, and Weight Class?</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Unlock micro-segmentation, custom private leagues, and deep performance heatmaps with Apex Pro.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("pro")}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shrink-0 transition-all shadow-lg shadow-amber-400/20"
                  >
                    Upgrade for $4.99/mo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. APEX AI COACH ================= */}
          {activeTab === "ai-coach" && (
            <div className="space-y-4 h-[75vh] flex flex-col">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="font-black text-white text-base">Apex AI Personal Coach</h1>
                    <p className="text-xs text-slate-400">Trained on elite biomechanics, nutrition, and longevity science.</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-bold">
                  Online 24/7
                </span>
              </div>

              {/* Chat Stream Window */}
              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 flex flex-col">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'ai' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'ai' ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-emerald-500 text-slate-950 font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex gap-3 items-center text-xs text-slate-400 italic">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" /> Apex AI is calculating training variables...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your AI coach about form, plateaus, recovery, or diet..." 
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* ================= 6. PRO MEMBERSHIP UPGRADE ================= */}
          {activeTab === "pro" && (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
                  <Crown className="h-3.5 w-3.5" /> Next-Gen Fitness Evolution
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white">Elevate Your Training to Apex Pro</h1>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                  Instead of hiding your progress behind basic paywalls, unlock advanced AI simulations, granular cohort filtering, and ghost racing.
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Free Core Tier</div>
                    <div className="text-2xl font-black text-white mb-4">$0 <span className="text-xs text-slate-500 font-normal">/ forever</span></div>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Global All-Time Leaderboard view</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited workout session logging</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Basic macro & calorie calculator</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Standard AI coach responses</li>
                    </ul>
                  </div>
                  <button 
                    disabled={!user.isPro}
                    className="w-full mt-6 bg-slate-800 text-slate-400 text-xs font-bold py-3 rounded-xl cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                </div>

                <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full shadow">
                    Most Popular
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Apex Pro Experience</div>
                    <div className="text-3xl font-black text-white mb-4">$4.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                    <ul className="space-y-3 text-sm text-slate-200">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> **Segmented Leaderboards** (Age, Weight, Region)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> **Ghost Racing Mode** against top competitors</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> **Deep Muscle Heatmaps** & Velocity metrics</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> **Autonomous AI Coach** adaptive programming</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Custom profile badges & animated borders</li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setUser({...user, isPro: true});
                      setActiveTab("dashboard");
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" /> {user.isPro ? "Pro Already Active!" : "Unlock Apex Pro Now"}
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
