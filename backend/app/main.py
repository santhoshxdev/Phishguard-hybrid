"""
FastAPI Server for Phishing URL Detection
Exposes endpoints for URL inspection, sample tests, and engine status.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schemas import URLRequest, DetectionResult, SampleURL, HealthStatus
from classifier import engine, CONFIDENCE_THRESHOLD
from features import get_feature_names

app = FastAPI(
    title="PhishGuard Hybrid API",
    description="Low-Latency Machine Learning Phishing URL Detection Engine with Confidence Routing",
    version="1.0.0"
)

# Enable CORS for all local development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthStatus)
def health_check():
    """Returns engine health and model status."""
    return HealthStatus(
        status="healthy",
        version="1.0.0",
        primary_model_loaded=engine.primary_model is not None,
        secondary_model_loaded=engine.secondary_model is not None,
        feature_count=len(get_feature_names())
    )


@app.post("/api/detect", response_model=DetectionResult)
def detect_url(payload: URLRequest):
    """
    Analyzes submitted URL using the two-tier hybrid ML pipeline.
    """
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    try:
        result = engine.predict(url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.get("/api/samples", response_model=List[SampleURL])
def get_sample_urls():
    """Provides curated sample URLs demonstrating different verdicts and execution paths."""
    return [
        SampleURL(
            title="Popular Legitimate Portal",
            url="https://github.com/features/actions",
            expected_verdict="Legitimate",
            category="legitimate",
            description="Established domain, standard path, zero deceptive keywords or subdomains. Fast primary path."
        ),
        SampleURL(
            title="Complex Corporate Subdomain",
            url="https://cloud.google.com/vertex-ai/docs/overview",
            expected_verdict="Legitimate",
            category="legitimate",
            description="Legitimate multi-level domain with documentation path and SSL. Correctly identified as benign."
        ),
        SampleURL(
            title="Credential Phishing Attack",
            url="http://paypal-login-security-update.account-verify.com/signin/webscr",
            expected_verdict="Phishing",
            category="phishing",
            description="Deceptive brand-squatting domain with stacked authentication keywords (login, security, verify, webscr) and no HTTPS."
        ),
        SampleURL(
            title="IP-Based Direct Harvest",
            url="http://192.168.1.105/login-account-update/bank/auth.html",
            expected_verdict="Phishing",
            category="phishing",
            description="Direct IPv4 hostname concealing identity, paired with banking and login keywords."
        ),
        SampleURL(
            title="Suspicious / Borderline Edge Case",
            url="http://verify-my-account-now.com/portal",
            expected_verdict="Suspicious",
            category="suspicious",
            description="Ambiguous lexical score triggers the secondary ensemble path for in-depth structural inspection."
        )
    ]


@app.get("/api/architecture")
def get_architecture_summary():
    """Returns metadata about the research problem and hybrid design."""
    return {
        "problem": {
            "title": "Limitations of Single-Dataset Static Detectors",
            "points": [
                "Static models overfit on single dataset distributions (98-99.5% laboratory accuracy drops significantly in real-world deployment).",
                "HTML scraping and external reputation APIs introduce 1,000-3,000ms latency, break on SPAs/CAPTCHAs, and fail on taken-down domains.",
                "Feature importance shifts wildly between training snapshots."
            ]
        },
        "solution": {
            "title": "Lightweight Hybrid Lexical Architecture",
            "points": [
                "Feature extraction is 100% lexical and structural from the URL string itself (zero network overhead, pure Python).",
                "Primary XGBoost model delivers ultra-low latency (<5ms) for the vast majority of unambiguous URLs.",
                f"Confidence routing gate ({int(CONFIDENCE_THRESHOLD * 100)}% threshold): High-confidence decisions return instantly via Fast Path; ambiguous cases escalate to the secondary ensemble path.",
                "Explainable outputs highlight specific structural anomalies for transparent security auditing."
            ]
        }
    }
