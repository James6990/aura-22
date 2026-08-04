#!/usr/bin/env bash
set -euo pipefail

EXPECTED_BRANCH="apex-foundation-1.0"
PATCH_NAME="REPLACE_WITH_PATCH_NAME"

echo "=========================================="
echo " Apex Patch: ${PATCH_NAME}"
echo "=========================================="

if [[ ! -d .git ]]; then
  echo "Error: run this patch from the Apex repository root." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "Error: expected branch '$EXPECTED_BRANCH' but found '$CURRENT_BRANCH'." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: the working tree is not clean." >&2
  echo "Commit, stash or discard existing changes before applying this patch." >&2
  git status --short
  exit 1
fi

required_files=(
  "package.json"
  "APEX_BUILD_STATE.md"
  "PATCH_HISTORY.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: missing required file: $file" >&2
    exit 1
  fi
done

echo "Repository checks passed."
echo

# -------------------------------------------------
# PATCH IMPLEMENTATION GOES HERE
# -------------------------------------------------

echo
echo "Patch applied. No commit was created."
echo
echo "Review:"
echo "  git diff --stat"
echo "  git diff"
echo
echo "Verify:"
echo "  npm run apex:check"
