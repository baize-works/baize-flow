#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BAIZE_FLOW_HOME="$(cd "${BIN_DIR}/.." && pwd)"

LOG_DIR="${BAIZE_FLOW_HOME}/logs"
PID_FILE="${BAIZE_FLOW_HOME}/baize-flow.pid"
RUN_SCRIPT="${BIN_DIR}/run-baize-flow.sh"

if [[ -f "${PID_FILE}" ]]; then
  PID="$(cat "${PID_FILE}")"

  if kill -0 "${PID}" >/dev/null 2>&1; then
    echo "Baize Flow is already running with pid ${PID}."
    exit 0
  fi

  rm -f "${PID_FILE}"
fi

mkdir -p "${LOG_DIR}"

nohup "${RUN_SCRIPT}" \
  > "${LOG_DIR}/baize-flow.out" \
  2>&1 &

PID=$!
echo "${PID}" > "${PID_FILE}"

sleep 1

if ! kill -0 "${PID}" >/dev/null 2>&1; then
  echo "Baize Flow failed to start. Check ${LOG_DIR}/baize-flow.out." >&2
  rm -f "${PID_FILE}"
  exit 1
fi

echo "Baize Flow started with pid ${PID}."