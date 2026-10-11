# PhishGuard Hybrid: ML-Based Phishing URL Detection

> **Phase-1 Academic Research Prototype**  
> High-throughput, low-latency phishing URL detection designed to overcome static dataset overfitting, feature instability, and network scraping delays using confidence-gated hybrid machine learning.

---

## 1. Academic & Research Context

### The Core Problem
In cybersecurity research literature, traditional Machine Learning phishing detectors regularly report **98–99.5% accuracy** when evaluated against single static benchmark datasets (e.g. Mendeley, Ebuehi, or Kaggle URL corpuses). However, when deployed into live network traffic or production environments, these systems suffer severe degradation:

1. **Dataset Shift & Poor Generalization:** Classifiers overfit to the lexical artifacts of a specific training snapshot. Out-of-distribution URLs from emerging campaigns cause accuracy to plummet to 60–75%.
2. **Fragility of HTML/DOM Scraping:** Many legacy detection pipelines rely on fetching webpage HTML, inspecting forms, or querying third-party reputation APIs. This introduces:
   - **Severe Latency Bottlenecks:** Network roundtrips and DOM rendering take **1,000–3,500ms**, far exceeding the **< 10ms budget** required by DNS resolvers, edge firewalls, or browser navigation hooks.
   - **Evasion via SPAs and CAPTCHAs:** Modern phishing kits deploy client-side JavaScript redirects, Cloudflare verification, or bot-blocking scripts that blind scrapers.
   - **Dead Domains:** Phishing campaigns have short lifespans (median < 24 hours). Scraper-based models fail completely on domains taken down before evaluation.
   - **User Privacy Violations:** Sending full browsing destinations to third-party reputation APIs leaks sensitive user activity.

---

## 2. The Solution: Lightweight Hybrid Lexical Architecture

PhishGuard introduces a **pure lexical/structural extraction engine** coupled with a **two-tier confidence-routed hybrid pipeline**:

```
                       User Submits URL
                              │
                              ▼
            ┌───────────────────────────────────┐
            │  Pure Python Lexical Extractor    │
            │  (27 Invariant Structural Metrics)│
            │  Execution Latency: < 1 ms        │
            └─────────────────┬─────────────────┘
                              │
                              ▼
            ┌───────────────────────────────────┐
            │   Primary Lightweight Classifier  │
            │   (Tuned Fast XGBoost Model)      │
            │   Execution Latency: < 4 ms       │
            └─────────────────┬─────────────────┘
                              │
                              ▼
                    Confidence Routing Gate
                    Certainty ≥ 85% Cutoff?
                              │
              ┌───────────────┴───────────────┐
              │                               │
         YES (≥ 85%)                      NO (< 85%)
              ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐
    │  FAST PRIMARY     │           │ IN-DEPTH HYBRID   │
    │  PATH             │           │ PATH              │
    │  Sub-5ms response │           │ Secondary RF      │
    │  High Certainty   │           │ Ensemble + Risk   │
    │  (Unambiguous)    │           │ Heuristics        │
    └─────────┬─────────┘           └─────────┬─────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
            ┌───────────────────────────────────┐
            │  Verdict & Explainability Engine  │
            │  • Legitimate / Phishing /        │
            │    Suspicious                     │
            │  • Confidence Gauge %             │
            │  • Execution Pathway Badge        │
            │  • Plain-English Diagnostics      │
            └───────────────────────────────────┘
```

### Key Architectural Pillars
- **Zero-Network Lexical Extraction:** Features are extracted purely from the URL string in native Python with zero HTTP requests, zero DOM rendering, and zero third-party API dependencies.
- **Sub-5ms Fast Path:** Over 90% of real-world queries represent clear-cut legitimate or blatant phishing attacks and are resolved instantly by the primary XGBoost model.
- **Confidence-Gated Escalation:** Ambiguous or borderline queries (< 85% certainty) are routed to a deeper Random Forest ensemble cross-referenced with structural heuristic weights (IP hosts, domain entropy, high-risk TLDs).
- **Explainable Cybersecurity Diagnostics:** Every decision provides human-readable explanations of the top contributing risk signals.

---

## 3. Extracted Stable Lexical Features (27 Features)

