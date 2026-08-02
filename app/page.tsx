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
  Activity,
  Send
} from 'lucide-react';

export default function ApexStateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'nutrition' | 'library' | 'achievements' | 'profile'>('home');
  const [aura, setAura] = useState(100);
  const [streak, setStreak] = useState(1);
  const [dailyCalories, setDailyCalories] = useState({ current: 0, target: 2500 });
  const [macros, setMacros] = useState({ protein: { current: 0, target: 180 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 70 } });
  const [toast, setToast] = useState<string | null>(null);

  // Bluetooth State
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [deviceBattery, setDeviceBattery] = useState<number | null>(null);

  // AI Assistant Modal State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState([
    { sender: 'ai', text: 'Hello athlete. I am your Apex AI Coach. Ask me anything about training, macros, or form correction.' }
  ]);

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

  const connectBluetoothWatch = () => {
    showToast('📡 Scanning for Apex Smartwatch...');
    setTimeout(() => {
      setIsBluetoothConnected(true);
      setDeviceBattery(98);
      setAura(prev => prev + 150);
      showToast('✅ Connected to Apex Watch! +150 Aura');
    }, 1500);
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
      } else if (userMsg.toLowerCase().includes('fatigue') || userMsg.toLowerCase().includes('tired')) {
        reply = "Fatigue is stacking up. Consider taking an extra 60 seconds of rest between working sets.";
      }
      setAiChat(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  const [exercises, setExercises] = useState([
    { id: 1, name: 'Barbell Bench Press', weight: '60kg', reps: '10, 10, 10', pr: 'Ready', logged: false },
    { id: 2, name: 'Incline Dumbbell Press', weight: '20kg', reps: '10, 10, 10', pr: 'Ready', logged: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const library = [
    { name: 'Barbell Back Squat', muscle: 'Legs', difficulty: 'Advanced', tips: 'Keep chest upright, break at hips and knees simultaneously.' },
    { name: 'Conventional Deadlift', muscle: 'Back', difficulty: 'Advanced', tips: 'Keep bar close to shins, engage lats before initiating pull.' },
    { name: 'Overhead Press', muscle: 'Shoulders', difficulty: 'Intermediate', tips: 'Brace core hard, squeeze glutes, press straight overhead.' },
  ];

  const achievements = [
    { title: 'Iron Initiate', desc: 'Log your very first workout session', progress: '0/1', unlocked: false, reward: '+250 Aura' },
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

      {/* Cybernetic Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 p-1.5 rounded-xl font-black tracking-wider text-xs flex items-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-4 h-4 mr-0.5 fill-current" /> APEX
          </div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">STATE</span>
        </div>
        <div className="flex items-center space-x-2.5">
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
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Command Center</p>
                  <h1 className="text-xl font-black text-slate-100 mt-0.5">Welcome, Athlete</h1>
                </div>
                <span className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-xl font-bold">Level 1</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your performance hub is live. Connect your smartwatch, query your AI coach, or jump straight into today's protocol.
              </p>
            </div>

            {/* Interactive Hardware Connectors & AI Triggers */}
            <div className="grid grid-cols-2 gap-3">
              {/* Bluetooth Smartwatch Connector Button */}
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
                  {isBluetoothConnected && <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded font-bold">{deviceBattery}% Batt</span>}
                </div>
                <div>
                  <h3 className="font-bold text-xs">{isBluetoothConnected ? 'Watch Paired' : 'Connect Watch'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{isBluetoothConnected ? 'Syncing telemetry' : 'Tap to pair Bluetooth device'}</p>
                </div>
              </button>

              {/* AI Assistant Button */}
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Ask questions & get insights</p>
                </div>
              </button>
            </div>

            {/* Quick Navigation Card */}
            <div onClick={() => setActiveTab('workout')} className="bg-slate-900 hover:border-slate-700 border border-slate-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-200">Start Today's Workout</h3>
                  <p className="text-[10px] text-slate-400">Push Hypertrophy Protocol</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-cyan-400" />
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

        {/* NUTRITION TAB */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight">Fuel & Macros</h1>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Calories Remaining</p>
                <h2 className="text-3xl font-black text-slate-100 mt-1">{dailyCalories.target - dailyCalories.current} <span className="text-xs text-slate-400">kcal</span></h2>
              </div>
              <div className="w-16 h-16 flex items-center justify-center bg-cyan-950/40 rounded-full border-4 border-cyan-500/30">
                <span className="text-xs font-bold text-cyan-400">0%</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setDailyCalories(prev => ({ ...prev, current: prev.current + 500 }));
                setAura(prev => prev + 50);
                showToast('🥗 Meal Logged! +50 Aura');
              }}
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xs font-bold text-cyan-400 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Log Meal (+500 kcal)
            </button>
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
            <h1 className="text-xl font-black tracking-tight">Athlete Profile</h1>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3">
              <div className="w-20 h-20 bg-cyan-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl">AS</div>
              <h2 className="font-bold text-base">New Athlete</h2>
              <p className="text-xs text-cyan-400">Ready for configuration</p>
            </div>
          </div>
        )}

      </main>

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
