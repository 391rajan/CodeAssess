import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { slideUp, staggerContainer, fadeInUp } from '../utils/animations';

export default function AdminLogin() {
  const { checkUserStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      
      if (data.success) {
        if (data.data.role !== 'admin') {
          toast.error("Not an admin account");
          return navigate('/login');
        }
        await checkUserStatus();
        navigate('/admin');
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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="glass-card w-full max-w-md p-8 relative overflow-hidden shadow-2xl border-red-500/20"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500" />
        
        <div className="text-center mb-8 flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-90" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400 uppercase tracking-widest">
            Administrator Access
          </h1>
          <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest font-semibold">Authorized Personnel Only</p>
        </div>

        <motion.form 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono text-sm"
              placeholder="admin@system.io"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Access Payload</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono text-sm tracking-widest"
              placeholder="••••••••"
            />
          </motion.div>

          <motion.button 
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg mt-2 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            Authenticate
          </motion.button>
        </motion.form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link to="/login" className="text-xs text-gray-500 hover:text-red-400 transition-colors tracking-wide">
            ← Return to Student Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
