package io.baize.flow.engine.client.rest;

import org.apache.commons.lang3.StringUtils;
import io.baize.flow.engine.client.exceptions.SeaTunnelClientException;
import io.baize.flow.engine.client.modal.SeaTunnelClientAuth;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"unchecked", "rawtypes"})
@Service
public class SeaTunnelRestClient {

    private static final String DEFAULT_FINISHED_JOB_STATE = "UNKNOWABLE";
    private static final String DEFAULT_CONFIG_FILE_NAME = "job.conf";

    private final RestTemplate restTemplate;
    private final SeaTunnelClientResolver seatunnelClientResolver;

    public SeaTunnelRestClient(RestTemplate restTemplate,
                               SeaTunnelClientResolver seatunnelClientResolver) {
        this.restTemplate = restTemplate;
        this.seatunnelClientResolver = seatunnelClientResolver;
    }

    /* ===================== URL ===================== */

    private String url(Long clientId, String path) {
        String baseApiUrl = seatunnelClientResolver.resolveBaseApiUrl(clientId);

        if (baseApiUrl == null || baseApiUrl.trim().isEmpty()) {
            throw new SeaTunnelClientException(
                    "SeaTunnel client baseUrl is empty",
                    -1,
                    "",
                    null
            );
        }

        baseApiUrl = trimEndSlash(baseApiUrl.trim());

        if (path == null || path.trim().isEmpty()) {
            return baseApiUrl;
        }

        path = path.trim();
        if (!path.startsWith("/")) {
            path = "/" + path;
        }

        return baseApiUrl + path;
    }

