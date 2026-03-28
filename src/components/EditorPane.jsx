import React, { useState } from 'react';
import clsx from 'clsx';
import Editor from '@monaco-editor/react';
import { Play, Loader2, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/submit';

export default function EditorPane({ className, onSubmit, problem }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState('python');
  
  // Safe initial boilerplate pulling from DB templates.
  const [code, setCode] = useState(problem?.solutionTemplates?.python || '');
  const [validationError, setValidationError] = useState('');

  // Re-sync code if the problem changes entirely
  React.useEffect(() => {
    if (problem?.solutionTemplates) {
      setLanguage('python');
      setCode(problem.solutionTemplates.python || '');
      setValidationError('');
    }
  }, [problem]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem?.solutionTemplates?.[lang] || '');
    setValidationError('');
  };

  const handleSubmit = async () => {
    // --- Frontend validation ---
    if (!code || code.trim().length === 0) {
      setValidationError('Please write your solution first');
      return;
    }
    setValidationError('');
    setIsAnalyzing(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem._id,
          language,
          code,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Server returned a validation/logical error (4xx/5xx)
        onSubmit({
          status: 'COMPILE_ERROR',
          output: result.error || 'An unknown server error occurred.',
          passedCount: 0,
          totalCount: 0,
        });
        return;
      }

      // Pass the full data payload up to App.jsx
      onSubmit(result.data);
    } catch (err) {
      // Network error — could not reach the backend
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

  return (
    <div className={clsx('p-6 flex flex-col relative', className)}>
      <div className="glass-card flex-1 flex flex-col overflow-hidden border-white/5 shadow-inner">
        {/* Editor */}
        <div className="flex-1 w-full bg-[#0a0a0f]/80 relative rounded-t-xl overflow-hidden pt-4">
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
        <div className="h-16 border-t border-white/10 bg-black/40 flex items-center justify-between px-6 rounded-b-xl">
          <select
            id="language-select"
            className="bg-black/50 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none cursor-pointer"
            value={language}
            onChange={handleLanguageChange}
            disabled={isAnalyzing}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className={clsx(
              'flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all shadow-lg active:scale-95',
              isAnalyzing
                ? 'bg-primary/50 cursor-not-allowed opacity-80'
                : 'bg-primary hover:bg-primary/90 hover:shadow-primary/20'
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
