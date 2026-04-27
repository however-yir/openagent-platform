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

TARGET_PATHS=(
  "${ROOT_DIR}/README.md"
  "${ROOT_DIR}/docker-compose.yml"
  "${ROOT_DIR}/frontend/README.md"
  "${ROOT_DIR}/frontend/src/components/features/forgepilot"
  "${ROOT_DIR}/frontend/src/routes/deployment-wizard.tsx"
  "${ROOT_DIR}/docs/brand-system.zh-CN.md"
  "${ROOT_DIR}/docs/repository-profile.md"
  "${ROOT_DIR}/openhands/core/config/arg_utils.py"
)

echo "ForgePilot rename audit"
echo "root: ${ROOT_DIR}"

status=0
for pattern in "${PATTERNS[@]}"; do
  if rg -n --hidden --glob '!node_modules' --glob '!poetry.lock' --glob '!frontend/public/locales/**' "${pattern}" "${TARGET_PATHS[@]}"; then
    status=1
  fi
done

if [[ "${status}" -eq 0 ]]; then
  echo "No blocked legacy public-brand strings found."
else
  echo "Legacy public-brand strings remain."
fi

exit "${status}"
