#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BAIZE_FLOW_HOME="$(cd "${BIN_DIR}/.." && pwd)"

CONF_DIR="${BAIZE_FLOW_HOME}/conf"
LOG_DIR="${BAIZE_FLOW_HOME}/logs"
DRIVER_DIR="${BAIZE_FLOW_HOME}/jdbc-drivers"

JAVA_BIN=""

if [[ -n "${JAVA_HOME:-}" ]] && [[ -x "${JAVA_HOME}/bin/java" ]]; then
  JAVA_BIN="${JAVA_HOME}/bin/java"
else
  JAVA_BIN="$(command -v java || true)"
fi

if [[ -z "${JAVA_BIN}" ]]; then
  echo "Java executable was not found. Please install Java 21 or configure JAVA_HOME." >&2
  exit 1
fi

if [[ ! -f "${BAIZE_FLOW_HOME}/libs/baize-flow-api.jar" ]]; then
  echo "Missing application jar: ${BAIZE_FLOW_HOME}/libs/baize-flow-api.jar" >&2
  exit 1
fi

mkdir -p "${LOG_DIR}" "${DRIVER_DIR}"

JAVA_ARGS=()
APP_ARGS=()

if [[ -n "${JAVA_OPTS:-}" ]]; then
  read -r -a JAVA_ARGS <<< "${JAVA_OPTS}"
fi

if [[ -n "${APP_OPTS:-}" ]]; then
  read -r -a APP_ARGS <<< "${APP_OPTS}"
fi

exec "${JAVA_BIN}" \
  "${JAVA_ARGS[@]}" \
  -Dbaize.flow.home="${BAIZE_FLOW_HOME}" \
  -Dlogging.config="${CONF_DIR}/logback-spring.xml" \
  -jar "${BAIZE_FLOW_HOME}/libs/baize-flow-api.jar" \
  --spring.config.location="${CONF_DIR}/application.yml" \
  "${APP_ARGS[@]}"