import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meme } from '../types';
import MemeCard from '../components/MemeCard';
import { Loader2, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { searchMemes } from '../services/gemini';

export default function Home() {
  const [allMemes, setAllMemes] = useState<Meme[]>([]);
  const [displayMemes, setDisplayMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const q = query(
      collection(db, 'memes'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memeList = snapshot.docs.map(doc => ({
        ...doc.data(),
        memeId: doc.id
      })) as Meme[];
      setAllMemes(memeList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery || !allMemes.length) {
        setDisplayMemes(allMemes);
        return;
      }

      setIsSearching(true);
      try {
        const matchingIds = await searchMemes(searchQuery, allMemes);
        const filtered = allMemes
          .filter(m => matchingIds.includes(m.memeId))
          .sort((a, b) => matchingIds.indexOf(a.memeId) - matchingIds.indexOf(b.memeId));
        setDisplayMemes(filtered);
      } catch (error) {
        console.error("Search failed:", error);
        setDisplayMemes(allMemes);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [searchQuery, allMemes]);

  const clearSearch = () => {
    setSearchParams({});
  };

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
            <div className="w-3 h-3 bg-cyan-vivid rounded-full shadow-[0_0_10px_#00F5FF]"></div>
            <span className="text-[11px] tracking-[0.3em] text-cyan-vivid uppercase font-bold">
              {searchQuery ? "AI Search Matrix" : "Stream Identity Matrix"}
            </span>
          </div>
          <h1 className="text-7xl font-black uppercase leading-none text-white tracking-tighter">
            {searchQuery ? "QUERY_RESULTS" : "CENTRAL FEED"}
          </h1>
        </div>
        <div className="hidden lg:flex flex-col items-end">
          {searchQuery ? (
            <button 
              onClick={clearSearch}
              className="flex items-center gap-2 text-[10px] uppercase text-pink-vivid tracking-widest font-bold hover:brightness-125 transition-all"
            >
              <X size={12} /> CLEAR_SEARCH
            </button>
          ) : (
            <>
              <p className="text-[10px] uppercase text-text-dim tracking-widest">Global Status</p>
              <p className="text-sm text-white font-mono uppercase tracking-tighter">UPTIME_99.98% / SYNC_ACTIVE</p>
            </>
          )}
        </div>
      </header>

      {searchQuery && (
        <div className="flex items-center gap-3 bg-surface-soft border border-border-dim p-4">
          <Search size={16} className="text-cyan-vivid" />
          <span className="text-xs font-mono uppercase tracking-widest text-text-dim">
            Analyzing repository for: <span className="text-white">"{searchQuery}"</span>
          </span>
          {isSearching && <Loader2 className="animate-spin text-cyan-vivid ml-auto" size={16} />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayMemes.length > 0 ? (
          displayMemes.map((meme) => (
            <div key={meme.memeId}>
              <MemeCard meme={meme} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center tech-panel rounded-sm">
            <p className="text-text-dim uppercase tracking-[0.2em] font-mono italic">
              {searchQuery ? "NO SEMANTIC MATCHES FOUND FOR QUERY" : "NO VECTOR DATA DETECTED IN FEED"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
