#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YAK_OPS_HOME="$(cd "${BIN_DIR}/.." && pwd)"
PID_FILE="${YAK_OPS_HOME}/yak-ops.pid"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "Yak Ops is not running: pid file not found."
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if ! kill -0 "${PID}" >/dev/null 2>&1; then
  echo "Yak Ops process ${PID} is not running."
  rm -f "${PID_FILE}"
  exit 0
fi

kill "${PID}"
for _ in {1..30}; do
  if ! kill -0 "${PID}" >/dev/null 2>&1; then
    rm -f "${PID_FILE}"
    echo "Yak Ops stopped."
    exit 0
  fi
  sleep 1
done

echo "Yak Ops did not stop within 30 seconds; sending SIGKILL."
kill -9 "${PID}" >/dev/null 2>&1 || true
rm -f "${PID_FILE}"
