import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NavLink = ({ to, active, children, icon }) => (
  <Link to={to} className="relative group px-4 py-2 flex items-center gap-1.5 focus:outline-none">
    <span className={`text-sm font-semibold transition-colors relative z-10 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
      {icon && <span className="inline-block mr-1 opacity-80">{icon}</span>}
      {children}
    </span>
    {active && (
      <motion.div
        layoutId="activeNavIndicator"
        className="absolute inset-0 bg-white/10 rounded-lg"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    {/* Underline slide on hover */}
    <motion.div
      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary/50 origin-left"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.2 }}
    />
  </Link>
);

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
    <motion.div 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10 backdrop-blur-md sticky top-0 z-50"
    >
      
      {/* Left side */}
      <div className="flex items-center gap-8">
        <Link to="/problems">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          >
            CodeAssess
          </motion.div>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/problems" active={isLinkActive('/problems')}>Problems</NavLink>
          <NavLink to="/profile" active={isLinkActive('/profile')}>Profile</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" active={isLinkActive('/admin')} icon={<Shield className="w-3.5 h-3.5 text-accent" />}>
              <span className="text-accent">Admin</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 mr-2 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/20"
          >
            {getInitials(user?.name)}
          </motion.div>
          <span className="text-sm font-semibold text-gray-200 tracking-wide hidden sm:block">
            {user?.name}
          </span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <motion.button
          onClick={logout}
          whileHover={{ backgroundColor: "rgba(239,68,68,0.2)" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg transition-colors text-sm font-semibold"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Logout</span>
        </motion.button>
      </div>
      
    </motion.div>
  );
}
