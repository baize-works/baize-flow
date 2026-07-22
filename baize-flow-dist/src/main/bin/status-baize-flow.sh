#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BAIZE_FLOW_HOME="$(cd "${BIN_DIR}/.." && pwd)"
PID_FILE="${BAIZE_FLOW_HOME}/baize-flow.pid"

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" >/dev/null 2>&1; then
  echo "Baize Flow is running with pid $(cat "${PID_FILE}")."
else
  echo "Baize Flow is stopped."
fi
