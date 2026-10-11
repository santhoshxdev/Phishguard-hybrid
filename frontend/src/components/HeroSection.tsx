'use client';

import React from 'react';
import { AlertCircle, Cpu, Zap, CheckCircle2, ArrowRight, Gauge, Layers, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-8 pb-12 overflow-hidden border-b border-slate-800/60">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Phase Pill */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-900/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Phase-1 Research Prototype</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Confidence-Routed Hybrid Lexical Model</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Real-Time Phishing Detection
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Prioritizing Stable Features & Low Latency
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Traditional ML detectors boast <strong>98–99.5% accuracy</strong> on isolated static datasets,
            yet collapse in live environments due to dataset shift and high-latency HTML scraping.
            PhishGuard solves this with <strong>pure lexical structural feature extraction</strong> and a
            <strong> dual-tier confidence routing engine</strong>.
          </p>
        </div>

        {/* Three Pillar Cards: Problem vs Solution */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Card 1: The Research Bottleneck */}
          <div className="glass-panel p-5 rounded-2xl border-rose-500/20 bg-slate-900/50 hover:border-rose-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide">The Academic Dilemma</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Models trained on single static datasets suffer from severe <strong>dataset shift</strong>.
              Features that appear critical in one dataset lose predictive stability in another, causing high false alarm rates.
            </p>
          </div>

          {/* Card 2: Fragile Scraping */}
          <div className="glass-panel p-5 rounded-2xl border-amber-500/20 bg-slate-900/50 hover:border-amber-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide">Fragile DOM Features</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              HTML scraping and third-party reputation APIs inject <strong>1,000–3,000ms latency</strong>,
              fail on SPAs/CAPTCHAs, and crash when phishing domains are suspended before evaluation.
            </p>
          </div>

          {/* Card 3: The Hybrid Solution */}
          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 bg-slate-900/50 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide">The Hybrid Answer</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Extract <strong>pure lexical features</strong> in Python in &lt;1ms. Accept high-confidence predictions
              (<strong>≥85%</strong>) immediately via XGBoost; route edge cases to an in-depth secondary ensemble.
            </p>
          </div>
        </div>

        {/* Live Architecture Metric Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Latency: <strong className="text-slate-200">&lt; 10ms</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Primary Model: <strong className="text-slate-200">XGBoost Classifier</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Confidence Gate: <strong className="text-slate-200">≥ 85% Cutoff</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>External API Calls: <strong className="text-slate-200">0 (Zero Latency)</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
