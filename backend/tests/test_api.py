"""
Integration tests for FastAPI endpoints: /api/health, /api/detect, /api/samples, /api/architecture
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(BACKEND_DIR, "app")
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["primary_model_loaded"] is True
    assert data["secondary_model_loaded"] is True
    assert data["feature_count"] == 27


def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 4
    categories = [s["category"] for s in samples]
    assert "legitimate" in categories
    assert "phishing" in categories


def test_architecture_endpoint():
    response = client.get("/api/architecture")
    assert response.status_code == 200
    data = response.json()
    assert "problem" in data
    assert "solution" in data


def test_detect_legitimate_url():
    response = client.post("/api/detect", json={"url": "https://github.com/torvalds/linux"})
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Legitimate"
    assert data["is_phishing"] is False
    assert data["confidence_percentage"] >= 70.0
    assert data["latency_ms"] > 0
    assert "top_features" in data
    assert len(data["top_features"]) > 0


def test_detect_phishing_url():
    response = client.post(
        "/api/detect",
        json={"url": "http://paypal-login-security-update.account-verify.com/signin/webscr"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Phishing"
    assert data["is_phishing"] is True
    assert data["confidence_percentage"] >= 80.0
    assert data["path_used"] in ["fast_primary", "in_depth_hybrid"]
    # Verify explainability feature presence
    risk_features = [f for f in data["top_features"] if f["impact"] == "phishing_risk"]
    assert len(risk_features) > 0


def test_detect_empty_url_validation():
    response = client.post("/api/detect", json={"url": "   "})
    assert response.status_code == 400
