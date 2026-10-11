'use client';

import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  Cpu,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

export const HowItWorksFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: 'URL String Input',
      icon: Globe,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/20',
      tag: 'Step 1',
      short: 'Submit URL String',
      description:
        'The user submits a raw URL string. The engine performs local normalization and lexical tokenization without sending outbound network queries or resolving DNS.',
      detail:
        'Prevents alerting the phishing operator by completely avoiding DNS lookups, TLS handshakes, or server requests.',
    },
    {
      id: 2,
      title: 'Stable Feature Extraction',
      icon: Sliders,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/40',
      bgColor: 'bg-teal-950/20',
      tag: 'Step 2 • Pure Python',
      short: 'Extract 27 Lexical Features',
      description:
        'Extracts 27 invariant structural features in pure Python in <1ms: lengths, token frequencies, Shannon entropy, subdomain depth, IP addresses, and brand keywords.',
      detail:
        'Zero HTML scraping or third-party reputation APIs ensures resilience against dynamic JavaScript, CAPTCHAs, and offline phishing sites.',
    },
    {
      id: 3,
      title: 'Primary Lightweight Model',
      icon: Cpu,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/20',
      tag: 'Step 3 • XGBoost',
      short: 'Fast Model Inference',
      description:
        'A compact, calibrated XGBoost classifier evaluates the feature vector and outputs prediction probabilities in sub-5ms.',
      detail:
        'Optimized for extreme throughput, ideal for real-time edge integration in DNS resolvers, browser extensions, or mail transfer agents.',
    },
    {
      id: 4,
      title: 'Confidence Routing Gate',
      icon: GitBranch,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      tag: 'Step 4 • ≥ 85% Cutoff',
      short: 'Certainty Evaluation',
      description:
        'Evaluates model certainty: if confidence is ≥ 85%, the prediction is accepted immediately (Fast Path). If confidence is < 85%, it triggers the secondary path.',
      detail:
        'Overcomes static dataset overfitting by isolating borderline ambiguity instead of forcing low-confidence binary classifications.',
    },
    {
      id: 5,
      title: 'Secondary Hybrid Path',
      icon: Zap,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      bgColor: 'bg-indigo-950/20',
      tag: 'Step 5 • Fallback Ensemble',
      short: 'Deep Ensemble & Heuristics',
      description:
        'Ambiguous samples are escalated to a deep Random Forest ensemble paired with structural risk rules (IP host, high-risk TLD, stacked subdomains).',
      detail:
        'Synthesizes multi-model probability to reach high-assurance verdicts even on obfuscated or evasion-heavy URLs.',
    },
    {
      id: 6,
      title: 'Final Verdict & Explainability',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/20',
      tag: 'Step 6 • Output',
      short: 'Verdict & Rationale',
      description:
        'Outputs the final verdict (Legitimate / Phishing / Suspicious), confidence score, execution pathway badge, and key contributing features.',
      detail:
        'Transparent cyber-defense explanations provide actionable forensic intelligence for security analysts and end-users.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-t border-slate-800/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-2">
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            How the Hybrid Detection System Works
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A confidence-gated dual-tier workflow balancing sub-5ms latency with high resilience against dataset shift.
          </p>
        </div>

        {/* Visual Pipeline Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? `${s.borderColor} ${s.bgColor} shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40`
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {s.tag}
                  </span>
                  <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-800 ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {s.description}
                </p>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{s.short}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Banner */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">
              Architecture Insight: {steps[activeStep].title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {steps[activeStep].detail}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
