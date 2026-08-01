'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Sparkles } from 'lucide-react';

const WORKOUTS_FEED = [
  {
    id: '1',
    title: '15-Min Core & Glow Flow',
    category: 'Quick Burn',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    energy: 'High Vibe',
    duration: '15m',
  },
  {
    id: '2',
    title: 'Matcha Protein Cloud Bowl',
    category: 'Clean Fuel',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    energy: 'Recovery',
    duration: '5m prep',
  },
];

export default function HomeFeed() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 pb-20">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
            AURA
          </h1>
          <p className="text-xs text-zinc-400">Match your energy. Transform your body.</p>
        </div>
        <Link href="/bookmarks" className="p-2 rounded-full bg-zinc-900 border border-zinc-800 relative">
          <Bookmark className="w-5 h-5 text-teal-400" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {bookmarks.length}
            </span>
          )}
        </Link>
      </header>

      {/* AI Energy Prompt Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-indigo-950/40 border border-teal-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">AI Vibe Check</span>
        </div>
        <p className="text-sm font-medium mb-3 text-zinc-200">How is your energy moving today?</p>
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20">
            🔥 Beast Mode
          </button>
          <button className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20">
            🌙 Low Energy / Flow
          </button>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="space-y-4">
        {WORKOUTS_FEED.map((item) => {
          const isBookmarked = bookmarks.includes(item.id);
          return (
            <div key={item.id} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-xl">
              <div className="relative h-56 w-full">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover"
                />
                <button 
                  onClick={() => toggleBookmark(item.id)}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:scale-105 transition-transform"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-400 text-teal-400' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-teal-300 border border-teal-500/30">
                    {item.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-zinc-300 border border-zinc-700">
                    {item.duration}
                  </span>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-zinc-100">{item.title}</h3>
                  <p className="text-xs text-zinc-400">Curated for your goals</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-200">
                  Start
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
