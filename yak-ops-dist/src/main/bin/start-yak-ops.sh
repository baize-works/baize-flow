#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YAK_OPS_HOME="$(cd "${BIN_DIR}/.." && pwd)"

LOG_DIR="${YAK_OPS_HOME}/logs"
PID_FILE="${YAK_OPS_HOME}/yak-ops.pid"
RUN_SCRIPT="${BIN_DIR}/run-yak-ops.sh"

if [[ -f "${PID_FILE}" ]]; then
  PID="$(cat "${PID_FILE}")"

  if kill -0 "${PID}" >/dev/null 2>&1; then
    echo "Yak Ops is already running with pid ${PID}."
    exit 0
  fi

  rm -f "${PID_FILE}"
fi

mkdir -p "${LOG_DIR}"

nohup "${RUN_SCRIPT}" \
  > "${LOG_DIR}/yak-ops.out" \
  2>&1 &

PID=$!
echo "${PID}" > "${PID_FILE}"

sleep 1

if ! kill -0 "${PID}" >/dev/null 2>&1; then
  echo "Yak Ops failed to start. Check ${LOG_DIR}/yak-ops.out." >&2
  rm -f "${PID_FILE}"
  exit 1
fi

echo "Yak Ops started with pid ${PID}."