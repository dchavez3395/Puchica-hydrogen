#!/usr/bin/env bash
#
# archive-cleanup.sh — tidy the Puchica repo root.
#
# Moves one-off probe/debug/OAuth scripts into scripts/archive/ and dated
# audit artifacts into docs/audits/, preserving git history via `git mv`.
# Nothing is deleted. Run from anywhere inside the repo:
#
#     bash archive-cleanup.sh
#
# Then review with `git status` and commit if it looks right.

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

mkdir -p docs/audits scripts/archive

echo "==> Archiving one-off scripts -> scripts/archive/"
for f in \
  probe-*.py \
  debug-*.py \
  app-probe.py \
  app_diagnostic.py \
  app_identity_check.py \
  capture_current_token.py \
  force_oauth_install.py \
  refresh-token.py \
  scope-probe.py \
  analyze-alt-diffs.py
do
  if [ -e "$f" ]; then
    git mv -k "$f" scripts/archive/ && echo "  moved $f"
  fi
done

echo "==> Archiving dated audit artifacts -> docs/audits/"
for f in \
  *2026-06-29*.md \
  *2026-06-29*.csv \
  *2026-06-29*.json \
  cart-redirect-audit.md \
  ink-block-audit.md \
  sales-channels-recommendations.md
do
  if [ -e "$f" ]; then
    git mv -k "$f" docs/audits/ && echo "  moved $f"
  fi
done

echo
echo "Done. Review the staged moves with:  git status"
echo "If it looks right:  git commit -m 'chore: archive one-off scripts + dated audits'"
