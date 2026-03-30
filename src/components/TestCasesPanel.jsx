import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function TestCasesPanel({ 
  isOpen, 
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

  // Parse results from EditorPane where runResults is now an object
  // { status, output, results: [] }
  const parseResultForTab = (idx) => {
    if (isAnalyzing || !runResults) return null;

    // Handle top-level errors (network/server)
    if (runResults.error) {
      if (idx === activeTab) return { status: "Error", text: runResults.error };
      return null;
    }

    // Handle compilation errors
    if (runResults.status === "COMPILE_ERROR") {
      if (idx === activeTab) return { status: "Error", text: runResults.output };
      return null;
    }

    // If we have an array of results, find the one corresponding to this tab
    let line = null;
    if (runResults.results && Array.isArray(runResults.results)) {
       const targetSubstring = `Test case ${idx + 1}:`;
       line = runResults.results.find(l => l.includes(targetSubstring));
    } else if (typeof runResults === 'string') { // Fallback if given raw string
       const lines = runResults.split('\n');
       const targetSubstring = `Test case ${idx + 1}:`;
       line = lines.find(l => l.includes(targetSubstring));
    }
    
    if (!line) {
      // Show raw output if no specific test line found and we are on active tab
      if (idx === activeTab) {
        return { status: "Warning", text: runResults.output || "No output provided." };
      }
      return null;
    }

    // Parse the structured text string natively!
    // Example: "Test case 1: Wrong Answer — got [1,2], expected [0,2]"
    // Example: "Test case 2: Passed"
    // Example: "Test case 3: Runtime Error — json.decoder..."
    const targetSubstring = `Test case ${idx + 1}:`;
    const textAfterTest = line.split(targetSubstring)[1]?.trim() || "";
    
    if (textAfterTest.startsWith("Passed")) {
      return { status: "Passed", text: textAfterTest };
    } 
    
    if (textAfterTest.startsWith("Wrong Answer")) {
      // split by "—" 
      const parts = textAfterTest.split('—');
      const details = parts.length > 1 ? parts[1].trim() : "";
      
      let gotStr = "Unknown";
      let expStr = "Unknown";
      
      // parse "got X, expected Y"
      const gotMatch = details.match(/got (.*?), expected (.*)/);
      if (gotMatch) {
         gotStr = gotMatch[1];
         expStr = gotMatch[2];
      }
      
      return { status: "Wrong Answer", output: gotStr, expected: expStr };
    }

    if (textAfterTest.startsWith("Runtime Error") || textAfterTest.startsWith("Error")) {
       return { status: "Error", text: textAfterTest };
    }

    return { status: "Warning", text: textAfterTest };
  };

  const renderResultBadge = (parsed) => {
     if (!parsed) return null;
     if (parsed.status === "Passed") {
       return (
         <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col gap-2">
            <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Passed
            </span>
            {parsed.output && (
              <div className="flex flex-col gap-1 text-xs font-mono text-gray-400">
                 <p>Output: <span className="text-gray-200">{parsed.output}</span></p>
              </div>
            )}
         </div>
       );
     }

     if (parsed.status === "Wrong Answer") {
       return (
         <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-2">
            <span className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <XCircle className="w-4 h-4" /> Failed
            </span>
            <div className="flex flex-col gap-1 text-xs font-mono text-gray-400 mt-2 bg-black/40 p-2 rounded">
               <p>Output: <span className="text-red-300">{parsed.output}</span></p>
               <p>Expected: <span className="text-green-300">{parsed.expected}</span></p>
            </div>
         </div>
       );
     }

     return (
       <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex flex-col gap-2">
          <span className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4" /> {parsed.status}
          </span>
          <div className="text-xs font-mono text-yellow-300 mt-1 break-all bg-black/40 p-2 rounded">
             {parsed.text}
          </div>
       </div>
     );
  };

  const isCustomTab = activeTab === totalExamples;
  const parsedRes = parseResultForTab(activeTab);

  return (
    <div className="w-full mt-4 glass-card border border-white/5 rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300" style={{ maxHeight: '40vh' }}>
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
       </div>

       {/* Tab Content */}
       <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-black/20">
          {!isCustomTab ? (
             <div className="flex flex-col gap-4">
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
             </div>
          ) : (
             <div className="flex flex-col gap-4">
                {customError && (
                  <div className="text-xs font-bold text-red-400 flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                     <AlertCircle className="w-4 h-4" /> {customError}
                  </div>
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
             </div>
          )}

          {/* Results per tab */}
          {renderResultBadge(parsedRes)}
       </div>

       {/* Run Time Footer */}
       {runTime && !isAnalyzing && (
         <div className="px-5 py-2 bg-black/40 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
           <Clock className="w-3 h-3 text-cyan-500" />
           {runTime}
         </div>
       )}
    </div>
  );
}
