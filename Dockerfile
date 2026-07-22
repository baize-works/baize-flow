# =========================
# Distribution artifact
# =========================
FROM scratch AS dist-artifact

COPY baize-flow-dist/target/baize-flow-*.tar.gz \
     /baize-flow.tar.gz


# =========================
# Backend runtime
# =========================
FROM eclipse-temurin:21-jre-jammy AS backend-runtime

ARG VERSION=dev
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="Baize Flow API" \
      org.opencontainers.image.description="Baize Flow backend service" \
      org.opencontainers.image.licenses="Apache-2.0" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

ENV BAIZE_FLOW_HOME=/opt/baize-flow \
    JAVA_OPTS="" \
    APP_OPTS="" \
    SERVER_PORT=9527 \
    SPRING_PROFILES_ACTIVE=mysql \
    BAIZE_FLOW_DATABASE_TYPE=mysql \
    BAIZE_FLOW_DATABASE_HOST=mysql \
    BAIZE_FLOW_DATABASE_PORT=3306 \
    BAIZE_FLOW_DATABASE_NAME=baize_flow \
    SPRING_DATASOURCE_URL="jdbc:mysql://mysql:3306/baize_flow?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8&allowPublicKeyRetrieval=true" \
    SPRING_DATASOURCE_USERNAME=seatunnel \
    SPRING_DATASOURCE_PASSWORD=seatunnel

WORKDIR ${BAIZE_FLOW_HOME}

COPY --from=dist-artifact \
     /baize-flow.tar.gz \
     /tmp/baize-flow.tar.gz

RUN set -eux; \
    mkdir -p "${BAIZE_FLOW_HOME}"; \
    tar -xzf /tmp/baize-flow.tar.gz \
        --strip-components=1 \
        -C "${BAIZE_FLOW_HOME}"; \
    rm -f /tmp/baize-flow.tar.gz; \
    chmod +x "${BAIZE_FLOW_HOME}"/bin/*.sh; \
    mkdir -p \
        "${BAIZE_FLOW_HOME}/logs" \
        "${BAIZE_FLOW_HOME}/jdbc-drivers"; \
    test -f "${BAIZE_FLOW_HOME}/libs/baize-flow-api.jar"

EXPOSE 9527

VOLUME ["/opt/baize-flow/logs","/opt/baize-flow/jdbc-drivers"]

ENTRYPOINT ["/opt/baize-flow/bin/run-baize-flow.sh"]


# =========================
# Frontend runtime
# =========================
FROM nginx:latest AS frontend-runtime

ARG VERSION=dev
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="Baize Flow" \
      org.opencontainers.image.description="Baize Flow frontend and reverse proxy" \
      org.opencontainers.image.licenses="Apache-2.0" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

COPY --from=dist-artifact \
     /baize-flow.tar.gz \
     /tmp/baize-flow.tar.gz

RUN set -eux; \
    mkdir -p /tmp/baize-flow; \
    tar -xzf /tmp/baize-flow.tar.gz \
        --strip-components=1 \
        -C /tmp/baize-flow; \
    test -f /tmp/baize-flow/web/index.html; \
    test -f /tmp/baize-flow/conf/nginx/default.conf; \
    rm -rf /usr/share/nginx/html/*; \
    cp -r /tmp/baize-flow/web/. /usr/share/nginx/html/; \
    cp /tmp/baize-flow/conf/nginx/default.conf \
       /etc/nginx/conf.d/default.conf; \
    rm -rf \
        /tmp/baize-flow \
        /tmp/baize-flow.tar.gz

EXPOSE 80

HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=10s \
    --retries=6 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]