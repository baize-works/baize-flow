package io.baize.flow.engine.client.rest;

import io.baize.flow.engine.client.modal.SeaTunnelClientAuth;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@SuppressWarnings({"unchecked", "rawtypes"})
@Service
public class SeaTunnelRestClient {

    public Map overview(Long clientId, Map<String, String> tags) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map overview(String baseUrl, Map<String, String> tags) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map overview(
            String baseUrl,
            String contextPath,
            Map<String, String> tags,
            SeaTunnelClientAuth auth) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List systemMonitoringInformation(
            String baseUrl,
            String contextPath,
            SeaTunnelClientAuth auth) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List runningJobs(Long clientId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map jobInfo(Long clientId, String jobId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List finishedJobs(Long clientId, String state) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List systemMonitoringInformation(Long clientId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public String logs(
            Long clientId,
            String jobIdOrNull,
            String formatOrNull) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public String jobLogs(
            Long clientId,
            String engineJobId,
            String formatOrNull) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public String nodeLogs(Long clientId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public String metrics(Long clientId, boolean openMetrics) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map submitJobText(
            Long clientId,
            String configText,
            String format,
            String jobId,
            String jobName,
            Boolean isStartWithSavePoint) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map submitJobJson(
            Long clientId,
            Object configJsonObject,
            String jobId,
            String jobName,
            Boolean isStartWithSavePoint) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map submitJobUpload(
            Long clientId,
            byte[] fileBytes,
            String filename) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map submitJobUpload(
            Long clientId,
            byte[] fileBytes,
            String filename,
            String jobId,
            String jobName,
            Boolean isStartWithSavePoint) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List submitJobsBatch(
            Long clientId,
            List jobConfigs) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map stopJob(
            Long clientId,
            String jobId,
            boolean isStopWithSavePoint) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Map checkpointOverview(
            Long clientId,
            Long jobId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List checkpointHistory(
            Long clientId,
            Long jobId,
            Long pipelineId,
            Integer limit,
            String status) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public List stopJobsBatch(
            Long clientId,
            List<Map<String, Object>> items) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}