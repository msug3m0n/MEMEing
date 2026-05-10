import { Meme } from '../types';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface MemeCardProps {
  meme: Meme;
}

export default function MemeCard({ meme }: MemeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="tech-panel flex flex-col group overflow-hidden hover:border-cyan-vivid transition-all"
    >
      {/* Index Number */}
      <div className="flex items-center justify-between p-4 border-b border-border-dim bg-surface-solid/50">
        <span className="font-mono text-2xl font-bold text-border-dim group-hover:text-cyan-vivid transition-colors">
          #{meme.memeId.slice(-4).toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <Star size={14} className="text-pink-vivid" fill="currentColor" />
          <span className="text-[10px] font-mono text-text-dim">READY_FOR_DEPLOY</span>
        </div>
      </div>

      <Link to={`/meme/${meme.memeId}`} className="relative aspect-square overflow-hidden block">
        <img
          src={meme.imageUrl}
          alt={meme.caption}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium line-clamp-2">"{meme.caption}"</p>
        </div>
      </Link>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="text-white truncate font-display tracking-wide">{meme.caption}</h3>
          <div className="flex flex-wrap gap-1">
            {meme.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] uppercase tracking-tighter text-text-dim border border-border-dim px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-dim mt-auto">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-text-dim hover:text-pink-vivid transition-colors">
              <Heart size={16} />
              <span className="text-xs font-mono">{meme.likesCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-text-dim hover:text-cyan-vivid transition-colors">
              <MessageCircle size={16} />
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase text-text-dim tracking-widest leading-none mb-1">Virality</span>
            <span className={cn(
              "text-sm font-mono font-bold leading-none",
              meme.viralityScore > 80 ? "text-cyan-vivid" : 
              meme.viralityScore > 50 ? "text-purple-vivid" : "text-pink-vivid"
            )}>
              {meme.viralityScore}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="progress-bar mt-2">
          <div 
            className="progress-fill bg-cyan-vivid" 
            style={{ width: `${meme.viralityScore}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
