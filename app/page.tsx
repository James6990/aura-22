"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Utensils,
  Trophy,
  Bot,
  Heart,
  Bluetooth,
  Award,
  MessageSquare,
  Crown,
  Flame,
  Zap,
  Shield,
  Footprints,
  Cpu,
  Mic,
  Star,
  CheckCircle2,
  Camera,
  Sparkles,
  UserPlus,
  RefreshCw,
  Send,
  ShieldAlert,
  Sword,
  Filter
} from "lucide-react";

// ==================== TYPES & INTERFACES ====================

type TabType =
  | "dashboard"
  | "workout"
  | "diet"
  | "bloodline"
  | "leaderboard"
  | "ai-coach"
  | "biometrics"
  | "devices"
  | "badges"
  | "social"
  | "pro";

type UserArchetype = "bodybuilder" | "fatloss" | "athlete" | "endurance" | "vitality";
type DietaryRestriction = "standard" | "plant-based" | "gluten-free" | "keto" | "dairy-free";

interface UserProfile {
  name: string;
  archetype: UserArchetype;
  primaryGoal: string;
  xp: number;
  streak: number;
  league: string;
  leagueRank: number;
  isPro: boolean;
  proType?: "solo" | "bloodline";
  dietaryRestriction: DietaryRestriction;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  defaultSets: string;
  defaultWeight: string;
  completed?: boolean;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  targetArchetype: UserArchetype;
  style: string;
  guideline: string;
  exercises: Exercise[];
}

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner";
}

interface MealPlanTemplate {
  id: string;
  title: string;
  targetArchetype: UserArchetype;
  goal: string;
  totalCalories: number;
  description: string;
  meals: Omit<Meal, "id">[];
}

interface LeagueUser {
  rank: number;
  name: string;
  xp: number;
  isPro: boolean;
  isUser?: boolean;
}

interface BloodlineMember {
  id: string;
  name: string;
  role: string;
  streak: number;
  status: string;
  avatarBg: string;
}

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  rarity: "Epic" | "Legendary" | "Mythic" | "Rare";
  icon: string;
  xpReward: number;
  unlocked: boolean;
}

interface SquadMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

// ==================== MAIN COMPONENT ====================

