from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional


class URLRequest(BaseModel):
    url: str = Field(..., description="The URL to analyze for phishing threats")


class FeatureImpact(BaseModel):
    feature_name: str
    display_name: str
    value: float
    formatted_value: str
    impact: str  # "phishing_risk", "legitimate_indicator", "neutral"
    description: str


class DetectionResult(BaseModel):
    url: str
    verdict: str  # "Legitimate", "Phishing", "Suspicious"
    is_phishing: bool
    confidence_score: float  # 0.0 - 1.0
    confidence_percentage: float  # 0 - 100
    path_used: str  # "fast_primary" | "in_depth_hybrid"
    path_name: str
    path_description: str
    latency_ms: float
    primary_confidence: float
    secondary_confidence: Optional[float] = None
    threshold_applied: float = 0.85
    top_features: List[FeatureImpact]
    all_features: Dict[str, float]
    metadata: Dict[str, Any]


class SampleURL(BaseModel):
    title: str
    url: str
    expected_verdict: str
    category: str
    description: str


class HealthStatus(BaseModel):
    status: str
    version: str
    primary_model_loaded: bool
    secondary_model_loaded: bool
    feature_count: int
