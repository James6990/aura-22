"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen
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

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  // Persistent User Profile State
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
      cycleDay: 8
    };
  });

  const [steps, setSteps] = useState<number>(8420);
  const baseCaloriesBurned = 1850;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  
  // Persistent Active Exercises State
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apex_active_exercises");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: 1, name: "Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "90kg", completed: false },
      { id: 2, name: "Incline Dumbbell Press", category: "Strength", metValue: 5.0, defaultSets: "3 sets × 10-12 reps", defaultWeight: "32kg", completed: false },
    ];
  });

  // Save changes to localStorage automatically
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

  // Comprehensive Master Workout Templates for All Gym User Types
  const comprehensiveWorkoutTemplates: WorkoutRoutineTemplate[] = [
    {
      id: "ppl-hypertrophy",
      title: "Push / Pull / Legs (PPL) Hypertrophy Split",
      targetUser: "Intermediate to Advanced Bodybuilding",
      style: "Hypertrophy & Aesthetics",
      guideline: "Perform 6 days a week with 1 rest day. Focus on mechanical tension, 60-90s rest intervals, and progressive overload on compound lifts.",
      exercises: [
        { id: 201, name: "Barbell Overhead Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "60kg" },
        { id: 202, name: "Weighted Pull-Ups", category: "Strength", metValue: 8.0, defaultSets: "4 sets × 8 reps", defaultWeight: "Bodyweight + 15kg" },
        { id: 203, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "110kg" },
        { id: 204, name: "Incline Dumbbell Flyes", category: "Strength", metValue: 5.0, defaultSets: "3 sets × 12 reps", defaultWeight: "18kg" }
      ]
    },
    {
      id: "powerlifting-strength",
      title: "5x5 Powerlifting Strength Foundation",
      targetUser: "Strength Seekers & Ectomorphs",
      style: "Absolute Strength",
      guideline: "Perform 3 days a week. Focus on heavy compound lifting with long rest periods (2 to 3 minutes) to maximize neural adaptations.",
      exercises: [
        { id: 205, name: "Heavy Barbell Squat (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "130kg" },
        { id: 206, name: "Flat Barbell Bench Press (5x5)", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 5 reps", defaultWeight: "100kg" },
        { id: 207, name: "Conventional Deadlift", category: "Strength", metValue: 6.0, defaultSets: "3 sets × 5 reps", defaultWeight: "160kg" }
      ]
    },
    {
      id: "fat-loss-circuit",
      title: "Metabolic Conditioning & Fat-Loss WOD",
      targetUser: "Endomorphs & Cutting Phases",
      style: "Cardio & HIIT Circuit",
      guideline: "High-intensity circuits with minimal rest (30s) between stations. Maximizes EPOC (afterburn effect) and hourly caloric burn.",
      exercises: [
        { id: 208, name: "Kettlebell Swings", category: "Circuit", metValue: 11.0, defaultSets: "4 sets × 20 reps", defaultWeight: "24kg" },
        { id: 209, name: "Rowing Machine Intervals", category: "Cardio", metValue: 9.5, defaultSets: "15 mins continuous", defaultWeight: "Moderate Pace" },
        { id: 210, name: "Burpee Box Jumps", category: "Circuit", metValue: 12.0, defaultSets: "4 sets × 12 reps", defaultWeight: "Bodyweight" }
      ]
    },
    {
      id: "calisthenics-mastery",
      title: "Bodyweight Calisthenics & Gymnastics",
      targetUser: "Functional Fitness & Travelers",
      style: "Bodyweight Strength",
      guideline: "Focus on strict form, full range of motion, and advanced progressions (e.g., muscle-ups, pistol squats, handstand push-ups).",
      exercises: [
        { id: 211, name: "Strict Pull-Ups", category: "Strength", metValue: 8.0, defaultSets: "4 sets × max reps", defaultWeight: "Bodyweight" },
        { id: 212, name: "Pistol Squats", category: "Strength", metValue: 7.0, defaultSets: "3 sets × 8 reps/leg", defaultWeight: "Bodyweight" },
        { id: 213, name: "Dips on Parallel Bars", category: "Strength", metValue: 6.5, defaultSets: "4 sets × 12 reps", defaultWeight: "Bodyweight" }
      ]
    }
  ];

  const masterExerciseLibrary: Omit<ExerciseItem, "completed">[] = [
    { id: 101, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "120kg" },
    { id: 102, name: "Heavy Deadlift", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 5 reps", defaultWeight: "140kg" },
    { id: 103, name: "CrossFit Circuit WOD", category: "Circuit", metValue: 10.0, defaultSets: "20 min AMRAP", defaultWeight: "Bodyweight" },
    { id: 104, name: "Brisk Outdoor Walking", category: "Cardio", metValue: 4.3, defaultSets: "30 mins", defaultWeight: "3.5 mph" },
    { id: 105, name: "Running / Jogging", category: "Cardio", metValue: 8.3, defaultSets: "30 mins", defaultWeight: "5 mph" },
    { id: 106, name: "HIIT Sprint Intervals", category: "Cardio", metValue: 12.0, defaultSets: "20 mins", defaultWeight: "Max Effort" },
    { id: 107, name: "Lap Swimming (Moderate)", category: "Cardio", metValue: 8.3, defaultSets: "30 mins", defaultWeight: "Free style" },
    { id: 108, name: "Vinyasa Flow Yoga", category: "Flexibility", metValue: 4.0, defaultSets: "45 mins", defaultWeight: "Bodyweight" },
  ];

  const [selectedCat, setSelectedCat] = useState<string>("All");
  const filteredLibrary = masterExerciseLibrary.filter(item => selectedCat === "All" || item.category === selectedCat);

  const addExerciseToRoutine = (ex: Omit<ExerciseItem, "completed">) => {
    if (exercises.some(item => item.name === ex.name)) return;
    setExercises([...exercises, { ...ex, id: Date.now(), completed: false }]);
  };

  const loadRoutineTemplate = (template: WorkoutRoutineTemplate) => {
    const newItems: ExerciseItem[] = template.exercises.map((ex, idx) => ({
      ...ex,
      id: Date.now() + idx,
      completed: false
    }));
    setExercises(newItems);
  };

  const calculateMetCalories = (met: number, durationMins: number) => {
    return Math.round(met * user.weightKg * (durationMins / 60));
  };

  const [macros] = useState({ protein: 180, carbs: 220, fats: 70, baseTarget: 2200 });
  const netCalorieTarget = Math.round(macros.baseTarget + (steps * 0.02));

  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Hello ${user.name}! Your workspace is now backed by persistent Local Storage. All routine setups, custom weights, and somatotype profiles will remain saved on your device.` }
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
      let aiReply = `As a ${user.somatotype} focused on ${user.primaryGoal}, your data is securely cached locally.`;
      if (userText.toLowerCase().includes("template") || userText.toLowerCase().includes("split")) {
        aiReply = `You can pick from PPL, 5x5 Strength, Fat-Loss Circuits, or Calisthenics right inside the Workouts tab!`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950">
            AX
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              APEX STATE OS
            </span>
            <p className="text-xs text-slate-400">Persistent Local Storage & Workouts Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase">
            {user.somatotype} • {user.primaryGoal}
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0">
          <nav className="flex lg:flex-col gap-1 w-full">
            {[
              { id: "dashboard", label: "Overview", icon: Activity },
              { id: "workout", label: "Workouts & Guidelines", icon: Dumbbell },
              { id: "diet", label: "Nutrition & Steps", icon: Utensils },
              { id: "biometrics", label: "Somatotype & Profile", icon: Calendar },
              { id: "ai-coach", label: "Apex AI Coach", icon: Bot },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap w-full ${
                    isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl">
                <h1 className="text-2xl font-black text-white">System Persistent & Ready</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Your customized routine edits, weight scale entries, and somatotype configurations (<strong className="text-emerald-400">{user.somatotype}</strong>) are automatically saved to your browser's local storage.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Body Weight</div>
                  <div className="text-2xl font-black text-white mt-1">{user.weightKg} kg</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Step Count Burn</div>
                  <div className="text-2xl font-black text-orange-400 mt-1">+{Math.round(steps * 0.04)} kcal</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Net Calorie Budget</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{netCalorieTarget} kcal</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <div>
                  <h1 className="text-2xl font-black text-white">Workouts, Guidelines & Templates</h1>
                  <p className="text-xs text-slate-400 mt-1">Choose pre-built blueprints designed for all gym users, complete with MET-calculated calorie burns.</p>
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  {formatTime(workoutTimer)}
                </div>
              </div>

              {/* Pre-built Gym Routine Templates for All Users */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <BookOpen className="h-4 w-4" />
                  <h3>Professional Workout Templates & Guidelines</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comprehensiveWorkoutTemplates.map(template => (
                    <div key={template.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">{template.style}</span>
                          <span className="text-xs text-slate-400">{template.targetUser}</span>
                        </div>
                        <h4 className="font-bold text-white text-base mt-2">{template.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 italic">"{template.guideline}"</p>
                      </div>
                      <button 
                        onClick={() => loadRoutineTemplate(template)}
                        className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                      >
                        Load Routine into Active Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Session Routine */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Active Session Routine (Persisted)</h3>
                  <button onClick={() => setWorkoutActive(!workoutActive)} className={`px-4 py-1.5 rounded-xl text-xs font-bold ${workoutActive ? "bg-rose-500 text-white" : "bg-emerald-500 text-slate-950"}`}>
                    {workoutActive ? "Pause Timer" : "Start Session Timer"}
                  </button>
                </div>
                <div className="space-y-3">
                  {exercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setExercises(exercises.map(i => i.id === ex.id ? {...i, completed: !i.completed} : i))}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center ${ex.completed ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}
                        >
                          {ex.completed && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className={`font-bold text-sm ${ex.completed ? "line-through text-slate-500" : "text-white"}`}>{ex.name}</div>
                          <div className="text-xs text-slate-400">{ex.defaultSets} • Burn Estimate: <span className="text-emerald-400">~{calculateMetCalories(ex.metValue, 30)} kcal / 30m</span></div>
                        </div>
                      </div>
                      <button onClick={() => setExercises(exercises.filter(i => i.id !== ex.id))} className="text-xs text-rose-400">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Exercise & MET Library */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-bold text-white text-base">Global Exercise & MET Library</h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {["All", "Strength", "Cardio", "Circuit", "Flexibility"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${selectedCat === cat ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-950 border border-slate-800 text-slate-400"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {filteredLibrary.map(item => (
                    <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">{item.category} (MET: {item.metValue})</span>
                        <div className="font-bold text-sm text-white mt-1.5">{item.name}</div>
                        <div className="text-xs text-slate-400">Burns ~{calculateMetCalories(item.metValue, 30)} kcal per 30 mins</div>
                      </div>
                      <button 
                        onClick={() => addExerciseToRoutine(item)}
                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h1 className="text-2xl font-black text-white">Somatotype & Body Goal Configuration</h1>
                <p className="text-xs text-slate-400 mt-1">Changes here instantly save locally across device reloads.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-3">Select Somatotype (Body Type)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "ectomorph", label: "Ectomorph (Lean / Fast Metabolism)" },
                      { id: "mesomorph", label: "Mesomorph (Athletic / Balanced)" },
                      { id: "endomorph", label: "Endomorph (Sturdy / Fat Storage)" },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setUser({...user, somatotype: s.id as any})}
                        className={`p-4 rounded-xl text-xs font-bold border text-center ${user.somatotype === s.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-3">Primary Fitness Goal</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "muscle-gain", label: "Muscle Hypertrophy" },
                      { id: "fat-loss", label: "Fat Loss & Conditioning" },
                      { id: "recomposition", label: "Body Recomposition" },
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setUser({...user, primaryGoal: g.id as any})}
                        className={`p-4 rounded-xl text-xs font-bold border text-center ${user.primaryGoal === g.id ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-2">Current Body Weight: <span className="text-emerald-400">{user.weightKg} kg</span></label>
                  <input 
                    type="range" 
                    min="40" 
                    max="140" 
                    value={user.weightKg} 
                    onChange={(e) => setUser({...user, weightKg: Number(e.target.value)})}
                    className="w-full accent-emerald-500 bg-slate-950" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-coach" && (
            <div className="space-y-4 h-[75vh] flex flex-col">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shrink-0">
                <Bot className="h-5 w-5 text-emerald-400" />
                <div>
                  <h1 className="font-black text-white text-base">Apex AI Somatotype Coach</h1>
                  <p className="text-xs text-slate-400">Contextualized for your {user.somatotype} profile and local saved settings.</p>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 flex flex-col">
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
                  placeholder="Ask about workout templates or splits..." 
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 rounded-xl font-bold">
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
