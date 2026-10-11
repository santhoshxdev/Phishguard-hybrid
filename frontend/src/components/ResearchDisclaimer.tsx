'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, ExternalLink, Terminal } from 'lucide-react';

export const ResearchDisclaimer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">
                Academic Research Prototype Disclaimer
              </h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                This software is developed as a <strong>Phase-1 academic research prototype</strong> exploring lightweight hybrid ML architectures for real-time phishing URL detection.
                While the model achieves high lexical discrimination, automated heuristic evaluation should not serve as the sole perimeter control for enterprise threat defense.
                Always verify sensitive banking and account actions through verified multi-factor channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">PhishGuard Hybrid ML</span>
            <span>•</span>
            <span>Phase-1 Academic Demonstration</span>
            <span>•</span>
            <span>FastAPI + XGBoost + Next.js</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-mono text-emerald-400">Latency Target: &lt;10ms</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">Lexical Stability Index: 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
