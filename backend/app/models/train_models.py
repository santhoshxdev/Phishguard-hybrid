"""
Model Training Script for Phishing URL Detection
Trains:
1. Primary Lightweight Model: XGBoost Classifier on stable lexical features
2. Secondary Model: Random Forest Ensemble for ambiguous / low-confidence cases

Saves trained models to .joblib files ready for low-latency production inference.
"""

import os
import sys
import random
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# Ensure backend/app can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from features import extract_features, get_feature_names


def generate_curated_dataset() -> pd.DataFrame:
    """
    Generates a curated distribution of legitimate, blatant phishing,
    and subtle/borderline ambiguous URLs reflecting real-world datasets.
    """
    # 1. High-authority legitimate domains
    legit_domains = [
        "google.com", "microsoft.com", "github.com", "apple.com", "amazon.com",
        "wikipedia.org", "cloudflare.com", "stackoverflow.com", "linkedin.com",
        "nytimes.com", "bbc.co.uk", "cnn.com", "reddit.com", "netflix.com",
        "spotify.com", "dropbox.com", "zoom.us", "salesforce.com", "adobe.com",
        "mit.edu", "stanford.edu", "nih.gov", "who.int", "weather.com",
        "medium.com", "coursera.org", "kaggle.com", "gitlab.com", "python.org",
        "docker.com", "openai.com", "anthropic.com", "ubuntu.com", "debian.org",
        "archlinux.org", "slack.com", "notion.so", "figma.com", "stripe.com",
        "chase.com", "bankofamerica.com", "wellsfargo.com", "paypal.com",
        "ebay.com", "etsy.com", "walmart.com", "target.com", "ikea.com"
    ]

    legit_paths = [
        "", "/", "/about", "/docs/guide", "/blog/post-2026", "/help/faq",
        "/products/enterprise", "/user/profile", "/search?q=machine+learning",
        "/explore/topics", "/settings/preferences", "/download/latest",
        "/pricing", "/security/advisories", "/terms-of-service", "/contact"
    ]

    legit_urls = []
    for d in legit_domains:
        for p in legit_paths:
            prefix = "https://" if random.random() > 0.1 else "http://"
            legit_urls.append((f"{prefix}{d}{p}", 0))

    # Add complex legitimate URLs (e.g. subdomains, developers, docs)
    legit_complex = [
        ("https://developer.mozilla.org/en-US/docs/Web/JavaScript", 0),
        ("https://docs.github.com/en/actions/learn-github-actions", 0),
        ("https://learn.microsoft.com/en-us/azure/architecture/", 0),
        ("https://cloud.google.com/vertex-ai/docs/overview", 0),
        ("https://aws.amazon.com/solutions/case-studies/", 0),
        ("https://en.wikipedia.org/wiki/Phishing", 0),
        ("https://console.cloud.google.com/home/dashboard", 0),
        ("https://login.live.com", 0),  # legitimate login
        ("https://accounts.google.com/ServiceLogin", 0),  # legitimate login
        ("https://auth.github.com/sessions", 0),  # legitimate auth
        ("https://identity.apple.com/profile", 0),
        ("https://secure.bankofamerica.com/login/sign-in/signOnV2Screen.go", 0),
        ("https://www.paypal.com/signin", 0),
        ("https://support.apple.com/kb/HT201222", 0),
        ("https://scholar.google.com/citations?user=test", 0),
    ]
    legit_urls.extend(legit_complex * 6)

    # 2. Blatant Phishing URLs (classic attack vectors)
    phish_templates = [
        "http://paypal-login-security-update.account-verify.com/signin/webscr",
        "http://appleid.apple.com.verify-billing-notice.com/auth/login",
        "http://chasebank.online-secure-access.xyz/banking/update?id=94829",
        "http://wellsfargo.account-security-alert.click/login.php?confirm=true",
        "http://192.168.1.105/login-account-update/bank/auth.html",
        "http://216.58.214.206/secure-paypal/verification.php",
        "http://secure-login.netflix-update-billing.top/login?session=active",
        "http://microsoft-outlook-office365-verify.club/signin.aspx?auth=token",
        "http://login.google.com.security-account-action.cam/signin",
        "http://bankofamerica-customer-id.update-profile.work/portal",
        "http://ebay.com.shopping-deal-discount.rest/signin/ebayisapi.dll",
        "http://amazon-support-prime-renewal.live/account/billing/verify",
        "http://secure.account-update.instagram.buzz/login/auth",
        "http://facebook-security-checkpoint.verify-user.fit/help.php",
        "http://binance-secure-wallet-login.monster/recovery-portal",
        "http://coinbase-crypto-verification.top/signin?wallet=confirm",
        "http://paypal.com@secure-account-login.tk/webscr/login",
        "http://google.com@auth-recovery-token.ml/accounts/login",
        "http://secure-banking-portal-confirmation.com//login/user.php",
        "http://login-update-recover-account-support.xyz/auth/verify?token=894819",
        "http://dhl-express-parcel-tracking-update.work/confirm/payment",
        "http://usps-package-delivery-redirection.icu/update-address.php",
        "http://irs-tax-refund-portal-claim.click/verification/identity",
        "http://fedex-shipment-tracking-confirmation.fit/login.html"
    ]

    phish_urls = []
    for tmpl in phish_templates:
        phish_urls.append((tmpl, 1))

    # Procedural generation of realistic phishing patterns
    phish_brand_targets = ["paypal", "apple", "chase", "bankofamerica", "netflix", "microsoft", "amazon", "wells", "coinbase"]
    phish_deceptive_subdomains = ["login-security", "account-verify", "update-billing", "auth-portal", "confirm-identity", "service-secure"]
    phish_bad_tlds = ["xyz", "top", "click", "work", "fit", "buzz", "monster", "live", "cam", "icu", "tk", "ml"]
    phish_paths = ["/login.php", "/signin/auth", "/webscr/confirm", "/update/billing.html", "/account/security", "/verification/token"]

    for _ in range(500):
        brand = random.choice(phish_brand_targets)
        sub = random.choice(phish_deceptive_subdomains)
        tld = random.choice(phish_bad_tlds)
        path = random.choice(phish_paths)
        num = random.randint(100, 99999)

        variant = random.randint(1, 4)
        if variant == 1:
            url = f"http://{brand}-{sub}.{tld}{path}?ref={num}"
        elif variant == 2:
            url = f"http://{brand}.com.{sub}-{num}.{tld}{path}"
        elif variant == 3:
            ip = f"{random.randint(11, 220)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            url = f"http://{ip}/{brand}-{sub}/login.html"
        else:
            url = f"https://{sub}.{brand}-online-banking.{tld}{path}?user_id={num}&verify=true"
        phish_urls.append((url, 1))

    # 3. Subtle / Ambiguous Borderline cases (critical for testing the Hybrid routing logic!)
    # Examples where single-feature heuristics might struggle (e.g. clean looking phishing or complex legitimate)
    borderline_samples = [
        # Phishing that looks somewhat clean or uses HTTPS
        ("https://paypaI-security.com/webscr", 1), # homoglyph style
        ("https://chase-alerts-online.net/notification", 1),
        ("https://apple-id-recovery-portal.info/verify", 1),
        ("https://secure-netflix-billing.com/update", 1),
        ("http://verify-my-account-now.com/portal", 1),
        # Legitimate with multiple hyphens or long queries
        ("https://my-account-security-settings.service-now.com/dashboard", 0),
        ("https://id.atlassian.com/login?continue=https%3A%2F%2Fjira.atlassian.com", 0),
        ("https://auth.docker.com/service/token?scope=repository%3Alibrary%2Fubuntu%3Apull", 0),
        ("https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade", 0),
        ("https://www.bankofamerica.com/online-banking/mobile-banking/", 0),
        ("https://sso.godaddy.com/login?app=account", 0),
    ]
    phish_urls.extend([(u, label) for u, label in borderline_samples if label == 1] * 8)
    legit_urls.extend([(u, label) for u, label in borderline_samples if label == 0] * 8)

    # Combine and shuffle
    all_data = legit_urls + phish_urls
    random.seed(42)
    random.shuffle(all_data)

    df = pd.DataFrame(all_data, columns=["url", "label"])
    return df


