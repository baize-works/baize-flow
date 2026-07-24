#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YAK_OPS_HOME="$(cd "${BIN_DIR}/.." && pwd)"
PID_FILE="${YAK_OPS_HOME}/yak-ops.pid"

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" >/dev/null 2>&1; then
  echo "Yak Ops is running with pid $(cat "${PID_FILE}")."
else
  echo "Yak Ops is stopped."
fi
