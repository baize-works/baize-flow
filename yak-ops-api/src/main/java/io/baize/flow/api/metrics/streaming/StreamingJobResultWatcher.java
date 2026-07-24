package io.baize.flow.api.metrics.streaming;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.metrics.JobRuntimeContext;
import io.baize.flow.common.enums.JobResult;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@Slf4j
public class StreamingJobResultWatcher {

    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Resource
    private StreamingJobResultHandler streamingJobResultHandler;

    @Resource
    private SeaTunnelRestClient seatunnelRestClient;

    @Value("${seatunnel.result.poll-interval-ms:2000}")
    private long pollIntervalMs;

    @Value("${seatunnel.result.poll-timeout-ms:0}")
    private long pollTimeoutMs;

    public void registerByRest(JobRuntimeContext context) {
        executor.submit(() -> watch(context));
    }

    private void watch(JobRuntimeContext context) {
        long start = System.currentTimeMillis();

        Long instanceId = context.getInstanceId();
        String engineId = context.getEngineId();

        try {
            while (true) {
                checkTimeout(start, engineId);

                Map jobInfo = seatunnelRestClient.jobInfo(context.getClientId(), engineId);
                String statusStr = readStatus(jobInfo);

                if (statusStr == null) {
                    log.warn("Streaming job-info returned no status, instanceId={}, engineId={}, resp={}",
                            instanceId, engineId, jobInfo);
                    sleepQuietly();
                    continue;
                }

                JobStatus status = parseJobStatus(statusStr);

                if (status == null) {
                    log.warn("Unknown streaming job status, instanceId={}, engineId={}, status={}, resp={}",
                            instanceId, engineId, statusStr, jobInfo);
                    sleepQuietly();
                    continue;
                }

                if (isRunningStatus(status)) {
                    sleepQuietly();
                    continue;
                }

                handleFinalStatus(instanceId, status, jobInfo);
                return;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Streaming REST job result watcher interrupted, instanceId={}, engineId={}",
                    instanceId, engineId, e);
        } catch (Exception e) {
            log.warn("Streaming REST job result watcher failed, instanceId={}, engineId={}",
                    instanceId, engineId, e);

            streamingJobResultHandler.handleFailure(instanceId, e);
        } finally {
            log.info("Streaming REST job result watcher finished, instanceId={}, engineId={}",
                    instanceId, engineId);
        }
    }

    private void handleFinalStatus(Long instanceId,
                                   JobStatus status,
                                   Map jobInfo) {
        if (status == JobStatus.FINISHED) {
            streamingJobResultHandler.handleSuccess(instanceId);
            return;
        }

        if (status == JobStatus.CANCELED) {
            streamingJobResultHandler.handleCanceled(instanceId, readErrorMsg(jobInfo));
            return;
        }

        JobResult jr = new JobResult(JobStatus.FAILED);
        jr.setStatus(status);
        jr.setError(readErrorMsg(jobInfo));

        streamingJobResultHandler.handleFailure(instanceId, jr);
    }

    private boolean isRunningStatus(JobStatus status) {
        return status == JobStatus.RUNNING
                || status == JobStatus.INITIALIZING
                || status == JobStatus.CREATED
                || status == JobStatus.PENDING
                || status == JobStatus.SCHEDULED;
    }

    private void checkTimeout(long start, String engineId) {
        if (pollTimeoutMs <= 0) {
            return;
        }

        long cost = System.currentTimeMillis() - start;
        if (cost > pollTimeoutMs) {
            throw new IllegalStateException("Polling streaming job-info timeout, engineId=" + engineId);
        }
    }

    private String readStatus(Map jobInfo) {
        if (jobInfo == null) {
            return null;
        }

        Object status = jobInfo.get("jobStatus");
        if (status == null) {
            return null;
        }

        String value = String.valueOf(status);
        if (value.trim().isEmpty() || "null".equalsIgnoreCase(value)) {
            return null;
        }

        return value.trim();
    }

    private String readErrorMsg(Map jobInfo) {
        if (jobInfo == null) {
            return null;
        }

        Object errorMsg = jobInfo.get("errorMsg");
        return errorMsg == null ? null : String.valueOf(errorMsg);
    }

    private void sleepQuietly() throws InterruptedException {
        Thread.sleep(pollIntervalMs);
    }

    private JobStatus parseJobStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);

        if ("CANCELLED".equals(normalized)
                || "CANCELED".equals(normalized)
                || "STOPPED".equals(normalized)) {
            return JobStatus.CANCELED;
        }

        if ("CANCELLING".equals(normalized)
                || "CANCELING".equals(normalized)
                || "STOPPING".equals(normalized)) {
            return JobStatus.RUNNING;
        }

        if ("COMPLETED".equals(normalized)
                || "SUCCEEDED".equals(normalized)
                || "SUCCESS".equals(normalized)) {
            return JobStatus.FINISHED;
        }

        try {
            return JobStatus.valueOf(normalized);
        } catch (Exception e) {
            return null;
        }
    }
}