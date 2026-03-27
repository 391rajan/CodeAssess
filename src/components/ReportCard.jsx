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
  switch (rating) {
    case 'Good':    return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Average': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Poor':    return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
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
      <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">

        {/* PASSED: show AI report if available, otherwise a success note */}
        {status === 'PASSED' && (
          <>
            {aiReport ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Time</p>
                      <p className="font-mono font-medium text-white">{aiReport.time_complexity || '—'}</p>
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Space</p>
                      <p className="font-mono font-medium text-white">{aiReport.space_complexity || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h3 className="font-semibold text-sm">Optimization Tips</h3>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {aiReport.optimization_tips?.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-sm">Style Feedback</h3>
                  </div>
                  <p className="text-sm text-gray-300 italic bg-black/20 p-3 rounded-lg border border-white/5">
                    "{aiReport.style_feedback}"
                  </p>
                </div>
              </>
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
