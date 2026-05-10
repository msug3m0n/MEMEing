import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meme } from '../types';
import MemeCard from '../components/MemeCard';
import { Loader2, TrendingUp } from 'lucide-react';

export default function Trending() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trending logic: highest viralityScore first
    const q = query(
      collection(db, 'memes'),
      orderBy('viralityScore', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memeList = snapshot.docs.map(doc => ({
        ...doc.data(),
        memeId: doc.id
      })) as Meme[];
      setMemes(memeList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-cyan-vivid" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-border-dim pb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-vivid rounded-full shadow-[0_0_10px_#BD00FF]"></div>
            <span className="text-[11px] tracking-[0.3em] text-purple-vivid uppercase font-bold">Viral Propagation Node</span>
          </div>
          <h1 className="text-7xl font-black uppercase leading-none text-white tracking-tighter">TRENDING_RESOURCES</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {memes.map((meme, idx) => (
          <div key={meme.memeId} className="relative">
             <div className="absolute -top-3 -left-3 z-10 w-10 h-10 tech-panel flex items-center justify-center font-mono font-bold text-cyan-vivid border-cyan-vivid/30">
               {idx + 1}
             </div>
             <MemeCard meme={meme} />
          </div>
        ))}
      </div>
    </div>
  );
}
