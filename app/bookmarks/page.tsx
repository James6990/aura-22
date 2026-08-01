'use client';
import Link from 'next/link';
import { ArrowLeft, BookmarkCheck } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <header className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <ArrowLeft className="w-5 h-5 text-zinc-300" />
        </Link>
        <h1 className="text-xl font-bold">Saved Vibe Collection</h1>
      </header>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-teal-400">
          <BookmarkCheck className="w-8 h-8" />
        </div>
        <h2 className="text-base font-semibold text-zinc-200 mb-1">Your collection is empty</h2>
        <p className="text-xs text-zinc-400 max-w-xs mb-6">Tap the bookmark icon on any workout or recipe feed card to save it here for later.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-teal-500 text-zinc-950 font-bold text-xs hover:bg-teal-400">
          Explore Feed
        </Link>
      </div>
    </main>
  );
}
