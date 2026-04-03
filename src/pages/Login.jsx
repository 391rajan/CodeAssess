import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, staggerContainer, fadeInUp } from '../utils/animations';

export default function Login() {
  const { checkUserStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please enter email and password");
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.status === 403) {
        toast.error(data.error || "Access Denied");
        setLoading(false);
        return;
      }

      if (data.success) {
        await checkUserStatus(); // populate user object globally
        navigate('/');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 text-white font-sans overflow-hidden">
      <motion.div 
        variants={slideUp} 
        initial="initial" 
        animate="animate" 
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        {/* Subtle glowing accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            CodeAssess
          </h1>
          <p className="text-gray-400 mt-2">Student Portal Login</p>
        </div>



        <motion.form 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit} 
          className="space-y-5"
        >
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="student@example.com"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="••••••••"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-black/30 text-primary focus:ring-primary/20 accent-primary"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              Remember me for 30 days
            </label>
          </motion.div>

          <motion.button 
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg mt-2 disabled:opacity-50"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            Sign In
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-white font-semibold transition-colors">
            Register here
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
          <Link to="/admin/login" className="text-xs text-gray-500 hover:text-gray-300 underline-offset-4 hover:underline transition-colors">
            Administrators Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
