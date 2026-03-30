import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Editor from '@monaco-editor/react';
import { Play, Loader2, AlertCircle, PlayCircle, Lightbulb } from 'lucide-react';
import TestCasesPanel from './TestCasesPanel';
import HintModal from './HintModal';

const API_SUBMIT = 'http://localhost:5000/api/submit';
const API_RUN    = 'http://localhost:5000/api/run';

export default function EditorPane({ className, onSubmit, problem, hintState, onHintUsed }) {
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [language,      setLanguage]      = useState('python');
  const [code,          setCode]          = useState(problem?.solutionTemplates?.python || '');
  const [validationError, setValidationError] = useState('');

  // Test Cases Panel state
  const [isPanelOpen,    setIsPanelOpen]    = useState(false);
  const [activeTab,      setActiveTab]      = useState(0);
  const [customInput,    setCustomInput]    = useState('');
  const [customExpected, setCustomExpected] = useState('');
  const [customError,    setCustomError]    = useState('');
  const [runResults,     setRunResults]     = useState(null);
  const [runTime,        setRunTime]        = useState('');

  // Hint modal state
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);

  // Re-sync when problem changes
  useEffect(() => {
    if (problem?.solutionTemplates) {
      setLanguage('python');
      setCode(problem.solutionTemplates.python || '');
      setValidationError('');
      setIsPanelOpen(false);
      setRunResults(null);
      setRunTime('');
    }
    if (problem?._id) {
      const saved = localStorage.getItem(`custom_input_${problem._id}`);
      if (saved) setCustomInput(saved);
    }
  }, [problem]);

  // Persist custom input to localStorage
  useEffect(() => {
    if (problem?._id && customInput !== undefined) {
      localStorage.setItem(`custom_input_${problem._id}`, customInput);
    }
  }, [customInput, problem]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem?.solutionTemplates?.[lang] || '');
    setValidationError('');
  };

  // ── Submit handler ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!code || code.trim().length === 0) {
      setValidationError('Please write your solution first');
      return;
    }
    setValidationError('');
    setIsAnalyzing(true);

    try {
      const response = await fetch(API_SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem._id, language, code }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        onSubmit({
          status: 'COMPILE_ERROR',
          output: result.error || 'An unknown server error occurred.',
          passedCount: 0,
          totalCount: 0,
        });
        return;
      }
      onSubmit(result.data);
    } catch (err) {
      onSubmit({
        status: 'COMPILE_ERROR',
        output: `Could not reach the server: ${err.message}`,
        passedCount: 0,
        totalCount: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Run Code handler ───────────────────────────────────────
  const handleRunCode = async () => {
    if (!code || code.trim().length === 0) {
      setValidationError('Please write your solution first');
      return;
    }

    setValidationError('');
    setCustomError('');
    setRunResults(null);
    setRunTime('');

    // ── BUG F FIX: validate custom JSON and bail early ──────
    let parsedCustomInput    = null;
    let parsedCustomExpected = null;

    if (customInput && customInput.trim() !== '') {
      try {
        parsedCustomInput = JSON.parse(customInput);
      } catch {
        setCustomError('Invalid JSON format. Example: {"nums": [1,2], "target": 3}');
        setIsPanelOpen(true);
        setActiveTab((problem?.examples?.length) ?? 0); // switch to Custom tab
        return; // ← halt, do NOT send request
      }
    }

    if (customExpected && customExpected.trim() !== '') {
      try {
        parsedCustomExpected = JSON.parse(customExpected);
      } catch {
        // expected output format errors are non-blocking (comparison just won't work)
      }
    }

    const customTestCases = parsedCustomInput
      ? [{ input: parsedCustomInput, expectedOutput: parsedCustomExpected ?? null }]
      : [];

    // Auto-expand panel
    setIsPanelOpen(true);
    setIsRunningCode(true);
    const startTime = Date.now();

    try {
      const response = await fetch(API_RUN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem._id,
          language,
          code,
          customTestCases,
        }),
        credentials: 'include',
      });

      const result = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setRunTime(`Executed in ${elapsed}s`);

      if (!response.ok || !result.success) {
        setRunResults({ error: result.error || 'Unknown server error' });
        return;
      }

      setRunResults(result.data);
    } catch (err) {
      setRunResults({ error: `Network Error: ${err.message}` });
    } finally {
      setIsRunningCode(false);
    }
  };

  // ── Hint button styling ────────────────────────────────────
  const hintsRemaining = hintState?.hintsRemaining ?? 3;
  const hintBtnClass = clsx(
    'flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all border',
    hintsRemaining === 3 && 'bg-green-500/10  border-green-500/20  text-green-400  hover:bg-green-500/20',
    hintsRemaining === 2 && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20',
    hintsRemaining === 1 && 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20',
    hintsRemaining === 0 && 'bg-gray-500/10   border-gray-500/20   text-gray-500   cursor-not-allowed',
  );

  return (
    <div className={clsx('p-6 flex flex-col relative', className)}>
      <div className="glass-card flex-1 flex flex-col overflow-hidden border-white/5 shadow-inner transition-all duration-300">

        {/* Monaco Editor */}
        <div className="flex-1 w-full bg-[#0a0a0f]/80 relative rounded-t-xl overflow-hidden pt-4 min-h-[300px]">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              setCode(value);
              if (validationError) setValidationError('');
            }}
            options={{
              fontFamily: 'Fira Code',
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="w-full border-t border-white/10 bg-black/40 flex items-center justify-between px-6 py-3 rounded-b-xl z-20 gap-3 flex-wrap">

          {/* Left: Language selector + Hint button */}
          <div className="flex items-center gap-3">
            <select
              id="language-select"
              className="bg-black/50 border border-white/10 text-white text-sm rounded-lg p-2 outline-none cursor-pointer focus:ring-primary focus:border-primary"
              value={language}
              onChange={handleLanguageChange}
              disabled={isAnalyzing || isRunningCode}
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            {/* 💡 Hint button */}
            <button
              id="hint-button"
              onClick={() => setIsHintModalOpen(true)}
              className={hintBtnClass}
              title={hintsRemaining === 0 ? 'View your used hints' : `${hintsRemaining} hint${hintsRemaining === 1 ? '' : 's'} remaining`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {hintsRemaining === 0
                ? '💡 No Hints Left'
                : `💡 Hint (${hintsRemaining} remaining)`}
            </button>
          </div>

          {/* Right: Run Code + Submit */}
          <div className="flex items-center gap-3">
            {/* BUG B FIX: Run Code disabled ONLY when isRunningCode */}
            <button
              id="run-code-btn"
              onClick={handleRunCode}
              disabled={isRunningCode}
              className={clsx(
                'flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white transition-all shadow-lg text-sm active:scale-95',
                isRunningCode
                  ? 'bg-cyan-500/50 cursor-not-allowed opacity-80'
                  : 'bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/50',
              )}
            >
              {isRunningCode ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
              ) : (
                <><PlayCircle className="w-4 h-4 fill-current text-cyan-100" /> Run Code</>
              )}
            </button>

            {/* BUG B FIX: Submit disabled ONLY when isAnalyzing */}
            <button
              id="submit-btn"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className={clsx(
                'flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all shadow-lg text-sm active:scale-95',
                isAnalyzing
                  ? 'bg-primary/50 cursor-not-allowed opacity-80'
                  : 'bg-primary hover:bg-primary/90 hover:shadow-primary/20',
              )}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Submit</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Cases Collapsible Panel */}
      {isPanelOpen && (
        <TestCasesPanel
          isOpen={isPanelOpen}
          problem={problem}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          customInput={customInput}
          setCustomInput={setCustomInput}
          customExpected={customExpected}
          setCustomExpected={setCustomExpected}
          customError={customError}
          runResults={runResults}
          runTime={runTime}
          isAnalyzing={isRunningCode}
        />
      )}

      {/* Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        problem={problem}
        currentCode={code}
        hintState={hintState}
        onHintUsed={(data) => {
          onHintUsed(data);
          setIsHintModalOpen(true);
        }}
      />
    </div>
  );
}
