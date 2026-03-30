import React, { useState } from 'react';
import { X, Lock, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';

const API_HINTS = 'http://localhost:5000/api/hints';

// ── Relative time helper ──────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const secs = Math.round((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// ── Per-level styling config ──────────────────────────────
const HINT_CONFIG = {
  1: {
    borderClass: 'border-l-green-400',
    labelClass: 'text-green-400',
    bgClass: 'bg-green-500/5',
    checkClass: 'text-green-400',
    badgeBg: 'bg-green-500/10',
  },
  2: {
    borderClass: 'border-l-yellow-400',
    labelClass: 'text-yellow-400',
    bgClass: 'bg-yellow-500/5',
    checkClass: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/10',
  },
  3: {
    borderClass: 'border-l-red-400',
    labelClass: 'text-red-400',
    bgClass: 'bg-red-500/5',
    checkClass: 'text-red-400',
    badgeBg: 'bg-red-500/10',
  },
};

export default function HintModal({
  isOpen,
  onClose,
  problem,
  currentCode,
  hintState,
  onHintUsed,
}) {
  const [loadingLevel, setLoadingLevel] = useState(null);

  if (!isOpen || !problem) return null;

  const { hintsUsed = 0, hintsRemaining = 3, hints = [] } = hintState || {};

  const getHintData = (level) => hints.find((h) => h.level === level) || null;

  const handleGetHint = async (level) => {
    setLoadingLevel(level);
    try {
      const res = await fetch(API_HINTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          problemId: problem._id,
          hintLevel: level,
          currentCode: currentCode || '',
        }),
      });
      const json = await res.json();
      if (json.success) {
        onHintUsed(json.data);
      } else {
        alert(json.error || 'Could not get hint. Please try again.');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setLoadingLevel(null);
    }
  };

  const renderHintSlot = (level) => {
    const cfg = HINT_CONFIG[level];
    const isUsed = hintsUsed >= level;
    const isAvailable = hintsUsed === level - 1;
    const isLocked = hintsUsed < level - 1;
    const hintData = getHintData(level);
    const isLoading = loadingLevel === level;

    return (
      <div
        key={level}
        className={`border-l-4 ${cfg.borderClass} ${cfg.bgClass} rounded-r-xl p-4 border border-white/5 transition-all duration-300`}
      >
        {/* Row header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${cfg.labelClass}`}>
              Hint {level}
            </span>
            {isUsed && <CheckCircle2 className={`w-3.5 h-3.5 ${cfg.checkClass}`} />}
            {isLocked && <Lock className="w-3.5 h-3.5 text-gray-600" />}
          </div>
          {hintData?.usedAt && (
            <span className="text-[10px] text-gray-600 font-mono">
              Used {timeAgo(hintData.usedAt)}
            </span>
          )}
        </div>

        {/* Content area */}
        {isUsed && hintData?.text ? (
          <p className="text-sm text-gray-300 leading-relaxed">{hintData.text}</p>
        ) : isAvailable ? (
          <button
            onClick={() => handleGetHint(level)}
            disabled={isLoading}
            className={`mt-1 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border
              ${isLoading
                ? 'bg-white/5 text-gray-500 cursor-not-allowed border-white/5'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10 hover:border-white/25'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting hint...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Get Hint {level}
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-gray-600 italic mt-1">
            🔒 Complete Hint {level - 1} to unlock
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-lg flex flex-col animate-in fade-in zoom-in duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <h2 className="text-lg font-bold text-white">AI Hints</h2>
              {/* Remaining badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hintsRemaining === 3
                    ? 'bg-green-500/20 text-green-400'
                    : hintsRemaining === 2
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : hintsRemaining === 1
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {hintsRemaining} remaining
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-snug max-w-xs">
              Get up to 3 AI-powered hints. Each hint reveals more.
              Hints are saved — come back anytime.
            </p>
          </div>

          {/* X Close button */}
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {hintsUsed === 3 && (
            <div className="text-center py-3 text-gray-500 text-sm border border-white/5 rounded-xl bg-white/[0.02]">
              No hints remaining. Try to solve it yourself! 💪
            </div>
          )}
          {renderHintSlot(1)}
          {renderHintSlot(2)}
          {renderHintSlot(3)}
        </div>
      </div>
    </div>
  );
}
