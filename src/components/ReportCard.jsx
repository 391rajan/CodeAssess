import React from 'react';
import clsx from 'clsx';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Terminal,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Zap,
  MessageSquare,
} from 'lucide-react';

/**
 * Maps execution status → visual config
 */
const STATUS_CONFIG = {
  PASSED: {
    icon: CheckCircle2,
    label: 'Accepted',
    badgeCls: 'bg-green-500/15 text-green-400 border-green-500/30',
    headerCls: 'from-green-400 to-emerald-300',
  },
  FAILED: {
    icon: XCircle,
    label: 'Wrong Answer',
    badgeCls: 'bg-red-500/15 text-red-400 border-red-500/30',
    headerCls: 'from-red-400 to-rose-300',
  },
  TIME_LIMIT_EXCEEDED: {
    icon: AlertTriangle,
    label: 'Time Limit Exceeded',
    badgeCls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    headerCls: 'from-yellow-400 to-amber-300',
  },
  COMPILE_ERROR: {
    icon: Terminal,
    label: 'Compile Error',
    badgeCls: 'bg-red-500/15 text-red-400 border-red-500/30',
    headerCls: 'from-red-400 to-orange-300',
  },
};

const getRatingColor = (rating) => {
  if (!rating) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const lower = rating.toLowerCase();
  if (lower.includes('good') || lower.includes('excellent')) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (lower.includes('average')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (lower.includes('poor') || lower.includes('bad')) return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const parseComplexity = (str) => {
  if (!str) return { notation: '—', explanation: '' };
  const strTrimmed = str.trim();
  const match = strTrimmed.match(/^(O\([^)]+\))(.*)/i);
  if (match) {
    const notation = match[1];
    let explanation = match[2].trim();
    explanation = explanation.replace(/^(with explanation:?\s*|-\s*)/i, '').trim();
    return { notation, explanation };
  }
  return { notation: strTrimmed, explanation: '' };
};

export default function ReportCard({ data, isVisible }) {
  if (!isVisible || !data) return null;

  const { status, output, passedCount, totalCount, aiReport } = data;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.COMPILE_ERROR;
  const StatusIcon = cfg.icon;

  return (
    <div
      className={clsx(
        'glass-card fixed bottom-6 right-6 w-[420px] shadow-2xl flex flex-col gap-0 z-50 overflow-hidden',
        'transition-all duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'
      )}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <StatusIcon
            className={clsx(
              'w-6 h-6',
              status === 'PASSED' ? 'text-green-400' :
              status === 'TIME_LIMIT_EXCEEDED' ? 'text-yellow-400' :
              'text-red-400'
            )}
          />
          <h2
            className={clsx(
              'text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r',
              cfg.headerCls
            )}
          >
            {cfg.label}
          </h2>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-gray-400 tabular-nums">
            {passedCount} / {totalCount} tests
          </span>
        )}
      </div>

      {/* ─── Content ─── */}
      <div className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

        {/* PASSED: show AI report if available, otherwise a success note */}
        {status === 'PASSED' && (
          <>
            {aiReport ? (
              <div className="flex flex-col gap-5">
                {aiReport.overall_rating && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Overall Rating</span>
                    <span className={clsx("px-3 py-1 rounded-full border text-xs font-bold tracking-wide", getRatingColor(aiReport.overall_rating))}>
                      {aiReport.overall_rating}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Time</p>
                    </div>
                    <p className="font-mono text-2xl font-bold text-white tracking-tight">
                      {parseComplexity(aiReport.time_complexity).notation}
                    </p>
                    {parseComplexity(aiReport.time_complexity).explanation && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-snug mt-1" title={parseComplexity(aiReport.time_complexity).explanation}>
                        {parseComplexity(aiReport.time_complexity).explanation}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Space</p>
                    </div>
                    <p className="font-mono text-2xl font-bold text-white tracking-tight">
                      {parseComplexity(aiReport.space_complexity).notation}
                    </p>
                    {parseComplexity(aiReport.space_complexity).explanation && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-snug mt-1" title={parseComplexity(aiReport.space_complexity).explanation}>
                        {parseComplexity(aiReport.space_complexity).explanation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-200">Optimization Tips</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {aiReport.optimization_tips?.map((tip, idx) => (
                      <div key={idx} className="bg-white/[0.03] border border-white/5 border-l-4 border-l-primary p-3 rounded-r-lg rounded-l-sm text-sm text-gray-300 flex items-start gap-3 shadow-sm">
                        <span className="text-primary font-bold font-mono text-xs mt-0.5">{idx + 1}.</span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 border-t border-white/10 mt-1">
                  <div className="flex items-center gap-2 text-white mt-3 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-200">Style Feedback</h3>
                  </div>
                  <div className="text-sm text-gray-300 italic bg-white/[0.03] p-3.5 rounded-r-lg rounded-l-sm border border-white/5 border-l-2 border-l-accent leading-relaxed">
                    {aiReport.style_feedback}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-xl p-4 leading-relaxed">
                🎉 All test cases passed! Your solution is correct.
              </p>
            )}
          </>
        )}

        {/* FAILED: show which tests failed */}
        {status === 'FAILED' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Passed <span className="text-white font-semibold">{passedCount}</span> of{' '}
              <span className="text-white font-semibold">{totalCount}</span> test cases.
            </p>
            {output && (
              <div className="bg-black/40 border border-red-500/20 rounded-xl p-4 space-y-2">
                {output.split('\n').map((line, idx) => (
                  <p key={idx} className="text-xs font-mono text-red-300">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIME_LIMIT_EXCEEDED: yellow warning */}
        {status === 'TIME_LIMIT_EXCEEDED' && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-300 mb-1">Time Limit Exceeded</p>
              <p className="text-xs text-yellow-200/70 leading-relaxed">
                {output || 'Your code exceeded the 5-second time limit. Check for infinite loops or inefficient algorithms.'}
              </p>
            </div>
          </div>
        )}

        {/* COMPILE_ERROR: red error output */}
        {status === 'COMPILE_ERROR' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">Error Output</p>
            <pre className="text-xs font-mono text-red-300 bg-black/50 border border-red-500/20 rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed">
              {output || 'An unknown compilation or runtime error occurred.'}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
