export interface FeatureImpact {
  feature_name: string;
  display_name: string;
  value: number;
  formatted_value: string;
  impact: 'phishing_risk' | 'legitimate_indicator' | 'neutral';
  description: string;
}

export interface DetectionResult {
  url: string;
  verdict: 'Legitimate' | 'Phishing' | 'Suspicious';
  is_phishing: boolean;
  confidence_score: number;
  confidence_percentage: number;
  path_used: 'fast_primary' | 'in_depth_hybrid';
  path_name: string;
  path_description: string;
  latency_ms: number;
  primary_confidence: number;
  secondary_confidence?: number | null;
  threshold_applied: number;
  top_features: FeatureImpact[];
  all_features: Record<string, number>;
  metadata: {
    hostname: string;
    domain: string;
    tld: string;
    matched_keywords: string[];
    subdomain_count: number;
    is_ip: boolean;
    is_https: boolean;
  };
}

export interface SampleURL {
  title: string;
  url: string;
  expected_verdict: string;
  category: 'legitimate' | 'phishing' | 'suspicious';
  description: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  verdict: 'Legitimate' | 'Phishing' | 'Suspicious';
  confidence_percentage: number;
  path_used: 'fast_primary' | 'in_depth_hybrid';
  latency_ms: number;
  timestamp: string;
}
