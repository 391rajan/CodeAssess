import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StudentHeader from '../components/StudentHeader';
import { motion } from 'framer-motion';
import { fadeInLeft, staggerContainer, fadeInUp } from '../utils/animations';

export default function ProblemList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [company, setCompany] = useState('All');

  const COMPANIES = ['All', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch public problems array
        const probRes = await fetch('http://localhost:5000/api/problems');
        const probJson = await probRes.json();
        
        // Fetch personal submissions securely
        const subRes = await fetch('http://localhost:5000/api/student/submissions', { credentials: 'include' });
        const subJson = await subRes.json();
        
        if (probJson.success) setProblems(probJson.data);
        if (subJson.success) setSubmissions(subJson.data.submissions);
        
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats mapping tracking PASSED conditions globally over Problem IDs
  const computedMetrics = useMemo(() => {
    const stats = {};
    submissions.forEach(sub => {
      if (!sub.problemId) return;
      if (!stats[sub.problemId]) {
         stats[sub.problemId] = { attempts: 0, passed: 0 };
      }
      stats[sub.problemId].attempts++;
      if (sub.status === 'PASSED') {
         stats[sub.problemId].passed++;
      }
    });
    return stats;
  }, [submissions]);

  // Filter problems logically
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Title search
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      // Difficulty
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      // Company parsing raw comma separated strings
      if (company !== 'All') {
        const tags = Array.isArray(p.companyTags) ? p.companyTags : (p.companyTags || '').split(',');
        const hasTag = tags.some(t => t.toLowerCase().includes(company.toLowerCase()));
        if (!hasTag) return false;
      }
      return true;
    });
  }, [problems, search, difficulty, company]);

  const getStatusIcon = (probId) => {
    const stat = computedMetrics[probId];
    if (!stat || stat.attempts === 0) return <Circle className="w-5 h-5 text-gray-600" />;
    if (stat.passed > 0) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'Easy') return <motion.span whileHover={{ scale: 1.1 }} className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">Easy</motion.span>;
    if (diff === 'Medium') return <motion.span whileHover={{ scale: 1.1 }} className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Medium</motion.span>;
    return <motion.span whileHover={{ scale: 1.1 }} className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">Hard</motion.span>;
  };

  const validateRate = (probId) => {
    const stat = computedMetrics[probId];
    if (!stat || stat.attempts === 0) return <span className="text-gray-500">-</span>;
    const pct = Math.round((stat.passed / stat.attempts) * 100);
    return <span className="font-mono text-gray-300">{stat.passed}/{stat.attempts} <span className="text-gray-500 text-xs">({pct}%)</span></span>;
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-4">
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <p className="text-gray-400 font-medium">Constructing algorithm grid...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white flex flex-col font-sans relative">
      <StudentHeader />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-6 relative z-10 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <motion.div variants={fadeInLeft} initial="initial" animate="animate">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
              Problem Catalog
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">
              Showing <span className="text-white font-bold">{filteredProblems.length}</span> of <span className="text-white font-bold">{problems.length}</span> problems
            </p>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-4 shadow-lg backdrop-blur-md"
        >
          {/* Search */}
          <motion.div variants={fadeInUp} custom={0} className="flex items-center bg-black/40 border border-white/10 rounded-lg px-4 py-2 flex-grow md:max-w-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input 
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm w-full outline-none placeholder-gray-500 text-white"
            />
          </motion.div>

          {/* Difficulty Filters */}
          <motion.div variants={fadeInUp} custom={1} className="flex items-center gap-2 bg-black/40 border border-white/10 p-1.5 rounded-lg">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff, diffIdx) => (
              <motion.button
                key={diff}
                onClick={() => setDifficulty(diff)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (diffIdx * 0.05) }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  difficulty === diff ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {diff}
              </motion.button>
            ))}
          </motion.div>

          {/* Company Filters */}
          <motion.div variants={fadeInUp} custom={2} className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">Company:</span>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-black/40 border border-white/10 text-gray-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer"
            >
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </motion.div>
        </motion.div>

        {/* Problems Table */}
        <div className="glass-card overflow-hidden mt-4 relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-semibold">
                <th className="p-5 text-center w-16">Status</th>
                <th className="p-5 w-16">#</th>
                <th className="p-5">Title</th>
                <th className="p-5">Difficulty</th>
                <th className="p-5 hidden md:table-cell">Companies</th>
                <th className="p-5 text-right whitespace-nowrap">Solved Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-medium text-sm tracking-wider uppercase">
                    No problems match your filters.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((p, idx) => (
                  <motion.tr 
                    key={p._id} 
                    onClick={() => navigate(`/problems/${p._id}`)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      backgroundColor: "rgba(124, 58, 237, 0.1)",
                      x: 4,
                      transition: { duration: 0.15 }
                    }}
                    className="group cursor-pointer hover:bg-primary/[0.04] relative overflow-hidden border-b border-transparent hover:border-primary/50"
                  >
                    
                    <td className="p-5 text-center flex justify-center">{getStatusIcon(p._id)}</td>
                    <td className="p-5 text-gray-500 font-mono text-sm">{idx + 1}</td>
                    <td className="p-5 font-bold text-gray-200 group-hover:text-primary transition-colors">
                      {p.title}
                    </td>
                    <td className="p-5">{getDifficultyBadge(p.difficulty)}</td>
                    <td className="p-5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(p.companyTags) ? p.companyTags : (p.companyTags || '').split(','))
                          .map(t => typeof t === 'string' ? t.trim() : '')
                          .filter(t => t !== '')
                          .slice(0, 3)
                          .map((tag, i) => (
                            <span key={i} className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">
                              {tag}
                            </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-5 text-right">{validateRate(p._id)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
