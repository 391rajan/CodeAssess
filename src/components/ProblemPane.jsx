import React from 'react';
import clsx from 'clsx';

export default function ProblemPane({ className, problem }) {
  if (!problem) return null;

  return (
    <div className={clsx("p-6 overflow-y-auto flex flex-col gap-4", className)}>
      <div className="glass-card p-6 flex flex-col gap-4 flex-1">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {problem.title}
        </h1>
        <div className="flex gap-2 text-sm">
          <span className={clsx(
            "px-3 py-1 rounded-full border text-sm font-semibold",
            problem.difficulty === 'Easy' ? "bg-green-500/10 text-green-400 border-green-500/20" :
            problem.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
            "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {problem.difficulty}
          </span>
          {problem.companyTags?.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white/5 text-gray-300 rounded-full border border-white/10">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-4 text-gray-300 leading-relaxed space-y-4">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />

          {problem.examples?.map((ex, idx) => (
            <div key={idx} className="mt-6">
              <h3 className="font-semibold text-white mb-2">Example {idx + 1}:</h3>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm border border-white/5">
                <p><span className="text-gray-400">Input:</span> {ex.input}</p>
                <p><span className="text-gray-400">Output:</span> {ex.output}</p>
                {ex.explanation && (
                  <p><span className="text-gray-400">Explanation:</span> {ex.explanation}</p>
                )}
              </div>
            </div>
          ))}

          {problem.constraints && (
            <div className="mt-6">
              <h3 className="font-semibold text-white mb-2">Constraints:</h3>
              <div 
                className="bg-black/20 p-4 rounded-lg border border-white/5 text-gray-400 font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: problem.constraints }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
