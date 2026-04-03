import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft } from '../utils/animations';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (err) {
      toast.error("Connection error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-4">
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <p className="text-gray-400 font-medium">Loading network roster...</p>
      </div>
    );
  }

  const totalStudents = users.length;

  return (
    <div className="min-h-screen w-full bg-background text-white p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          variants={fadeInLeft}
          initial="initial"
          animate="animate"
          className="flex justify-between items-end border-b border-white/10 pb-6"
        >
          <div>
            <Link to="/admin" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" /> Registered Students
            </h1>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] border border-white/10 px-5 py-3 rounded-lg flex items-center gap-3"
          >
            <span className="text-sm font-semibold tracking-wide text-gray-300">
              <span className="text-primary font-bold mr-1">{totalStudents}</span> Total Students
            </span>
          </motion.div>
        </motion.div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest">
                <th className="p-5 font-semibold">User Profile</th>
                <th className="p-5 font-semibold">Registered Date</th>
                <th className="p-5 font-semibold text-right">Problems Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-500 font-medium uppercase tracking-widest text-sm">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    No registered students found.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <motion.tr 
                    key={u._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5">
                      <p className="font-bold text-white tracking-wide">{u.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</p>
                    </td>
                    <td className="p-5 text-gray-400 text-sm font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right font-bold text-gray-300">
                      {u.solvedProblems?.length || 0}
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
