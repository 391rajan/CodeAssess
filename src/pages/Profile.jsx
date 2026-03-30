import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, Target, Award, ListChecks, PieChart, Activity, X, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import StudentHeader from '../components/StudentHeader';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profRes, subRes] = await Promise.all([
          fetch('http://localhost:5000/api/student/profile', { credentials: 'include' }),
          fetch('http://localhost:5000/api/student/submissions', { credentials: 'include' })
        ]);
        
        const profJson = await profRes.json();
        const subJson = await subRes.json();

        if (profJson.success) setProfile(profJson.data);
        if (subJson.success) setSubmissions(subJson.data.submissions.slice(0, 20));

      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status) => {
    if (status === 'PASSED') return <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Accepted</span>;
    if (status === 'FAILED') return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Wrong Answer</span>;
    return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{status.replace(/_/g, ' ')}</span>;
  };

  const openReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-400 font-medium">Assembling student metrics...</p>
      </div>
    );
  }

  if (!profile) return null;

  // Donut Chart logic
  const totalSolved = profile.totalSolved || 0;
  // Circumference of SVG circle with r=15.91549430918954 is exactly 100
  // Values represent percentages
  const ePct = totalSolved === 0 ? 0 : (profile.easySolved / totalSolved) * 100;
  const mPct = totalSolved === 0 ? 0 : (profile.mediumSolved / totalSolved) * 100;
  const hPct = totalSolved === 0 ? 0 : (profile.hardSolved / totalSolved) * 100;

  // Dash offsets
  // Easy starts from 0 (offset 25 logically due to SVG orientation normally, we adjust in CSS rotate)
  const offsetMedium = 100 - ePct;
  const offsetHard = 100 - ePct - mPct;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white flex flex-col font-sans relative">
      <StudentHeader />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 relative z-10">
        
        {/* Top Profile Card */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_30px_rgba(124,58,237,0.4)] border-2 border-primary/50 flex-shrink-0">
            {getInitials(profile.name)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-wide text-white mb-2">{profile.name}</h1>
            <p className="text-gray-400 font-mono text-sm mb-4">{profile.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4 text-primary" />
                Member since <span className="font-bold text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                <Target className="w-4 h-4 text-orange-400" />
                Current Streak: <span className="font-bold text-orange-400 text-base">{profile.streakCount} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Solved</h3>
                <ListChecks className="w-5 h-5 text-primary opacity-50" />
             </div>
             <p className="text-4xl font-black text-white">{profile.totalSolved}</p>
          </div>
          <div className="glass-card p-6 flex flex-col gap-2 border-t-2 border-t-green-500/50">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-green-500">Easy</h3>
             </div>
             <p className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(7ade80,0.4)]">{profile.easySolved}</p>
          </div>
          <div className="glass-card p-6 flex flex-col gap-2 border-t-2 border-t-yellow-500/50">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500">Medium</h3>
             </div>
             <p className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">{profile.mediumSolved}</p>
          </div>
          <div className="glass-card p-6 flex flex-col gap-2 border-t-2 border-t-red-500/50">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Hard</h3>
             </div>
             <p className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">{profile.hardSolved}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Donut Chart */}
           <div className="glass-card p-6 lg:col-span-1 flex flex-col items-center">
             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 w-full flex items-center gap-2 mb-8">
               <PieChart className="w-4 h-4 text-primary" /> Difficulty Breakdown
             </h3>
             <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
                {totalSolved === 0 ? (
                  <span className="text-gray-600 font-bold uppercase tracking-widest text-sm">No Data</span>
                ) : (
                  <>
                    <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                      {/* Base ring */}
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                      
                      {/* Hard (Red) */}
                      {hPct > 0 && <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${hPct} ${100 - hPct}`} strokeDashoffset={offsetHard}></circle>}
                      {/* Medium (Yellow) */}
                      {mPct > 0 && <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#eab308" strokeWidth="4" strokeDasharray={`${mPct} ${100 - mPct}`} strokeDashoffset={offsetMedium}></circle>}
                      {/* Easy (Green) */}
                      {ePct > 0 && <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray={`${ePct} ${100 - ePct}`} strokeDashoffset="0"></circle>}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black">{totalSolved}</span>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total</span>
                    </div>
                  </>
                )}
             </div>
           </div>

           <div 
             className="glass-card flex flex-col lg:col-span-2" 
             style={{ overflow: "hidden", width: "100%", boxSizing: "border-box" }}
           >
             <div className="p-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 w-full flex items-center gap-2 mb-8">
                 <Activity className="w-4 h-4 text-accent" /> 30-Day Activity Heatmap
               </h3>
             </div>
             <div className="flex-1 flex items-center justify-center pb-4">
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(30, 1fr)",
                  gap: "4px",
                  padding: "16px",
                  overflow: "hidden",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  {profile.recentActivity.map((day, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: "2px",
                        backgroundColor: day.hasSubmission 
                          ? "#22C55E" 
                          : "rgba(255,255,255,0.08)"
                      }}
                      className="transition-all hover:scale-110 cursor-pointer"
                      title={`${day.date}: ${day.hasSubmission ? 'Activity recorded' : 'No submissions'}`}
                    />
                  ))}
                </div>
             </div>
             <div className="flex items-center justify-end gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-2">
                <span>Less</span>
                <div className="w-3 h-3 rounded-[2px] bg-white/5 border border-white/[0.05]" />
                <div className="w-3 h-3 rounded-[2px] bg-green-500/40" />
                <div className="w-3 h-3 rounded-[2px] bg-green-500" />
                <span>More</span>
             </div>
           </div>
        </div>

        {/* Submission History Table */}
        <div className="glass-card overflow-hidden mt-2">
           <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">
                Recent Submissions
              </h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
                   <th className="px-6 py-4">Problem</th>
                   <th className="px-6 py-4 hidden sm:table-cell">Language</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 hidden md:table-cell">Date</th>
                   <th className="px-6 py-4 text-right">Insight</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {submissions.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest">
                       No submissions recorded yet.
                     </td>
                   </tr>
                 ) : (
                   submissions.map((sub) => (
                     <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="px-6 py-4">
                         <p className="font-bold text-gray-200 text-sm whitespace-nowrap">{sub.problemTitle}</p>
                       </td>
                       <td className="px-6 py-4 hidden sm:table-cell">
                         <span className="text-xs font-mono text-gray-400 tracking-wider uppercase border border-white/10 bg-white/5 px-2 py-1 rounded">
                           {sub.language}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           {getStatusBadge(sub.status)}
                           {sub.status === 'PASSED' && sub.hintsUsed === 3 && (
                             <span className="px-2 py-0.5 border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 rounded text-[9px] font-bold uppercase tracking-widest whitespace-nowrap" title="Solved using 3 AI hints">
                               Solved with hints
                             </span>
                           )}
                         </div>
                       </td>
                       <td className="px-6 py-4 hidden md:table-cell">
                         <span className="text-xs font-mono text-gray-500 tracking-wide">
                           {new Date(sub.createdAt).toLocaleString()}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => openReport(sub.aiReport)}
                           className="text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(124,58,237,0.3)] whitespace-nowrap"
                         >
                           View Report
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </main>

      {/* AI Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60 transition-opacity">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
             
             <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
               <h2 className="text-lg font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                 <Award className="w-5 h-5 text-primary" /> Algorithmic Insight Report
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                {!selectedReport || Object.keys(selectedReport).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                     <Fingerprint className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                     <p className="font-semibold tracking-wide uppercase text-sm">No AI report available for this submission.</p>
                     <p className="text-xs mt-2 text-gray-500">Only fully PASSED submissions receive full algorithmic audits.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                     {/* Complexities */}
                     <div className="flex flex-wrap gap-4">
                        <div className="glass-card flex-1 p-4 bg-primary/[0.02] border-primary/20">
                          <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Time Complexity</h4>
                          <p className="text-2xl font-black text-white font-mono">{selectedReport.time_complexity}</p>
                        </div>
                        <div className="glass-card flex-1 p-4 bg-accent/[0.02] border-accent/20">
                          <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Space Complexity</h4>
                          <p className="text-2xl font-black text-white font-mono">{selectedReport.space_complexity}</p>
                        </div>
                        <div className="glass-card flex-1 p-4 bg-green-500/[0.02] border-green-500/20">
                          <h4 className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-2">Rating Array</h4>
                          <p className="text-xl font-bold text-white capitalize">{selectedReport.overall_rating}/10 Rating</p>
                        </div>
                     </div>

                     {/* Tips */}
                     {(selectedReport.optimization_tips?.length > 0) && (
                       <div>
                         <h4 className="text-xs uppercase tracking-widest text-yellow-500 font-bold mb-4 flex items-center gap-2">
                           Optimization Analytics
                         </h4>
                         <ul className="space-y-3">
                           {selectedReport.optimization_tips.map((tip, i) => (
                             <li key={i} className="flex gap-3 text-gray-300 text-sm bg-white/[0.02] border border-white/5 p-3 rounded-lg leading-relaxed">
                               <span className="text-yellow-500 font-bold font-mono text-xs">{i+1}.</span> {tip}
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}

                     {/* Style */}
                     {selectedReport.style_feedback && (
                       <div>
                         <h4 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3 flex items-center gap-2">
                           Style Syntax Diagnostics
                         </h4>
                         <div className="text-gray-300 text-sm leading-relaxed p-4 bg-cyan-900/10 border-l-2 border-cyan-500 rounded-r-lg">
                           {selectedReport.style_feedback.replace(/"/g, '')}
                         </div>
                       </div>
                     )}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
