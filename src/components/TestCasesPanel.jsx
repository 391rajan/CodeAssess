import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestCasesPanel({ 
  isOpen, 
  onClose,
  problem, 
  activeTab, 
  setActiveTab, 
  customInput, 
  setCustomInput, 
  customExpected, 
  setCustomExpected,
  customError,
  runResults,
  runTime,
  isAnalyzing
}) {
  if (!isOpen || !problem) return null;

  const totalExamples = problem.examples.length;
  // Tabs: 0 ... totalExamples - 1 are examples. totalExamples is Custom.
  const tabs = problem.examples.map((_, i) => `Example ${i + 1}`);
  tabs.push("Custom");

  // Parse per-tab result from the runResults object returned by EditorPane.
  // runResults shape: { status, output, passedCount, totalCount } | { error }
  const parseResultForTab = (idx) => {
    if (isAnalyzing || !runResults) return null;

    // Network / server error
    if (runResults.error) {
      if (idx === activeTab) return { status: 'Error', text: runResults.error };
      return null;
    }

    // All tests passed — every example tab shows green, no per-tab output on custom
    if (runResults.status === 'PASSED') {
      if (idx < totalExamples) return { status: 'Passed' };
      return null; // custom tab — no result to show on a full pass
    }

    // Compile error — show on active tab only
    if (runResults.status === 'COMPILE_ERROR') {
      if (idx === activeTab) return { status: 'Error', text: runResults.output };
      return null;
    }

    // FAILED — output is newline-joined "Test case N: ..." strings
    const lines = (runResults.output || '').split('\n').filter(Boolean);
    const prefix = `Test case ${idx + 1}:`;
    const line = lines.find(l => l.includes(prefix));

    if (!line) {
      // Unknown output format — show on active tab as a warning
      if (idx === activeTab) {
        return { status: 'Warning', text: runResults.output || 'No output.' };
      }
      return null;
    }

    const text = line.split(prefix)[1]?.trim() || '';

    if (text.startsWith('Passed')) {
      return { status: 'Passed' };
    }

    if (text.startsWith('Wrong Answer')) {
      const parts = text.split('—');
      const details = parts.length > 1 ? parts[1].trim() : '';
      const m = details.match(/got (.*?), expected (.*)/);
      return {
        status: 'Wrong Answer',
        output: m ? m[1] : 'Unknown',
        expected: m ? m[2] : 'Unknown',
      };
    }

    if (text.startsWith('Runtime Error') || text.startsWith('Error')) {
      return { status: 'Error', text };
    }

    return { status: 'Warning', text };
  };

  const renderResultBadge = (parsed) => {
     if (!parsed) return null;
     if (parsed.status === "Passed") {
       return (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col gap-2"
          >
            <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                <CheckCircle2 className="w-4 h-4" />
              </motion.span> Passed
            </span>
            {parsed.output && (
              <div className="flex flex-col gap-1 text-xs font-mono text-gray-400">
                 <p>Output: <span className="text-gray-200">{parsed.output}</span></p>
              </div>
            )}
         </motion.div>
       );
     }

     if (parsed.status === "Wrong Answer") {
       return (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-2"
          >
            <span className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                <XCircle className="w-4 h-4" />
              </motion.span> Failed
            </span>
            <div className="flex flex-col gap-1 text-xs font-mono text-gray-400 mt-2 bg-black/40 p-2 rounded">
               <p>Output: <span className="text-red-300">{parsed.output}</span></p>
               <p>Expected: <span className="text-green-300">{parsed.expected}</span></p>
            </div>
         </motion.div>
       );
     }

     return (
       <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex flex-col gap-2"
        >
          <span className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4" /> {parsed.status}
          </span>
          <div className="text-xs font-mono text-yellow-300 mt-1 break-all bg-black/40 p-2 rounded">
             {parsed.text}
          </div>
       </motion.div>
     );
  };

  const isCustomTab = activeTab === totalExamples;
  const parsedRes = parseResultForTab(activeTab);

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full mt-4 glass-card border border-white/5 rounded-xl flex flex-col overflow-hidden"
      style={{ maxHeight: '40vh' }}
    >
       {/* Tab Headers */}
       <div className="flex items-center bg-black/40 border-b border-white/10 overflow-x-auto custom-scrollbar">
          {tabs.map((tabLabel, i) => (
             <button
               key={i}
               onClick={() => setActiveTab(i)}
               className={`px-6 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 whitespace-nowrap ${
                 activeTab === i 
                 ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' 
                 : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
               }`}
             >
               {tabLabel}
             </button>
          ))}
          {/* Close panel button */}
          <button
            onClick={onClose}
            className="ml-auto px-3 py-3 text-gray-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
            title="Close test cases panel"
          >
            <X className="w-4 h-4" />
          </button>
       </div>

       {/* Tab Content */}
       <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-black/20">
          {!isCustomTab ? (
             <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block">Input</label>
                   <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-sm text-gray-300">
                     {problem.examples[activeTab].input}
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block">Expected Output</label>
                   <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-sm text-gray-300">
                     {problem.examples[activeTab].output}
                   </div>
                </div>
             </motion.div>
          ) : (
             <motion.div 
                key="custom"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {customError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-red-400 flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20"
                  >
                     <AlertCircle className="w-4 h-4" /> {customError}
                  </motion.div>
                )}
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                     Custom Input (JSON format)
                   </label>
                   <textarea
                     value={customInput}
                     onChange={(e) => setCustomInput(e.target.value)}
                     placeholder='{"nums": [1,2], "target": 3}'
                     className="w-full p-3 bg-black/60 rounded-lg border border-white/10 font-mono text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 resize-hidden min-h-[80px]"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                     Expected Output (Optional JSON format)
                   </label>
                   <input
                     value={customExpected}
                     onChange={(e) => setCustomExpected(e.target.value)}
                     placeholder='[0, 1]'
                     className="w-full p-3 bg-black/60 rounded-lg border border-white/10 font-mono text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
                   />
                </div>
             </motion.div>
          )}

          {/* Results per tab */}
          {renderResultBadge(parsedRes)}
       </div>

       {/* Run Time Footer */}
       {runTime && !isAnalyzing && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="px-5 py-2 bg-black/40 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest"
         >
           <Clock className="w-3 h-3 text-cyan-500" />
           {runTime}
         </motion.div>
       )}
    </motion.div>
  );
}
