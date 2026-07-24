package io.baize.flow.api.metrics.streaming;

import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.api.utils.JobUtils;
import io.baize.flow.common.enums.JobResult;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@Slf4j
public class StreamingJobResultHandler {

    private final StreamingJobInstanceService streamingJobInstanceService;
    private final StreamingJobMetricsMonitor streamingJobMetricsMonitor;

    public StreamingJobResultHandler(StreamingJobInstanceService streamingJobInstanceService,
                                     StreamingJobMetricsMonitor streamingJobMetricsMonitor) {
        this.streamingJobInstanceService = streamingJobInstanceService;
        this.streamingJobMetricsMonitor = streamingJobMetricsMonitor;
    }

    public void handleSuccess(Long jobInstanceId) {
        updateStatus(jobInstanceId, JobStatus.FINISHED, null);
        log.info("Streaming job completed successfully. instanceId={}", jobInstanceId);
    }

    public void handleCanceled(Long jobInstanceId, String message) {
        String finalMessage = message == null || message.trim().isEmpty()
                ? "Streaming job was canceled."
                : message;

        updateStatus(jobInstanceId, JobStatus.CANCELED, finalMessage);
        log.info("Streaming job canceled. instanceId={}, message={}", jobInstanceId, finalMessage);
    }

    public void handleFailure(Long jobInstanceId, Throwable error) {
        if (shouldSkipFailureOverwrite(jobInstanceId)) {
            log.info("Skip failure overwrite because streaming job is already finished. instanceId={}", jobInstanceId);
            return;
        }

        String message = error == null
                ? "Unknown error"
                : JobUtils.getJobInstanceErrorMessage(error.getMessage());

        updateStatus(jobInstanceId, JobStatus.FAILED, message);
        log.error("Streaming job failed. instanceId={}, error={}", jobInstanceId, message, error);
    }

    public void handleFailure(Long jobInstanceId, JobResult jobResult) {
        JobStatus realStatus = jobResult == null ? null : jobResult.getStatus();

        if (realStatus == JobStatus.FINISHED) {
            handleSuccess(jobInstanceId);
            return;
        }

        if (realStatus == JobStatus.CANCELED) {
            handleCanceled(jobInstanceId, jobResult.getError());
            return;
        }

        if (shouldSkipFailureOverwrite(jobInstanceId)) {
            log.info("Skip failure overwrite because streaming job is already finished. instanceId={}, engineStatus={}",
                    jobInstanceId, realStatus);
            return;
        }

        String message = jobResult != null ? jobResult.getError() : "Unknown error";

        updateStatus(jobInstanceId, JobStatus.FAILED, message);

        log.error(
                "Streaming job failed. instanceId={}, status={}, error={}",
                jobInstanceId,
                realStatus,
                message
        );
    }

    public void updateEngineId(Long instanceId, String engineId) {
        StreamingJobInstance po = new StreamingJobInstance();
        po.setId(instanceId);
        po.setEngineJobId(engineId);
        po.setSubmitTime(new Date());
        po.setStartTime(new Date());
        po.setJobStatus(JobStatus.RUNNING);

        streamingJobInstanceService.updateById(po);

        log.info("Streaming job submitted. instanceId={}, engineId={}", instanceId, engineId);
    }

    private void updateStatus(Long jobInstanceId, JobStatus status, String errorMessage) {
        StreamingJobInstance po = new StreamingJobInstance();
        po.setId(jobInstanceId);
        po.setJobStatus(status);
        po.setEndTime(new Date());
        po.setErrorMessage(errorMessage);

        streamingJobInstanceService.updateById(po);

        streamingJobMetricsMonitor.finalizeAndPersist(jobInstanceId, status.name());
    }

    private boolean shouldSkipFailureOverwrite(Long jobInstanceId) {
        JobInstanceVO current = streamingJobInstanceService.selectById(jobInstanceId);
        if (current == null || current.getJobStatus() == null) {
            return false;
        }

        String currentStatus = current.getJobStatus();

        return "FINISHED".equalsIgnoreCase(currentStatus)
                || "CANCELED".equalsIgnoreCase(currentStatus)
                || "CANCELLED".equalsIgnoreCase(currentStatus)
                || "STOPPED".equalsIgnoreCase(currentStatus);
    }
}