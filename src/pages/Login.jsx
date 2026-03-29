import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { checkUserStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [warningMessage, setWarningMessage] = useState('');

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarningMessage('');
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
        setWarningMessage(data.error);
        toast.error("Access Denied");
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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 text-white font-sans">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Subtle glowing accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            CodeAssess
          </h1>
          <p className="text-gray-400 mt-2">Student Portal Login</p>
        </div>

        {warningMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm leading-relaxed ${
            warningMessage.toLowerCase().includes('rejected') 
              ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
              : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{warningMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center gap-2">
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
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg active:scale-[0.98] mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Sign In
          </button>
        </form>

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
      </div>
    </div>
  );
}
