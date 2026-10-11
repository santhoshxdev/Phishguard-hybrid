'use client';

import React, { useState } from 'react';
import { Search, Globe, ArrowRight, Loader2, X, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { SampleURL } from '../types/detection';

interface UrlScannerProps {
  onScan: (url: string) => Promise<void>;
  isLoading: boolean;
  samples: SampleURL[];
}

export const UrlScanner: React.FC<UrlScannerProps> = ({
  onScan,
  isLoading,
  samples,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setValidationError('Please enter a URL to analyze.');
      return;
    }
    setValidationError(null);
    onScan(trimmed);
  };

  const handleSelectSample = (sample: SampleURL) => {
    setInputUrl(sample.url);
    setValidationError(null);
    onScan(sample.url);
  };

  return (
    <section id="scanner" className="pt-8 pb-10 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Scanner Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden bg-slate-900/70">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Lexical Inspector</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Submit URL for Instant Hybrid Threat Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Extracts 27 lexical features in &lt;1ms. Routes through XGBoost primary path with confidence thresholding.
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-slate-400">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>

              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Paste or type any URL (e.g., https://secure-bank.update-notice.xyz/login)..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-sm sm:text-base font-mono transition-all shadow-inner"
                disabled={isLoading}
              />

              {/* Clear button */}
              {inputUrl && !isLoading && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="absolute right-28 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Clear URL"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Scan Trigger Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span className="hidden sm:inline">Evaluating</span>
                  </>
                ) : (
                  <>
                    <span>Check URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Validation Message */}
            {validationError && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400 font-medium pl-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </div>
            )}
          </form>

          {/* Quick Preset Samples */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Test Benchmarks:
              </span>
              <span className="text-[11px] text-slate-500">
                Click any sample to test detection path
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {samples.map((sample, idx) => {
                const isPhish = sample.category === 'phishing';
                const isLegit = sample.category === 'legitimate';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 disabled:opacity-50 ${
                      isPhish
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-300 hover:bg-rose-900/40 hover:border-rose-500'
                        : isLegit
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500'
                        : 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-900/40 hover:border-amber-500'
                    }`}
                    title={sample.description}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPhish ? 'bg-rose-400' : isLegit ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-semibold">{sample.title}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      ({sample.category})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
