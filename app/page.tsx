"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Eye, Volume2, VolumeX
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "leaderboard" | "ai-coach" | "pro" | "biometrics";

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
  highContrast: boolean;
  screenReaderVoiceEnabled: boolean;
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

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  somatotype: string;
  isPro: boolean;
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
      xp: 2450,
      streak: 12,
      weightKg: 75,
      somatotype: "mesomorph",
      primaryGoal: "muscle-gain",
      gender: "female",
      menstrualPhase: "follicular",
      cycleDay: 8,
      highContrast: false,
      screenReaderVoiceEnabled: true,
    };
  });

  // Screen Reader / Accessibility Live Announcement State
  const [announcement, setAnnouncement] = useState<string>("Apex State OS loaded successfully. Screen reader accessibility mode active.");

  const speakText = (text: string) => {
    setAnnouncement(text);
    if (user.screenReaderVoiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const [steps, setSteps] = useState<number>(8420);
  const baseCaloriesBurned = 1850;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

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

  const [newMealName, setNewMealName] = useState("");
  const [newMealCals, setNewMealCals] = useState(350);
  const [newMealProtein, setNewMealProtein] = useState(25);
  const [newMealType, setNewMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Dinner");

  const [cameraActive, setCameraActive] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>("");
  const [scannedFoodResult, setScannedFoodResult] = useState<{name: string; cals: number; protein: number} | null>(null);

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
      targetUser: "Intermediate to Advanced Bodybuilding",
      style: "Hypertrophy & Aesthetics",
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
      targetUser: "Strength Seekers & Ectomorphs",
      style: "Absolute Strength",
      guideline: "Perform 3 days a week with long rest intervals (2-3 mins).",
      exercises: [
        { id: 205, name: "Heavy Barbell Squat (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "130kg" },
        { id: 206, name: "Flat Barbell Bench Press (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "100kg" }
      ]
    }
  ];

  const masterExerciseLibrary: Omit<ExerciseItem, "completed">[] = [
    { id: 101, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "120kg" },
    { id: 102, name: "Heavy Deadlift", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 5 reps", defaultWeight: "140kg" },
    { id: 104, name: "Brisk Outdoor Walking", category: "Cardio", metValue: 4.3, defaultSets: "30 mins", defaultWeight: "3.5 mph" },
    { id: 106, name: "HIIT Sprint Intervals", category: "Cardio", metValue: 12.0, defaultSets: "20 mins", defaultWeight: "Max Effort" },
  ];

  const [selectedCat, setSelectedCat] = useState<string>("All");
  const filteredLibrary = masterExerciseLibrary.filter(item => selectedCat === "All" || item.category === selectedCat);

  const addExerciseToRoutine = (ex: Omit<ExerciseItem, "completed">) => {
    if (exercises.some(item => item.name === ex.name)) return;
    setExercises([...exercises, { ...ex, id: Date.now(), completed: false }]);
    speakText(`Added ${ex.name} to your active workout routine.`);
  };

  const loadRoutineTemplate = (template: WorkoutRoutineTemplate) => {
    const newItems: ExerciseItem[] = template.exercises.map((ex, idx) => ({
      ...ex,
      id: Date.now() + idx,
      completed: false
    }));
    setExercises(newItems);
    speakText(`Loaded routine template: ${template.title}`);
  };

  const calculateMetCalories = (met: number, durationMins: number) => {
    return Math.round(met * user.weightKg * (durationMins / 60));
  };

  const totalNutritionCals = nutritionLog.reduce((acc, item) => acc + item.calories, 0);
  const totalNutritionProtein = nutritionLog.reduce((acc, item) => acc + item.protein, 0);
  const netCalorieTarget = Math.round(2200 + (steps * 0.02));

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    const newItem: NutritionItem = {
      id: Date.now(),
      name: newMealName,
      calories: Number(newMealCals),
      protein: Number(newMealProtein),
      carbs: 35,
      fats: 12,
      mealType: newMealType
    };
    setNutritionLog([...nutritionLog, newItem]);
    setNewMealName("");
    speakText(`Logged meal: ${newMealName}, ${newMealCals} calories.`);
  };

  const triggerCameraScan = () => {
    setCameraActive(true);
    setScanningStatus("Analyzing image via Google Visual Search Engine...");
    setScannedFoodResult(null);
    speakText("Google Visual Camera scanner activated. Pointing camera at meal.");

    setTimeout(() => {
      setScanningStatus("Match found: Avocado & Poached Eggs on Sourdough Toast");
      setScannedFoodResult({
        name: "Avocado & Poached Eggs on Sourdough",
        cals: 420,
        protein: 22
      });
      speakText("Scan complete. Detected Avocado and Poached Eggs on Sourdough Toast, 420 calories.");
    }, 2000);
  };

  const confirmScannedFood = () => {
    if (!scannedFoodResult) return;
    setNutritionLog([...nutritionLog, {
      id: Date.now(),
      name: scannedFoodResult.name,
      calories: scannedFoodResult.cals,
      protein: scannedFoodResult.protein,
      carbs: 30,
      fats: 18,
      mealType: "Breakfast"
    }]);
    setCameraActive(false);
    setScannedFoodResult(null);
    speakText("Scanned meal successfully added to your daily nutrition log.");
  };

  const leaderboardData: LeaderboardUser[] = [
    { rank: 1, name: "Marcus Thorne", xp: 5420, streak: 45, somatotype: "Mesomorph", isPro: true },
    { rank: 2, name: "Elena Rostova", xp: 4890, streak: 30, somatotype: "Ectomorph", isPro: true },
    { rank: 3, name: "Alex Vance (You)", xp: user.xp, streak: user.streak, somatotype: user.somatotype, isPro: user.isPro },
    { rank: 4, name: "David Kim", xp: 2100, streak: 8, somatotype: "Endomorph", isPro: false },
  ];

  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Hello ${user.name}! Universal accessibility engine, screen reader voice narration, and Google visual camera scanner are fully online.` }
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let aiReply = `As a ${user.gender} (${user.somatotype}) focused on ${user.primaryGoal}, your hormonal phase is logged as ${user.menstrualPhase}.`;
      speakText(aiReply);
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col ${user.highContrast ? "bg-black text-yellow-300" : "bg-slate-950 text-slate-100"}`}>
      
      {/* Hidden Live Region for Screen Readers (Accessibility Compliance) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Header with Quick Accessibility Toggles */}
      <header className={`border-b sticky top-0 z-50 px-6 py-3 flex items-center justify-between backdrop-blur-md ${user.highContrast ? "bg-black border-yellow-500" : "bg-slate-900/60 border-slate-800"}`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950" aria-hidden="true">
            AX
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              APEX STATE OS
            </span>
            <p className="text-xs text-slate-400">Accessible Inclusive Fitness & Biometrics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Screen Reader Toggle */}
          <button 
            onClick={() => {
              const newState = !user.screenReaderVoiceEnabled;
              setUser({...user, screenReaderVoiceEnabled: newState});
              speakText(newState ? "Screen reader voice narration enabled." : "Screen reader voice narration muted.");
            }}
            aria-label={user.screenReaderVoiceEnabled ? "Disable Screen Reader Voice Narration" : "Enable Screen Reader Voice Narration"}
            className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${user.screenReaderVoiceEnabled ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-900 border-slate-700 text-slate-400"}`}
          >
            {user.screenReaderVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">Voice Aid</span>
          </button>

          {/* High Contrast Mode Toggle for Low Vision */}
          <button 
            onClick={() => {
              const newState = !user.highContrast;
              setUser({...user, highContrast: newState});
              speakText(newState ? "High contrast mode activated." : "High contrast mode disabled.");
            }}
            aria-label="Toggle High Contrast Display Mode"
            className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${user.highContrast ? "bg-yellow-400 text-black border-yellow-300" : "bg-slate-900 border-slate-700 text-slate-400"}`}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("pro");
              speakText("Opened Apex Pro Membership Paywall.");
            }} 
            aria-label="Open Apex Pro Membership"
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>{user.isPro ? "PRO" : "UPGRADE"}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0" aria-label="Main Navigation">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workouts & Guidelines", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Camera", icon: Utensils },
              { id: "leaderboard", label: "Global Leaderboard", icon: Trophy },
              { id: "biometrics", label: "Somatotype & Profile", icon: Calendar },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
              { id: "pro", label: "Apex Pro Paywall", icon: Crown },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    speakText(`Switched tab to ${tab.label}`);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap w-full focus:ring-2 focus:ring-emerald-400 ${
                    isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto" tabIndex={0}>
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Full Inclusive Ecosystem Online</h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Screen reader voice narration, high contrast modes, and Google camera food scanning are fully active for your <strong className="text-emerald-400">{user.somatotype}</strong> setup.
                  </p>
                </div>
                <button 
                  onClick={() => { setActiveTab("diet"); triggerCameraScan(); }} 
                  className="hidden sm:flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl text-xs uppercase focus:ring-2 focus:ring-white"
                  aria-label="Quick launch camera food scanner"
                >
                  <Camera className="h-4 w-4" /> Quick Camera Scan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Global Rank</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">#3 on Leaderboard</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Daily Steps</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{steps.toLocaleString()} steps</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Calories Consumed</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{totalNutritionCals} / {netCalorieTarget} kcal</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <div>
                  <h1 className="text-2xl font-black text-white">Workouts, Guidelines & Screen Reader Audio</h1>
                  <p className="text-xs text-slate-400 mt-1">Select templates or track reps with spoken voice verification.</p>
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800" aria-label={`Workout timer: ${formatTime(workoutTimer)}`}>
                  {formatTime(workoutTimer)}
                </div>
              </div>

              {/* Workout Templates */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Professional Workout Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comprehensiveWorkoutTemplates.map(template => (
                    <div key={template.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">{template.style}</span>
                        <h4 className="font-bold text-white text-base mt-2">{template.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 italic">{template.guideline}</p>
                      </div>
                      <button 
                        onClick={() => loadRoutineTemplate(template)}
                        aria-label={`Load routine template ${template.title}`}
                        className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 py-3 rounded-xl text-xs font-bold transition-all text-center focus:ring-2 focus:ring-white"
                      >
                        Load Routine into Active Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Exercises */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase text-slate-200">Active Session Routine</h3>
                  <button 
                    onClick={() => {
                      const nextState = !workoutActive;
                      setWorkoutActive(nextState);
                      speakText(nextState ? "Workout session timer started." : "Workout session timer paused.");
                    }} 
                    aria-label={workoutActive ? "Pause workout session timer" : "Start workout session timer"}
                    className={`px-4 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-white ${workoutActive ? "bg-rose-500 text-white" : "bg-emerald-500 text-slate-950"}`}
                  >
                    {workoutActive ? "Pause Timer" : "Start Session Timer"}
                  </button>
                </div>
                <div className="space-y-3">
                  {exercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setExercises(exercises.map(i => i.id === ex.id ? {...i, completed: !i.completed} : i));
                            speakText(`Exercise ${ex.name} marked as ${!ex.completed ? "completed" : "incomplete"}`);
                          }}
                          aria-label={`Mark ${ex.name} as ${ex.completed ? "incomplete" : "completed"}`}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center focus:ring-2 focus:ring-white ${ex.completed ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}
                        >
                          {ex.completed && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className={`font-bold text-sm ${ex.completed ? "line-through text-slate-500" : "text-white"}`}>{ex.name}</div>
                          <div className="text-xs text-slate-400">{ex.defaultSets} • Burn Estimate: <span className="text-emerald-400">~{calculateMetCalories(ex.metValue, 30)} kcal</span></div>
                        </div>
                      </div>
                      <button onClick={() => setExercises(exercises.filter(i => i.id !== ex.id))} aria-label={`Remove ${ex.name}`} className="text-xs text-rose-400">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Nutrition, Macros & Google Visual Camera</h1>
                  <p className="text-xs text-slate-400 mt-1">Snap photos with your camera or screen reader interface to log meals automatically.</p>
                </div>
                <button 
                  onClick={triggerCameraScan}
                  aria-label="Scan meal using Google Visual Camera"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg focus:ring-2 focus:ring-white"
                >
                  <Camera className="h-4 w-4" /> Google Visual Scan Meal
                </button>
              </div>

              {cameraActive && (
                <div className="bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-400" /> Google Visual Search Scanner Active
                    </h3>
                    <button onClick={() => setCameraActive(false)} aria-label="Close camera scanner" className="text-xs text-slate-400 hover:text-white">Close Camera</button>
                  </div>
                  
                  <div className="h-48 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200" aria-live="polite">{scanningStatus}</p>
                  </div>

                  {scannedFoodResult && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-emerald-400 font-bold">Detection Successful</div>
                        <div className="font-bold text-white text-base mt-1">{scannedFoodResult.name}</div>
                        <div className="text-xs text-slate-300">{scannedFoodResult.cals} kcal • {scannedFoodResult.protein}g Protein</div>
                      </div>
                      <button 
                        onClick={confirmScannedFood}
                        aria-label="Confirm and log scanned food item"
                        className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase focus:ring-2 focus:ring-white"
                      >
                        Log to Nutrition
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nutrition Log List & Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase">Today's Logged Meals</h3>
                  <div className="space-y-3">
                    {nutritionLog.map(meal => (
                      <div key={meal.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">{meal.mealType}</span>
                          <div className="font-bold text-sm text-white mt-1">{meal.name}</div>
                          <div className="text-xs text-slate-400">{meal.calories} kcal • {meal.protein}g Protein</div>
                        </div>
                        <button onClick={() => setNutritionLog(nutritionLog.filter(m => m.id !== meal.id))} aria-label={`Remove ${meal.name}`} className="text-xs text-rose-400">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase">Log New Meal Manually</h3>
                  <form onSubmit={handleAddMeal} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Meal Name (e.g., Salmon & Rice)" 
                      aria-label="Meal Name"
                      value={newMealName}
                      onChange={(e) => setNewMealName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        placeholder="Calories" 
                        aria-label="Calories"
                        value={newMealCals}
                        onChange={(e) => setNewMealCals(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input 
                        type="number" 
                        placeholder="Protein (g)" 
                        aria-label="Protein in grams"
                        value={newMealProtein}
                        onChange={(e) => setNewMealProtein(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button type="submit" aria-label="Add meal to nutrition log" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase focus:ring-2 focus:ring-white">
                      Add to Nutrition Log
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Global Somatotype Leaderboard</h1>
                  <p className="text-xs text-slate-400 mt-1">Compete globally based on XP and training streaks.</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-800" role="list">
                  {leaderboardData.map(item => (
                    <div key={item.rank} role="listitem" className={`p-4 flex items-center justify-between ${item.name.includes("You") ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-950 text-slate-300 flex items-center justify-center font-bold text-xs">
                          #{item.rank}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {item.name}
                            {item.isPro && <Crown className="h-3.5 w-3.5 text-amber-400" aria-label="Pro User" />}
                          </div>
                          <div className="text-xs text-slate-400">{item.somatotype} • Streak: {item.streak} days</div>
                        </div>
                      </div>
                      <div className="font-black text-emerald-400 text-sm">{item.xp} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 p-8 rounded-3xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-xl">
                  <Crown className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Apex State Pro Membership</h1>
                  <p className="text-sm text-slate-300 mt-2">Unlock unlimited AI coach queries, high-contrast themes, voice narration expansions, and Google camera food recognition.</p>
                </div>
                <button 
                  onClick={() => {
                    setUser({...user, isPro: true});
                    speakText("Congratulations! Apex Pro membership is now active on your account.");
                  }}
                  aria-label="Upgrade account to Apex Pro membership"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-4 rounded-xl text-sm uppercase tracking-wider focus:ring-2 focus:ring-white"
                >
                  {user.isPro ? "Pro Active on Account" : "Upgrade to Pro ($9.99/mo)"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h1 className="text-2xl font-black text-white">Somatotype & Accessibility Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure your body type, goals, and screen reader options.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-3">Somatotype Selection</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "ectomorph", label: "Ectomorph" },
                      { id: "mesomorph", label: "Mesomorph" },
                      { id: "endomorph", label: "Endomorph" },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setUser({...user, somatotype: s.id as any});
                          speakText(`Somatotype updated to ${s.label}`);
                        }}
                        aria-pressed={user.somatotype === s.id}
                        className={`p-4 rounded-xl text-xs font-bold border text-center focus:ring-2 focus:ring-white ${user.somatotype === s.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-4 h-[75vh] flex flex-col">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shrink-0">
                <Bot className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <div>
                  <h1 className="font-black text-white text-base">Apex AI Somatotype Coach</h1>
                  <p className="text-xs text-slate-400">Voice narration enabled for blind and low-vision accessibility.</p>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 flex flex-col" role="log" aria-label="AI Chat History">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-emerald-500 text-slate-950 font-medium'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your AI coach anything..." 
                  aria-label="Chat message input"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" aria-label="Send message" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 rounded-xl font-bold focus:ring-2 focus:ring-white">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