    private String trimEndSlash(String value) {
        while (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }

    /* ===================== Headers ===================== */

    private HttpHeaders jsonHeaders(Long clientId) {
        return headers(clientId, MediaType.APPLICATION_JSON);
    }

    private HttpHeaders textHeaders(Long clientId) {
        return headers(clientId, MediaType.TEXT_PLAIN);
    }

    private HttpHeaders multipartHeaders(Long clientId) {
        return headers(clientId, MediaType.MULTIPART_FORM_DATA);
    }

    private HttpHeaders getHeaders(Long clientId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        applyBasicAuth(clientId, headers);
        return headers;
    }

    private HttpHeaders headers(Long clientId, MediaType contentType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        applyBasicAuth(clientId, headers);
        return headers;
    }

    private void applyBasicAuth(Long clientId, HttpHeaders headers) {
        if (clientId == null) {
            return;
        }

        SeaTunnelClientAuth auth = seatunnelClientResolver.resolveAuth(clientId);

        if (auth == null) {
            return;
        }

        if (!Boolean.TRUE.equals(auth.getAuthEnabled())) {
            return;
        }

        if (isBlank(auth.getUsername()) || isBlank(auth.getPassword())) {
            return;
        }

        headers.setBasicAuth(
                auth.getUsername().trim(),
                auth.getPassword(),
                StandardCharsets.UTF_8
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /* ===================== Common Request ===================== */

    private <T> T get(Long clientId, String requestUrl, Class<T> responseType, String hint) {
        try {
            ResponseEntity<T> response = restTemplate.exchange(
                    requestUrl,
                    HttpMethod.GET,
                    new HttpEntity<Void>(null, getHeaders(clientId)),
                    responseType
            );
            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, hint);
        }
    }

    private <T> T post(Long clientId,
                       String requestUrl,
                       Object body,
                       HttpHeaders headers,
                       Class<T> responseType,
                       String hint) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            ResponseEntity<T> response = restTemplate.exchange(
                    requestUrl,
                    HttpMethod.POST,
                    entity,
                    responseType
            );
            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, hint);
        }
    }

    private RuntimeException wrap(Exception e, String hint) {
        if (e instanceof HttpStatusCodeException) {
            HttpStatusCodeException he = (HttpStatusCodeException) e;
            return new SeaTunnelClientException(
                    hint,
                    he.getRawStatusCode(),
                    safe(he.getResponseBodyAsString()),
                    he
            );
        }

        return new SeaTunnelClientException(
                hint,
                -1,
                "",
                e
        );
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    /* ===================== GET ===================== */

    public Map overview(Long clientId, Map<String, String> tags) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url(clientId, "/overview"));
            appendQueryParams(builder, tags);

            return get(
                    clientId,
                    builder.build(true).toUriString(),
                    Map.class,
                    "GET /overview failed"
            );
        } catch (Exception e) {
            throw wrap(e, "GET /overview failed");
        }
    }

    /**
     * 保留这个重载，适合没有 clientId 的临时探活场景。
     *
     * 注意：这个方法没有 clientId，所以无法从数据库读取账号密码。
     * 如果 Zeta Engine 开启了 Basic Auth，建议优先使用 overview(Long clientId, Map<String, String> tags)。
     */
    public Map overview(String baseUrl, Map<String, String> tags) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl);
            appendQueryParams(builder, tags);

            ResponseEntity<Map> response = restTemplate.exchange(
                    builder.build(true).toUri(),
                    HttpMethod.GET,
                    new HttpEntity<Void>(null, new HttpHeaders()),
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, "GET /overview failed");
        }
    }

    public Map overview(String baseUrl, String contextPath, Map<String, String> tags, SeaTunnelClientAuth auth) {
        try {
            String finalUrl = buildFullUrl(baseUrl, contextPath, "/overview");

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(finalUrl);
            appendQueryParams(builder, tags);

            ResponseEntity<Map> response = restTemplate.exchange(
                    builder.build(true).toUri(),
                    HttpMethod.GET,
                    new HttpEntity<Void>(null, getHeaders(auth)),
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, "GET /overview failed");
        }
    }

    /**
     * 这是个重载，适合没有 clientId 的临时探活场景。
     * @param baseUrl
     * @param contextPath
     * @param auth 认证数据
     * @return 多节点数据，含所有master + workers
     */
    public List systemMonitoringInformation(String baseUrl, String contextPath, SeaTunnelClientAuth auth) {
        try {
            String finalUrl = buildFullUrl(baseUrl, contextPath, "/system-monitoring-information");

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(finalUrl);

            ResponseEntity<List> response = restTemplate.exchange(
                    builder.build(true).toUri(),
                    HttpMethod.GET,
                    new HttpEntity<Void>(null, getHeaders(auth)),
                    List.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, "GET /system-monitoring-information failed");
        }
    }

    /**
     * 拼接基础 URL、上下文路径和具体接口路径
     *
     * @param baseUrl     基础 URL
     * @param contextPath 上下文路径
     * @param apiPath     具体的接口路径
     * @return 拼接完成的完整 URL
     */
    private String buildFullUrl(String baseUrl, String contextPath, String apiPath) {
        String url = StringUtils.removeEnd(baseUrl, "/");

        if (StringUtils.isNotBlank(contextPath)) {
            url = url + "/" + StringUtils.removeStart(contextPath, "/");
        }

        return url + StringUtils.prependIfMissing(apiPath, "/");
    }

    private HttpHeaders getHeaders(SeaTunnelClientAuth auth) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        applyBasicAuth(auth, headers);
        return headers;
    }

    private void applyBasicAuth(SeaTunnelClientAuth auth, HttpHeaders headers) {
        if (auth == null) {
            return;
        }

        if (!Boolean.TRUE.equals(auth.getAuthEnabled())) {
            return;
        }

        if (isBlank(auth.getUsername()) || isBlank(auth.getPassword())) {
            return;
        }

        headers.setBasicAuth(
                auth.getUsername().trim(),
                auth.getPassword(),
                StandardCharsets.UTF_8
        );
    }

    public List runningJobs(Long clientId) {
        return get(
                clientId,
                url(clientId, "/running-jobs"),
                List.class,
                "GET /running-jobs failed"
        );
    }

    public Map jobInfo(Long clientId, String jobId) {
        return get(
                clientId,
                url(clientId, "/job-info/" + jobId),
                Map.class,
                "GET /job-info/{jobId} failed"
        );
    }

    public List finishedJobs(Long clientId, String state) {
        if (isBlank(state)) {
            state = DEFAULT_FINISHED_JOB_STATE;
        }

        return get(
                clientId,
                url(clientId, "/finished-jobs/" + state.trim()),
                List.class,
                "GET /finished-jobs/{state} failed"
        );
    }

    public List systemMonitoringInformation(Long clientId) {
        return get(
                clientId,
                url(clientId, "/system-monitoring-information"),
                List.class,
                "GET /system-monitoring-information failed"
        );
    }

    public String logs(Long clientId, String jobIdOrNull, String formatOrNull) {
        try {
            String fullPath = String.format("job-%s.log", jobIdOrNull);
            String path = jobIdOrNull == null ? "/log" : "/log/" + fullPath;

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url(clientId, path));
            if (!isBlank(formatOrNull)) {
                builder.queryParam("format", formatOrNull.trim());
            }

            return get(
                    clientId,
                    builder.build(true).toUriString(),
                    String.class,
                    "GET /log failed"
            );
        } catch (Exception e) {
            throw wrap(e, "GET /log failed");
        }
    }

    public String jobLogs(Long clientId, String engineJobId, String formatOrNull) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId cannot be empty");
        }

        if (engineJobId == null) {
            throw new IllegalArgumentException("engineJobId cannot be empty");
        }

        return logs(clientId, engineJobId, formatOrNull);
    }

    public String nodeLogs(Long clientId) {
        return get(
                clientId,
                url(clientId, "/log"),
                String.class,
                "GET /log failed"
        );
    }

    public String metrics(Long clientId, boolean openMetrics) {
        String path = openMetrics ? "/openmetrics" : "/metrics";

        return get(
                clientId,
                url(clientId, path),
                String.class,
                "GET /metrics failed"
        );
    }

    /* ===================== POST ===================== */

    public Map submitJobText(Long clientId,
                             String configText,
                             String format,
                             String jobId,
                             String jobName,
                             Boolean isStartWithSavePoint) {
        try {
            if (isBlank(format)) {
                format = "json";
            }

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url(clientId, "/submit-job"))
                    .queryParam("format", format.trim());

            appendSubmitJobParams(builder, jobId, jobName, isStartWithSavePoint);

            return post(
                    clientId,
                    builder.build(true).toUriString(),
                    configText == null ? "" : configText,
                    textHeaders(clientId),
                    Map.class,
                    "POST /submit-job(text) failed"
            );
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job(text) failed");
        }
    }

    public Map submitJobJson(Long clientId,
                             Object configJsonObject,
                             String jobId,
                             String jobName,
                             Boolean isStartWithSavePoint) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url(clientId, "/submit-job"))
                    .queryParam("format", "json");

            appendSubmitJobParams(builder, jobId, jobName, isStartWithSavePoint);

            return post(
                    clientId,
                    builder.build(true).toUriString(),
                    configJsonObject,
                    jsonHeaders(clientId),
                    Map.class,
                    "POST /submit-job(json) failed"
            );
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job(json) failed");
        }
    }

    public Map submitJobUpload(Long clientId, byte[] fileBytes, String filename) {
        return submitJobUpload(clientId, fileBytes, filename, null, null, null);
    }

    public Map submitJobUpload(Long clientId,
                               byte[] fileBytes,
                               String filename,
                               String jobId,
                               String jobName,
                               Boolean isStartWithSavePoint) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            ByteArrayResource resource = new ByteArrayResource(fileBytes == null ? new byte[0] : fileBytes) {
                @Override
                public String getFilename() {
                    return isBlank(filename) ? DEFAULT_CONFIG_FILE_NAME : filename.trim();
                }
            };

            body.add("config_file", resource);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(
                    body,
                    multipartHeaders(clientId)
            );

            UriComponentsBuilder builder =
                    UriComponentsBuilder.fromHttpUrl(url(clientId, "/submit-job/upload"));

            appendSubmitJobParams(builder, jobId, jobName, isStartWithSavePoint);

            ResponseEntity<Map> response = restTemplate.exchange(
                    builder.build(true).toUriString(),
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job/upload failed");
        }
    }

    public List submitJobsBatch(Long clientId, List jobConfigs) {
        return post(
                clientId,
                url(clientId, "/submit-jobs"),
                jobConfigs,
                jsonHeaders(clientId),
                List.class,
                "POST /submit-jobs failed"
        );
    }

    public Map stopJob(Long clientId, String jobId, boolean isStopWithSavePoint) {
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("jobId", jobId);
        body.put("isStopWithSavePoint", isStopWithSavePoint);

        return post(
                clientId,
                url(clientId, "/stop-job"),
                body,
                jsonHeaders(clientId),
                Map.class,
                "POST /stop-job failed"
        );
    }

    public Map checkpointOverview(Long clientId, Long jobId) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId cannot be empty");
        }

        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be empty");
        }

        return get(
                clientId,
                url(clientId, "/jobs/checkpoints/" + jobId),
                Map.class,
                "GET /jobs/checkpoints/{jobId} failed"
        );
    }

    public List checkpointHistory(Long clientId,
                                  Long jobId,
                                  Long pipelineId,
                                  Integer limit,
                                  String status) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId cannot be empty");
        }

        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be empty");
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(
                url(clientId, "/jobs/checkpoints/history/" + jobId)
        );

        if (pipelineId != null) {
            builder.queryParam("pipelineId", pipelineId);
        }

        if (limit != null) {
            builder.queryParam("limit", limit);
        }

        if (!isBlank(status)) {
            builder.queryParam("status", status.trim());
        }

        return get(
                clientId,
                builder.build(true).toUriString(),
                List.class,
                "GET /jobs/checkpoints/history/{jobId} failed"
        );
    }

    public List stopJobsBatch(Long clientId, List<Map<String, Object>> items) {
        return post(
                clientId,
                url(clientId, "/stop-jobs"),
                items,
                jsonHeaders(clientId),
                List.class,
                "POST /stop-jobs failed"
        );
    }

    /* ===================== Query Params ===================== */

    private void appendQueryParams(UriComponentsBuilder builder, Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return;
        }

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!isBlank(entry.getKey()) && entry.getValue() != null) {
                builder.queryParam(entry.getKey().trim(), entry.getValue());
            }
        }
    }

    private void appendSubmitJobParams(UriComponentsBuilder builder,
                                       String jobId,
                                       String jobName,
                                       Boolean isStartWithSavePoint) {
        if (!isBlank(jobId)) {
            builder.queryParam("jobId", jobId.trim());
        }

        if (!isBlank(jobName)) {
            builder.queryParam("jobName", jobName.trim());
        }

        if (isStartWithSavePoint != null) {
            builder.queryParam("isStartWithSavePoint", isStartWithSavePoint);
        }
    }
}