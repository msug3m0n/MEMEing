import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meme, User } from '../types';
import { Loader2, Heart, Share2, CornerDownRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import CommentSection from '../components/CommentSection';

export default function MemePage() {
  const { id } = useParams<{ id: string }>();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribeMeme = onSnapshot(doc(db, 'memes', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), memeId: docSnap.id } as Meme;
        setMeme(data);
        
        // Fetch author
        onSnapshot(doc(db, 'users', data.userId), (userSnap) => {
          if (userSnap.exists()) {
            setAuthor(userSnap.data() as User);
          }
        });
      }
      setLoading(false);
    });

    return () => unsubscribeMeme();
  }, [id]);

  const toggleLike = async () => {
    if (!id || !meme) return;
    setLiked(!liked);
    await updateDoc(doc(db, 'memes', id), {
      likesCount: increment(liked ? -1 : 1)
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-vivid" size={48} /></div>;
  if (!meme) return <div className="text-center py-20 uppercase font-mono text-text-dim tracking-widest">DATA_NOT_FOUND</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-border-dim pb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-cyan-vivid rounded-full shadow-[0_0_8px_#00F5FF]"></div>
            <span className="text-[11px] tracking-[0.3em] text-cyan-vivid uppercase font-bold">Meme Identifier: {id?.slice(0, 8)}</span>
          </div>
          <h1 className="text-6xl font-black uppercase leading-none text-white tracking-tighter">RESOURCE_VIEW</h1>
        </div>
        <Link to="/" className="text-[10px] font-mono text-text-dim hover:text-cyan-vivid transition-colors uppercase tracking-widest flex items-center gap-2">
          <CornerDownRight size={14} /> Back to Index
        </Link>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="tech-panel p-4 bg-surface-solid">
            <img src={meme.imageUrl} alt={meme.caption} className="w-full h-auto rounded-sm border border-border-dim" />
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={toggleLike}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-5 font-bold uppercase tracking-widest text-xs border transition-all",
                  liked ? "bg-pink-vivid text-white border-pink-vivid" : "bg-surface-soft border-border-dim text-text-dim hover:border-pink-vivid hover:text-pink-vivid"
                )}
             >
               <Heart size={20} fill={liked ? "currentColor" : "none"} />
               {meme.likesCount} <span className="opacity-50">Endorsements</span>
             </button>
             <button className="tech-panel py-5 px-8 flex items-center justify-center text-text-dim hover:text-cyan-vivid transition-colors">
               <Share2 size={20} />
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Block */}
          <div className="tech-panel p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-border-dim pb-4">
              <Zap className="text-cyan-vivid" size={20} />
              <h3 className="font-display text-xl uppercase tracking-wider">AI_INTELLIGENCE_REPORTS</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-dim font-bold">Verified_Caption</label>
              <p className="text-2xl font-bold italic text-white leading-tight">"{meme.caption}"</p>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-dim font-bold">Virality_Prediction_Index</label>
              <div className="flex items-center gap-4">
                <div className="progress-bar flex-1 h-2">
                  <div className="progress-fill bg-cyan-vivid" style={{ width: `${meme.viralityScore}%` }} />
                </div>
                <span className="font-mono text-2xl font-black text-cyan-vivid">{meme.viralityScore}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.2em] text-text-dim font-bold">Categorization</label>
                <div className="flex flex-wrap gap-1">
                  {meme.tags.map(tag => (
                    <span key={tag} className="text-[9px] border border-border-dim px-1.5 py-0.5 uppercase font-mono text-text-dim">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.2em] text-text-dim font-bold">Atmospheric_Mood</label>
                <p className="text-purple-vivid uppercase font-bold text-xs tracking-widest">{meme.mood}</p>
              </div>
            </div>
          </div>

          {/* Author Block */}
          {author && (
            <div className="tech-panel p-6 flex flex-col gap-4">
               <label className="text-[9px] uppercase tracking-[0.2em] text-text-dim font-bold">Source_Provider</label>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-border-dim p-0.5">
                    <img src={author.avatarUrl} alt={author.username} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div>
                    <p className="font-bold text-white uppercase tracking-tight">{author.username}</p>
                    <p className="text-[10px] text-text-dim font-mono">UID: {author.userId.slice(0, 10)}</p>
                  </div>
                  <div className="ml-auto">
                    <ShieldCheck className="text-cyan-vivid/40" size={20} />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Social / Comments Section */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CommentSection memeId={id!} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="tech-panel p-6 bg-surface-solid/50">
             <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="text-cyan-vivid" size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">NETWORK_ADVISORY</span>
             </div>
             <p className="text-[11px] text-text-dim leading-relaxed font-mono italic">
               ALL TRANSMISSIONS ARE MONITORED BY THE CENTRAL AI NEURAL MODERATOR. HATE SPEECH, SPAM, OR MALICIOUS PACKETS WILL BE DROPPED AUTOMATICALLY. PROCEED WITH ANALYTICAL INTEGRITY.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
