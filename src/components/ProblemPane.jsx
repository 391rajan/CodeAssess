import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';

export default function ProblemPane({ className, problem }) {
  if (!problem) return null;

  return (
    <div className={clsx("p-6 overflow-y-auto flex flex-col gap-4", className)}>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="glass-card p-6 flex flex-col gap-4 flex-1"
      >
        <motion.h1 variants={fadeInUp} className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {problem.title}
        </motion.h1>
        <motion.div variants={fadeInUp} className="flex gap-2 text-sm">
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
        </motion.div>
        
        <motion.div variants={fadeInUp} className="mt-4 text-gray-300 leading-relaxed space-y-4">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />

          {problem.examples?.map((ex, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="mt-6"
            >
              <h3 className="font-semibold text-white mb-2">Example {idx + 1}:</h3>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm border border-white/5">
                <p><span className="text-gray-400">Input:</span> {ex.input}</p>
                <p><span className="text-gray-400">Output:</span> {ex.output}</p>
                {ex.explanation && (
                  <p><span className="text-gray-400">Explanation:</span> {ex.explanation}</p>
                )}
              </div>
            </motion.div>
          ))}

          {problem.constraints && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <h3 className="font-semibold text-white mb-2">Constraints:</h3>
              <div 
                className="bg-black/20 p-4 rounded-lg border border-white/5 text-gray-400 font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: problem.constraints }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
