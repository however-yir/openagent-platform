#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  "CHANGELOG.md"
  "docs/release-standard.zh-CN.md"
  "docs/compatibility-matrix.zh-CN.md"
  "docs/release-rollback-playbook.zh-CN.md"
)

status=0

contains_pattern() {
  local pattern="$1"
  local path="$2"
  if command -v rg >/dev/null 2>&1; then
    rg -q "${pattern}" "${path}"
  else
    grep -Eq "${pattern}" "${path}"
  fi
}

for file in "${required_files[@]}"; do
  path="${ROOT_DIR}/${file}"
  if [[ ! -s "${path}" ]]; then
    echo "Missing required release artifact: ${file}"
    status=1
  fi
done

if ! contains_pattern '^## \[[^]]+\]' "${ROOT_DIR}/CHANGELOG.md"; then
  echo "CHANGELOG.md is missing version sections."
  status=1
fi

if ! contains_pattern '^\| 组件 \|' "${ROOT_DIR}/docs/compatibility-matrix.zh-CN.md"; then
  echo "Compatibility matrix table header is missing."
  status=1
fi

if ! contains_pattern '回滚步骤' "${ROOT_DIR}/docs/release-rollback-playbook.zh-CN.md"; then
  echo "Rollback playbook does not contain rollback steps section."
  status=1
fi

if [[ "${status}" -eq 0 ]]; then
  echo "ForgePilot release artifacts check passed."
else
  echo "ForgePilot release artifacts check failed."
fi

exit "${status}"