| Feature Name | Description & Attack Rationale |
| :--- | :--- |
| `url_length` | Total length of the URL. Long URLs frequently conceal redirection tokens. |
| `domain_length` | Length of the hostname component. |
| `path_length` | Depth of URL directory path. |
| `query_length` | Size of query parameter string. |
| `dot_count` | Number of periods. Excess dots indicate subdomain cloaking. |
| `hyphen_count` | Hyphen count in the full URL. |
| `hyphen_in_domain`| Number of hyphens in the domain (typosquatting indicator e.g. `paypal-update-center`). |
| `subdomain_count`| Depth of subdomains (e.g. `secure.login.bank.com`). |
| `has_ip` | Binary flag: Hostname is a raw IPv4 address (e.g. `http://192.168.1.1/login`). |
| `is_https` | Transport security indicator (HTTP vs HTTPS). |
| `has_at_symbol` | Presence of `@` symbol (often used to obscure destination host). |
| `double_slash_in_path`| Presence of `//` inside path (redirection trick). |
| `is_high_risk_tld`| Binary flag for high-abuse TLDs (`.xyz`, `.top`, `.click`, `.work`, `.fit`, `.buzz`, etc.). |
| `suspicious_keyword_count`| Token-bounded count of credential-harvesting keywords (`login`, `signin`, `verify`, `account`, `banking`, etc.). |
| `kw_in_hostname` | Suspicious keywords weaponized directly in the domain/subdomain. |
| `kw_in_path` | Suspicious keywords placed in path segments. |
| `digit_count` | Total count of numerical digits. |
| `digit_ratio` | Ratio of digits to total characters. |
| `domain_entropy`| Shannon entropy of hostname (detects automated DGA and randomized string masking). |
| `url_entropy` | Shannon entropy of full URL string. |
| `special_char_counts`| Frequency of `_`, `/`, `?`, `=`, `&`, `%`. |

---

## 4. Tech Stack

- **Backend:** Python 3.8+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning:** XGBoost (Primary Classifier), Scikit-learn (Random Forest Ensemble), NumPy, Pandas, Joblib
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Testing:** Pytest, HTTPX

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher (LTS recommended)

### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# (Optional) Re-train or verify models
python app/models/train_models.py

# Run backend automated test suite
python -m pytest tests -v

# Launch FastAPI backend server (runs on http://127.0.0.1:8000)
python run_backend.py
```

### 2. Frontend Setup
```powershell
# Navigate to frontend directory in a separate terminal
cd frontend

# Install Node dependencies (if not already installed)
npm install

# Start development server (runs on http://localhost:3000)
npm run dev
```

### 3. One-Click Launch (Windows PowerShell)
You can launch both services concurrently with the included helper:
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

---

## 6. API Reference

### `POST /api/detect`
Analyzes a URL and executes the two-tier hybrid decision pipeline.

**Request:**
```json
{
  "url": "http://paypal-login-security-update.account-verify.com/signin/webscr"
}
```

**Response (Example):**
```json
{
  "url": "http://paypal-login-security-update.account-verify.com/signin/webscr",
  "verdict": "Phishing",
  "is_phishing": true,
  "confidence_score": 0.9984,
  "confidence_percentage": 99.8,
  "path_used": "fast_primary",
  "path_name": "⚡ Fast Primary Path (XGBoost)",
  "path_description": "Primary model achieved high certainty (99.8% ≥ 85% threshold). Accepted immediately with sub-5ms latency.",
  "latency_ms": 3.42,
  "primary_confidence": 0.9984,
  "secondary_confidence": null,
  "threshold_applied": 0.85,
  "top_features": [
    {
      "feature_name": "suspicious_keyword_count",
      "display_name": "Suspicious Keywords",
      "value": 5.0,
      "formatted_value": "5 found: login, security, update",
      "impact": "phishing_risk",
      "description": "Identified authentication keywords commonly weaponized for credential harvesting."
    },
    {
      "feature_name": "is_https",
      "display_name": "Transport Security",
      "value": 0.0,
      "formatted_value": "Insecure HTTP",
      "impact": "phishing_risk",
      "description": "Uses unencrypted HTTP protocol. Legitimate banking services mandate HTTPS."
    }
  ],
  "all_features": { ... },
  "metadata": {
    "hostname": "paypal-login-security-update.account-verify.com",
    "domain": "account-verify",
    "tld": "com",
    "matched_keywords": ["login", "security", "update", "verify", "webscr"],
    "subdomain_count": 1,
    "is_ip": false,
    "is_https": false
  }
}
```

### `GET /api/samples`
Returns benchmark sample URLs categorized into `legitimate`, `phishing`, and `suspicious` for instant testing.

### `GET /api/health`
Returns health check, model status, and total feature count.

---

## 7. Automated Test Suite

Run unit and integration tests from the `backend` directory:
```powershell
cd backend
python -m pytest tests -v
```

Test coverage includes:
- Benign URL parsing and feature extraction
- Phishing pattern identification (keyword counts, hyphens, entropy)
- Direct IPv4 hostname detection
- Shannon entropy variance verification
- Full canonical feature vector integrity (27 features)
- FastAPI endpoints (`/api/health`, `/api/samples`, `/api/architecture`, `/api/detect`, error handling)

---

## 8. Disclaimer
This software is developed strictly as a **Phase-1 academic prototype** for research and educational purposes. While the hybrid architecture delivers robust lexical signals with sub-5ms latency, it should be integrated as part of a defense-in-depth security posture rather than an exclusive perimeter solution.
