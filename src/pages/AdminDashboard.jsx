import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Database, ShieldAlert, LogOut, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shakingRow, setShakingRow] = useState(null);

  const fetchAdminProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/problems', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setProblems(json.data);
      } else {
        toast.error("Failed to load problems");
      }
    } catch (err) {
      toast.error("Connection error loading problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProblems();
  }, []);

  const handleDelete = async (id, title) => {
    setShakingRow(id);
    setTimeout(() => setShakingRow(null), 500);
    
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/problems/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Problem deleted successfully");
          setProblems(problems.filter(p => p._id !== id));
        } else {
          toast.error(json.error || "Failed to delete");
        }
      } catch (err) {
        toast.error("Server error during deletion");
      }
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'Easy') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (diff === 'Medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-4">
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <p className="text-gray-400 font-medium">Loading admin dashboard...</p>
      </div>
    );
  }

  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

  return (
    <div className="min-h-screen w-full bg-background text-white p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-end border-b border-white/10 pb-6"
        >
          <div>
            <div className="flex gap-4 items-center mb-4">
               <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors w-fit">
                 <ArrowLeft className="w-4 h-4" /> Back to Platform
               </Link>
               <span className="text-gray-600">|</span>
               <Link to="/admin/users" className="text-accent hover:text-white flex items-center gap-2 text-sm transition-colors w-fit font-semibold">
                 <Users className="w-4 h-4" /> Registered Students
               </Link>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-300">
               Admin: <span className="text-white font-bold">{user?.name}</span>
            </span>
            <motion.button
               onClick={logout}
               whileHover={{ backgroundColor: "rgba(239,68,68,0.2)" }}
               whileTap={{ scale: 0.95 }}
               className="p-2 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg transition-colors"
               title="Logout"
            >
               <LogOut className="w-4 h-4" />
            </motion.button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/admin/new"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-lg font-bold text-white transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add New Problem
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-4 gap-4"
        >
          <motion.div variants={fadeInUp} className="glass-card p-6 flex flex-col items-start gap-4">
            <Database className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-3xl font-bold">{problems.length}</p>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Problems</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="glass-card p-6 flex flex-col items-start gap-4">
            <div className="p-2 bg-green-500/20 rounded-lg"><div className="w-4 h-4 bg-green-500 rounded-full"/></div>
            <div>
              <p className="text-3xl font-bold text-green-400">{easyCount}</p>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Easy</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="glass-card p-6 flex flex-col items-start gap-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg"><div className="w-4 h-4 bg-yellow-400 rounded-full"/></div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">{mediumCount}</p>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Medium</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="glass-card p-6 flex flex-col items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-lg"><div className="w-4 h-4 bg-red-500 rounded-full"/></div>
            <div>
              <p className="text-3xl font-bold text-red-400">{hardCount}</p>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Hard</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Difficulty</th>
                <th className="p-4 font-semibold">Company Tags</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {problems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No problems found in the database.
                  </td>
                </tr>
              ) : (
                problems.map((p, idx) => (
                  <motion.tr 
                    key={p._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={shakingRow === p._id 
                      ? { opacity: 1, y: 0, x: [0, -10, 10, -10, 0] } 
                      : { opacity: 1, y: 0 }
                    }
                    transition={shakingRow === p._id 
                      ? { duration: 0.4 }
                      : { delay: idx * 0.04 }
                    }
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{p.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getDifficultyBadge(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {p.companyTags?.length > 0 ? p.companyTags.map((tag, i) => (
                          <span key={i} className="text-xs text-gray-300 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        )) : <span className="text-gray-500 text-sm">—</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link 
                          to={`/admin/edit/${p._id}`}
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                          title="Edit Problem"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <motion.button 
                          onClick={() => handleDelete(p._id, p.title)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
