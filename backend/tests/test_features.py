"""
Unit tests for stable lexical and structural feature extraction.
"""

import pytest
import os
import sys

# Ensure backend/app is in Python path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(BACKEND_DIR, "app")
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from features import extract_features, calculate_entropy, get_feature_names


def test_benign_url_extraction():
    url = "https://www.google.com/search?q=cybersecurity"
    result = extract_features(url)
    features = result["features"]
    metadata = result["metadata"]

    assert metadata["hostname"] == "www.google.com"
    assert metadata["domain"] == "google"
    assert metadata["tld"] == "com"
    assert metadata["is_https"] is True
    assert metadata["is_ip"] is False
    assert features["has_ip"] == 0.0
    assert features["is_https"] == 1.0
    assert features["suspicious_keyword_count"] == 0.0
    assert features["url_length"] == len(url)
    assert features["subdomain_count"] == 1.0  # 'www'


def test_phishing_url_extraction():
    url = "http://paypal-login-security-update.account-verify.com/signin/webscr"
    result = extract_features(url)
    features = result["features"]
    metadata = result["metadata"]

    assert features["is_https"] == 0.0
    assert features["hyphen_count"] >= 4
    # Keywords: login, security, update, account, verify, signin, webscr
    assert features["suspicious_keyword_count"] >= 5
    assert "login" in metadata["matched_keywords"]
    assert "verify" in metadata["matched_keywords"]
    assert "webscr" in metadata["matched_keywords"]


def test_ip_address_detection():
    url = "http://192.168.1.100/login/auth"
    result = extract_features(url)
    features = result["features"]
    metadata = result["metadata"]

    assert features["has_ip"] == 1.0
    assert metadata["is_ip"] is True
    assert metadata["hostname"] == "192.168.1.100"


def test_entropy_calculation():
    # Constant string has 0 entropy
    assert calculate_entropy("aaaaaaa") == 0.0
    # Random-like strings have higher entropy
    low_entropy = calculate_entropy("google.com")
    high_entropy = calculate_entropy("x8q92mz10akslqiw8.xyz")
    assert high_entropy > low_entropy


def test_all_canonical_features_present():
    names = get_feature_names()
    result = extract_features("https://github.com/torvalds/linux")
    features = result["features"]

    for name in names:
        assert name in features, f"Missing feature {name}"
        assert isinstance(features[name], float)
