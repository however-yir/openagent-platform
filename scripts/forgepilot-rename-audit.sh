#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PATTERNS=(
  "OpenAgent Platform"
  "OpenAgent UI"
  "@openagent/ui"
  "openagent-logo"
  "openagent-ui-logo"
  "AI Software Engineer"
  "AI software engineer"
)

echo "ForgePilot rename audit"
echo "root: ${ROOT_DIR}"

status=0
for pattern in "${PATTERNS[@]}"; do
  if rg -n --hidden --glob '!node_modules' --glob '!poetry.lock' --glob '!frontend/public/locales/**' "${pattern}" "${ROOT_DIR}"; then
    status=1
  fi
done

if [[ "${status}" -eq 0 ]]; then
  echo "No blocked legacy public-brand strings found."
else
  echo "Legacy public-brand strings remain."
fi

exit "${status}"
