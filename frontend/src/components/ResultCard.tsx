'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { DetectionResult } from '../types/detection';

interface ResultCardProps {
  result: DetectionResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const isPhishing = result.verdict === 'Phishing';
  const isLegit = result.verdict === 'Legitimate';
  const isSuspicious = result.verdict === 'Suspicious';

  const isFastPath = result.path_used === 'fast_primary';

  // Theme styling based on verdict
  const themeClasses = isPhishing
    ? {
        border: 'border-rose-500/50',
        glow: 'glow-rose',
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/60',
        barBg: 'bg-gradient-to-r from-rose-600 to-red-500',
        textColor: 'text-rose-400',
        cardBg: 'bg-rose-950/20',
      }
    : isLegit
    ? {
        border: 'border-emerald-500/50',
        glow: 'glow-emerald',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
        barBg: 'bg-gradient-to-r from-emerald-600 to-teal-400',
        textColor: 'text-emerald-400',
        cardBg: 'bg-emerald-950/20',
      }
    : {
        border: 'border-amber-500/50',
        glow: 'glow-amber',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
        barBg: 'bg-gradient-to-r from-amber-600 to-yellow-400',
        textColor: 'text-amber-400',
        cardBg: 'bg-amber-950/20',
      };

  return (
    <section className="pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className={`glass-panel rounded-3xl border ${themeClasses.border} ${themeClasses.glow} overflow-hidden transition-all shadow-2xl bg-slate-900/80`}
        >
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Verdict Indicator */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                    isPhishing
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : isLegit
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}
                >
                  {isPhishing && <ShieldAlert className="w-8 h-8 stroke-[2.5]" />}
                  {isLegit && <ShieldCheck className="w-8 h-8 stroke-[2.5]" />}
                  {isSuspicious && <AlertTriangle className="w-8 h-8 stroke-[2.5]" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Detection Verdict
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${themeClasses.badgeBg}`}>
                      {result.verdict}
                    </span>
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-black mt-0.5 ${themeClasses.textColor}`}>
                    {isPhishing
                      ? 'High Phishing Risk'
                      : isLegit
                      ? 'Legitimate URL'
                      : 'Suspicious / Borderline Pattern'}
                  </h3>
                </div>
              </div>

              {/* Path and Latency Badges */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-right">
                {/* Path badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
                    isFastPath
                      ? 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300'
                      : 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300'
                  }`}
                  title={result.path_description}
                >
                  {isFastPath ? <Zap className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isFastPath ? '⚡ Fast Primary Path' : '🛡️ In-Depth Hybrid Path'}</span>
                </div>

                {/* Latency badge */}
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Execution Latency: <strong className="text-slate-200">{result.latency_ms} ms</strong></span>
                </div>
              </div>
            </div>

            {/* Target URL Preview */}
            <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300 break-all">
              <span className="truncate mr-2">{result.url}</span>
              <span className="shrink-0 px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400">
                {result.metadata.is_https ? 'HTTPS' : 'HTTP'}
              </span>
            </div>
          </div>

          {/* Confidence Gauge & Decision Path Explanation */}
          <div className="p-6 sm:p-8 bg-slate-950/30 border-b border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Confidence Progress Meter */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    Model Confidence Score
                  </span>
                  <span className="text-2xl font-black font-mono text-slate-100">
                    {result.confidence_percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${themeClasses.barBg}`}
                    style={{ width: `${Math.max(5, result.confidence_percentage)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1.5">
                  <span>0% (Uncertain)</span>
                  <span>Cutoff: 85%</span>
                  <span>100% (Certain)</span>
                </div>
              </div>

              {/* Execution Path Rationale */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Pipeline Routing Rationale:</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {result.path_description}
                </p>
                {result.secondary_confidence !== undefined && result.secondary_confidence !== null && (
                  <div className="mt-2 text-[11px] text-indigo-300 font-mono">
                    Secondary Model Certainty: {(result.secondary_confidence * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Contributing Features (Explainability) */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Key Features Influencing Decision</span>
                  <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                    (Explainable ML Diagnostics)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Primary structural and lexical signals analyzed from the URL string.
                </p>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.top_features.map((feature, idx) => {
                const isRisk = feature.impact === 'phishing_risk';
                const isBenign = feature.impact === 'legitimate_indicator';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                      isRisk
                        ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
                        : isBenign
                        ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700/60'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-200">
                          {feature.display_name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isRisk
                              ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                              : isBenign
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isRisk ? 'Risk Factor' : isBenign ? 'Benign Signal' : 'Neutral'}
                        </span>
                      </div>

                      <div className="font-mono text-xs font-semibold text-cyan-300 mb-1.5">
                        {feature.formatted_value}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expandable Raw Feature Vector Accordion */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors py-2 px-3 rounded-xl bg-slate-950/50 border border-slate-800"
              >
                <span>
                  {showAllFeatures
                    ? 'Hide Complete 27-Feature Lexical Vector'
                    : 'Inspect Complete 27-Feature Lexical Vector'}
                </span>
                {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAllFeatures && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto">
                  {Object.entries(result.all_features).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex flex-col">
                      <span className="text-[10px] text-slate-400 truncate" title={key}>
                        {key}
                      </span>
                      <span className="text-cyan-300 font-bold mt-0.5">
                        {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 3) : val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
