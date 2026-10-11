'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { UrlScanner } from '../components/UrlScanner';
import { ResultCard } from '../components/ResultCard';
import { HowItWorksFlow } from '../components/HowItWorksFlow';
import { ResearchContextSection } from '../components/ResearchContextSection';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { ResearchDisclaimer } from '../components/ResearchDisclaimer';
import { DetectionResult, SampleURL, HistoryItem } from '../types/detection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const DEFAULT_SAMPLES: SampleURL[] = [
  {
    title: 'Popular Legitimate Portal',
    url: 'https://github.com/features/actions',
    expected_verdict: 'Legitimate',
    category: 'legitimate',
    description: 'Established domain, standard path, zero deceptive keywords or subdomains. Fast primary path.'
  },
  {
    title: 'Complex Corporate Subdomain',
    url: 'https://cloud.google.com/vertex-ai/docs/overview',
    expected_verdict: 'Legitimate',
    category: 'legitimate',
    description: 'Legitimate multi-level domain with documentation path and SSL. Correctly identified as benign.'
  },
  {
    title: 'Credential Phishing Attack',
    url: 'http://paypal-login-security-update.account-verify.com/signin/webscr',
    expected_verdict: 'Phishing',
    category: 'phishing',
    description: 'Deceptive brand-squatting domain with stacked authentication keywords (login, security, verify, webscr) and no HTTPS.'
  },
  {
    title: 'IP-Based Direct Harvest',
    url: 'http://192.168.1.105/login-account-update/bank/auth.html',
    expected_verdict: 'Phishing',
    category: 'phishing',
    description: 'Direct IPv4 hostname concealing identity, paired with banking and login keywords.'
  },
  {
    title: 'Suspicious / Borderline Edge Case',
    url: 'http://verify-my-account-now.com/portal',
    expected_verdict: 'Suspicious',
    category: 'suspicious',
    description: 'Ambiguous lexical score triggers the secondary ensemble path for in-depth structural inspection.'
  }
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [samples, setSamples] = useState<SampleURL[]>(DEFAULT_SAMPLES);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('phishguard_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Check backend health & fetch sample URLs
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        if (res.ok) {
          setApiHealthy(true);
        } else {
          setApiHealthy(false);
        }
      } catch (err) {
        setApiHealthy(false);
      }
    };

    const fetchSamples = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/samples`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSamples(data);
          }
        }
      } catch (err) {
        // Fall back to default static samples
      }
    };

    checkHealth();
    fetchSamples();
  }, []);

  const handleScan = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with status ${response.status}`);
      }

      const result: DetectionResult = await response.json();
      setCurrentResult(result);
      setApiHealthy(true);

      // Save to history
      const historyEntry: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        url: result.url,
        verdict: result.verdict,
        confidence_percentage: result.confidence_percentage,
        path_used: result.path_used,
        latency_ms: result.latency_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [historyEntry, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('phishguard_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }

      // Smooth scroll down to result card
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(
        err.message || 'Unable to connect to the PhishGuard backend service. Please verify the API is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('phishguard_history');
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? '' : 'light-theme'} cyber-grid flex flex-col selection:bg-cyan-500 selection:text-slate-950`}>
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        apiHealthy={apiHealthy}
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <main className="flex-1">
        {/* Research Context & Hero */}
        <HeroSection />

        {/* Interactive URL Scanner */}
        <UrlScanner
          onScan={handleScan}
          isLoading={isLoading}
          samples={samples}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold text-white ml-3 shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Result Card Section */}
        {currentResult && (
          <div id="results-section">
            <ResultCard result={currentResult} />
          </div>
        )}

        {/* How It Works Visual Flow */}
        <HowItWorksFlow />

        {/* Academic Deep Dive */}
        <ResearchContextSection />
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectUrl={handleScan}
        onClearHistory={handleClearHistory}
      />

      {/* Footer & Prototype Disclaimer */}
      <ResearchDisclaimer />
    </div>
  );
}
