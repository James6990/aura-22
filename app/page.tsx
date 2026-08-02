"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera
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
      cycleDay: 8
    };
  });

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

  // Camera / Google Visual Search Simulation State
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
      id: "upper-lower-power",
      title: "Upper / Lower Heavy Power Split",
      targetUser: "Intermediate Lifters & Athletes",
      style: "Maximal Force & Hypertrophy",
      guideline: "4 days a week split. Focus on heavy multi-joint movements followed by targeted accessory volume for joint health and growth.",
      exercises: [
        { id: 214, name: "Weighted Dips", category: "Strength", metValue: 6.5, defaultSets: "4 sets × 6-8 reps", defaultWeight: "Bodyweight + 20kg" },
        { id: 215, name: "Pendlay Barbell Row", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "85kg" },
        { id: 216, name: "Romanian Deadlift (RDL)", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "115kg" },
        { id: 217, name: "Standing Barbell Military Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6 reps", defaultWeight: "65kg" }
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
    { id: 115, name: "Front Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "95kg" },
    { id: 116, name: "Sumo Deadlift", category: "Strength", metValue: 6.0, defaultSets: "3 sets × 5 reps", defaultWeight: "150kg" },
    { id: 117, name: "Incline Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "80kg" },
    { id: 118, name: "Close-Grip Bench Press", category: "Strength", metValue: 6.0, defaultSets: "3 sets × 8-10 reps", defaultWeight: "75kg" },
    { id: 119, name: "Standing Barbell Military Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "65kg" },
    { id: 120, name: "Dumbbell Lateral Raises", category: "Strength", metValue: 5.0, defaultSets: "4 sets × 12-15 reps", defaultWeight: "14kg" },
    { id: 121, name: "Barbell Bent-Over Row", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8 reps", defaultWeight: "90kg" },
    { id: 122, name: "T-Bar Row", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "70kg" },
    { id: 123, name: "Lat Pulldown (Wide Grip)", category: "Strength", metValue: 5.0, defaultSets: "4 sets × 10-12 reps", defaultWeight: "70kg" },
    { id: 124, name: "Seated Cable Row", category: "Strength", metValue: 5.0, defaultSets: "4 sets × 10 reps", defaultWeight: "75kg" },
    { id: 125, name: "Romanian Deadlift (RDL)", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "110kg" },
    { id: 126, name: "Bulgarian Split Squats", category: "Strength", metValue: 6.0, defaultSets: "3 sets × 10 reps/leg", defaultWeight: "24kg db" },
    { id: 127, name: "Leg Press (45 Degree)", category: "Strength", metValue: 5.5, defaultSets: "4 sets × 10-12 reps", defaultWeight: "220kg" },
    { id: 128, name: "Barbell Hip Thrust", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 10 reps", defaultWeight: "140kg" },
    { id: 129, name: "Standing Barbell Bicep Curl", category: "Strength", metValue: 4.5, defaultSets: "3 sets × 10-12 reps", defaultWeight: "35kg" },
    { id: 130, name: "Tricep Overhead Cable Extension", category: "Strength", metValue: 4.5, defaultSets: "3 sets × 12-15 reps", defaultWeight: "30kg" },
    { id: 131, name: "Standing Calf Raises", category: "Strength", metValue: 4.0, defaultSets: "4 sets × 15 reps", defaultWeight: "100kg" },
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
  };

  // Simulate Google Vision Camera Food Recognition
  const triggerCameraScan = () => {
    setCameraActive(true);
    setScanningStatus("Analyzing image via Google Visual Search Engine...");
    setScannedFoodResult(null);

    setTimeout(() => {
      setScanningStatus("Match found: Avocado & Poached Eggs on Sourdough Toast");
      setScannedFoodResult({
        name: "Avocado & Poached Eggs on Sourdough",
        cals: 420,
        protein: 22
      });
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
  };

  // Leaderboard mockup data
  const leaderboardData: LeaderboardUser[] = [
    { rank: 1, name: "Marcus Thorne", xp: 5420, streak: 45, somatotype: "Mesomorph", isPro: true },
    { rank: 2, name: "Elena Rostova", xp: 4890, streak: 30, somatotype: "Ectomorph", isPro: true },
    { rank: 3, name: "Alex Vance (You)", xp: user.xp, streak: user.streak, somatotype: user.somatotype, isPro: user.isPro },
    { rank: 4, name: "David Kim", xp: 2100, streak: 8, somatotype: "Endomorph", isPro: false },
    { rank: 5, name: "Sarah Jenkins", xp: 1950, streak: 14, somatotype: "Mesomorph", isPro: false },
  ];

  const [chatMessages, setChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Hello ${user.name}! Google Visual Camera Scanner, Leaderboards, Pro Paywall, and all biometrics are fully operational.` }
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
      let aiReply = `As a ${user.gender} (${user.somatotype}) focused on ${user.primaryGoal}, your hormonal phase is currently logged as ${user.menstrualPhase} (Day ${user.cycleDay}).`;
      if (userText.toLowerCase().includes("camera") || userText.toLowerCase().includes("scan")) {
        aiReply = `You can use the Google Visual Camera Scanner in the Nutrition tab to instantly snap or upload a meal for automatic calorie logging!`;
      } else if (userText.toLowerCase().includes("pro") || userText.toLowerCase().includes("paywall")) {
        aiReply = `Upgrading to Apex Pro unlocks advanced AI coaching, limitless routine templates, and priority leaderboard placements.`;
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
            <p className="text-xs text-slate-400">Camera Scanner, Leaderboards & Pro Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("pro")} 
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-bold uppercase hover:bg-amber-500/20 transition-all"
          >
            <Crown className="h-3.5 w-3.5" />
            {user.isPro ? "PRO ACTIVE" : "UPGRADE PRO"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <aside className="w-full lg:w-64 border-r border-slate-800 p-4 flex lg:flex-col gap-2 overflow-x-auto shrink-0">
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
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Full Feature Suite Online</h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Google Visual Camera food scanning, Global Leaderboards, and Pro Paywall systems are fully integrated into your <strong className="text-emerald-400">{user.somatotype}</strong> environment.
                  </p>
                </div>
                <button onClick={() => setActiveTab("diet")} className="hidden sm:flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl text-xs uppercase">
                  <Camera className="h-4 w-4" /> Open Camera Scan
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
                  <h1 className="text-2xl font-black text-white">Workouts, Guidelines & Templates</h1>
                  <p className="text-xs text-slate-400 mt-1">Expanded strength splits and comprehensive movement library with MET calculation.</p>
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  {formatTime(workoutTimer)}
                </div>
              </div>

              {/* Pre-built Gym Routine Templates */}
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
                  <h3 className="font-bold text-white text-base">Global Exercise & MET Library (Expanded Strength)</h3>
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

          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Nutrition, Macros & Google Visual Camera</h1>
                  <p className="text-xs text-slate-400 mt-1">Scan meals using your camera or log them manually to track calories.</p>
                </div>
                <button 
                  onClick={triggerCameraScan}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="h-4 w-4" /> Google Visual Scan Meal
                </button>
              </div>

              {/* Camera Scanner Simulation Modal Box */}
              {cameraActive && (
                <div className="bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-400" /> Google Visual Search Scanner Active
                    </h3>
                    <button onClick={() => setCameraActive(false)} className="text-xs text-slate-400 hover:text-white">Close Camera</button>
                  </div>
                  
                  <div className="h-48 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{scanningStatus}</p>
                  </div>

                  {scannedFoodResult && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-emerald-400 font-bold uppercase">Detection Successful</div>
                        <div className="font-bold text-white text-base mt-1">{scannedFoodResult.name}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{scannedFoodResult.cals} kcal • {scannedFoodResult.protein}g Protein</div>
                      </div>
                      <button 
                        onClick={confirmScannedFood}
                        className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase"
                      >
                        Log to Nutrition
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Calories Consumed</div>
                  <div className="text-2xl font-black text-white mt-1">{totalNutritionCals} / {netCalorieTarget} kcal</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Protein Intake</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{totalNutritionProtein}g / 180g</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400">Step Count Sync</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{steps.toLocaleString()} steps</div>
                </div>
              </div>

              {/* Step Adjuster */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase block">Simulate Step Counter: <span className="text-cyan-400">{steps.toLocaleString()} steps</span></label>
                <input 
                  type="range" 
                  min="1000" 
                  max="25000" 
                  step="500"
                  value={steps} 
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950" 
                />
              </div>

              {/* Nutrition Log List & Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase">Today's Logged Meals</h3>
                  <div className="space-y-3">
                    {nutritionLog.map(meal => (
                      <div key={meal.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">{meal.mealType}</span>
                          <div className="font-bold text-sm text-white mt-1">{meal.name}</div>
                          <div className="text-xs text-slate-400">{meal.calories} kcal • {meal.protein}g Protein</div>
                        </div>
                        <button onClick={() => setNutritionLog(nutritionLog.filter(m => m.id !== meal.id))} className="text-xs text-rose-400">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase">Log New Meal Manually</h3>
                  <form onSubmit={handleAddMeal} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Meal Name (e.g., Salmon & Sweet Potato)" 
                      value={newMealName}
                      onChange={(e) => setNewMealName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        placeholder="Calories" 
                        value={newMealCals}
                        onChange={(e) => setNewMealCals(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input 
                        type="number" 
                        placeholder="Protein (g)" 
                        value={newMealProtein}
                        onChange={(e) => setNewMealProtein(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <select 
                      value={newMealType}
                      onChange={(e) => setNewMealType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                    <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase">
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
                  <p className="text-xs text-slate-400 mt-1">Compete globally based on XP earned, training consistency, and streaks.</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-400" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-800">
                  {leaderboardData.map(item => (
                    <div key={item.rank} className={`p-4 flex items-center justify-between ${item.name.includes("You") ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${item.rank === 1 ? "bg-amber-500 text-slate-950" : item.rank === 2 ? "bg-slate-300 text-slate-950" : item.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-950 text-slate-400"}`}>
                          #{item.rank}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {item.name}
                            {item.isPro && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                          </div>
                          <div className="text-xs text-slate-400">{item.somatotype} • Streak: <span className="text-orange-400">{item.streak} days</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400 text-sm">{item.xp} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 p-8 rounded-3xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Crown className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Apex State Pro Membership</h1>
                  <p className="text-sm text-slate-300 mt-2">Unlock unlimited AI coach queries, advanced somatotype analytics, priority Google camera recognition, and exclusive pro workout routines.</p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-left space-y-3">
                  {[
                    "Unlimited Google Visual Camera Food & Meal Scanning",
                    "Advanced Somatotype & Hormonal Phase Optimization",
                    "Unlimited AI Coach Access with Custom Splits",
                    "Priority Global Leaderboard Badge & Perks"
                  ].map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setUser({...user, isPro: true});
                    alert("Congratulations! Apex Pro is now active.");
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-4 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
                >
                  {user.isPro ? "Pro Active on Account" : "Upgrade to Pro ($9.99/mo)"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h1 className="text-2xl font-black text-white">Somatotype, Gender & Hormonal Configuration</h1>
                <p className="text-xs text-slate-400 mt-1">Changes here instantly save locally across device reloads.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-3">Biological Gender & Hormonal Cycle Tracking</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "female", label: "Female (Cycle / Menopause)" },
                      { id: "male", label: "Male" },
                      { id: "other", label: "Other / Unspecified" },
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setUser({...user, gender: g.id as any})}
                        className={`p-4 rounded-xl text-xs font-bold border text-center ${user.gender === g.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {user.gender === "female" && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Current Menstrual / Hormonal Phase</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "follicular", label: "Follicular" },
                        { id: "ovulatory", label: "Ovulatory" },
                        { id: "luteal", label: "Luteal" },
                        { id: "menstrual", label: "Menstrual" },
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => setUser({...user, menstrualPhase: p.id as any})}
                          className={`p-3 rounded-xl text-xs font-bold border text-center ${user.menstrualPhase === p.id ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                  <p className="text-xs text-slate-400">Contextualized for your {user.gender} profile ({user.somatotype}) and active hormone phase.</p>
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
                  placeholder="Ask about camera scanning, leaderboard, or nutrition..." 
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
