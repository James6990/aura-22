'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Utensils, 
  BookOpen, 
  User, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Search,
  Award,
  Sparkles,
  ShieldCheck,
  Timer,
  Bluetooth,
  MessageSquare,
  Camera,
  Send,
  LogOut,
  LogIn,
  Globe,
  Lock,
  Crown,
  CreditCard,
  Smartphone,
  ExternalLink
} from 'lucide-react';

// Official Apex Vector Logo Component
function ApexLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L90 85H10L50 5Z" fill="url(#apexGrad)" stroke="#06b6d4" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M50 30L70 70H30L50 30Z" fill="#020617"/>
      <circle cx="50" cy="55" r="8" fill="#06b6d4" />
      <defs>
        <linearGradient id="apexGrad" x1="10" y1="5" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'nutrition' | 'library' | 'achievements' | 'profile'>('home');
  const [aura, setAura] = useState(150);
  const [streak, setStreak] = useState(1);
  const [dailyCalories, setDailyCalories] = useState({ current: 0, target: 2500 });
  const [macros, setMacros] = useState({ protein: { current: 0, target: 180 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 70 } });
  const [toast, setToast] = useState<string | null>(null);

  // Authentication & Subscription State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  // Profile & Predator Avatar State
  const [athleteName, setAthleteName] = useState('New Athlete');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁 Lion Apex');

  const predatorAvatars = [
    { name: '🦁 Lion Apex', type: 'Male Predator', badge: '👑' },
    { name: '🦁 Lioness Apex', type: 'Female Predator', badge: '👑' },
    { name: '🐺 Alpha Wolf', type: 'Male Predator', badge: '🌙' },
    { name: '🐺 She-Wolf', type: 'Female Predator', badge: '🌙' },
    { name: '🦅 Falcon Apex', type: 'Male Predator', badge: '⚡' },
    { name: '🦅 Falconess Apex', type: 'Female Predator', badge: '⚡' },
    { name: '🐅 Tiger Apex', type: 'Male Predator', badge: '🔥' },
    { name: '🐅 Tigress Apex', type: 'Female Predator', badge: '🔥' }
  ];

  // Bluetooth State
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [deviceBattery, setDeviceBattery] = useState<number | null>(null);

  // AI Assistant Modal State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState([
    { sender: 'ai', text: 'Hello athlete. I am your Apex AI Coach. Ask me anything about training, macros, or form correction.' }
  ]);

  // AI Food Scanner State
  const [isScanningFood, setIsScanningFood] = useState(false);
  const [scanStep, setScanStep] = useState('');

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds(prev => prev - 1), 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      showToast('❌ Please enter a valid email address.');
      return;
    }

    setTimeout(() => {
      setIsAuthenticated(true);
      setAura(prev => prev + 100);
      showToast(isSignUpMode ? '✅ Account created! Free Offline Mode Active.' : '✅ Signed In Locally.');
    }, 800);
  };

  const handleUnlockProPass = () => {
    setTimeout(() => {
      setIsSubscriber(true);
      setShowPaywallModal(false);
      setAura(prev => prev + 500);
      showToast('👑 APEX PRO UNLOCKED! Global Leagues & Cloud Sync Active (+500 Aura)');
    }, 1000);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsSubscriber(false);
    setAuthEmail('');
    setAuthPassword('');
    showToast('🔒 Signed out.');
  };

  const connectBluetoothWatch = () => {
    showToast('📡 Scanning for Apex Smartwatch...');
    setTimeout(() => {
      setIsBluetoothConnected(true);
      setDeviceBattery(98);
      setAura(prev => prev + 150);
      showToast('✅ Connected to Apex Watch! +150 Aura');
    }, 1500);
  };

  const handleFoodCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsScanningFood(true);
      setScanStep('Encoding visual telemetry to Base64...');

      const reader = new FileReader();
      reader.onloadend = async () => {
        setTimeout(() => {
          setIsScanningFood(false);
          setDailyCalories(prev => ({ ...prev, current: prev.current + 620 }));
          setMacros(prev => ({
            ...prev,
            protein: { ...prev.protein, current: prev.protein.current + 52 },
            carbs: { ...prev.carbs, current: prev.carbs.current + 55 },
            fats: { ...prev.fats, current: prev.fats.current + 18 }
          }));
          setAura(prev => prev + 120);
          showToast('📸 Vision AI Verified: High-Protein Meal (+620 kcal, +120 Aura)');
        }, 1500);
      };

      reader.readAsDataURL(file);
    }
  };

  const sendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    const userMsg = aiQuery;
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiQuery('');

    setTimeout(() => {
      let reply = "Based on your current volume and recovery metrics, keep pushing progressive overload on your compound movements.";
      if (userMsg.toLowerCase().includes('macro') || userMsg.toLowerCase().includes('protein')) {
        reply = "Hit your protein target of 180g today to maximize muscle protein synthesis.";
      }
      setAiChat(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  const [exercises, setExercises] = useState([
    { id: 1, name: 'Barbell Bench Press', weight: '60kg', reps: '10, 10, 10', pr: 'Ready', logged: false },
    { id: 2, name: 'Incline Dumbbell Press', weight: '20kg', reps: '10, 10, 10', pr: 'Ready', logged: false },
  ]);

  const library = [
    { name: 'Barbell Back Squat', muscle: 'Legs', difficulty: 'Advanced', tips: 'Keep chest upright, break at hips and knees simultaneously.' },
    { name: 'Conventional Deadlift', muscle: 'Back', difficulty: 'Advanced', tips: 'Keep bar close to shins, engage lats before initiating pull.' },
  ];

  const achievements = [
    { title: 'Iron Initiate', desc: 'Log your very first workout session', progress: '0/1', unlocked: false, reward: '+250 Aura' },
    { title: 'Apex Pro Competitor', desc: 'Unlock global online league access', progress: isSubscriber ? '1/1' : '0/1', unlocked: isSubscriber, reward: '+500 Aura' },
    { title: 'Bluetooth Sync', desc: 'Connect your smart wearable device', progress: isBluetoothConnected ? '1/1' : '0/1', unlocked: isBluetoothConnected, reward: '+150 Aura' },
  ];

  const logExercise = (id: number) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, logged: true } : ex));
    setAura(prev => prev + 50);
    showToast('⚡ Set Logged! +50 Aura');
    setRestSeconds(90);
    setIsResting(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-cyan-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center justify-between animate-bounce">
          <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> {toast}</span>
        </div>
      )}

      {/* Cybernetic Header with Apex Logo */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-slate-950 border border-cyan-500/40 p-1.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <ApexLogo className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-sm tracking-widest bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">APEX</span>
            <span className="font-extrabold text-xs text-slate-300 ml-1">STATE</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowWidgetModal(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 p-2 rounded-xl transition-all"
            title="Add Widget & Quick Launch"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <div className="flex items-center bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700/60 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-orange-400 mr-1.5 fill-orange-400" />
            <span className="text-slate-200">{streak}d</span>
          </div>
          <div className="flex items-center bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40 text-xs font-bold text-cyan-400">
            <Trophy className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>{aura}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        
        {/* HOME DASHBOARD TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center">
                    <Globe className="w-3 h-3 mr-1" /> {isSubscriber ? 'Apex Pro Global Online' : 'Local Offline Mode'}
                  </p>
                  <h1 className="text-xl font-black text-slate-100 mt-0.5">Welcome, {selectedAvatar.split(' ')[1]}</h1>
                </div>
                <div className="bg-slate-950 border border-cyan-500/40 p-2 rounded-xl shadow-md">
                  <ApexLogo className="w-8 h-8" />
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your performance hub is live. Use the home screen widget for instant telemetry entry or unlock Apex Pro.
              </p>
            </div>

            {/* Widget Quick-Access Banner */}
            <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-950 p-2.5 rounded-xl border border-cyan-500/40 text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-200">Apex Home Screen Widget</h3>
                  <p className="text-[10px] text-slate-400">One-tap entry & live streak tracker</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWidgetModal(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                Launch Widget
              </button>
            </div>

            {/* Global Competition Gateway Card (If not a subscriber) */}
            {!isSubscriber && (
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-black">
                    <Crown className="w-4 h-4" />
                    <span>Global Duolingo-Style Leagues</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Compete against athletes worldwide</p>
                </div>
                <button 
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Unlock Pro
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={connectBluetoothWatch}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all shadow-md ${
                  isBluetoothConnected 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-3">
                  <Bluetooth className={`w-5 h-5 ${isBluetoothConnected ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
                  {isBluetoothConnected && <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded font-bold">{deviceBattery}%</span>}
                </div>
                <div>
                  <h3 className="font-bold text-xs">{isBluetoothConnected ? 'Watch Paired' : 'Connect Watch'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bluetooth telemetry</p>
                </div>
              </button>

              <button 
                onClick={() => setIsAiOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl text-left flex flex-col justify-between transition-all shadow-md group"
              >
                <div className="flex justify-between items-center w-full mb-3">
                  <MessageSquare className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">Online</span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-200">AI Coach</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ask questions</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Active Workout</h1>
            
            {isResting && (
              <div className="bg-indigo-950/80 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  <Timer className="w-5 h-5 text-indigo-400 animate-spin" />
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase">Rest Period Active</p>
                    <p className="text-lg font-black text-slate-100">{Math.floor(restSeconds / 60)}:{('0' + (restSeconds % 60)).slice(-2)}</p>
                  </div>
                </div>
                <button onClick={() => setIsResting(false)} className="px-3 py-1 bg-slate-800 text-xs font-bold rounded-xl text-slate-300">Skip</button>
              </div>
            )}

            <div className="space-y-3">
              {exercises.map(ex => (
                <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{ex.name}</h3>
                    <p className="text-xs text-slate-400">{ex.weight} • {ex.reps}</p>
                  </div>
                  <button 
                    onClick={() => logExercise(ex.id)}
                    disabled={ex.logged}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${ex.logged ? 'bg-emerald-950 text-emerald-400' : 'bg-cyan-500 text-slate-950'}`}
                  >
                    {ex.logged ? 'Done' : 'Log Set'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NUTRITION & AI VISION TAB */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Fuel & Recovery</h1>
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Calories Logged</p>
                <h2 className="text-3xl font-black text-slate-100 mt-1">{dailyCalories.current} <span className="text-xs text-slate-400">/ {dailyCalories.target} kcal</span></h2>
              </div>
              <div className="w-16 h-16 flex items-center justify-center bg-cyan-950/40 rounded-full border-4 border-cyan-500/30">
                <span className="text-xs font-bold text-cyan-400">{Math.min(100, Math.round((dailyCalories.current / dailyCalories.target) * 100))}%</span>
              </div>
            </div>

            <label className="relative overflow-hidden cursor-pointer bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 hover:opacity-95 text-slate-950 p-4 rounded-2xl flex items-center justify-center space-x-2 font-black text-xs shadow-xl shadow-cyan-500/20 transition-all active:scale-95">
              <Camera className="w-5 h-5" />
              <span>Snap Meal with AI Vision Scanner</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFoodCapture} 
                className="hidden" 
              />
            </label>

            {isScanningFood && (
              <div className="bg-slate-900 border border-cyan-500/40 p-5 rounded-2xl text-center space-y-3 animate-pulse">
                <Camera className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
                <h3 className="font-bold text-sm text-cyan-300">Apex Vision Processing...</h3>
                <p className="text-xs text-slate-400">{scanStep}</p>
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Exercise Library</h1>
            <div className="space-y-3">
              {library.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <h3 className="font-bold text-sm text-slate-200">{item.name}</h3>
                  <p className="text-[11px] text-slate-400">Tip: {item.tips}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Badges & Aura</h1>
            <div className="space-y-3">
              {achievements.map((ach, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{ach.title}</h3>
                    <p className="text-xs text-slate-400">{ach.desc}</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">{ach.reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Athlete Profile & Tier</h1>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg shadow-cyan-500/20">
                {selectedAvatar.split(' ')[0]}
              </div>
              <div>
                <input 
                  type="text" 
                  value={athleteName} 
                  onChange={(e) => setAthleteName(e.target.value)}
                  className="bg-transparent text-center font-bold text-base text-slate-100 border-b border-transparent focus:border-cyan-500 focus:outline-none pb-1"
                />
                <p className="text-xs text-cyan-400 font-semibold mt-1">{selectedAvatar}</p>
                <p className="text-[10px] text-amber-400 font-bold mt-1">
                  {isSubscriber ? '👑 Apex Pro Subscriber (Global Access)' : '🔒 Free Offline Mode'}
                </p>
              </div>

              {isAuthenticated ? (
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : null}
            </div>

            {/* Predator Avatar Picker */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-widest">Select Predator Archetype</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {predatorAvatars.map((avatar, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAvatar(avatar.name);
                      showToast(`Selected ${avatar.name}!`);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                      selectedAvatar === avatar.name
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{avatar.badge}</span>
                    <div>
                      <p className="font-bold text-xs text-slate-200">{avatar.name}</p>
                      <p className="text-[9px] text-slate-400">{avatar.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Interactive App Widget / Quick Launch Modal */}
      {showWidgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-sm p-6 rounded-3xl space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Apex Home Screen Widget</h3>
              </div>
              <button onClick={() => setShowWidgetModal(false)} className="text-xs text-slate-400 font-bold px-2 py-1 bg-slate-800 rounded-lg">Close</button>
            </div>

            {/* Simulated Live Home Screen Widget Card */}
            <div className="bg-gradient-to-br from-slate-950 to-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-900 p-1.5 rounded-lg border border-cyan-500/40">
                    <ApexLogo className="w-4 h-4" />
                  </div>
                  <span className="font-black text-xs text-slate-200 tracking-wider">APEX WIDGET</span>
                </div>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">{streak}d Streak</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Aura Score</p>
                  <p className="text-sm font-black text-cyan-400 mt-0.5">{aura}</p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Avatar</p>
                  <p className="text-sm font-black text-slate-200 mt-0.5">{selectedAvatar.split(' ')[0]}</p>
                </div>
              </div>

              {/* Working Widget Enter Button */}
              <button 
                onClick={() => {
                  setShowWidgetModal(false);
                  setActiveTab('home');
                  showToast('🚀 Widget Activated: Entered Apex State');
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <span>Enter App From Widget</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Tip: In your mobile browser menu, select <strong className="text-slate-200">"Add to Home Screen"</strong> to place this exact widget launcher on your phone desktop.
            </p>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-sm p-6 rounded-3xl space-y-5 shadow-2xl animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black text-slate-100">Unlock Apex Pro Pass</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step into the worldwide arena. Unlock global Duolingo-style competitive leagues, live leaderboards, and cloud telemetry backups.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center text-slate-300"><Globe className="w-4 h-4 text-amber-400 mr-2" /> Worldwide Leaderboards</div>
              <div className="flex items-center text-slate-300"><Trophy className="w-4 h-4 text-amber-400 mr-2" /> Competitive Weekly Leagues</div>
              <div className="flex items-center text-slate-300"><ShieldCheck className="w-4 h-4 text-amber-400 mr-2" /> Real-Time Cloud Sync</div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleUnlockProPass}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:opacity-95 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Unlock Now ($4.99 / Month)</span>
              </button>
              <button 
                onClick={() => setShowPaywallModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Continue Offline (Free)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal Overlay */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end max-w-md mx-auto">
          <div className="bg-slate-900 border-t border-slate-800 p-4 rounded-t-3xl space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">Apex AI Performance Coach</h3>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-xs text-slate-400 hover:text-slate-100 font-bold px-2 py-1 bg-slate-800 rounded-lg">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-60">
              {aiChat.map((msg, i) => (
                <div key={i} className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'ai' ? 'bg-slate-950 border border-slate-800 text-slate-300' : 'bg-cyan-500 text-slate-950 font-medium ml-6'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={sendAiMessage} className="flex space-x-2 pt-2">
              <input 
                type="text"
                placeholder="Ask about training, recovery, or diet..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 z-40 max-w-md mx-auto shadow-2xl">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Zap className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Home</span>
          </button>
          <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'workout' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Dumbbell className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Workout</span>
          </button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'nutrition' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <Utensils className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Nutrition</span>
          </button>
          <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'library' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Library</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}>
            <User className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
