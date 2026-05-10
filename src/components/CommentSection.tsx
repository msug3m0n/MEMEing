import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Comment, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { moderateComment } from '../services/gemini';
import { Loader2, Send, Trash2, ShieldAlert } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CommentSectionProps {
  memeId: string;
}

export default function CommentSection({ memeId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'memes', memeId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        commentId: doc.id
      })) as Comment[];
      setComments(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [memeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);

    try {
      // AI Moderation
      const moderation = await moderateComment(newComment);
      
      if (!moderation.isAllowed) {
        setError(`Comment blocked: ${moderation.reason || 'Offensive content detected.'}`);
        setIsPosting(false);
        return;
      }

      await addDoc(collection(db, 'memes', memeId, 'comments'), {
        memeId,
        userId: user.userId,
        username: user.username,
        avatarUrl: user.avatarUrl || '',
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      });

      setNewComment('');
    } catch (err) {
      console.error(err);
      setError('Failed to post comment.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'memes', memeId, 'comments', commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border-dim pb-4">
        <h3 className="font-display text-xl uppercase tracking-wider">COMMENTS_STREAM</h3>
        <span className="text-pink-vivid font-mono text-xs">[{comments.length}]</span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="ENCRYPT_YOUR_THOUGHTS..."
              className="w-full bg-surface-solid border border-border-dim p-4 text-sm font-mono focus:border-cyan-vivid outline-none min-h-[100px] resize-none"
              disabled={isPosting}
            />
            {isPosting && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-cyan-vivid" />
                <span className="text-[10px] font-mono text-cyan-vivid uppercase tracking-widest">AI_MODERATION_IN_PROGRESS</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-dim">
              <ShieldAlert size={14} className={error ? "text-pink-vivid" : ""} />
              <span className={cn("text-[9px] uppercase tracking-tighter", error ? "text-pink-vivid font-bold" : "")}>
                {error || "MODERATED BY NEURAL ENGINE"}
              </span>
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isPosting}
              className="bg-cyan-vivid text-black px-6 py-2 font-bold uppercase tracking-widest text-[10px] hover:brightness-110 disabled:opacity-30 flex items-center gap-2"
            >
              POST_DATA <Send size={12} />
            </button>
          </div>
        </form>
      ) : (
        <div className="tech-panel p-6 text-center">
          <p className="text-text-dim text-[10px] uppercase font-mono tracking-widest">AUTHENTICATION_REQUIRED_FOR_COMMENTS</p>
        </div>
      )}

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.commentId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="tech-panel p-4 flex gap-4 group"
            >
              <div className="w-8 h-8 border border-border-dim p-0.5 shrink-0">
                <img src={comment.avatarUrl} alt={comment.username} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-vivid uppercase tracking-tight">{comment.username}</span>
                  <span className="text-[8px] font-mono text-text-dim">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-text-vivid leading-relaxed font-mono">{comment.text}</p>
              </div>
              {user?.userId === comment.userId && (
                <button
                  onClick={() => handleDelete(comment.commentId)}
                  className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-pink-vivid transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-cyan-vivid/30" />
          </div>
        )}
        
        {!loading && comments.length === 0 && (
          <div className="text-center py-8 opacity-20 border border-dashed border-border-dim">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">EMPTY_COMMENTS_VECTOR</p>
          </div>
        )}
      </div>
    </div>
  );
}
