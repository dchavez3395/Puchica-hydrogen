#!/usr/bin/env python3
"""capture_current_token.py — Snapshot the current access_token
BEFORE uninstalling puchicaadmin-1.

After uninstall + reinstall, the old token will be invalid.
This script just saves a copy in case we need to roll back.

Output: .shopify-admin-token.BACKUP
"""
import json, shutil
from pathlib import Path

src = Path('.shopify-admin-token')
dst = Path('.shopify-admin-token.BACKUP')

if not src.exists():
    print('No current token file found.')
    raise SystemExit(1)

shutil.copy2(src, dst)
data = json.loads(src.read_text())
print(f'Backed up to {dst}')
print(f'  Token prefix: {data.get("access_token", "")[:15]}...')
print(f'  Scope: {data.get("scope")}')
print()
print('This is a safety net. After uninstall + reinstall of puchicaadmin-1,')
print('the new install will issue a fresh token with the updated scopes.')
print('This backup is for emergency rollback if anything goes sideways.')