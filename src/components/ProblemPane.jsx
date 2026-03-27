import React from 'react';
import clsx from 'clsx';

export default function ProblemPane({ className }) {
  return (
    <div className={clsx("p-6 overflow-y-auto flex flex-col gap-4", className)}>
      <div className="glass-card p-6 flex flex-col gap-4 flex-1">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          1. Two Sum
        </h1>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Easy</span>
        </div>
        
        <div className="mt-4 text-gray-300 leading-relaxed space-y-4">
          <p>
            Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
          </p>
          <p>
            You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
          </p>
          <p>
            You can return the answer in any order.
          </p>

          <div className="mt-6">
            <h3 className="font-semibold text-white mb-2">Example 1:</h3>
            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm border border-white/5">
              <p><span className="text-gray-400">Input:</span> nums = [2,7,11,15], target = 9</p>
              <p><span className="text-gray-400">Output:</span> [0,1]</p>
              <p><span className="text-gray-400">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-white mb-2">Example 2:</h3>
            <div className="bg-black/40 p-4 rounded-lg font-mono text-sm border border-white/5">
              <p><span className="text-gray-400">Input:</span> nums = [3,2,4], target = 6</p>
              <p><span className="text-gray-400">Output:</span> [1,2]</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-white mb-2">Constraints:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
              <li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
              <li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
              <li><strong>Only one valid answer exists.</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
