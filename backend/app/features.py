"""
Pure Python Stable Lexical & Structural Feature Extractor
Extracts URL-only features without making any network requests or DOM parsing.
Designed for ultra-low latency (<1ms) and high stability across varying datasets.
"""

import math
import re
from typing import Dict, Any, List, Tuple
from urllib.parse import urlparse

# Suspicious keywords frequently observed in phishing URL paths, subdomains, and queries
SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "account", "update", "banking",
    "bank", "secure", "security", "ebayisapi", "webscr", "wallet", "confirm",
    "confirmation", "service", "auth", "support", "password", "billing",
    "credential", "recover", "authenticate", "portal", "token", "validate"
]

# Suspicious TLDs with historically disproportionate phishing / free abuse rates
HIGH_RISK_TLDS = {
    "xyz", "top", "click", "work", "fit", "gq", "cf", "ml", "tk", "ga",
    "buzz", "rest", "surf", "monster", "icu", "cam", "live", "club"
}

# Regex to detect raw IPv4 address in hostname
IPV4_REGEX = re.compile(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")


def calculate_entropy(text: str) -> float:
    """Calculates Shannon entropy of a string."""
    if not text:
        return 0.0
    length = len(text)
    freq: Dict[str, int] = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def normalize_url(raw_url: str) -> str:
    """Ensures URL has a scheme for accurate urllib parsing."""
    url = raw_url.strip()
    if not url.startswith(("http://", "https://", "ftp://")):
        url = "http://" + url
    return url


def extract_features(raw_url: str) -> Dict[str, Any]:
    """
    Extracts all stable lexical and structural features from a URL string.
    Returns both a numeric feature dictionary (for ML inference) and human-readable metadata.
    """
    cleaned_url = raw_url.strip()
    parsed_url = normalize_url(cleaned_url)
    parsed = urlparse(parsed_url)

    hostname = (parsed.hostname or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""
    full_url = cleaned_url.lower()

    # Domain and Subdomain breakdown
    host_parts = [p for p in hostname.split(".") if p]
    if len(host_parts) >= 2:
        tld = host_parts[-1]
        domain_name = host_parts[-2]
        subdomain_count = max(0, len(host_parts) - 2)
    elif len(host_parts) == 1:
        tld = ""
        domain_name = host_parts[0]
        subdomain_count = 0
    else:
        tld = ""
        domain_name = ""
        subdomain_count = 0

    # 1. Length Metrics
    url_length = len(cleaned_url)
    domain_length = len(hostname)
    path_length = len(path)
    query_length = len(query)

    # 2. Character & Symbol Counts
    dot_count = cleaned_url.count(".")
    hyphen_count = cleaned_url.count("-")
    hyphen_in_domain = hostname.count("-")
    underscore_count = cleaned_url.count("_")
    slash_count = cleaned_url.count("/")
    question_count = cleaned_url.count("?")
    equal_count = cleaned_url.count("=")
    at_count = cleaned_url.count("@")
    ampersand_count = cleaned_url.count("&")
    percent_count = cleaned_url.count("%")

    # 3. Numeric content
    digit_count = sum(c.isdigit() for c in cleaned_url)
    digit_ratio = round(digit_count / max(1, url_length), 4)

    # 4. Security Indicators
    has_ip = 1 if IPV4_REGEX.match(hostname) else 0
    is_https = 1 if cleaned_url.lower().startswith("https://") else 0
    has_at_symbol = 1 if "@" in cleaned_url else 0
    double_slash_in_path = 1 if "//" in path else 0
    is_high_risk_tld = 1 if tld in HIGH_RISK_TLDS else 0

    # 5. Suspicious Keywords analysis (token-based to avoid false positives like 'cybersecurity')
    url_tokens = set(re.split(r'[^a-z0-9]+', full_url))
    host_tokens = set(re.split(r'[^a-z0-9]+', hostname))
    path_tokens = set(re.split(r'[^a-z0-9]+', path.lower()))

    matched_keywords: List[str] = []
    for kw in SUSPICIOUS_KEYWORDS:
        # Match if token equals keyword, or keyword is specifically in hostname tokens
        if kw in url_tokens or any(kw in t and len(t) <= len(kw) + 4 for t in host_tokens):
            matched_keywords.append(kw)
    suspicious_keyword_count = len(matched_keywords)

    kw_in_hostname = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in host_tokens or any(kw in t for t in host_tokens))
    kw_in_path = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in path_tokens)

    # 6. Shannon Entropy
    domain_entropy = calculate_entropy(hostname)
    url_entropy = calculate_entropy(cleaned_url)

    # Structured features dictionary for model vector
    feature_vector = {
        "url_length": float(url_length),
        "domain_length": float(domain_length),
        "path_length": float(path_length),
        "query_length": float(query_length),
        "dot_count": float(dot_count),
        "hyphen_count": float(hyphen_count),
        "hyphen_in_domain": float(hyphen_in_domain),
        "underscore_count": float(underscore_count),
        "slash_count": float(slash_count),
        "question_count": float(question_count),
        "equal_count": float(equal_count),
        "at_count": float(at_count),
        "ampersand_count": float(ampersand_count),
        "percent_count": float(percent_count),
        "digit_count": float(digit_count),
        "digit_ratio": float(digit_ratio),
        "subdomain_count": float(subdomain_count),
        "has_ip": float(has_ip),
        "is_https": float(is_https),
        "has_at_symbol": float(has_at_symbol),
        "double_slash_in_path": float(double_slash_in_path),
        "is_high_risk_tld": float(is_high_risk_tld),
        "suspicious_keyword_count": float(suspicious_keyword_count),
        "kw_in_hostname": float(kw_in_hostname),
        "kw_in_path": float(kw_in_path),
        "domain_entropy": float(domain_entropy),
        "url_entropy": float(url_entropy),
    }

    metadata = {
        "hostname": hostname,
        "domain": domain_name,
        "tld": tld,
        "matched_keywords": matched_keywords,
        "subdomain_count": subdomain_count,
        "is_ip": bool(has_ip),
        "is_https": bool(is_https),
    }

    return {
        "features": feature_vector,
        "metadata": metadata,
    }


def get_feature_names() -> List[str]:
    """Returns canonical list of feature names in vector order."""
    return [
        "url_length",
        "domain_length",
        "path_length",
        "query_length",
        "dot_count",
        "hyphen_count",
        "hyphen_in_domain",
        "underscore_count",
        "slash_count",
        "question_count",
        "equal_count",
        "at_count",
        "ampersand_count",
        "percent_count",
        "digit_count",
        "digit_ratio",
        "subdomain_count",
        "has_ip",
        "is_https",
        "has_at_symbol",
        "double_slash_in_path",
        "is_high_risk_tld",
        "suspicious_keyword_count",
        "kw_in_hostname",
        "kw_in_path",
        "domain_entropy",
        "url_entropy",
    ]
