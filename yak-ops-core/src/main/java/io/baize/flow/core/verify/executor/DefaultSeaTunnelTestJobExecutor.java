package io.baize.flow.core.verify.executor;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.domain.enums.JobStatus;
import io.baize.flow.core.verify.job.ConnectivityTestJob;
import io.baize.flow.dao.entity.SeaTunnelClient;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@SuppressWarnings("rawtypes")
public class DefaultSeaTunnelTestJobExecutor implements SeaTunnelTestJobExecutor {

    @Resource
    private SeaTunnelRestClient seaTunnelRestClient;

    @Resource
    private ConnectivityJobStatusRules statusRules;

    @Resource
    private SeaTunnelJobResponseParser responseParser;

    @Override
    public JobExecutionResult executeAndWait(
            SeaTunnelClient client,
            ConnectivityTestJob job,
            long timeoutMs,
            long pollIntervalMs) {

        long start = System.currentTimeMillis();
        String jobId = null;
        JobExecutionResult result = new JobExecutionResult();

        try {
            jobId = submitTestJob(client, job);
            result.setJobId(jobId);

            if (jobId == null) {
                return buildSubmitFailedResult(result, start);
            }

            JobStatus observedStatus = waitForVerificationPhase(
                    client.getId(),
                    jobId,
                    timeoutMs,
                    pollIntervalMs
            );

            result.setFinalStatus(observedStatus == null ? "TIMEOUT" : observedStatus.name());

            if (observedStatus == null) {
                return handleTimeout(result, client, job, jobId, start, pollIntervalMs, timeoutMs);
            }

            if (statusRules.isVerifyFail(observedStatus)) {
                return handleVerifyFail(result, client, jobId, start);
            }

            if (statusRules.isVerifySuccess(observedStatus)) {
                return handleVerifySuccess(
                        result,
                        client,
                        job,
                        jobId,
                        observedStatus,
                        start,
                        timeoutMs,
                        pollIntervalMs
                );
            }

            result.setSuccess(false);
            result.setErrorMessage("Unexpected job status: " + observedStatus.name());
            result.setDurationMs(System.currentTimeMillis() - start);
            return result;

        } catch (Exception e) {
            log.error("Execute connectivity test job failed: clientId={}, jobId={}, jobName={}",
                    client.getId(), jobId, job.getJobName(), e);

            result.setSuccess(false);
            result.setErrorMessage(simplifyMessage(e));
            result.setDurationMs(System.currentTimeMillis() - start);

            if (jobId != null && job.isCleanupRequired()) {
                tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);
            }
            return result;
        }
    }

    /** Submit the test job and parse its jobId. */
    private String submitTestJob(SeaTunnelClient client, ConnectivityTestJob job) {
        Map submitResponse = seaTunnelRestClient.submitJobText(
                client.getId(),
                job.getJobConfig(),
                job.getConfigFormat(),
                null,
                job.getJobName(),
                false
        );
        return responseParser.extractJobId(submitResponse);
    }

    /** Build a result for submit failure. */
    private JobExecutionResult buildSubmitFailedResult(JobExecutionResult result, long start) {
        result.setSuccess(false);
        result.setFinalStatus("SUBMIT_FAILED");
        result.setErrorMessage("Failed to extract jobId from submit response");
        result.setDurationMs(System.currentTimeMillis() - start);
        return result;
    }

    /** Handle timeout and try cleanup if needed. */
    private JobExecutionResult handleTimeout(
            JobExecutionResult result,
            SeaTunnelClient client,
            ConnectivityTestJob job,
            String jobId,
            long start,
            long pollIntervalMs,
            long timeoutMs) {

        result.setSuccess(false);
        result.setErrorMessage("The test job did not reach a verifiable state within the timeout");
        result.setDurationMs(System.currentTimeMillis() - start);

        if (job.isCleanupRequired()) {
            tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);
        }
        return result;
    }

    /** Handle verification failure and attach raw log. */
    private JobExecutionResult handleVerifyFail(
            JobExecutionResult result,
            SeaTunnelClient client,
            String jobId,
            long start) {

        result.setSuccess(false);
        result.setRawLog(tryReadLog(client.getId(), jobId));
        result.setDurationMs(System.currentTimeMillis() - start);
        return result;
    }

    /** Handle verification success and stop the job if cleanup is required. */
    private JobExecutionResult handleVerifySuccess(
            JobExecutionResult result,
            SeaTunnelClient client,
            ConnectivityTestJob job,
            String jobId,
            JobStatus observedStatus,
            long start,
            long timeoutMs,
            long pollIntervalMs) throws InterruptedException {

        if (job.isCleanupRequired() && statusRules.isActive(observedStatus)) {
            stopJobQuietly(client.getId(), jobId);

            JobStatus terminalStatus = waitForTerminalAfterStop(
                    client.getId(),
                    jobId,
                    timeoutMs / 2,
                    pollIntervalMs
            );

            if (terminalStatus != null) {
                result.setFinalStatus(terminalStatus.name());
            } else {
                result.setFinalStatus("STOPPING_TIMEOUT");
            }
        }

        result.setSuccess(true);
        result.setDurationMs(System.currentTimeMillis() - start);
        return result;
    }

    /** Wait until the job reaches a verifiable status. */
    private JobStatus waitForVerificationPhase(
            Long clientId,
            String jobId,
            long timeoutMs,
            long pollIntervalMs) throws InterruptedException {

        return pollStatusUntil(clientId, jobId, timeoutMs, pollIntervalMs, new StatusStopCondition() {
            @Override
            public boolean shouldStop(JobStatus status) {
                return statusRules.isVerifiable(status);
            }
        });
    }

    /** Wait until the job reaches a terminal status after stop. */
    private JobStatus waitForTerminalAfterStop(
            Long clientId,
            String jobId,
            long timeoutMs,
            long pollIntervalMs) throws InterruptedException {

        return pollStatusUntil(clientId, jobId, timeoutMs, pollIntervalMs, new StatusStopCondition() {
            @Override
            public boolean shouldStop(JobStatus status) {
                return statusRules.isTerminal(status);
            }
        });
    }

    /** Poll job status until the stop condition is met or timeout occurs. */
    private JobStatus pollStatusUntil(
            Long clientId,
            String jobId,
            long timeoutMs,
            long pollIntervalMs,
            StatusStopCondition stopCondition) throws InterruptedException {

        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            JobStatus status = queryJobStatus(clientId, jobId);
            if (status != null && stopCondition.shouldStop(status)) {
                return status;
            }
            Thread.sleep(pollIntervalMs);
        }
        return null;
    }

    /** Stop the job and wait for terminal status quietly. */
    private void tryCleanupAndWaitTerminal(
            Long clientId,
            String jobId,
            long pollIntervalMs,
            long timeoutMs) {
        if (jobId == null) {
            return;
        }

        try {
            stopJobQuietly(clientId, jobId);
            waitForTerminalAfterStop(clientId, jobId, timeoutMs, pollIntervalMs);
        } catch (Exception e) {
            log.warn("Cleanup connectivity test job failed: clientId={}, jobId={}", clientId, jobId, e);
        }
    }

    /** Query current job status with detail-first and list-based fallback. */
    private JobStatus queryJobStatus(Long clientId, String jobId) {
        try {
            Map info = seaTunnelRestClient.jobInfo(clientId, jobId);
            JobStatus status = responseParser.extractStatus(info);
            if (status != null) {
                return status;
            }
        } catch (Exception ignored) {
        }

        try {
            List running = seaTunnelRestClient.runningJobs(clientId);
            if (responseParser.containsJob(running, jobId)) {
                return JobStatus.RUNNING;
            }
        } catch (Exception ignored) {
        }

        try {
            List finished = seaTunnelRestClient.finishedJobs(clientId, "FINISHED");
            if (responseParser.containsJob(finished, jobId)) {
                return JobStatus.FINISHED;
            }
        } catch (Exception ignored) {
        }

        try {
            List failed = seaTunnelRestClient.finishedJobs(clientId, "FAILED");
            if (responseParser.containsJob(failed, jobId)) {
                return JobStatus.FAILED;
            }
        } catch (Exception ignored) {
        }

        try {
            List canceled = seaTunnelRestClient.finishedJobs(clientId, "CANCELED");
            if (responseParser.containsJob(canceled, jobId)) {
                return JobStatus.CANCELED;
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    /** Try to stop the job without interrupting the main flow. */
    private void stopJobQuietly(Long clientId, String jobId) {
        if (jobId == null) {
            return;
        }

        try {
            seaTunnelRestClient.stopJob(clientId, jobId, false);
            log.info("Stop requested for test job: clientId={}, jobId={}", clientId, jobId);
        } catch (Exception e) {
            log.warn("Stop test job failed: clientId={}, jobId={}", clientId, jobId, e);
        }
    }

    /** Read job log for troubleshooting when possible. */
    private String tryReadLog(Long clientId, String jobId) {
        try {
            Object logObj = seaTunnelRestClient.logs(clientId, jobId, "TEXT");
            return logObj == null ? null : String.valueOf(logObj);
        } catch (Exception e) {
            log.warn("Read test job log failed: clientId={}, jobId={}", clientId, jobId, e);
            return null;
        }
    }

    /** Convert exception to a simple readable message. */
    private String simplifyMessage(Throwable e) {
        String msg = e.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            return e.getClass().getSimpleName();
        }
        return msg;
    }

    /** Callback used to decide when polling should stop. */
    private interface StatusStopCondition {
        boolean shouldStop(JobStatus status);
    }
}