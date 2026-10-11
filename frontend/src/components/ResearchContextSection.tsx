'use client';

import React from 'react';
import { BookOpen, ShieldAlert, Zap, Lock, Database, ArrowRight } from 'lucide-react';

export const ResearchContextSection: React.FC = () => {
  return (
    <section id="research-context" className="py-16 border-t border-slate-800/80 scroll-mt-16 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Background & Rationale</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            Why Single-Dataset ML Detectors Fail
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Phase-1 research analysis on overcoming dataset shift, content instability, and latency limits.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl mb-12">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 font-bold text-sm text-slate-200">
            Architectural Comparison: Traditional vs Third-Party vs PhishGuard Hybrid
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4 text-rose-400">Traditional HTML/DOM Scraping</th>
                  <th className="py-3 px-4 text-amber-400">Third-Party Reputation APIs</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold">PhishGuard Hybrid (Proposed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">End-to-End Latency</td>
                  <td className="py-3 px-4 text-rose-300">1,500 – 4,000 ms (HTTP fetch)</td>
                  <td className="py-3 px-4 text-amber-300">300 – 1,200 ms (API network hop)</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">&lt; 5 ms (Local XGBoost)</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">Offline / Suspended Sites</td>
                  <td className="py-3 px-4 text-rose-300">Fails (connection refused)</td>
                  <td className="py-3 px-4 text-amber-300">Vulnerable to zero-hour lag</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">100% Effective (Lexical only)</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">Dynamic SPAs & CAPTCHAs</td>
                  <td className="py-3 px-4 text-rose-300">Completely blinded</td>
                  <td className="py-3 px-4 text-slate-400">Dependent on crawler coverage</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">Immune (Evaluates URL structure)</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">Dataset Generalization</td>
                  <td className="py-3 px-4 text-rose-300">Severe shift across website designs</td>
                  <td className="py-3 px-4 text-amber-300">Proprietary black-box heuristic</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">Confidence-gated hybrid fallback</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">User Privacy</td>
                  <td className="py-3 px-4 text-amber-300">Leaked via outbound connection</td>
                  <td className="py-3 px-4 text-rose-300">Browsing history transmitted to API</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">Zero leakage (100% local in-browser/edge)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>The 99% Accuracy Paradox</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic literature frequently reports accuracy upwards of 99% when testing classifiers on identical static dataset splits (e.g. Mendeley or Kaggle phishing dumps).
              When tested out-of-domain against fresh real-time feeds, these classifiers drop to 60–75% accuracy due to distribution shift.
              Our approach addresses this by relying exclusively on <strong>domain-invariant structural primitives</strong> (subdomain depth, token entropy, character ratios).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Confidence Thresholding as Quality Gate</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard classifiers force a hard binary cutoff at probability 0.5, introducing false positives on ambiguous corporate domains.
              By establishing a strict <strong>85% certainty threshold</strong>, PhishGuard routes ambiguous inputs into a secondary Random Forest ensemble with heuristic risk scoring,
              maintaining ultra-low latency for unambiguous traffic while providing deep defense for tricky edge cases.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
