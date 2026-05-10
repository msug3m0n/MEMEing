import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plus, Flame, Home as HomeIcon, LogIn, LogOut, Terminal, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, loginWithGoogle, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navItems = [
    { name: 'INDEX', path: '/', icon: HomeIcon },
    { name: 'TRENDING', path: '/trending', icon: Flame },
    { name: 'UPLOAD', path: '/upload', icon: Plus },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-deep/90 backdrop-blur-sm border-b border-border-dim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-vivid rounded-full shadow-[0_0_8px_#00F5FF]" />
                <span className="text-[10px] tracking-[0.4em] text-cyan-vivid uppercase font-bold">M3-CORE</span>
              </div>
              <h1 className="text-3xl font-black text-white leading-none -mt-1 tracking-tighter uppercase">Meming</h1>
            </Link>

            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
              <Search className="absolute left-4 text-text-dim group-focus-within:text-cyan-vivid transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="AI_SEARCH_FOR_MEMES..."
                className="bg-surface-solid border border-border-dim pl-12 pr-6 py-2.5 rounded-sm text-xs font-mono w-80 focus:outline-none focus:border-cyan-vivid transition-all"
              />
            </form>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-[11px] font-bold tracking-[0.2em] transition-all hover:text-cyan-vivid relative py-2",
                  location.pathname === item.path ? "text-cyan-vivid" : "text-white/40"
                )}
              >
                {location.pathname === item.path && (
                  <motion.div layoutId="nav-glow" className="absolute -bottom-1 inset-x-0 h-[2px] bg-cyan-vivid shadow-[0_0_8px_#00F5FF]" />
                )}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">{user.username}</span>
                  <button onClick={logout} className="text-[9px] uppercase tracking-widest text-text-dim hover:text-pink-vivid transition-colors">
                    TERMINATE_SESSION
                  </button>
                </div>
                <div className="w-10 h-10 border border-border-dim p-0.5 hover:border-cyan-vivid transition-colors">
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-3 bg-white text-black px-6 py-2 rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-cyan-vivid hover:text-black transition-all cursor-pointer"
              >
                <Terminal size={14} />
                Connect_
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