def train_models():
    """Extracts features, trains primary and secondary models, and evaluates performance."""
    print("Generating curated URL dataset...")
    df = generate_curated_dataset()
    print(f"Total samples: {len(df)} (Legitimate: {sum(df['label'] == 0)}, Phishing: {sum(df['label'] == 1)})")

    print("Extracting stable lexical and structural features...")
    feature_names = get_feature_names()
    X_rows = []
    for url in df["url"]:
        ext = extract_features(url)
        vector = [ext["features"][fn] for fn in feature_names]
        X_rows.append(vector)

    X = np.array(X_rows, dtype=np.float32)
    y = df["label"].to_numpy(dtype=np.int32)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("\n--- Training Primary Lightweight XGBoost Classifier ---")
    # Tuned for ultra-low latency, low memory footprint, and well-calibrated probabilities
    primary_model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
        use_label_encoder=False,
        tree_method="hist"
    )
    primary_model.fit(X_train, y_train)

    y_pred_prim = primary_model.predict(X_test)
    y_prob_prim = primary_model.predict_proba(X_test)[:, 1]
    acc_prim = accuracy_score(y_test, y_pred_prim)
    auc_prim = roc_auc_score(y_test, y_prob_prim)
    print(f"Primary XGBoost Accuracy: {acc_prim * 100:.2f}% | ROC-AUC: {auc_prim:.4f}")

    print("\n--- Training Secondary Deeper Random Forest Ensemble ---")
    # Richer ensemble to resolve borderline confidence uncertainty
    secondary_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    secondary_model.fit(X_train, y_train)

    y_pred_sec = secondary_model.predict(X_test)
    y_prob_sec = secondary_model.predict_proba(X_test)[:, 1]
    acc_sec = accuracy_score(y_test, y_pred_sec)
    auc_sec = roc_auc_score(y_test, y_prob_sec)
    print(f"Secondary Random Forest Accuracy: {acc_sec * 100:.2f}% | ROC-AUC: {auc_sec:.4f}")

    # Save models
    models_dir = os.path.dirname(os.path.abspath(__file__))
    primary_path = os.path.join(models_dir, "primary_model.joblib")
    secondary_path = os.path.join(models_dir, "secondary_model.joblib")

    joblib.dump(primary_model, primary_path, compress=3)
    joblib.dump(secondary_model, secondary_path, compress=3)

    print(f"\nSaved Primary Model to: {primary_path}")
    print(f"Saved Secondary Model to: {secondary_path}")

    # Feature Importance Summary for Primary Model
    importances = primary_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("\nTop 7 Contributing Features in Primary XGBoost:")
    for rank, idx in enumerate(sorted_idx[:7], 1):
        print(f"  {rank}. {feature_names[idx]:<25}: {importances[idx] * 100:.2f}%")

    return primary_path, secondary_path


if __name__ == "__main__":
    train_models()
