"""
Hybrid Phishing Detection Engine with Confidence-Based Routing
Implements:
1. Fast Primary Path (Lightweight XGBoost) with <5ms latency.
2. In-Depth Secondary Path (Random Forest Ensemble + Structural Heuristics)
   triggered when confidence < 85%.
3. Human-friendly explainability breakdown for top contributing features.
"""

import os
import time
import numpy as np
import joblib
from typing import Dict, Any, List, Tuple, Optional
from features import extract_features, get_feature_names
from schemas import DetectionResult, FeatureImpact

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
PRIMARY_MODEL_PATH = os.path.join(MODELS_DIR, "primary_model.joblib")
SECONDARY_MODEL_PATH = os.path.join(MODELS_DIR, "secondary_model.joblib")

CONFIDENCE_THRESHOLD = 0.85  # 85% confidence cutoff for fast path acceptance


class PhishGuardEngine:
    def __init__(self):
        self.primary_model = None
        self.secondary_model = None
        self.feature_names = get_feature_names()
        self.load_models()

    def load_models(self):
        """Loads serialized models from disk."""
        if os.path.exists(PRIMARY_MODEL_PATH):
            self.primary_model = joblib.load(PRIMARY_MODEL_PATH)
        else:
            raise FileNotFoundError(f"Primary model not found at {PRIMARY_MODEL_PATH}")

        if os.path.exists(SECONDARY_MODEL_PATH):
            self.secondary_model = joblib.load(SECONDARY_MODEL_PATH)
        else:
            raise FileNotFoundError(f"Secondary model not found at {SECONDARY_MODEL_PATH}")

    def analyze_feature_contributions(
        self,
        features: Dict[str, float],
        metadata: Dict[str, Any],
        is_phishing: bool,
        prob_phishing: float
    ) -> List[FeatureImpact]:
        """
        Translates raw feature values into human-readable cyber-defense explanations.
        Identifies top contributing risk or legitimacy factors.
        """
        contributions: List[FeatureImpact] = []

        # 1. Suspicious Keywords
        kw_count = int(features["suspicious_keyword_count"])
        matched = metadata.get("matched_keywords", [])
        if kw_count > 0:
            contributions.append(FeatureImpact(
                feature_name="suspicious_keyword_count",
                display_name="Suspicious Keywords",
                value=float(kw_count),
                formatted_value=f"{kw_count} found: {', '.join(matched[:3])}",
                impact="phishing_risk",
                description=f"Identified authentication keywords ({', '.join(matched[:3])}) commonly weaponized for credential harvesting."
            ))
        else:
            contributions.append(FeatureImpact(
                feature_name="suspicious_keyword_count",
                display_name="Suspicious Keywords",
                value=0.0,
                formatted_value="None detected",
                impact="legitimate_indicator",
                description="No sensitive or deceptive credential keywords found in URL path or parameters."
            ))

        # 2. IP Hostname Check
        if features["has_ip"] == 1.0:
            contributions.append(FeatureImpact(
                feature_name="has_ip",
                display_name="Direct IP Address Host",
                value=1.0,
                formatted_value=metadata.get("hostname", "Raw IP"),
                impact="phishing_risk",
                description="Domain uses a raw IP address instead of a registered domain name, a severe phishing indicator."
            ))

        # 3. Subdomains
        sub_count = int(features["subdomain_count"])
        if sub_count >= 2:
            contributions.append(FeatureImpact(
                feature_name="subdomain_count",
                display_name="Subdomain Depth",
                value=float(sub_count),
                formatted_value=f"{sub_count} subdomains",
                impact="phishing_risk",
                description=f"High subdomain depth ({sub_count} levels). Attackers frequently stack subdomains to disguise actual root domains."
            ))
        elif sub_count == 0:
            contributions.append(FeatureImpact(
                feature_name="subdomain_count",
                display_name="Subdomain Structure",
                value=0.0,
                formatted_value="Standard root domain",
                impact="legitimate_indicator",
                description="Clean domain architecture without excessive subdomain chaining."
            ))

        # 4. Hyphens in domain / URL
        hyphen_domain = int(features["hyphen_in_domain"])
        hyphen_total = int(features["hyphen_count"])
        if hyphen_domain >= 2:
            contributions.append(FeatureImpact(
                feature_name="hyphen_in_domain",
                display_name="Domain Hyphenation",
                value=float(hyphen_domain),
                formatted_value=f"{hyphen_domain} hyphens in hostname",
                impact="phishing_risk",
                description="Multiple hyphens in domain name (common typosquatting technique mimicking legitimate brands)."
            ))
        elif hyphen_total <= 1:
            contributions.append(FeatureImpact(
                feature_name="hyphen_count",
                display_name="Hyphen Count",
                value=float(hyphen_total),
                formatted_value=f"{hyphen_total} hyphens",
                impact="neutral",
                description="Normal hyphen count within benign structural bounds."
            ))

        # 5. Shannon Entropy
        entropy = features["url_entropy"]
        if entropy > 4.4:
            contributions.append(FeatureImpact(
                feature_name="url_entropy",
                display_name="Shannon Entropy",
                value=entropy,
                formatted_value=f"{entropy:.2f} bits",
                impact="phishing_risk",
                description="High randomness score (entropy), suggesting automated domain generation algorithms (DGA) or token masking."
            ))
        elif entropy < 3.8:
            contributions.append(FeatureImpact(
                feature_name="url_entropy",
                display_name="Shannon Entropy",
                value=entropy,
                formatted_value=f"{entropy:.2f} bits",
                impact="legitimate_indicator",
                description="Natural lexical distribution consistent with established domain naming conventions."
            ))

        # 6. High Risk TLD
        if features["is_high_risk_tld"] == 1.0:
            contributions.append(FeatureImpact(
                feature_name="is_high_risk_tld",
                display_name="TLD Risk Profile",
                value=1.0,
                formatted_value=f".{metadata.get('tld', '')}",
                impact="phishing_risk",
                description=f"Registered on '.{metadata.get('tld', '')}', a top-level domain frequently associated with spam and disposable phishing kits."
            ))

        # 7. URL Length
        url_len = int(features["url_length"])
        if url_len > 75:
            contributions.append(FeatureImpact(
                feature_name="url_length",
                display_name="URL Length",
                value=float(url_len),
                formatted_value=f"{url_len} characters",
                impact="phishing_risk",
                description=f"Long URL string ({url_len} chars). Phishing URLs tend to be bloated with redirect parameters and spoofed brand segments."
            ))
        elif url_len < 35:
            contributions.append(FeatureImpact(
                feature_name="url_length",
                display_name="URL Length",
                value=float(url_len),
                formatted_value=f"{url_len} characters",
                impact="legitimate_indicator",
                description=f"Short, concise URL length ({url_len} chars) characteristic of legitimate navigational destinations."
            ))

        # 8. Protocol HTTPS
        if features["is_https"] == 0.0:
            contributions.append(FeatureImpact(
                feature_name="is_https",
                display_name="Transport Security",
                value=0.0,
                formatted_value="Insecure HTTP",
                impact="phishing_risk",
                description="Uses unencrypted HTTP protocol. Legitimate banking and authentication services mandate HTTPS."
            ))
        else:
            contributions.append(FeatureImpact(
                feature_name="is_https",
                display_name="Transport Security",
                value=1.0,
                formatted_value="HTTPS Encrypted",
                impact="legitimate_indicator",
                description="Standard SSL/TLS transport protocol active."
            ))

        # Sort contributions: phishing risks first if verdict is phishing, else legitimate indicators first
        if is_phishing or prob_phishing > 0.5:
            order = {"phishing_risk": 0, "neutral": 1, "legitimate_indicator": 2}
        else:
            order = {"legitimate_indicator": 0, "neutral": 1, "phishing_risk": 2}

        contributions.sort(key=lambda x: order.get(x.impact, 1))
        return contributions[:6]

    def predict(self, url: str) -> DetectionResult:
        """
        Executes confidence-based hybrid phishing detection:
        1. Extract stable lexical features.
        2. Evaluate primary lightweight XGBoost model.
        3. Check confidence against threshold (85%).
        4. If confidence >= 85%: Accept Fast Primary Path.
        5. If confidence < 85%: Execute In-Depth Secondary Path (Random Forest + heuristics).
        6. Compute feature explanations and return comprehensive payload.
        """
        start_time = time.perf_counter()

        # Step 1: Stable Lexical Feature Extraction
        extraction = extract_features(url)
        features = extraction["features"]
        metadata = extraction["metadata"]

        vector = np.array([[features[fn] for fn in self.feature_names]], dtype=np.float32)

        # Step 2: Primary Lightweight Model (XGBoost)
        primary_probs = self.primary_model.predict_proba(vector)[0]
        p_phishing_primary = float(primary_probs[1])
        
        # Certainty is distance from 0.5: certainty in either 0 (Legitimate) or 1 (Phishing)
        primary_confidence = max(p_phishing_primary, 1.0 - p_phishing_primary)

        # Step 3 & 4: Confidence Check & Routing
        if primary_confidence >= CONFIDENCE_THRESHOLD:
            # Fast Primary Path Accepted
            path_used = "fast_primary"
            path_name = "Fast Primary Path (XGBoost)"
            path_description = (
                f"Primary model achieved high certainty ({primary_confidence * 100:.1f}% >= {CONFIDENCE_THRESHOLD * 100:.0f}% threshold). "
                "Accepted immediately with sub-5ms latency."
            )
            final_prob = p_phishing_primary
            final_confidence = primary_confidence
            secondary_confidence = None
        else:
            # In-Depth Secondary Hybrid Path Triggered
            path_used = "in_depth_hybrid"
            path_name = "In-Depth Hybrid Path (Ensemble & Heuristics)"
            path_description = (
                f"Primary model confidence was ambiguous ({primary_confidence * 100:.1f}% < {CONFIDENCE_THRESHOLD * 100:.0f}% threshold). "
                "Escalated to secondary Random Forest ensemble and deeper lexical structural analysis."
            )

            # Secondary Model (Random Forest)
            secondary_probs = self.secondary_model.predict_proba(vector)[0]
            p_phishing_secondary = float(secondary_probs[1])
            secondary_confidence = max(p_phishing_secondary, 1.0 - p_phishing_secondary)

            # Blend with structural risk heuristics
            risk_bonus = 0.0
            if features["has_ip"] == 1.0:
                risk_bonus += 0.25
            if features["is_high_risk_tld"] == 1.0:
                risk_bonus += 0.15
            if features["suspicious_keyword_count"] >= 2:
                risk_bonus += 0.20
            if features["subdomain_count"] >= 3:
                risk_bonus += 0.15

            # Weighted ensemble combination
            blended_prob = (0.55 * p_phishing_secondary) + (0.35 * p_phishing_primary) + (0.10 * min(1.0, risk_bonus))
            final_prob = min(0.99, max(0.01, blended_prob))
            final_confidence = max(final_prob, 1.0 - final_prob)

        # Step 5: Final Verdict Classification
        if final_prob >= 0.70:
            verdict = "Phishing"
            is_phishing = True
        elif final_prob <= 0.35:
            verdict = "Legitimate"
            is_phishing = False
        else:
            verdict = "Suspicious"
            is_phishing = True  # Flag as potential threat

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Step 6: Feature Explanations
        top_features = self.analyze_feature_contributions(
            features=features,
            metadata=metadata,
            is_phishing=is_phishing,
            prob_phishing=final_prob
        )

        return DetectionResult(
            url=url,
            verdict=verdict,
            is_phishing=is_phishing,
            confidence_score=round(final_confidence, 4),
            confidence_percentage=round(final_confidence * 100, 1),
            path_used=path_used,
            path_name=path_name,
            path_description=path_description,
            latency_ms=elapsed_ms,
            primary_confidence=round(primary_confidence, 4),
            secondary_confidence=round(secondary_confidence, 4) if secondary_confidence is not None else None,
            threshold_applied=CONFIDENCE_THRESHOLD,
            top_features=top_features,
            all_features=features,
            metadata=metadata
        )


# Global singleton instance
engine = PhishGuardEngine()
