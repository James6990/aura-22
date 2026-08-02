
"use client";

import React, { useState, useEffect } from "react";
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
  vitalityMode: boolean; // Rebranded from seniorMode
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
  role: "Syndicate Commander (You)" | "Vitality Vanguard" | "Alpha Striker" | "Elite Member";
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
  const baseCaloriesBurned = 1850;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

  // Boss Battle State (PvE)
  const [bossHp, setBossHp] = useState<number>(34200);
  const bossMaxHp = 50000;

  // Recovery Debt State
  const [recoveryDebtPct, setRecoveryDebtPct] = useState<number>(user.vitalityMode ? 18 : 38);

  // Audio Hype Mode State
  const [hypeActive, setHypeActive] = useState<boolean>(false);
  const [hypeMessage, setHypeMessage] = useState<string>("Ready to ignite your set!");

  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  
  // Voice Assistant State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  // Apex Cyber-Sigils (Badge & Reward System)
  const [badges, setBadges] = useState<BadgeItem[]>([
    { id: "b1", title: "Iron Core Ignition", description: "Complete your first 7-day training streak", rarity: "Common", icon: "🔥", unlocked: true, xpReward: 250, chatFlair: "🔥 [Iron Core]" },
    { id: "b2", title: "Neural Surge Overlord", description: "Log 50,000 cumulative steps in a single week", rarity: "Rare", icon: "⚡", unlocked: true, xpReward: 500, chatFlair: "⚡ [Neural Surge]" },
    { id: "b3", title: "Plate Visionary", description: "Scan 10 meals using the Apex AI Camera", rarity: "Rare", icon: "📸", unlocked: false, xpReward: 600, chatFlair: "📸 [Visual Elite]" },
    { id: "b4", title: "Titan Sovereign", description: "Reach Diamond League rank and defeat 3 Raid Bosses", rarity: "Legendary", icon: "👑", unlocked: false, xpReward: 2000, chatFlair: "👑 [Titan Sovereign]" },
  ]);

  // Bloodline Syndicate State (Rebranded Family/Crew Pass)
  const [bloodlineMembers, setBloodlineMembers] = useState<BloodlineMember[]>([
    { id: "bl1", name: "Alex Vance (You)", role: "Syndicate Commander (You)", streak: 14, status: "Crushing hypertrophy split 💪", avatarBg: "from-emerald-500 to-cyan-500" },
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
      { id: 1, name: user.vitalityMode ? "Gentle Wall Push-ups & Stability" : "Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: user.vitalityMode ? "Bodyweight" : "90kg", completed: false },
      { id: 2, name: user.vitalityMode ? "Seated Chair Leg Extensions" : "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: user.vitalityMode ? "Light Resistance" : "120kg", completed: false },
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

  const [hypeReactions, setHypeReactions] = useState<Record<string, string[]>>({
    "Marcus T.": ["⚡ CNS Surge", "🔥 Hyper-Burn"],
    "Elena R.": ["🛡️ Iron Shield"]
  });

  const claimBadgeReward = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId && !b.unlocked) {
        setUser(u => ({ ...u, xp: u.xp + b.xpReward }));
        return { ...b, unlocked: true };
      }
      return b;
    }));
  };

  const triggerVoiceAssistant = () => {
    setIsListening(true);
    setVoiceTranscript("Listening to your voice command...");
    setTimeout(() => {
      setVoiceTranscript('"Apex, log 500g of Greek yogurt and honey for afternoon snack"');
      setIsListening(false);
      setNutritionLog(prev => [...prev, {
        id: Date.now(),
        name: "Greek Yogurt & Honey (Voice Log)",
        calories: 320,
        protein: 28,
        carbs: 35,
        fats: 4,
        mealType: "Snack"
      }]);
    }, 2500);
  };

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
      title: user.vitalityMode ? "Joint-Friendly Mobility & Strength Sequence" : "Push / Pull / Legs (PPL) Hypertrophy Split",
      targetUser: user.vitalityMode ? "Vitality & Longevity Protocol" : "Intermediate Bodybuilding",
      style: user.vitalityMode ? "Low Impact Stability" : "Hypertrophy",
      guideline: user.vitalityMode ? "Focus on controlled range of motion and joint stability with zero axial spinal loading." : "Perform 6 days a week with 1 rest day. Focus on mechanical tension.",
      exercises: [
        { id: 201, name: user.vitalityMode ? "Resistance Band Press" : "Barbell Overhead Press", category: "Strength", metValue: 5.0, defaultSets: "3 sets × 10 reps", defaultWeight: "Light Band" },
        { id: 202, name: user.vitalityMode ? "Seated Row Machine" : "Weighted Pull-Ups", category: "Strength", metValue: 6.0, defaultSets: "3 sets × 10 reps", defaultWeight: "Moderate" },
        { id: 203, name: user.vitalityMode ? "Bodyweight Box Squat" : "Barbell Back Squat", category: "Strength", metValue: 5.0, defaultSets: "3 sets × 10 reps", defaultWeight: "Bodyweight" }
      ]
    },
    {
      id: "ai-pro-custom",
      title: "Apex AI Biometric Hyper-Customizer",
      targetUser: "Pro Subscribers Only",
      style: "AI Adaptive",
      guideline: "Generates daily micro-adjustments based on your recovery score and hormonal cycle.",
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

  const triggerCameraScan = () => {
    if (!user.isPro && scanCount >= 2) {
      setActiveTab("pro");
      return;
    }
    setCameraActive(true);
    setScanningStatus("Analyzing plate via Apex AI Camera Engine...");
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
  ];

  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Welcome back, ${user.name}! Tap the microphone icon for voice-assisted logging or view your newly unlocked Cyber-Sigils.` }
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
      let aiReply = `Based on your ${user.somatotype} physique and ${user.menstrualPhase} cycle phase, keep your rest intervals strict.`;
      if (userText.toLowerCase().includes("badge") || userText.toLowerCase().includes("sigil")) {
        aiReply = `You can check your unlocked Cyber-Sigils and claim bonus XP in the Badges tab!`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
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
              APEX STATE OS {user.vitalityMode && "(Vitality Protocol)"}
            </span>
            <p className="text-xs text-slate-400">Cybernetic Fitness & Syndicate Bloodlines</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Vitality Protocol Toggle */}
          <button 
            onClick={() => setUser(prev => ({ ...prev, vitalityMode: !prev.vitalityMode }))}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
              user.vitalityMode 
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30" 
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {user.vitalityMode ? "Vitality Mode: ON" : "Vitality Mode"}
          </button>

          {/* Pro / Bloodline Pass Button */}
          <button 
            onClick={() => setActiveTab("pro")} 
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-950/30"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            {user.isPro ? (user.proType === "bloodline" ? "BLOODLINE SYNDICATE" : "APEX PRO ACTIVE") : "GO PRO & SYNDICATE"}
          </button>
        </div>
      </header>

      {/* Voice Assistant Modal */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50">
            <Mic className="h-10 w-10 text-emerald-400 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white">Apex Voice AI Active</h2>
          <p className="text-emerald-400 mt-2 text-lg font-medium">Speak your meal, workout, or question naturally...</p>
        </div>
      )}

      {voiceTranscript && !isListening && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 flex items-center justify-between text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-emerald-400" />
            <span>Voice Parsed: <strong>{voiceTranscript}</strong></span>
          </div>
          <button onClick={() => setVoiceTranscript("")} className="text-xs underline hover:text-white">Dismiss</button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0 bg-slate-950/40">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview & State", icon: Activity },
              { id: "workout", label: user.vitalityMode ? "Joint Mobility & Longevity" : "Workouts & Guidelines", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Camera", icon: Utensils },
              { id: "bloodline", label: "Syndicate Bloodline", icon: UsersRound },
              { id: "badges", label: "Cyber-Sigils & Badges", icon: Award },
              { id: "leaderboard", label: `${user.league} League`, icon: Trophy },
              { id: "social", label: "Squad War Room", icon: Users },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
              { id: "pro", label: "Pro & Syndicate Pass", icon: Crown },
              { id: "biometrics", label: "Somatotype & Profile", icon: Calendar },
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

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Emotional Welcome Banner */}
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl shadow-emerald-950/20">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <Sparkles className="h-3.5 w-3.5" /> 
                      {user.vitalityMode ? "Vitality Protocol Active" : "Apex Biometric State: Optimal"}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Welcome back, {user.name}</h1>
                    <p className="text-sm text-slate-300 mt-2 flex flex-wrap items-center gap-2">
                      <span>Total XP: <strong className="text-amber-400">{user.xp.toLocaleString()} XP</strong></span>
                      <span>•</span>
                      <span>Syndicate Streak: <strong className="text-amber-400">{user.streak} Days 🔥</strong></span>
                      <span>•</span>
                      <span>Steps: <strong className="text-cyan-400">{steps.toLocaleString()}</strong></span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={triggerVoiceAssistant}
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-5 py-3 rounded-2xl font-black text-sm uppercase shadow-lg shadow-emerald-950/50 hover:scale-105 transition-all"
                  >
                    <Mic className="h-5 w-5" /> Tap to Speak AI
                  </button>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Recovery Debt</span>
                  <div className="text-2xl font-black text-white mt-1">{recoveryDebtPct}%</div>
                  <p className="text-xs text-emerald-400 mt-1">{user.vitalityMode ? "Joint mobility state is peak." : "Ready for heavy compound loading."}</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Syndicate Bloodline</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">3 Active Members</div>
                  <p className="text-xs text-slate-400 mt-1">Robert & Maya completed today's quests!</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Unlocked Cyber-Sigils</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{badges.filter(b => b.unlocked).length} / {badges.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Tap Badges tab to claim rewards</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 rounded-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase mb-3">
                  <Award className="h-3.5 w-3.5" /> Cyber-Sigil Achievement Hub
                </div>
                <h2 className="text-2xl font-black text-white">Unlock Rare Badges & Chat Flares</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Complete milestones to earn bonus XP and unlock holographic chat flair badges to show off in your Syndicate Squad War Room!
                </p>
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{badge.title}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            badge.rarity === "Legendary" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                            badge.rarity === "Rare" ? "bg-purple-500/20 text-purple-400 border border-purple-500/40" :
                            "bg-slate-800 text-slate-300"
                          }`}>{badge.rarity}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                        <span className="inline-block mt-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Flair: {badge.chatFlair}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Claimed
                        </span>
                      ) : (
                        <button 
                          onClick={() => claimBadgeReward(badge.id)}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-950/50"
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
                  <UsersRound className="h-3.5 w-3.5" /> Apex Syndicate Bloodline Pass
                </div>
                <h2 className="text-2xl font-black text-white">Vance Family & Squad Bloodline Syndicate</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Share Apex Pro perks across up to 5 family members or workout partners. Grandparents track safe joint mobility, teens track athletics, and everyone builds shared Syndicate XP!
                </p>

                <div className="mt-6 flex flex-col md:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter bloodline member's email..." 
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
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-950/50"
                  >
                    Send Bloodline Invite
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Active Syndicate Members ({bloodlineMembers.length}/5)</h3>
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
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Streak</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Crown className="h-4 w-4 text-amber-400" /> Apex Pro & Syndicate Club
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Unlock the Ultimate Multi-Generational Fitness Syndicate</h2>
              <p className="text-sm text-slate-300">
                Choose the tier that fits your crew. Grandparents, parents, and athletes all get custom biometric guidance under one ecosystem.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                {/* Solo Pro */}
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Individual Pass</span>
                    <h3 className="text-2xl font-black text-white mt-1">Apex Pro Solo</h3>
                    <div className="text-3xl font-black text-amber-400 mt-4">$9.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                    <ul className="space-y-3 mt-6 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited AI Plate Scanner</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Voice-First AI Coaching</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Advanced Cyber-Sigil Badges</li>
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

                {/* Bloodline Syndicate Pro */}
                <div className="bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-2 border-purple-500/50 p-6 rounded-3xl flex flex-col justify-between relative shadow-2xl shadow-purple-950/50">
                  <div className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-md">
                    Best Value • 5 Members
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Bloodline Syndicate Pass</span>
                    <h3 className="text-2xl font-black text-white mt-1">Apex Bloodline Pro</h3>
                    <div className="text-3xl font-black text-purple-400 mt-4">$14.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                    <ul className="space-y-3 mt-6 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Up to 5 Bloodline Members Included</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Vitality Longevity & Joint Mobility Modes</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Shared Syndicate Raids & Badges</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setUser(prev => ({ ...prev, isPro: true, proType: "bloodline" }));
                      setActiveTab("bloodline");
                    }}
                    className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-950/50"
                  >
                    Unlock Bloodline Syndicate
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "badges" && activeTab !== "bloodline" && activeTab !== "pro" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{activeTab} Hub</h2>
                <p className="text-slate-400 text-sm mt-2">
                  {user.vitalityMode 
                    ? "Vitality Protocol active. Workouts and biometrics calibrated for longevity and joint protection."
                    : "High-performance biometric telemetry active. Tap the microphone icon above for voice assistance!"}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
