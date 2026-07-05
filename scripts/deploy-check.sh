#!/usr/bin/env bash
# Smoke-tests a deployed ReviewSense environment.
#
# Usage:
#   ./scripts/deploy-check.sh <main-api-url> <ml-service-url>
#   MAIN_API_URL=... ML_SERVICE_URL=... ./scripts/deploy-check.sh
#
# Exits 0 if every check passes, 1 otherwise.

set -euo pipefail

MAIN_API_URL="${1:-${MAIN_API_URL:-}}"
ML_SERVICE_URL="${2:-${ML_SERVICE_URL:-}}"

if [[ -z "$MAIN_API_URL" || -z "$ML_SERVICE_URL" ]]; then
  echo "Usage: $0 <main-api-url> <ml-service-url>" >&2
  echo "   or: MAIN_API_URL=... ML_SERVICE_URL=... $0" >&2
  exit 1
fi

MAIN_API_URL="${MAIN_API_URL%/}"
ML_SERVICE_URL="${ML_SERVICE_URL%/}"

status=0

check() {
  local desc="$1" method="$2" url="$3" expected="$4"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" || true)
  if [[ "$code" == "$expected" ]]; then
    echo "OK   $desc (got $code)"
  else
    echo "FAIL $desc (expected $expected, got $code)"
    status=1
  fi
}

check "main-api GET /auth/me without JWT"                     GET  "$MAIN_API_URL/auth/me"                     401
check "main-api POST /api/v1/external/predict without JWT"    POST "$MAIN_API_URL/api/v1/external/predict"    401
check "ml-service GET /health"                                GET  "$ML_SERVICE_URL/health"                    200

exit $status
