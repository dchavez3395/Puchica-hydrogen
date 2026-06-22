#!/usr/bin/env python3
"""Walk Daniel through the OAuth authorization_code flow once.

This is the right path: the OllamaAdmin app is on basic-plan puchica-2,
configured for authorization_code grant. client_credentials is Plus-only,
but authorization_code works on every plan. Daniel approves once in
the browser, we capture the access_token, and then ALL the runners
can use it forever (no expiration).

After running, Daniel needs to:
1. Open the URL printed below in his browser
2. Approve the app
3. Paste the redirect URL back here

We then exchange the code for an access_token and persist it to the
User environment variable so all cron jobs / runners pick it up.
"""
import os
import sys
import urllib.parse
import urllib.request
import json
import re
from pathlib import Path

# Real client_id from Daniel's URL
CLIENT_ID = "a4bdd602c95e3310238ac87cf958e083"
CLIENT_SECRET = os.environ.get("SHOPIFY_OAUTH_CLIENT_SECRET", "").strip()
STORE_DOMAIN = os.environ.get("SHOPIFY_STORE_DOMAIN", "puchica-2.myshopify.com")
REDIRECT_URI = "https://shopify.dev/apps/default-app-home/api/auth"
SCOPES = "write_products,write_files,read_products,read_files"

# Match the app's TOML redirect, but admin.shopify.com apps often use
# the official dev dashboard redirect. Let me try both.
REDIRECT_CANDIDATES = [
    "https://shopify.dev/apps/default-app-home/api/auth",
    "https://admin.shopify.com/oauth/redirect_from_developer_dashboard",
]


def get_secret() -> str:
    """Try env, then registry, then ask."""
    global CLIENT_SECRET
    if CLIENT_SECRET:
        return CLIENT_SECRET
    # Try Windows registry
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                             r"Environment") as k:
            v, _ = winreg.QueryValueEx(k, "SHOPIFY_OAUTH_CLIENT_SECRET")
            if v:
                os.environ["SHOPIFY_OAUTH_CLIENT_SECRET"] = str(v)
                return str(v)
    except (OSError, FileNotFoundError):
        pass
    print("[FATAL] SHOPIFY_OAUTH_CLIENT_SECRET not set", file=sys.stderr)
    sys.exit(1)


def main():
    secret = get_secret()
    print(f"Store: {STORE_DOMAIN}")
    print(f"App client_id: {CLIENT_ID}")
    print(f"Secret: {secret[:10]}...{secret[-4:]}")
    print()

    for redirect in REDIRECT_CANDIDATES:
        # Build the authorize URL
        params = {
            "client_id": CLIENT_ID,
            "scope": SCOPES,
            "redirect_uri": redirect,
            "state": "puchica-image-pipeline",
            "grant_options[]": "per-user",
        }
        auth_url = (
            f"https://{STORE_DOMAIN}/admin/oauth/authorize?"
            + urllib.parse.urlencode(params)
        )
        print(f"=== Try redirect_uri: {redirect}")
        print(auth_url)
        print()

    print("=" * 70)
    print("STEPS:")
    print("=" * 70)
    print()
    print("1. Copy one of the URLs above into your browser.")
    print("   (Try the first one first. If Shopify rejects it for redirect")
    print("    URI mismatch, try the second.)")
    print()
    print("2. Approve the OllamaAdmin app. You'll see a list of scopes;")
    print("   all 4 are read/write on products and files.")
    print()
    print("3. After approval, Shopify redirects to the redirect_uri with")
    print("   ?code=XXXXXXX&state=...&hmac=...&shop=...")
    print()
    print("4. Copy the FULL redirect URL from your browser's address bar")
    print("   and paste it here.")
    print()
    print("=" * 70)
    print()

    # Accept the redirect URL on stdin (paste, then Enter)
    print("Paste the full redirect URL here (or 'q' to quit):")
    try:
        line = input("> ").strip()
    except (EOFError, KeyboardInterrupt):
        return 1
    if line.lower() in ("q", "quit", ""):
        return 0
    if not line.startswith("http"):
        # Maybe just the code?
        if re.match(r"^[a-f0-9]{32,}$", line):
            code = line
            redirect = ""
        else:
            print(f"[FATAL] Unrecognized input: {line[:100]}")
            return 2
    else:
        # Parse the redirect URL
        parsed = urllib.parse.urlparse(line)
        qs = urllib.parse.parse_qs(parsed.query)
        code = qs.get("code", [None])[0]
        shop = qs.get("shop", [None])[0]
        redirect = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

    if not code:
        print("[FATAL] No code in input")
        return 2

    # Exchange code for access_token
    print(f"\nExchanging code {code[:10]}... for access_token...")
    body = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": secret,
        "code": code,
    }).encode()
    token_url = f"https://{STORE_DOMAIN}/admin/oauth/access_token"
    req = urllib.request.Request(token_url, data=body, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            token_data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        print(f"[FATAL] Token exchange HTTP {e.code}: {body[:500]}")
        return 3
    except Exception as e:
        print(f"[FATAL] Token exchange failed: {e}")
        return 3

    access_token = token_data.get("access_token", "")
    scope = token_data.get("scope", "")
    expires_in = token_data.get("expires_in", "n/a")
    if not access_token:
        print(f"[FATAL] No access_token in response: {json.dumps(token_data)[:500]}")
        return 3

    print(f"\n[OK] Got access_token")
    print(f"  Scope: {scope}")
    print(f"  Expires in: {expires_in}")
    print(f"  Token: {access_token[:15]}...{access_token[-4:]}")

    # Persist to User environment
    ps_cmd = (
        f"[Environment]::SetEnvironmentVariable("
        f"'SHOPIFY_ADMIN_TOKEN', '{access_token}', 'User')"
    )
    print(f"\nPersisting to User environment...")
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps_cmd],
        capture_output=True, text=True, timeout=15,
    )
    if ps.returncode != 0:
        print(f"[FAIL] {ps.stderr}")
        return 4
    print(f"  [OK] SHOPIFY_ADMIN_TOKEN now set in User env")

    # Also write to .env so future tools pick it up
    env_path = Path(r"E:\Claude\puchica-site\.env")
    if env_path.exists():
        text = env_path.read_text(encoding="utf-8")
        # Replace or append
        if re.search(r"^SHOPIFY_ADMIN_TOKEN=", text, re.MULTILINE):
            text = re.sub(r"^SHOPIFY_ADMIN_TOKEN=.*$",
                          f"SHOPIFY_ADMIN_TOKEN={access_token}",
                          text, flags=re.MULTILINE)
        else:
            text += f"\nSHOPIFY_ADMIN_TOKEN={access_token}\n"
        env_path.write_text(text, encoding="utf-8")
        print(f"  [OK] Updated {env_path}")

    # Smoke-test: fetch shop info
    print(f"\nSmoke-testing the token...")
    test_url = (
        f"https://{STORE_DOMAIN}/admin/api/2025-01/shop.json"
    )
    req = urllib.request.Request(
        test_url,
        headers={"X-Shopify-Access-Token": access_token},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            shop_info = json.loads(resp.read())
        print(f"  [OK] Connected to: {shop_info.get('shop', {}).get('name', '?')}")
    except urllib.error.HTTPError as e:
        print(f"  [WARN] Smoke test HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')[:300]}")
    except Exception as e:
        print(f"  [WARN] Smoke test failed: {e}")

    print(f"\n=== Done. Run the runners and image upload pipeline now. ===")
    print(f"  python runners/images/run.py --dry-run --limit 1 --product giant-blanket-hoodie")
    return 0


if __name__ == "__main__":
    import subprocess
    sys.exit(main())