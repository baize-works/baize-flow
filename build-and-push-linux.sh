#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# Yak Ops Docker image publishing configuration
# Uses the local Docker image store and the default Docker builder.
# It does not create a Buildx builder, pull base images, or run Maven/npm builds.
# ============================================================
DOCKERHUB_USERNAME="weifuwan"
VERSION="1.0.0"
BACKEND_REPOSITORY="yak-ops-api"
FRONTEND_REPOSITORY="yak-ops"
PUSH_LATEST="true"

# Local base images required by Dockerfile.
BACKEND_BASE_IMAGE="eclipse-temurin:21-jre-jammy"
FRONTEND_BASE_IMAGE="nginx:latest"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

write_step() {
    printf '\n==> %s\n' "$1"
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        printf 'Required command not found: %s\n' "$1" >&2
        exit 1
    fi
}

require_local_image() {
    local image="$1"
    local platform

    if ! docker image inspect "$image" >/dev/null 2>&1; then
        printf 'Required local image was not found: %s\n' "$image" >&2
        printf 'This script never pulls base images automatically.\n' >&2
        exit 1
    fi

    platform="$(docker image inspect --format '{{.Os}}/{{.Architecture}}' "$image" 2>/dev/null | head -n 1 || true)"
    if [[ -n "$platform" ]]; then
        printf 'Local image ready: %s (%s)\n' "$image" "$platform"
    else
        printf 'Local image ready: %s\n' "$image"
    fi
}

build_local_image() {
    local target="$1"
    local image="$2"
    local title="$3"
    local -a args

    write_step "Building ${title} from local base images"

    args=(
        build
        --progress=plain
        --pull=false
        --target "$target"
        --build-arg "VERSION=$VERSION"
        --build-arg "VCS_REF=$VCS_REF"
        --build-arg "BUILD_DATE=$BUILD_DATE"
        --tag "${image}:${VERSION}"
    )

    if [[ "$PUSH_LATEST" == "true" ]]; then
        args+=(--tag "${image}:latest")
    fi

    args+=(.)
    docker "${args[@]}"
}

push_image_tags() {
    local image="$1"
    local title="$2"

    write_step "Pushing ${title}"
    docker push "${image}:${VERSION}"

    if [[ "$PUSH_LATEST" == "true" ]]; then
        docker push "${image}:latest"
    fi
}

require_command docker
require_command git

if [[ ! -f ./Dockerfile ]]; then
    printf 'Dockerfile was not found in %s. Put this script in the project root.\n' "$SCRIPT_DIR" >&2
    exit 1
fi

# Ensure `docker build` uses Docker Engine's default builder even if a custom
# Buildx builder was selected through this environment variable.
unset BUILDX_BUILDER || true

write_step "Checking Docker"
docker info >/dev/null

write_step "Checking required local base images"
require_local_image "$BACKEND_BASE_IMAGE"
require_local_image "$FRONTEND_BASE_IMAGE"

VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || true)"
[[ -n "$VCS_REF" ]] || VCS_REF="unknown"
BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
BACKEND_IMAGE="${DOCKERHUB_USERNAME}/${BACKEND_REPOSITORY}"
FRONTEND_IMAGE="${DOCKERHUB_USERNAME}/${FRONTEND_REPOSITORY}"

cat <<CONFIG

Publishing configuration
------------------------
Docker Hub namespace : $DOCKERHUB_USERNAME
Version              : $VERSION
Git revision         : $VCS_REF
Build date           : $BUILD_DATE
Backend base image   : $BACKEND_BASE_IMAGE (local only)
Frontend base image  : $FRONTEND_BASE_IMAGE (local only)
Backend image        : ${BACKEND_IMAGE}:${VERSION}
Frontend image       : ${FRONTEND_IMAGE}:${VERSION}
Publish latest       : $PUSH_LATEST
Build mode           : default Docker builder, single platform
Distribution build   : skipped (uses existing tar.gz)
CONFIG

write_step "Checking prebuilt Yak Ops distribution"
shopt -s nullglob
DIST_FILES=(./yak-ops-dist/target/yak-ops-*.tar.gz)
shopt -u nullglob

if (( ${#DIST_FILES[@]} == 0 )); then
    printf 'No distribution archive found at yak-ops-dist/target/yak-ops-*.tar.gz\n' >&2
    exit 1
fi

if (( ${#DIST_FILES[@]} > 1 )); then
    printf 'Multiple distribution archives were found. Keep only the archive that should be published.\n' >&2
    exit 1
fi

printf 'Distribution archive: %s\n' "${DIST_FILES[0]}"

build_local_image "backend-runtime" "$BACKEND_IMAGE" "backend image"
build_local_image "frontend-runtime" "$FRONTEND_IMAGE" "frontend image"

push_image_tags "$BACKEND_IMAGE" "backend image"
push_image_tags "$FRONTEND_IMAGE" "frontend image"

cat <<SUCCESS

Published successfully
----------------------
${BACKEND_IMAGE}:${VERSION}
${FRONTEND_IMAGE}:${VERSION}
SUCCESS

if [[ "$PUSH_LATEST" == "true" ]]; then
    cat <<LATEST
${BACKEND_IMAGE}:latest
${FRONTEND_IMAGE}:latest
LATEST
fi
