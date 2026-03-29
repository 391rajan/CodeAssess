import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        toast.success("Successfully Registered!");
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 text-white font-sans">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
            CodeAssess
          </h1>
          <p className="text-gray-400 mt-2">Student Registration</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl flex flex-col items-center gap-4 text-center leading-relaxed">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div>
              <h2 className="text-lg font-bold mb-2">Registration Successful!</h2>
              <p className="text-sm">Your account is pending admin approval. You will be notified once approved.</p>
            </div>
            <Link to="/login" className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded-lg transition-colors mt-2 border border-green-500/30">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
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
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Confirm Password</label>
              <input 
                type="password" 
                name="confirm"
                value={formData.confirm}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95 mt-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Create Account
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-white font-semibold transition-colors">
              Log in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
