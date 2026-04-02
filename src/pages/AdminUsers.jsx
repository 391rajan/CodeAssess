import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldAlert, ArrowLeft, Loader2, Check, X } from 'lucide-react';
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

  const handleStatusUpdate = async (id, name, newStatus) => {
    const actionPhrase = newStatus === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionPhrase} ${name}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(`User ${name} marked as ${newStatus}`);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } else {
        toast.error(json.error || `Failed to ${actionPhrase} user`);
      }
    } catch (err) {
      toast.error("Server error updating status");
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="px-3 py-1 rounded-full border text-xs font-bold bg-green-500/10 text-green-400 border-green-500/20">Approved</span>;
    if (status === 'rejected') return <span className="px-3 py-1 rounded-full border text-xs font-bold bg-red-500/10 text-red-500 border-red-500/20">Rejected</span>;
    return <span className="px-3 py-1 rounded-full border text-xs font-bold bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse">Pending...</span>;
  };

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

  const pendingCount = users.filter(u => u.status === 'pending').length;

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
              <Users className="w-8 h-8 text-primary" /> User Management
            </h1>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] border border-white/10 px-5 py-3 rounded-lg flex items-center gap-3"
          >
            <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-gray-300">
              <span className="text-yellow-400 font-bold">{pendingCount}</span> Awaiting Approval
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
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 font-medium uppercase tracking-widest text-sm">
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
                    className={`hover:bg-white/[0.02] transition-colors ${u.status === 'rejected' ? 'opacity-40 grayscale pointer-events-none hover:bg-transparent' : ''}`}
                  >
                    <td className="p-5">
                      <p className="font-bold text-white tracking-wide">{u.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</p>
                    </td>
                    <td className="p-5 text-gray-400 text-sm font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5">
                      {getStatusBadge(u.status)}
                    </td>
                    <td className="p-5 text-right">
                      {u.status === 'pending' && (
                        <div className="flex justify-end gap-3 pointer-events-auto">
                          <motion.button 
                            onClick={() => handleStatusUpdate(u._id, u.name, 'approved')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </motion.button>
                          <motion.button 
                            onClick={() => handleStatusUpdate(u._id, u.name, 'rejected')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
                          >
                            <X className="w-4 h-4" /> Reject
                          </motion.button>
                        </div>
                      )}
                      {u.status === 'approved' && (
                         <div className="flex justify-end">
                            <motion.button 
                              onClick={() => handleStatusUpdate(u._id, u.name, 'rejected')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-[10px] uppercase tracking-wider"
                            >
                              Revoke Access
                            </motion.button>
                         </div>
                      )}
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
