import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isLinkActive = (path) => {
    if (path === '/problems' && (location.pathname === '/problems' || location.pathname === '/')) return true;
    if (location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      
      {/* Left side */}
      <div className="flex items-center gap-8">
        <Link to="/problems" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          CodeAssess
        </Link>
        <div className="flex items-center gap-2">
          <Link 
            to="/problems" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isLinkActive('/problems') 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Problems
          </Link>
          <Link 
            to="/profile" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isLinkActive('/profile') 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Profile
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 mr-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/20">
            {getInitials(user?.name)}
          </div>
          <span className="text-sm font-semibold text-gray-200 tracking-wide hidden sm:block">
            {user?.name}
          </span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg transition-all text-sm font-semibold"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
      
    </div>
  );
}
