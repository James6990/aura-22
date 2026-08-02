"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, Flame, Dumbbell, Utensils, Users, Sparkles, 
  ChevronRight, Lock, Unlock, Zap, Activity, Award, 
  TrendingUp, Shield, RefreshCw, CheckCircle2, Heart, 
  Send, Bot, Globe, Filter, Crown, Cpu, ArrowUpRight,
  Bluetooth, Footprints, Calendar, BatteryCharging, Radio, Plus, Search, BookOpen, Clock, PieChart, Camera, Volume2, ShieldAlert, Sword, MessageSquare, UserPlus, Smile, Mic, Eye, UsersRound, ShieldCheck, Star, Target, ZapOff, FlameKindling
} from "lucide-react";

type TabType = "dashboard" | "workout" | "diet" | "bloodline" | "leaderboard" | "ai-coach" | "pro" | "biometrics" | "badges" | "devices" | "social";

type UserArchetype = "bodybuilder" | "fatloss" | "athlete" | "endurance" | "vitality";

type DietaryRestriction = "standard" | "vegetarian" | "gluten-free" | "keto" | "dairy-free";

interface UserProfile {
  name: string;
  isPro: boolean;
  proType: "solo" | "bloodline" | "none";
  xp: number;
  streak: number;
  weightKg: number;
  archetype: UserArchetype;
  somatotype: "ectomorph" | "mesomorph" | "endomorph";
  primaryGoal: "muscle-gain" | "fat-loss" | "recomposition" | "endurance" | "longevity";
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
  targetArchetype: UserArchetype;
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

interface MealPlanTemplate {
  id: string;
  title: string;
  targetArchetype: UserArchetype;
  dietaryRestriction?: DietaryRestriction;
  goal: string;
  totalCalories: number;
  description: string;
  meals: Omit<NutritionItem, "id">[];
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
  role: string;
  streak: number;
  status: string;
  avatarBg: string;
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  
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
      weightKg: 82,
      archetype: "bodybuilder",
      somatotype: "mesomorph",
      primaryGoal: "muscle-gain",
      gender: "male",
      menstrualPhase: "n/a",
      cycleDay: 1,
      league: "Ruby",
      leagueRank: 4,
      vitalityMode: false
    };
  });

  const [steps, setSteps] = useState<number>(10420);
  const baseCaloriesBurned = 2100;
  const activeCaloriesBurned = Math.round(baseCaloriesBurned + (steps * 0.04));

  // Boss Battle State (PvE)
  const [bossHp, setBossHp] = useState<number>(34200);
  const bossMaxHp = 50000;

  // Recovery Debt State
  const [recoveryDebtPct, setRecoveryDebtPct] = useState<number>(24);

  // Real Speech Recognition Hook State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Bluetooth Connected Devices State
  const [connectedDevice, setConnectedDevice] = useState<string>("Apex Smart Ring v2 (Paired)");
  const [isScanningDevices, setIsScanningDevices] = useState<boolean>(false);

  // Apex Cyber-Sigils & Badges
  const [badges, setBadges] = useState<BadgeItem[]>([
    { id: "b1", title: "Iron Core Ignition", description: "Complete your first 7-day training streak", rarity: "Common", icon: "🔥", unlocked: true, xpReward: 250, chatFlair: "🔥 [Iron Core]" },
    { id: "b2", title: "Neural Surge Overlord", description: "Log 50,000 cumulative steps in a single week", rarity: "Rare", icon: "⚡", unlocked: true, xpReward: 500, chatFlair: "⚡ [Neural Surge]" },
    { id: "b3", title: "Plate Visionary", description: "Scan 10 meals using the Apex AI Camera", rarity: "Rare", icon: "📸", unlocked: false, xpReward: 600, chatFlair: "📸 [Visual Elite]" },
    { id: "b4", title: "Titan Sovereign", description: "Reach Diamond League rank and defeat 3 Raid Bosses", rarity: "Legendary", icon: "👑", unlocked: false, xpReward: 2000, chatFlair: "👑 [Titan Sovereign]" },
  ]);

  // Bloodline Syndicate Pass
  const [bloodlineMembers, setBloodlineMembers] = useState<BloodlineMember[]>([
    { id: "bl1", name: "Alex Vance (You)", role: "Syndicate Commander", streak: 14, status: "Crushing hyper-trophy split 💪", avatarBg: "from-emerald-500 to-cyan-500" },
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
      { id: 1, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 6-8 reps", defaultWeight: "140kg", completed: false },
      { id: 2, name: "Romanian Deadlift", category: "Strength", metValue: 6.5, defaultSets: "4 sets × 8-10 reps", defaultWeight: "120kg", completed: false },
      { id: 3, name: "Leg Press Hypertrophy", category: "Hypertrophy", metValue: 5.5, defaultSets: "3 sets × 12-15 reps", defaultWeight: "220kg", completed: false }
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
      { id: 301, name: "Oatmeal with Whey Protein & Peanut Butter", calories: 620, protein: 42, carbs: 65, fats: 18, mealType: "Breakfast" },
      { id: 302, name: "Sirloin Steak, Jasmine Rice & Asparagus", calories: 750, protein: 58, carbs: 70, fats: 22, mealType: "Lunch" }
    ];
  });

  // Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>("");
  const [scannedFoodResult, setScannedFoodResult] = useState<{name: string; cals: number; protein: number} | null>(null);

  // Social & Friends State
  const [friends, setFriends] = useState<FriendItem[]>([
    { id: "f1", name: "Marcus T.", status: "Just crushed Leg Day 🔥", streak: 21, avatarColor: "from-emerald-500 to-cyan-500" },
    { id: "f2", name: "Elena R.", status: "Marathon endurance prep 🏃", streak: 12, avatarColor: "from-purple-500 to-pink-500" },
    { id: "f3", name: "David K.", status: "Logging 15,000 steps sprint", streak: 8, avatarColor: "from-amber-500 to-orange-500" }
  ]);

  const [squadMessages, setSquadMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "Marcus T.", text: "Who is hitting heavy squats today? Let's get these reps in!", timestamp: "10:42 AM" },
    { id: "m2", sender: "Elena R.", text: "Intervals complete! Sending massive power to everyone ⚡", timestamp: "10:45 AM" }
  ]);
  const [squadInput, setSquadInput] = useState<string>("");

  // AI Coach Chat State
  const [aiChatMessages, setAiChatMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: `Welcome back, ${user.name}! As your Apex AI Coach, I've calibrated your protocols for your current ${user.archetype.toUpperCase()} focus. How can I assist your gains or recovery today?` }
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
        setVoiceTranscript("Listening to voice command...");
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      setIsListening(true);
      setVoiceTranscript("Simulated Voice: Logging 400 calorie meal...");
      setTimeout(() => {
        setIsListening(false);
        setNutritionLog(prev => [...prev, {
          id: Date.now(),
          name: "Voice Log High-Protein Snack",
          calories: 400,
          protein: 35,
          carbs: 30,
          fats: 10,
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
        calories: 450,
        protein: 40,
        carbs: 35,
        fats: 12,
        mealType: "Snack"
      }]);
      setVoiceTranscript(`Successfully logged: "${command}"`);
    } else {
      setAiChatMessages(prev => [...prev, { role: 'user', text: command }, { role: 'ai', text: `Processed voice instruction: "${command}". Keep pushing your limits!` }]);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_user_profile", JSON.stringify(user));
    }
  }, [user]);

  const toggleExerciseComplete = (id: number) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    setUser(prev => ({ ...prev, xp: prev.xp + 60 }));
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
      let reply = `As a ${user.archetype}, keeping your progressive overload consistent is key. Ensure your protein timing aligns with your training window.`;
      if (text.toLowerCase().includes("recovery") || text.toLowerCase().includes("fatigue")) {
        reply = `Your recovery debt is currently ${recoveryDebtPct}%. You are in prime condition to tackle heavy workloads.`;
      }
      setAiChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 1000);
  };

  // Comprehensive Multi-Archetype Workout Planners Catalog
  const comprehensiveWorkoutTemplates: WorkoutRoutineTemplate[] = [
    {
      id: "bodybuilder-ppl",
      title: "Elite Bodybuilder Push / Pull / Legs",
      targetArchetype: "bodybuilder",
      style: "Hypertrophy & Mass Building",
      guideline: "High-volume mechanical tension focused on maximum fiber recruitment and muscular fullness.",
      exercises: [
        { id: 201, name: "Barbell Bench Press", category: "Strength", metValue: 6.0, defaultSets: "4 sets × 8-10 reps", defaultWeight: "110kg" },
        { id: 202, name: "Weighted Barbell Rows", category: "Strength", metValue: 6.5, defaultSets: "4 sets × 8-10 reps", defaultWeight: "100kg" },
        { id: 203, name: "Barbell Back Squat", category: "Strength", metValue: 6.0, defaultSets: "5 sets × 6-8 reps", defaultWeight: "140kg" }
      ]
    },
    {
      id: "fatloss-metabolic",
      title: "Metabolic Shred & Fat Loss Circuit",
      targetArchetype: "fatloss",
      style: "High Calorie Burn / HIIT",
      guideline: "Compound circuit training designed to maximize excess post-exercise oxygen consumption (EPIC).",
      exercises: [
        { id: 210, name: "Kettlebell Swings & Snatches", category: "Cardio / Strength", metValue: 8.0, defaultSets: "4 sets × 20 reps", defaultWeight: "24kg" },
        { id: 211, name: "Burpee Box Jumps", category: "Plyometrics", metValue: 9.0, defaultSets: "4 sets × 12 reps", defaultWeight: "Bodyweight" },
        { id: 212, name: "Rowing Machine Intervals", category: "Cardio", metValue: 7.5, defaultSets: "5 rounds × 500m", defaultWeight: "Damager 7" }
      ]
    },
    {
      id: "athlete-power",
      title: "Power & Explosive Athletic Split",
      targetArchetype: "athlete",
      style: "Speed, Power & Agility",
      guideline: "Develops fast-twitch muscle fibers, explosive force production, and multi-directional stability.",
      exercises: [
        { id: 220, name: "Power Clean & Jerk", category: "Power", metValue: 8.5, defaultSets: "5 sets × 3 reps", defaultWeight: "90kg" },
        { id: 221, name: "Trap Bar Deadlifts", category: "Power", metValue: 7.0, defaultSets: "4 sets × 5 reps", defaultWeight: "160kg" },
        { id: 222, name: "Depth Jumps to Rebound", category: "Plyometrics", metValue: 8.0, defaultSets: "4 sets × 6 reps", defaultWeight: "Bodyweight" }
      ]
    },
    {
      id: "endurance-stamina",
      title: "Cardiovascular Stamina & Engine Builder",
      targetArchetype: "endurance",
      style: "Aerobic Capacity & Threshold",
      guideline: "Targeted zone 2 training mixed with lactate threshold intervals for peak cardiovascular efficiency.",
      exercises: [
        { id: 230, name: "Threshold Running Intervals", category: "Endurance", metValue: 9.0, defaultSets: "6 rounds × 800m", defaultWeight: "Pace: 4:15/km" },
        { id: 231, name: "Assault Bike Sustained Cadence", category: "Endurance", metValue: 8.5, defaultSets: "45 minutes steady", defaultWeight: "180 Watts" },
        { id: 232, name: "Core & Rotational Stability", category: "Core", metValue: 4.5, defaultSets: "4 sets × 60 sec", defaultWeight: "Bodyweight" }
      ]
    },
    {
      id: "vitality-longevity",
      title: "Vitality & Joint Longevity Protocol",
      targetArchetype: "vitality",
      style: "Joint Health & Mobility",
      guideline: "Low-impact range of motion and functional strength for lifelong mobility and wellness.",
      exercises: [
        { id: 240, name: "Controlled Articular Rotations (CARs)", category: "Mobility", metValue: 3.5, defaultSets: "Daily Sequence", defaultWeight: "Bodyweight" },
        { id: 241, name: "Goblet Squat with Pause", category: "Strength", metValue: 5.0, defaultSets: "3 sets × 10 reps", defaultWeight: "24kg" },
        { id: 242, name: "Suspension Trainer Rows", category: "Strength", metValue: 4.5, defaultSets: "3 sets × 12 reps", defaultWeight: "Bodyweight" }
      ]
    }
  ];

  // Comprehensive Multi-Archetype & Dietary Restricted Meal Planner Catalog
  const mealPlanTemplates: MealPlanTemplate[] = [
    {
      id: "bodybuilder-mass",
      title: "Hypertrophy Mass Builder",
      targetArchetype: "bodybuilder",
      dietaryRestriction: "standard",
      goal: "Muscle Gain (3,200 kcal)",
      totalCalories: 3200,
      description: "High-protein, high-carb macro distribution engineered for maximum muscle protein synthesis and recovery.",
      meals: [
        { name: "Scrambled Eggs, Whole Oats & Banana Protein Shake", calories: 750, protein: 48, carbs: 85, fats: 22, mealType: "Breakfast" },
        { name: "Grilled Chicken Breast, Jasmine Rice & Avocado", calories: 820, protein: 62, carbs: 90, fats: 20, mealType: "Lunch" },
        { name: "Greek Yogurt, Almond Butter & Honey Bowl", calories: 530, protein: 36, carbs: 48, fats: 18, mealType: "Snack" },
        { name: "Lean Sirloin Steak, Baked Sweet Potato & Asparagus", calories: 1100, protein: 74, carbs: 95, fats: 32, mealType: "Dinner" }
      ]
    },
    {
      id: "fatloss-shred",
      title: "Metabolic Shred & Fat Loss Plan",
      targetArchetype: "fatloss",
      dietaryRestriction: "standard",
      goal: "Fat Loss (1,750 kcal)",
      totalCalories: 1750,
      description: "Nutrient-dense, high-satiety low-calorie plan designed to preserve lean muscle while stripping body fat.",
      meals: [
        { name: "Egg White Omelet with Spinach, Mushrooms & Feta", calories: 310, protein: 35, carbs: 10, fats: 12, mealType: "Breakfast" },
        { name: "Grilled Turkey Turkey Salad with Olive Oil Dressing", calories: 420, protein: 46, carbs: 18, fats: 16, mealType: "Lunch" },
        { name: "Whey Isolate Shake with Berries & Water", calories: 180, protein: 32, carbs: 10, fats: 2, mealType: "Snack" },
        { name: "Baked White Fish with Steamed Broccoli & Quinoa", calories: 480, protein: 45, carbs: 38, fats: 9, mealType: "Dinner" }
      ]
    },
    {
      id: "vegetarian-plant",
      title: "Plant-Powered Vegetarian Muscle Plan",
      targetArchetype: "bodybuilder",
      dietaryRestriction: "vegetarian",
      goal: "Vegetarian Muscle Gain (2,600 kcal)",
      totalCalories: 2600,
      description: "High-protein vegetarian meal plan utilizing paneer, lentils, Greek yogurt, and plant isolates.",
      meals: [
        { name: "Tofu & Spinach Scramble with Whole Wheat Toast", calories: 480, protein: 32, carbs: 45, fats: 16, mealType: "Breakfast" },
        { name: "Lentil & Quinoa Power Bowl with Tahini Dressing", calories: 650, protein: 38, carbs: 78, fats: 20, mealType: "Lunch" },
        { name: "Cottage Cheese with Pineapple and Almonds", calories: 340, protein: 30, carbs: 24, fats: 10, mealType: "Snack" },
        { name: "Chickpea & Paneer Curry with Brown Rice", calories: 1130, protein: 46, carbs: 110, fats: 38, mealType: "Dinner" }
      ]
    },
    {
      id: "glutenfree-shred",
      title: "Gluten-Free Clean Energy & Shred",
      targetArchetype: "fatloss",
      dietaryRestriction: "gluten-free",
      goal: "Gluten-Free Fat Loss (1,900 kcal)",
      totalCalories: 1900,
      description: "Strictly wheat- and gluten-free nutrition plan emphasizing lean proteins and complex certified-gf carbs.",
      meals: [
        { name: "Certified Gluten-Free Oatmeal with Chia & Berry Protein", calories: 420, protein: 28, carbs: 62, fats: 8, mealType: "Breakfast" },
        { name: "Grilled Chicken Breast with Sweet Potato & Green Beans", calories: 550, protein: 52, carbs: 45, fats: 12, mealType: "Lunch" },
        { name: "Rice Cakes with Almond Butter", calories: 250, protein: 8, carbs: 30, fats: 12, mealType: "Snack" },
        { name: "Baked Cod with Quinoa and Roasted Zucchini", calories: 680, protein: 48, carbs: 55, fats: 14, mealType: "Dinner" }
      ]
    },
    {
      id: "keto-performance",
      title: "Ketogenic Fat Adaptation",
      targetArchetype: "fatloss",
      dietaryRestriction: "keto",
      goal: "Low-Carb Ketogenic Shred (2,000 kcal)",
      totalCalories: 2000,
      description: "Low-carbohydrate, high-fat structural layout optimized for metabolic fat adaptation.",
      meals: [
        { name: "Whole Eggs, Avocado, and Bacon Scramble", calories: 550, protein: 26, carbs: 6, fats: 46, mealType: "Breakfast" },
        { name: "Grilled Salmon over Mixed Greens with Olive Oil & Walnuts", calories: 650, protein: 38, carbs: 8, fats: 50, mealType: "Lunch" },
        { name: "Macadamia Nuts and Cheese Cubes", calories: 300, protein: 8, carbs: 4, fats: 28, mealType: "Snack" },
        { name: "Ribeye Steak with Butter-Sautéed Asparagus", calories: 500, protein: 42, carbs: 5, fats: 35, mealType: "Dinner" }
      ]
    },
    {
      id: "dairyfree-vitality",
      title: "Dairy-Free Clean Vitality",
      targetArchetype: "vitality",
      dietaryRestriction: "dairy-free",
      goal: "Lactose-Free Daily Wellness (2,200 kcal)",
      totalCalories: 2200,
      description: "Completely dairy-free approach avoiding all lactose while maintaining micronutrient density.",
      meals: [
        { name: "Almond Milk Protein Smoothie with Spinach, Banana, and Pea Protein", calories: 420, protein: 32, carbs: 50, fats: 8, mealType: "Breakfast" },
        { name: "Turkey Breast and Avocado Wrap on Rice Tortilla", calories: 580, protein: 40, carbs: 45, fats: 22, mealType: "Lunch" },
        { name: "Apple Slices with Sunflower Seed Butter", calories: 280, protein: 6, carbs: 28, fats: 16, mealType: "Snack" },
        { name: "Baked Turkey Meatballs with Marinara and Gluten-Free Pasta", calories: 920, protein: 55, carbs: 95, fats: 24, mealType: "Dinner" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Navigation & Status Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  APEX STATE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v3.5 ULTIMATE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Commander: <strong className="text-slate-200">{user.name}</strong> ({user.archetype.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <Flame className="w-4 h-4 text-orange-400"/>
              <span>Streak: <strong className="text-orange-400">{user.streak}d</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <Zap className="w-4 h-4 text-cyan-400"/>
              <span>XP: <strong className="text-cyan-400">{user.xp}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <Trophy className="w-4 h-4 text-amber-400"/>
              <span>{user.league} #{user.leagueRank}</span>
            </div>
            <button 
              onClick={startVoiceRecognition}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}
            >
              {isListening ? <Volume2 className="w-4 h-4 animate-spin"/> : <Mic className="w-4 h-4"/>}
              <span>{isListening ? "Listening..." : "Voice Log"}</span>
            </button>
          </div>
        </div>

        {/* Voice Transcript Banner */}
        {voiceTranscript && (
          <div className="max-w-7xl mx-auto mt-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
            <span>🎙️ {voiceTranscript}</span>
            <button onClick={() => setVoiceTranscript("")} className="text-slate-400 hover:text-white">×</button>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto mt-3 pt-2 border-t border-slate-800/80 scrollbar-none">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "workout", label: "Workouts", icon: Dumbbell },
            { id: "diet", label: "Nutrition", icon: Utensils },
            { id: "bloodline", label: "Bloodline", icon: UsersRound },
            { id: "leaderboard", label: "Leagues", icon: Trophy },
            { id: "ai-coach", label: "AI Coach", icon: Bot },
            { id: "pro", label: "Pro Pass", icon: Crown },
            { id: "biometrics", label: "Biometrics", icon: Heart },
            { id: "badges", label: "Badges", icon: Award },
            { id: "devices", label: "Devices", icon: Bluetooth },
            { id: "social", label: "Social", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                <Icon className="w-4 h-4"/>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Hero Banner / Boss Battle Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-6 shadow-2xl">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest flex items-center gap-1">
                      <Sword className="w-3 h-3"/> Raid Boss Active: Titan Golem
                    </span>
                    <span className="text-xs text-slate-400">Global Syndicate Raid</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                    Crush Today's Protocol, Commander
                  </h1>
                  <p className="text-sm text-slate-300 max-w-xl">
                    Your current archetype is set to <strong className="text-emerald-400 uppercase">{user.archetype}</strong>. Complete workouts and log your nutrition to weaken the Raid Boss and climb the Ruby League.
                  </p>
                </div>

                {/* Boss HP Bar Widget */}
                <div className="bg-slate-950/80 border border-slate-700 p-4 rounded-xl w-full md:w-72 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-red-400 flex items-center gap-1"><Sword className="w-3.5 h-3.5"/> Titan Golem HP</span>
                    <span className="text-slate-300">{bossHp} / {bossMaxHp}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-orange-500 h-full transition-all duration-500" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}></div>
                  </div>
                  <button 
                    onClick={() => {
                      if (bossHp > 1000) {
                        setBossHp(prev => prev - 1200);
                        setUser(u => ({ ...u, xp: u.xp + 150 }));
                      }
                    }}
                    className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5"/> Strike Boss (-1,200 HP)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Active Calories</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{activeCaloriesBurned} <span className="text-xs font-normal text-slate-400">kcal</span></h3>
                  <p className="text-[10px] text-emerald-400 mt-1">↑ 12% vs yesterday</p>
                </div>
                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                  <Flame className="w-6 h-6"/>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Daily Steps</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{steps.toLocaleString()}</h3>
                  <p className="text-[10px] text-cyan-400 mt-1">Goal: 12,000 steps</p>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <Footprints className="w-6 h-6"/>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Recovery Debt</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{recoveryDebtPct}%</h3>
                  <p className="text-[10px] text-emerald-400 mt-1">Optimal recovery state</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Activity className="w-6 h-6"/>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Syndicate League</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{user.league}</h3>
                  <p className="text-[10px] text-amber-400 mt-1">Rank #{user.leagueRank} in tier</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Trophy className="w-6 h-6"/>
                </div>
              </div>
            </div>

            {/* Today's Active Protocol & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-400"/> Today's Assigned Protocol ({user.archetype.toUpperCase()})
                  </h2>
                  <button onClick={() => setActiveTab("workout")} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                    View All Workouts <ChevronRight className="w-3.5 h-3.5"/>
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((ex) => (
                    <div key={ex.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${ex.completed ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300' : 'bg-slate-800/40 border-slate-700/60 text-white'}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleExerciseComplete(ex.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${ex.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 hover:border-emerald-400'}`}>
                          {ex.completed && <CheckCircle2 className="w-4 h-4"/>}
                        </button>
                        <div>
                          <h4 className={`font-semibold text-sm ${ex.completed ? 'line-through text-slate-400' : 'text-white'}`}>{ex.name}</h4>
                          <p className="text-xs text-slate-400">{ex.defaultSets} • Load: {ex.defaultWeight}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {ex.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight & Somatotype Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400"/> Apex Bio-Analysis
                </h2>
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Somatotype:</span>
                    <strong className="text-cyan-400 uppercase">{user.somatotype}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Primary Goal:</span>
                    <strong className="text-emerald-400 uppercase">{user.primaryGoal}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Gender / Protocol:</span>
                    <strong className="text-white uppercase">{user.gender}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <p className="text-xs text-slate-300 font-medium">💡 AI Coach Recommendation</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Based on your {user.archetype} profile, ensure you hit at least 1.8g of protein per kg of body weight today. Your recovery metrics indicate peak readiness for heavy compound lifts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= WORKOUT TAB ================= */}
        {activeTab === "workout" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-emerald-400"/> Comprehensive Workout Vault
                </h1>
                <p className="text-sm text-slate-400">
                  Select from professional templates tailored for every archetype and fitness objective.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Archetype:</span>
                <select 
                  value={user.archetype}
                  onChange={(e) => setUser(prev => ({ ...prev, archetype: e.target.value as UserArchetype }))}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 uppercase font-bold"
                >
                  <option value="bodybuilder">Bodybuilder</option>
                  <option value="fatloss">Fat Loss</option>
                  <option value="athlete">Athlete</option>
                  <option value="endurance">Endurance</option>
                  <option value="vitality">Vitality</option>
                </select>
              </div>
            </div>

            {/* Workout Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comprehensiveWorkoutTemplates.map((template) => {
                const isSelectedArchetype = template.targetArchetype === user.archetype;
                return (
                  <div key={template.id} className={`bg-slate-900 border rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all ${isSelectedArchetype ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50' : 'border-slate-800'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${isSelectedArchetype ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                          {template.targetArchetype}
                        </span>
                        <span className="text-xs text-cyan-400 font-semibold">{template.style}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{template.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{template.guideline}</p>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <p className="text-xs font-bold text-slate-300">Included Exercises:</p>
                        {template.exercises.map((ex, idx) => (
                          <div key={idx} className="text-xs text-slate-400 flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                            <span>{ex.name}</span>
                            <span className="text-emerald-400">{ex.defaultSets}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setExercises(template.exercises.map(e => ({ ...e, completed: false })));
                        setUser(u => ({ ...u, archetype: template.targetArchetype }));
                        alert(`Successfully loaded ${template.title} into your active daily protocol!`);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Zap className="w-4 h-4"/> Load Protocol
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= DIET TAB ================= */}
        {activeTab === "diet" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-emerald-400"/> Apex Nutrition & Meal Plans
                </h1>
                <p className="text-sm text-slate-400">
                  Comprehensive macro-calculated meal plans, dietary restrictions, and AI Camera food scanner.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 uppercase font-bold"
                >
                  <option value="all">All Diets</option>
                  <option value="standard">Standard</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="keto">Keto</option>
                  <option value="dairy-free">Dairy-Free</option>
                </select>

                <button 
                  onClick={() => setCameraActive(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                >
                  <Camera className="w-4 h-4"/> AI Scanner
                </button>
              </div>
            </div>

            {/* AI Camera Scanner Modal / View */}
            {cameraActive && (
              <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setCameraActive(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕ Close Camera</button>
                </div>
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Camera className="w-5 h-5"/> Apex AI Vision Food & Macro Analyzer
                </h3>
                <p className="text-xs text-slate-300">
                  Point your camera at your plate or upload an image to instantly extract exact calories, protein, carbs, and fats.
                </p>

                <div className="p-8 rounded-xl bg-slate-950 border border-dashed border-cyan-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
                    <Camera className="w-8 h-8"/>
                  </div>
                  <p className="text-xs text-slate-400">Simulating AI visual neural scan...</p>
                  <button 
                    onClick={() => {
                      const detected = { name: "Grilled Salmon, Quinoa & Avocado Salad", cals: 650, protein: 48 };
                      setScannedFoodResult(detected);
                      setNutritionLog(prev => [...prev, {
                        id: Date.now(),
                        name: detected.name,
                        calories: detected.cals,
                        protein: detected.protein,
                        carbs: 45,
                        fats: 22,
                        mealType: "Lunch"
                      }]);
                    }}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all"
                  >
                    Capture & Analyze Meal Plate
                  </button>

                  {scannedFoodResult && (
                    <div className="mt-4 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-left space-y-1">
                      <p className="text-xs font-bold text-emerald-400">✨ Successfully Scanned & Logged:</p>
                      <p className="text-sm font-bold text-white">{scannedFoodResult.name}</p>
                      <p className="text-xs text-slate-300">Calories: {scannedFoodResult.cals} kcal | Protein: {scannedFoodResult.protein}g</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meal Plan Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlanTemplates
                .filter(plan => dietaryFilter === "all" || plan.dietaryRestriction === dietaryFilter)
                .map((plan) => (
                  <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {plan.dietaryRestriction || "standard"}
                        </span>
                        <span className="text-xs text-cyan-400 font-semibold">{plan.totalCalories} kcal</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <p className="text-xs font-bold text-slate-300">Included Meals:</p>
                        {plan.meals.map((m, idx) => (
                          <div key={idx} className="text-xs text-slate-400 flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                            <span className="truncate max-w-[180px]">{m.name}</span>
                            <span className="text-emerald-400">{m.calories} cals</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setNutritionLog(plan.meals.map((m, idx) => ({ ...m, id: Date.now() + idx })));
                        alert(`Successfully loaded ${plan.title} into your daily nutrition log!`);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Utensils className="w-4 h-4"/> Load Meal Plan
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= BLOODLINE TAB ================= */}
        {activeTab === "bloodline" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <UsersRound className="w-6 h-6 text-emerald-400"/> Bloodline Family Syndicate
                </h1>
                <p className="text-sm text-slate-400">
                  Sync training streaks and hold family members accountable in your exclusive private syndicate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white">Active Bloodline Members</h3>
                  <div className="space-y-3">
                    {bloodlineMembers.map((member) => (
                      <div key={member.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${member.avatarBg} flex items-center justify-center font-bold text-slate-950`}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{member.name}</h4>
                            <p className="text-xs text-slate-400">{member.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5"/> {member.streak}d Streak
                            </span>
                            <span className="text-[10px] text-slate-400">{member.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invite Family Member */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400"/> Invite Family & Friends
                </h3>
                <p className="text-xs text-slate-400">
                  Add family members to your Bloodline Syndicate so you can view each other's workout completions and boost collective XP.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email"
                    placeholder="family.member@apex.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={() => {
                      if (!inviteEmail) return;
                      setBloodlineMembers(prev => [...prev, {
                        id: `bl-${Date.now()}`,
                        name: inviteEmail.split("@")[0],
                        role: "Syndicate Recruit",
                        streak: 1,
                        status: "Joined the Bloodline 🔥",
                        avatarBg: "from-pink-500 to-rose-500"
                      }]);
                      setInviteEmail("");
                      alert("Syndicate invitation dispatched successfully!");
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4"/> Send Syndicate Invite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= LEADERBOARD TAB ================= */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400"/> Ruby League Leaderboard
                </h1>
                <p className="text-sm text-slate-400">
                  Compete globally for weekly XP supremacy and promotion to Sapphire League.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Kratos_Lift", xp: 5420, isPro: true },
                  { rank: 2, name: "Valkyrie_Fit", xp: 4890, isPro: true },
                  { rank: 3, name: "Titan_Jax", xp: 3920, isPro: false },
                  { rank: 4, name: `${user.name} (You)`, xp: user.xp, isPro: user.isPro, isUser: true },
                  { rank: 5, name: "Iron_Nova", xp: 2650, isPro: false },
                ].map((member) => (
                  <div key={member.rank} className={`p-4 rounded-xl border flex items-center justify-between ${member.isUser ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700/60'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${member.rank === 1 ? 'bg-amber-500 text-slate-950' : member.rank === 2 ? 'bg-slate-300 text-slate-950' : member.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        #{member.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          {member.name} {member.isPro && <Crown className="w-3.5 h-3.5 text-amber-400"/>}
                        </h4>
                        <p className="text-xs text-slate-400">Ruby League Contender</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-cyan-400">{member.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= AI COACH TAB ================= */}
        {activeTab === "ai-coach" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-emerald-400"/> Apex AI Personal Coach
                </h1>
                <p className="text-sm text-slate-400">
                  Consult your somatotype-aware intelligence engine for workout adaptations and recovery tips.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-[550px] flex flex-col justify-between">
              <div className="overflow-y-auto space-y-4 pr-2 flex-1">
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shrink-0">
                        AI
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl ${msg.role === 'user' ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAiChat} className="flex gap-2 pt-4 border-t border-slate-800">
                <input 
                  type="text"
                  placeholder="Ask your AI coach about sets, rep ranges, or recovery..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                  <Send className="w-4 h-4"/> Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= PRO PASS TAB ================= */}
        {activeTab === "pro" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 py-6">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Crown className="w-4 h-4"/> Apex Pro & Bloodline Pass
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Unlock Unlimited Somatotype AI & Family Syndicates
              </h1>
              <p className="text-sm text-slate-400">
                Take your physical transformation to elite tiers with automated biometric ring syncing, voice meal logging, and unlimited AI coaching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Apex Solo Pro</h3>
                  <p className="text-xs text-slate-400">For individual commanders seeking advanced biometric analysis.</p>
                  <div className="text-3xl font-extrabold text-cyan-400">$9.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Unlimited AI Coach & Voice Log</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> AI Camera Meal Scanner</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Advanced Smart Ring Integration</li>
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    setUser(u => ({ ...u, isPro: true, proType: "solo" }));
                    alert("Successfully activated Apex Solo Pro!");
                  }}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Activate Solo Pro Pass
                </button>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-slate-900 border border-amber-500/50 rounded-2xl p-8 space-y-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                  Best Value
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400"/> Apex Bloodline Family Pass
                  </h3>
                  <p className="text-xs text-slate-400">Unlock shared family syndicates and collective raid bosses for up to 5 members.</p>
                  <div className="text-3xl font-extrabold text-amber-400">$19.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400"/> Up to 5 Family Members Included</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400"/> Syndicate Boss Battles & Rewards</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400"/> All Solo Pro Features Included</li>
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    setUser(u => ({ ...u, isPro: true, proType: "bloodline" }));
                    alert("Successfully activated Apex Bloodline Family Pass!");
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
                >
                  Activate Bloodline Family Pass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= BIOMETRICS TAB ================= */}
        {activeTab === "biometrics" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-emerald-400"/> Biometric & Recovery Telemetry
              </h1>
              <p className="text-sm text-slate-400">
                Real-time tracking of heart rate variability, sleep quality, and active strain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <p className="text-xs text-slate-400">Heart Rate Variability (HRV)</p>
                <h3 className="text-3xl font-extrabold text-white">78 <span className="text-xs text-slate-400 font-normal">ms</span></h3>
                <p className="text-xs text-emerald-400">Optimal autonomic nervous balance</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <p className="text-xs text-slate-400">Resting Heart Rate (RHR)</p>
                <h3 className="text-3xl font-extrabold text-white">52 <span className="text-xs text-slate-400 font-normal">bpm</span></h3>
                <p className="text-xs text-cyan-400">Athletic cardiovascular conditioning</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <p className="text-xs text-slate-400">Sleep Restoration Score</p>
                <h3 className="text-3xl font-extrabold text-white">92 <span className="text-xs text-slate-400 font-normal">/ 100</span></h3>
                <p className="text-xs text-emerald-400">Deep sleep: 2h 14m</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= BADGES TAB ================= */}
        {activeTab === "badges" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400"/> Cyber-Sigils & Achievement Badges
              </h1>
              <p className="text-sm text-slate-400">
                Unlock legendary badges to gain XP rewards and exclusive chat flairs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {badges.map((badge) => (
                <div key={badge.id} className={`p-6 rounded-2xl border flex items-center justify-between ${badge.unlocked ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-900/50 border-slate-800 opacity-70'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      {badge.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{badge.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{badge.rarity}</span>
                      </div>
                      <p className="text-xs text-slate-400">{badge.description}</p>
                      <p className="text-[10px] text-cyan-400 font-semibold">Reward: +{badge.xpReward} XP | Chat Flair: {badge.chatFlair}</p>
                    </div>
                  </div>

                  <div>
                    {badge.unlocked ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Unlocked
                      </span>
                    ) : (
                      <button 
                        onClick={() => claimBadgeReward(badge.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                      >
                        Claim (+{badge.xpReward} XP)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= DEVICES TAB ================= */}
        {activeTab === "devices" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Bluetooth className="w-6 h-6 text-emerald-400"/> Bluetooth Wearable Sync
              </h1>
              <p className="text-sm text-slate-400">
                Connect your Apex Smart Ring, smart scale, and heart rate chest straps.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Radio className="w-5 h-5 animate-pulse"/>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">{connectedDevice}</h4>
                    <p className="text-xs text-emerald-400">Battery: 88% • Signal: Strong</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Connected
                </span>
              </div>

              <button 
                onClick={() => {
                  setIsScanningDevices(true);
                  setTimeout(() => {
                    setIsScanningDevices(false);
                    alert("Scanned and verified Bluetooth telemetry with Apex Smart Ring v2.");
                  }, 1500);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                {isScanningDevices ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Bluetooth className="w-4 h-4"/>}
                <span>{isScanningDevices ? "Scanning Bluetooth Bands..." : "Scan for New Wearables"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SOCIAL TAB ================= */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-400"/> Syndicate Squad Feed & Chat
              </h1>
              <p className="text-sm text-slate-400">
                Interact with your training squad, share workout completions, and push each other forward.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-[500px] flex flex-col justify-between">
                <div className="overflow-y-auto space-y-3 pr-2 flex-1">
                  {squadMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-emerald-400">{msg.sender}</strong>
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <input 
                    type="text"
                    placeholder="Broadcast message to your syndicate..."
                    value={squadInput}
                    onChange={(e) => setSquadInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={() => {
                      if (!squadInput.trim()) return;
                      setSquadMessages(prev => [...prev, {
                        id: `m-${Date.now()}`,
                        sender: `${user.name} (You)`,
                        text: squadInput,
                        timestamp: "Just now"
                      }]);
                      setSquadInput("");
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Friends List */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white">Squad Members</h3>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${friend.avatarColor} flex items-center justify-center font-bold text-slate-950 text-xs`}>
                          {friend.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-white">{friend.name}</h4>
                          <p className="text-[10px] text-slate-400">{friend.status}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3"/> {friend.streak}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
