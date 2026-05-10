import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Mail, Lock, User as UserIcon, Github, Chrome, Loader2, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithGithub, signupWithEmail, loginWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, username);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (method: 'google' | 'github') => {
    setLoading(true);
    try {
      if (method === 'google') await loginWithGoogle();
      else await loginWithGithub();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md tech-panel bg-surface-solid p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-vivid" />
            
            <button onClick={onClose} className="absolute top-4 right-4 text-text-dim hover:text-white transition-colors">
              <X size={20} />
            </button>

            <header className="mb-8">
              <span className="text-[10px] text-cyan-vivid tracking-[0.4em] font-bold uppercase">M3_AUTH_PROTOCOL</span>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{isLogin ? 'IDENTITY_LOGIN' : 'IDENTITY_CREATE'}</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-cyan-vivid" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USERNAME_ALIAS..."
                    className="w-full bg-bg-deep border border-border-dim pl-12 pr-4 py-4 text-xs font-mono focus:border-cyan-vivid outline-none"
                  />
                </div>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-cyan-vivid" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL_VECTOR..."
                  className="w-full bg-bg-deep border border-border-dim pl-12 pr-4 py-4 text-xs font-mono focus:border-cyan-vivid outline-none"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-cyan-vivid" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SECURE_PHRASE..."
                  className="w-full bg-bg-deep border border-border-dim pl-12 pr-4 py-4 text-xs font-mono focus:border-cyan-vivid outline-none"
                />
              </div>

              {error && (
                <p className="text-[10px] text-pink-vivid font-mono uppercase font-bold tracking-tighter">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-cyan-vivid text-black font-bold uppercase tracking-widest text-[10px] hover:brightness-110 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : (isLogin ? 'INITIATE_SESSION' : 'REGISTER_CORE')}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
               <div className="h-px flex-1 bg-border-dim" />
               <span className="text-[10px] text-text-dim font-mono tracking-widest uppercase">Social_Link</span>
               <div className="h-px flex-1 bg-border-dim" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => handleSocial('google')}
                className="py-3 px-4 tech-panel flex items-center justify-center gap-2 text-text-dim hover:text-white transition-all text-[10px] font-bold uppercase"
               >
                 <Chrome size={14} /> GOOGLE
               </button>
               <button 
                onClick={() => handleSocial('github')}
                className="py-3 px-4 tech-panel flex items-center justify-center gap-2 text-text-dim hover:text-white transition-all text-[10px] font-bold uppercase"
               >
                 <Github size={14} /> GITHUB
               </button>
            </div>

            <footer className="mt-8 text-center">
               <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] text-text-dim hover:text-cyan-vivid transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
               >
                 {isLogin ? 'Create_New_Core' : 'Existing_Session'} <CornerDownRight size={12} />
               </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