export default function ApexStateApp() {
  // Navigation & Core User State
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [user, setUser] = useState<UserProfile>({
    name: "Alex Mercer",
    archetype: "bodybuilder",
    primaryGoal: "Hypertrophy & Strength Optimization",
    xp: 3250,
    streak: 14,
    league: "Ruby",
    leagueRank: 4,
    isPro: true,
    proType: "solo",
    dietaryRestriction: "standard"
  });

  // Daily Stats & PvE Boss State
  const [steps, setSteps] = useState(8420);
  const [activeCaloriesBurned, setActiveCaloriesBurned] = useState(720);
  const [recoveryDebtPct, setRecoveryDebtPct] = useState(14);
  const [bossHp, setBossHp] = useState(42500);
  const [bossMaxHp] = useState(100000);

  // Dynamic Workout Tracking State
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: "e1", name: "Incline Barbell Bench Press", category: "Chest", defaultSets: "4 Sets x 8-10 Reps", defaultWeight: "225 lbs", completed: true },
    { id: "e2", name: "Weighted Pull-Ups", category: "Back", defaultSets: "4 Sets x 6-8 Reps", defaultWeight: "+45 lbs", completed: true },
    { id: "e3", name: "Seated Cable Rows", category: "Back", defaultSets: "3 Sets x 12 Reps", defaultWeight: "180 lbs", completed: false },
    { id: "e4", name: "Dumbbell Lateral Raises", category: "Shoulders", defaultSets: "4 Sets x 15 Reps", defaultWeight: "35 lbs", completed: false }
  ]);

  // Dynamic Nutrition Tracking State
  const [nutritionLog, setNutritionLog] = useState<Meal[]>([
    { id: 101, name: "Cybernetic Protein Oats & Whey", calories: 550, protein: 45, carbs: 65, fats: 10, mealType: "Breakfast" },
    { id: 102, name: "Grilled Chicken & Jasmine Rice Bowl", calories: 720, protein: 60, carbs: 80, fats: 12, mealType: "Lunch" }
  ]);

  // AI & Hardware States
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [, setScannedFoodResult] = useState<{ name: string; cals: number; protein: number } | null>(null);
  const [isScanningDevices, setIsScanningDevices] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState("Apex Smart Ring v2 (Synched)");

  // Social & Bloodline States
  const [inviteEmail, setInviteEmail] = useState("");
  const [bloodlineMembers, setBloodlineMembers] = useState<BloodlineMember[]>([
    { id: "b1", name: "Sarah Mercer", role: "Bloodline Partner", streak: 12, status: "Crushed Legs Today! 🦵", avatarBg: "from-pink-500 to-rose-500" },
    { id: "b2", name: "Marcus Mercer", role: "Bloodline Recruit", streak: 6, status: "10k Steps Completed 🏃", avatarBg: "from-blue-500 to-indigo-500" }
  ]);

  // AI Chat Assistant State
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Apex Neural Core online. How can I optimize your biomechanics or macro structure today?" }
  ]);

  // Squad Chat Messages
  const [squadInput, setSquadInput] = useState("");
  const [squadMessages, setSquadMessages] = useState<SquadMessage[]>([
    { id: "m1", sender: "Valerie Vance", text: "Who is attacking the Goliath Boss today? We have 40k HP left!", timestamp: "10:42 AM" },
    { id: "m2", sender: "Kurosh_X", text: "Just hit 10k steps. Dealing damage to Goliath now! 💥", timestamp: "11:15 AM" }
  ]);

  // Achievement Badges
  const [badges, setBadges] = useState<AchievementBadge[]>([
    { id: "bg1", title: "Iron Goliath", description: "Deal over 10,000 HP damage to a Raid Boss", rarity: "Legendary", icon: "⚔️", xpReward: 500, unlocked: true },
    { id: "bg2", title: "Macro Master", description: "Hit your daily macro targets within +/- 2% accuracy 7 days in a row", rarity: "Epic", icon: "🥗", xpReward: 300, unlocked: false },
    { id: "bg3", title: "Bloodline Sentinel", description: "Maintain a 14-day streak with your Bloodline Squad", rarity: "Mythic", icon: "🛡️", xpReward: 1000, unlocked: true }
  ]);

  // ==================== DYNAMIC AI NUTRITION & MACRO ENGINE ====================
  
  const generateDynamicMealPlan = (archetype: UserArchetype, restriction: DietaryRestriction) => {
    let baseCals = 2500;
    let proteinTarget = 180;
    let carbTarget = 250;
    let fatTarget = 70;

    if (archetype === "bodybuilder") {
      baseCals = 3200;
      proteinTarget = 210;
      carbTarget = 380;
      fatTarget = 85;
    } else if (archetype === "fatloss") {
      baseCals = 1900;
      proteinTarget = 190;
      carbTarget = 140;
      fatTarget = 55;
    } else if (archetype === "endurance") {
      baseCals = 2800;
      proteinTarget = 140;
      carbTarget = 420;
      fatTarget = 65;
    }

    let stapleIngredients: string[] = [];
    let restrictionLabel = "Standard Performance";

    if (restriction === "plant-based") {
      restrictionLabel = "Plant-Based / Vegetarian Bodybuilding";
      stapleIngredients = ["Tempeh", "Firm Tofu", "Seitan", "Low-Fat Greek Yogurt", "Cottage Cheese", "Lentils", "Edamame", "Hemp Seeds"];
    } else if (restriction === "gluten-free") {
      restrictionLabel = "Gluten-Free Clean Energy & Shred";
      stapleIngredients = ["Certified GF Oats", "Brown Rice", "Quinoa", "Sweet Potatoes", "Buckwheat", "Lean White Fish", "Skinless Poultry"];
    } else if (restriction === "keto") {
      restrictionLabel = "Ketogenic & Low-Carb Performance";
      stapleIngredients = ["Whole Eggs", "Avocados", "Macadamia Nuts", "Olive Oil", "Salmon", "Grass-Fed Beef", "Leafy Greens"];
      carbTarget = 35;
      fatTarget = 160;
    } else if (restriction === "dairy-free") {
      restrictionLabel = "Dairy-Free / Allergen-Conscious";
      stapleIngredients = ["Pea-Protein Isolate", "Almond Milk", "Coconut Yogurt", "Canned Sardines", "Nutritional Yeast", "Chicken Breast", "Jasmine Rice"];
    } else {
      stapleIngredients = ["Chicken Breast", "Jasmine Rice", "Whole Eggs", "Broccoli", "Olive Oil", "Oats", "Whey Protein"];
    }

    const constructedMeals: Omit<Meal, "id">[] = [
      {
        name: `Apex ${restrictionLabel} Breakfast (${stapleIngredients[0]} & ${stapleIngredients[1]})`,
        calories: Math.round(baseCals * 0.25),
        protein: Math.round(proteinTarget * 0.25),
        carbs: Math.round(carbTarget * 0.25),
        fats: Math.round(fatTarget * 0.25),
        mealType: "Breakfast"
      },
      {
        name: `High-Performance Midday Fuel (${stapleIngredients[2]} & ${stapleIngredients[3] || stapleIngredients[0]})`,
        calories: Math.round(baseCals * 0.35),
        protein: Math.round(proteinTarget * 0.35),
        carbs: Math.round(carbTarget * 0.35),
        fats: Math.round(fatTarget * 0.35),
        mealType: "Lunch"
      },
      {
        name: `Cellular Recovery Evening Meal (${stapleIngredients[4] || stapleIngredients[1]} & ${stapleIngredients[5] || stapleIngredients[2]})`,
        calories: Math.round(baseCals * 0.40),
        protein: Math.round(proteinTarget * 0.40),
        carbs: Math.round(carbTarget * 0.40),
        fats: Math.round(fatTarget * 0.40),
        mealType: "Dinner"
      }
    ];

    return {
      title: `AI Synthesized: ${restrictionLabel}`,
      targetArchetype: archetype,
      totalCalories: baseCals,
      protein: proteinTarget,
      carbs: carbTarget,
      fats: fatTarget,
      description: `Dynamically generated protocol using strictly ${restrictionLabel} rules for ${archetype.toUpperCase()}.`,
      meals: constructedMeals
    };
  };

  // Helper Functions & Handlers
  const toggleExerciseComplete = (id: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === id) {
          const nextState = !ex.completed;
          if (nextState) {
            setUser(u => ({ ...u, xp: u.xp + 50 }));
            setBossHp(hp => Math.max(0, hp - 500));
          }
          return { ...ex, completed: nextState };
        }
        return ex;
      })
    );
  };

  const handleSendAiChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = aiChatInput;
    setAiChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiChatInput("");

    setTimeout(() => {
      let botResponse = `Analysis complete for "${userMsg}". Considering your current ${user.archetype} protocol, maintain your progressive overload while managing recovery debt.`;
      if (userMsg.toLowerCase().includes("protein") || userMsg.toLowerCase().includes("diet")) {
        botResponse = `Based on your ${user.dietaryRestriction.toUpperCase()} filter, ensure you target high bioavailability sources. Your current protein goal is optimized for hypertrophy.`;
      }
      setAiChatMessages(prev => [...prev, { role: "bot", text: botResponse }]);
    }, 1000);
  };

  const startVoiceRecognition = () => {
    setIsListening(true);
    setVoiceTranscript("Listening to voice command...");
    setTimeout(() => {
      setIsListening(false);
      setVoiceTranscript('Logged: "Logged 1 glass of water & 30 mins cardio (+100 XP)"');
      setUser(u => ({ ...u, xp: u.xp + 100 }));
    }, 2500);
  };

  const claimBadgeReward = (badgeId: string) => {
    setBadges(prev =>
      prev.map(b => {
        if (b.id === badgeId && !b.unlocked) {
          setUser(u => ({ ...u, xp: u.xp + b.xpReward }));
          return { ...b, unlocked: true };
        }
        return b;
      })
    );
  };

  // Pre-configured Workout Templates
  const comprehensiveWorkoutTemplates: WorkoutTemplate[] = [
    {
      id: "wt-bodybuilder",
      title: "Hypertrophy Push/Pull Matrix",
      targetArchetype: "bodybuilder",
      style: "High Volume & Mechanical Tension",
      guideline: "Focus on 8-12 reps per set with a 3-second eccentric phase.",
      exercises: [
        { id: "e1", name: "Incline Barbell Bench Press", category: "Chest", defaultSets: "4 Sets x 8-10 Reps", defaultWeight: "225 lbs" },
        { id: "e2", name: "Weighted Pull-Ups", category: "Back", defaultSets: "4 Sets x 6-8 Reps", defaultWeight: "+45 lbs" },
        { id: "e3", name: "Standing Overhead Press", category: "Shoulders", defaultSets: "3 Sets x 8 Reps", defaultWeight: "155 lbs" }
      ]
    },
    {
      id: "wt-fatloss",
      title: "Metabolic Conditioning & Density",
      targetArchetype: "fatloss",
      style: "Short Rest Intervals & HIIT",
      guideline: "Limit rest periods to 45 seconds between sets to optimize caloric burn.",
      exercises: [
        { id: "e4", name: "Kettlebell Swings", category: "Full Body", defaultSets: "5 Sets x 20 Reps", defaultWeight: "53 lbs" },
        { id: "e5", name: "Barbell Thrusters", category: "Full Body", defaultSets: "4 Sets x 12 Reps", defaultWeight: "95 lbs" },
        { id: "e6", name: "Box Jumps", category: "Legs", defaultSets: "4 Sets x 15 Reps", defaultWeight: "30 inch" }
      ]
    },
    {
      id: "wt-endurance",
      title: "Mitochondrial Stamina Protocol",
      targetArchetype: "endurance",
      style: "Zone 2 Cardio & High Rep Resistance",
      guideline: "Keep heart rate steady between 130-145 BPM.",
      exercises: [
        { id: "e7", name: "Rowing Machine Intervals", category: "Cardio", defaultSets: "4 Sets x 1000m", defaultWeight: "Pace 1:55/500m" },
        { id: "e8", name: "Walking Dumbbell Lunges", category: "Legs", defaultSets: "3 Sets x 30 Reps", defaultWeight: "30 lbs each" }
      ]
    }
  ];

  // Meal Templates
  const mealPlanTemplates: MealPlanTemplate[] = [
    {
      id: "hypertrophy-pro",
      title: "Pro Anabolic Muscle Builder Plan",
      targetArchetype: "bodybuilder",
      goal: "Muscle Growth & Recovery (3,200 kcal)",
      totalCalories: 3200,
      description: "High protein, high carbohydrate structure for optimal glycogen loading and tissue repair.",
      meals: [
        { name: "Cybernetic Oats & Egg White Omelet", calories: 650, protein: 50, carbs: 75, fats: 12, mealType: "Breakfast" },
        { name: "Lean Beef & Rice Bowl with Broccoli", calories: 850, protein: 65, carbs: 95, fats: 20, mealType: "Lunch" },
        { name: "Whey Protein Shake & Rice Cakes", calories: 380, protein: 40, carbs: 45, fats: 4, mealType: "Snack" },
        { name: "Pasta with Lean Ground Turkey & Marinara", calories: 920, protein: 55, carbs: 120, fats: 18, mealType: "Dinner" }
      ]
    },
    {
      id: "vitality-longevity",
      title: "Vitality & Anti-Inflammatory Longevity Plan",
      targetArchetype: "vitality",
      goal: "Cellular Health & Wellness (2,100 kcal)",
      totalCalories: 2100,
      description: "Rich in antioxidants, omega-3 fatty acids, and clean micro-nutrients to promote long-term vitality.",
      meals: [
        { name: "Chia Seed Pudding with Berries & Walnuts", calories: 410, protein: 14, carbs: 38, fats: 22, mealType: "Breakfast" },
        { name: "Wild Caught Salmon Salad with Olive Oil", calories: 580, protein: 46, carbs: 15, fats: 34, mealType: "Lunch" },
        { name: "Green Tea & Handful of Mixed Raw Nuts", calories: 250, protein: 8, carbs: 12, fats: 20, mealType: "Snack" },
        { name: "Organic Tofu or Chicken Stir-Fry", calories: 660, protein: 44, carbs: 55, fats: 24, mealType: "Dinner" }
      ]
    }
  ];

  // Dynamic Plan synthesized on demand
  const dynamicPlan = generateDynamicMealPlan(user.archetype, user.dietaryRestriction);

  // League Rankings Data
  const leagueUsers: LeagueUser[] = [
    { rank: 1, name: "Valerie Vance", xp: 4890, isPro: true },
    { rank: 2, name: "Kurosh_X", xp: 3950, isPro: false },
    { rank: 3, name: "Sarah Connor", xp: 3420, isPro: true },
    { rank: 4, name: user.name, xp: user.xp, isPro: user.isPro, isUser: true },
    { rank: 5, name: "Jaxson Steel", xp: 2650, isPro: false },
    { rank: 6, name: "Elena Rostova", xp: 2100, isPro: true }
  ];

  const totalNutritionCals = nutritionLog.reduce((sum, item) => sum + item.calories, 0);
  const totalNutritionProtein = nutritionLog.reduce((sum, item) => sum + item.protein, 0);
  const totalNutritionCarbs = nutritionLog.reduce((sum, item) => sum + item.carbs, 0);
  const totalNutritionFats = nutritionLog.reduce((sum, item) => sum + item.fats, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* TOP HEADER NAVIGATION */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Cpu className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">APEX STATE</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">V2.6 PRO</span>
            </div>
            <p className="text-xs text-slate-400">Cybernetic Fitness & Bio-Optimization Matrix</p>
          </div>
        </div>

        {/* User Stats Bar */}
        <div className="hidden md:flex items-center space-x-6 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-2xl">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-xs font-bold">{user.streak} Day Streak</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold">{user.xp.toLocaleString()} XP</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">{user.league} League</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={startVoiceRecognition}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isListening ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? "Listening..." : "Voice Log"}</span>
          </button>

          <button 
            onClick={() => setActiveTab("pro")}
            className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            <span>UPGRADE PRO</span>
          </button>
        </div>
      </header>

      {/* VOICE TRANSCRIPT TOAST NOTIFICATION */}
      {voiceTranscript && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 text-center text-xs text-emerald-300 flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{voiceTranscript}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 border-r border-slate-800/80 bg-slate-950/40 p-4 flex flex-row lg:flex-col justify-between overflow-x-auto lg:overflow-y-auto">
          <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1.5 w-full">
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "workout", label: "Workout Matrix", icon: Dumbbell },
              { id: "diet", label: "AI Nutrition", icon: Utensils },
              { id: "ai-coach", label: "Neural Coach", icon: Bot },
              { id: "devices", label: "Hardware & BT", icon: Bluetooth },
              { id: "bloodline", label: "Bloodline", icon: Shield },
              { id: "leaderboard", label: "Leagues", icon: Trophy },
              { id: "social", label: "Squad Chat", icon: MessageSquare },
              { id: "badges", label: "Achievements", icon: Award },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CONTENT VIEW AREA */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800/80 p-6 lg:p-8 overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                        Archetype: {user.archetype.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">Goal: {user.primaryGoal}</span>
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-white">
                      Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Your neural connection is optimal. Hardware sync is fully active.</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                      {user.streak}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Day Streak</div>
                      <div className="text-sm font-black text-white">Consistency Matrix High</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Metrics & Boss Raid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Boss Raid Widget */}
                <div className="md:col-span-2 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Sword className="w-5 h-5 text-red-500" />
                        <h2 className="font-black text-base tracking-wide text-white">PvE Raid Boss: Goliath Titan</h2>
                      </div>
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold">
                        Active Raid
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Complete your daily exercises and log steps to deal structural damage to the raid boss alongside your bloodline.</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Boss Integrity HP</span>
                      <span className="text-red-400">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-red-500/20"
                        style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hardware Status Widget */}
                <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Bluetooth className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <h2 className="font-black text-sm tracking-wide text-white">Connected Hardware</h2>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 mb-3">
                      <div className="text-xs text-slate-400 font-semibold">Active Device</div>
                      <div className="text-xs font-black text-emerald-400 mt-0.5">{connectedDevice}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("devices")}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all border border-slate-700"
                  >
                    Manage Equipment & BT
                  </button>
                </div>
              </div>

              {/* Quick Daily Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Daily Steps</div>
                    <div className="text-lg font-black text-white">{steps.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Active Calories</div>
                    <div className="text-lg font-black text-white">{activeCaloriesBurned} kcal</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Recovery Debt</div>
                    <div className="text-lg font-black text-purple-300">{recoveryDebtPct}% Optimal</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKOUT MATRIX TAB */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <div>
                  <h1 className="text-2xl font-black text-white">Dynamic Workout Matrix</h1>
                  <p className="text-xs text-slate-400 mt-1">Execute your assigned training protocols. Completing exercises damages the Raid Boss and grants XP.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold">
                    {exercises.filter(e => e.completed).length} / {exercises.length} Completed
                  </span>
                </div>
              </div>

              {/* Workout Checklist */}
              <div className="grid grid-cols-1 gap-4">
                {exercises.map((ex) => (
                  <div 
                    key={ex.id}
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                      ex.completed 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300' 
                        : 'bg-slate-900/60 border-slate-800/80 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => toggleExerciseComplete(ex.id)}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          ex.completed 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                            : 'bg-slate-950 border-slate-700 hover:border-slate-500 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm">{ex.name}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">{ex.category}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                          <span>{ex.defaultSets}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{ex.defaultWeight}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      {ex.completed ? "+50 XP Claimed" : "Pending Execution"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Workout Templates Showcase */}
              <div className="mt-8">
                <h2 className="text-lg font-black text-white mb-4">AI Recommended Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comprehensiveWorkoutTemplates.map(wt => (
                    <div key={wt.id} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                          {wt.targetArchetype}
                        </span>
                        <h3 className="font-black text-base mt-2 text-white">{wt.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{wt.style}</p>
                        <p className="text-xs text-slate-500 mt-3 italic">"{wt.guideline}"</p>
                      </div>
                      <button 
                        onClick={() => {
                          setExercises(wt.exercises.map(ex => ({ ...ex, completed: false })));
                        }}
                        className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition-all text-emerald-400"
                      >
                        Load Protocol
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI NUTRITION TAB */}
          {activeTab === "diet" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">AI Nutrition & Macro Engine</h1>
                  <p className="text-xs text-slate-400 mt-1">Dynamically generated meal structures tailored precisely to your archetype and dietary restrictions.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={user.dietaryRestriction} 
                    onChange={(e) => setUser(u => ({ ...u, dietaryRestriction: e.target.value as DietaryRestriction }))}
                    className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="standard">Standard Performance</option>
                    <option value="plant-based">Plant-Based / Vegetarian</option>
                    <option value="gluten-free">Gluten-Free Clean</option>
                    <option value="keto">Ketogenic & Low-Carb</option>
                    <option value="dairy-free">Dairy-Free / Allergen</option>
                  </select>
                </div>
              </div>

              {/* Macro Target Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold uppercase">Target Calories</div>
                  <div className="text-xl font-black text-white mt-1">{dynamicPlan.totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span></div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold uppercase">Protein Goal</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{dynamicPlan.protein}g</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold uppercase">Carbohydrates</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">{dynamicPlan.carbs}g</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold uppercase">Healthy Fats</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{dynamicPlan.fats}g</div>
                </div>
              </div>

              {/* Synthesized Meals List */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <h2 className="text-lg font-black text-white mb-2">{dynamicPlan.title}</h2>
                <p className="text-xs text-slate-400 mb-6">{dynamicPlan.description}</p>
                <div className="space-y-4">
                  {dynamicPlan.meals.map((meal, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block mb-1">
                          {meal.mealType}
                        </div>
                        <h3 className="font-bold text-sm text-white">{meal.name}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-semibold">
                        <span className="text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">{meal.calories} kcal</span>
                        <span className="text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">P: {meal.protein}g</span>
                        <span className="text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">C: {meal.carbs}g</span>
                        <span className="text-amber-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">F: {meal.fats}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEURAL COACH (AI CHAT) TAB */}
          {activeTab === "ai-coach" && (
            <div className="space-y-6 flex flex-col h-[calc(100vh-12rem)]">
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center space-x-3">
                <Bot className="w-6 h-6 text-emerald-400" />
                <div>
                  <h1 className="font-black text-base text-white">Apex Neural Coach</h1>
                  <p className="text-xs text-slate-400">Ask any question regarding biomechanics, injury prevention, or macro adjustments.</p>
                </div>
              </div>

              {/* Chat Messages Box */}
              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 overflow-y-auto space-y-4">
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-emerald-500 text-slate-950 font-bold" 
                        : "bg-slate-900 border border-slate-800 text-slate-200"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendAiChat} className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder="Ask neural coach for custom protocol advice..."
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* HARDWARE & BLUETOOTH DEVICES TAB */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Bluetooth className="w-6 h-6 text-cyan-400" />
                  <h1 className="text-2xl font-black text-white">Hardware & Bluetooth Sync</h1>
                </div>
                <p className="text-xs text-slate-400">Manage your connected smart rings, watches, and smart gym equipment for real-time telemetry streaming.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Active Synced Hardware
                    </span>
                    <h2 className="text-lg font-black text-white mt-3">{connectedDevice}</h2>
                    <p className="text-xs text-slate-400 mt-1">Streaming heart rate variability, steps, and active mechanical output.</p>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">Signal Strength: Optimal (98%)</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">Scan Nearby Gym Equipment</h2>
                    <p className="text-xs text-slate-400 mt-1">Pair with smart treadmills, rowers, or intelligent barbell sensors via Bluetooth Low Energy (BLE).</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsScanningDevices(true);
                      setTimeout(() => {
                        setIsScanningDevices(false);
                        setConnectedDevice("Apex Gym Matrix Rower v4 (Synched)");
                      }, 3000);
                    }}
                    disabled={isScanningDevices}
                    className="mt-6 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isScanningDevices ? "Scanning BLE Frequencies..." : "Scan & Pair New Equipment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BLOODLINE SQUAD TAB */}
          {activeTab === "bloodline" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <h1 className="text-2xl font-black text-white">Bloodline Squad Matrix</h1>
                <p className="text-xs text-slate-400 mt-1">Train alongside your synced family and squad members to amplify streaks and boss raid rewards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bloodlineMembers.map(member => (
                  <div key={member.id} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${member.avatarBg} flex items-center justify-center text-white font-black text-base shadow-lg`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-white">{member.name}</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">{member.role}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">"{member.status}"</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-orange-400">{member.streak} Days</div>
                      <div className="text-[10px] text-slate-500">Streak Active</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <h1 className="text-2xl font-black text-white">Ruby League Rankings</h1>
                <p className="text-xs text-slate-400 mt-1">Compete weekly against global athletes to secure promotion to the Obsidian Tier.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden">
                {leagueUsers.map((u) => (
                  <div 
                    key={u.rank} 
                    className={`p-4 flex items-center justify-between border-b border-slate-800/60 last:border-none ${
                      u.isUser ? 'bg-emerald-950/20 border-emerald-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                        u.rank === 1 ? 'bg-amber-500 text-slate-950' : u.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.rank}
                      </span>
                      <span className="font-bold text-sm text-white">{u.name} {u.isUser && "(You)"}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black text-amber-400">{u.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SQUAD CHAT TAB */}
          {activeTab === "social" && (
            <div className="space-y-6 flex flex-col h-[calc(100vh-12rem)]">
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
                <div>
                  <h1 className="font-black text-base text-white">Squad Communications</h1>
                  <p className="text-xs text-slate-400">Coordinate raid boss attacks and share daily milestones with your team.</p>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 overflow-y-auto space-y-4">
                {squadMessages.map((msg) => (
                  <div key={msg.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-emerald-400">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={squadInput}
                  onChange={(e) => setSquadInput(e.target.value)}
                  placeholder="Broadcast message to squad..."
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={() => {
                    if (!squadInput.trim()) return;
                    setSquadMessages(prev => [...prev, { id: Date.now().toString(), sender: user.name, text: squadInput, timestamp: "Just now" }]);
                    setSquadInput("");
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === "badges" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
                <h1 className="text-2xl font-black text-white">Achievement Badges</h1>
                <p className="text-xs text-slate-400 mt-1">Unlock legendary badges through consistency, raid boss damage, and macro precision.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{badge.icon}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          badge.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {badge.rarity}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-white">{badge.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">+{badge.xpReward} XP</span>
                      {badge.unlocked ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <button 
                          onClick={() => claimBadgeReward(badge.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition-all text-slate-200"
                        >
                          Claim Reward
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRO UPGRADE TAB */}
          {activeTab === "pro" && (
            <div className="space-y-6 max-w-2xl mx-auto text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                <Crown className="w-8 h-8 text-slate-950 font-black" />
              </div>
              <h1 className="text-3xl font-black text-white">Apex State PRO Access</h1>
              <p className="text-slate-400 text-sm">Unlock unlimited AI neural coaching, advanced Bluetooth gym equipment streaming, and priority Bloodline Raid rewards.</p>

              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl text-left space-y-4">
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited AI Nutrition & Macro Synthesis Engine</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Device Bluetooth Hardware Telemetry (Rings, Watches, Rowers)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Exclusive PvE Raid Boss Multipliers & Legend Tier Badges</span>
                </div>
              </div>

              <button 
                onClick={() => alert("Apex State Pro is already fully activated for your cybernetic matrix!")}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-500/20 hover:brightness-110 transition-all"
              >
                PRO MEMBERSHIP ACTIVE
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
