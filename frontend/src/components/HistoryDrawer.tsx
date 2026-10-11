'use client';

import React from 'react';
import { X, Trash2, ArrowUpRight, Clock, Zap, Layers, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { HistoryItem } from '../types/detection';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectUrl,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Inspection History</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stored locally in browser session ({history.length} scans)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Scans */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>No recent scans recorded. Submit a URL to view history.</span>
            </div>
          ) : (
            history.map((item) => {
              const isPhish = item.verdict === 'Phishing';
              const isLegit = item.verdict === 'Legitimate';
              const isFast = item.path_used === 'fast_primary';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPhish
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : isLegit
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {item.verdict} • {item.confidence_percentage}%
                    </span>

                    <span className="text-[10px] font-mono text-slate-500">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 truncate mb-2" title={item.url}>
                    {item.url}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      {isFast ? (
                        <>
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Fast Path ({item.latency_ms}ms)</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3 h-3 text-indigo-400" />
                          <span>Hybrid Path ({item.latency_ms}ms)</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        onSelectUrl(item.url);
                        onClose();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Re-scan</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 rounded-xl border border-rose-900/50 hover:bg-rose-950/40 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Scan History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
