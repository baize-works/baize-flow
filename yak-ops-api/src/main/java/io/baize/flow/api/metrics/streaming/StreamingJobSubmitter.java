package io.baize.flow.api.metrics.streaming;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.api.metrics.JobConfigFileService;
import io.baize.flow.api.metrics.JobFileLogger;
import io.baize.flow.api.metrics.JobRuntimeContext;
import io.baize.flow.common.enums.JobSubmitStage;
import io.baize.flow.common.exception.JobSubmitException;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import io.baize.flow.spi.enums.Status;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@Slf4j
public class StreamingJobSubmitter {

    private static final String JOB_TYPE_STREAMING = "STREAMING";

    private final JobConfigFileService configFileService;
    private final SeaTunnelRestClient restClient;
    private final StreamingJobMetricsMonitor streamingJobMetricsMonitor;
    private final StreamingJobResultWatcher streamingJobResultWatcher;
    private final StreamingJobResultHandler streamingJobResultHandler;

    public StreamingJobSubmitter(JobConfigFileService configFileService,
                                 SeaTunnelRestClient restClient,
                                 StreamingJobMetricsMonitor streamingJobMetricsMonitor,
                                 StreamingJobResultWatcher streamingJobResultWatcher,
                                 StreamingJobResultHandler streamingJobResultHandler) {
        this.configFileService = configFileService;
        this.restClient = restClient;
        this.streamingJobMetricsMonitor = streamingJobMetricsMonitor;
        this.streamingJobResultWatcher = streamingJobResultWatcher;
        this.streamingJobResultHandler = streamingJobResultHandler;
    }

    public void submit(JobInstanceVO instance) {
        submit(instance, StreamingJobSubmitOptions.normal());
    }

    public void submitFromSavepoint(JobInstanceVO instance, String restoreEngineJobId) {
        submit(instance, StreamingJobSubmitOptions.restoreFromSavepoint(restoreEngineJobId));
    }

    public void submit(JobInstanceVO instance, StreamingJobSubmitOptions options) {
        validate(instance);
        validateSubmitOptions(options);

        Long instanceId = instance.getId();
        Long jobDefinitionId = instance.getJobDefinitionId();
        Long clientId = instance.getClientId();

        String hoconConfig = instance.getRuntimeConfig();
        String logPath = instance.getLogPath();

        JobFileLogger jobLogger = new JobFileLogger(logPath);
        jobLogger.info("=== Streaming Job Submit Start (REST API) ===");
        jobLogger.info("Streaming instanceId: " + instanceId);
        jobLogger.info("Streaming definitionId: " + jobDefinitionId);
        jobLogger.info("Client id: " + clientId);
        jobLogger.info("Start with savepoint: " + options.isStartWithSavepoint());
        jobLogger.info("Restore engine job id: " + options.getRestoreEngineJobId());

        String configFile = null;
        String engineId = null;
        boolean submitted = false;

        try {
            jobLogger.info("Writing streaming config file...");
            configFile = configFileService.writeConfig(instanceId, hoconConfig);
            jobLogger.info("Streaming config file written to: " + configFile);

            jobLogger.info("Submitting streaming job via REST API...");
            log.info(
                    "Submitting streaming job to Zeta, instanceId={}, clientId={}, startWithSavepoint={}, restoreEngineJobId={}",
                    instanceId,
                    clientId,
                    options.isStartWithSavepoint(),
                    options.getRestoreEngineJobId()
            );

            String filename = "streaming-job-" + instanceId + ".conf";

            Map<?, ?> resp = restClient.submitJobUpload(
                    clientId,
                    safeConfig(hoconConfig).getBytes(StandardCharsets.UTF_8),
                    filename,
                    options.getEngineJobIdParam(),
                    null,
                    options.isStartWithSavepoint()
            );

            engineId = extractJobId(resp);
            submitted = true;

            log.info("Submit streaming job response received, instanceId={}, resp={}", instanceId, resp);
            jobLogger.info("Submit streaming job response received: " + resp);

            streamingJobResultHandler.updateEngineId(instanceId, engineId);

            JobRuntimeContext ctx = buildRuntimeContext(instance, engineId, configFile);

            registerPostSubmitWatchers(ctx, jobLogger);

            jobLogger.info("=== Streaming Job Submit Complete ===");
        } catch (Exception e) {
            if (submitted) {
                handlePostSubmitFailure(jobLogger, instanceId, engineId, e);
                return;
            }

            handleCoreFailure(jobLogger, instanceId, e);
        } finally {
            jobLogger.close();
        }
    }

    public void pause(JobInstanceVO instance) {
        stop(instance, false);
    }

    public void stopWithSavepoint(JobInstanceVO instance) {
        stop(instance, true);
    }

    public void stop(JobInstanceVO instance, boolean stopWithSavepoint) {
        validateStopInstance(instance);

        Long instanceId = instance.getId();
        Long clientId = instance.getClientId();
        String engineJobId = instance.getEngineJobId();

        log.info(
                "Stopping streaming SeaTunnel job: instanceId={}, clientId={}, engineJobId={}, stopWithSavepoint={}",
                instanceId,
                clientId,
                engineJobId,
                stopWithSavepoint
        );

        Map<?, ?> resp = restClient.stopJob(clientId, engineJobId, stopWithSavepoint);

        log.info(
                "Stop streaming SeaTunnel job response: instanceId={}, clientId={}, engineJobId={}, stopWithSavepoint={}, resp={}",
                instanceId,
                clientId,
                engineJobId,
                stopWithSavepoint,
                resp
        );
    }

    private void registerPostSubmitWatchers(JobRuntimeContext ctx,
                                            JobFileLogger jobLogger) {
        boolean metricsRegistered = false;
        boolean watcherRegistered = false;

        try {
            streamingJobMetricsMonitor.register(ctx);
            metricsRegistered = true;
            jobLogger.info("Streaming metrics monitor registered");

            log.info("Streaming metrics monitor registered, instanceId={}, engineId={}",
                    ctx.getInstanceId(), ctx.getEngineId());
        } catch (Exception e) {
            jobLogger.warn("Streaming metrics monitor register failed: " + e.getMessage());

            log.warn("Streaming metrics monitor register failed, instanceId={}, engineId={}",
                    ctx.getInstanceId(), ctx.getEngineId(), e);
        }

        try {
            streamingJobResultWatcher.registerByRest(ctx);
            watcherRegistered = true;
            jobLogger.info("Streaming REST result watcher registered");
        } catch (Exception e) {
            jobLogger.warn("Streaming result watcher register failed: " + e.getMessage());

            log.warn("Streaming result watcher register failed, instanceId={}, engineId={}",
                    ctx.getInstanceId(), ctx.getEngineId(), e);
        }

        if (!metricsRegistered || !watcherRegistered) {
            jobLogger.warn(
                    "Streaming post-submit watcher registration incomplete. " +
                            "The job has already been submitted to SeaTunnel Engine. " +
                            "metricsRegistered=" + metricsRegistered +
                            ", watcherRegistered=" + watcherRegistered
            );
        }
    }

    private JobRuntimeContext buildRuntimeContext(JobInstanceVO instance,
                                                  String engineId,
                                                  String configFile) {
        JobRuntimeContext ctx = new JobRuntimeContext();

        ctx.setInstanceId(instance.getId());
        ctx.setJobDefinitionId(instance.getJobDefinitionId());
        ctx.setClientId(instance.getClientId());
        ctx.setEngineId(engineId);
        ctx.setConfigFile(configFile);
        ctx.setJobType(JOB_TYPE_STREAMING);

        return ctx;
    }

    private void handleCoreFailure(JobFileLogger jobLogger,
                                   Long instanceId,
                                   Exception e) {
        jobLogger.error("Streaming job submit failed before engine accepted the job", e);

        try {
            streamingJobResultHandler.handleFailure(instanceId, e);
        } catch (Exception handlerEx) {
            log.error("Streaming handleFailure threw exception, instanceId={}", instanceId, handlerEx);
        }

        throw (e instanceof JobSubmitException)
                ? (JobSubmitException) e
                : new JobSubmitException(JobSubmitStage.SUBMIT, "Submit streaming job failed", e);
    }

    private void handlePostSubmitFailure(JobFileLogger jobLogger,
                                         Long instanceId,
                                         String engineId,
                                         Exception e) {
        jobLogger.error(
                "Streaming job was submitted to SeaTunnel Engine, but post-submit handling failed. " +
                        "instanceId=" + instanceId + ", engineId=" + engineId,
                e
        );

        log.warn("Streaming post-submit handling failed after job accepted by engine, instanceId={}, engineId={}",
                instanceId, engineId, e);
    }

    private String extractJobId(Map<?, ?> resp) {
        Object jobIdObj = resp == null ? null : resp.get("jobId");

        if (jobIdObj == null) {
            throw new IllegalStateException("REST submit response missing jobId, resp=" + resp);
        }

        return jobIdObj.toString();
    }

    private void validate(JobInstanceVO instance) {
        if (instance == null) {
            throw new IllegalArgumentException("Streaming job instance must not be null");
        }

        if (instance.getId() == null) {
            throw new IllegalArgumentException("Streaming job instance id must not be null");
        }

        if (instance.getClientId() == null || instance.getClientId() <= 0) {
            throw new IllegalArgumentException("Streaming job client id must not be null");
        }

        if (StringUtils.isBlank(instance.getLogPath())) {
            throw new IllegalArgumentException("Streaming job log path must not be blank");
        }

        if (StringUtils.isBlank(instance.getRuntimeConfig())) {
            throw new IllegalArgumentException("Streaming job runtime config must not be blank");
        }
    }

    private void validateSubmitOptions(StreamingJobSubmitOptions options) {
        if (options == null) {
            throw new IllegalArgumentException("Streaming submit options must not be null");
        }

        if (options.isStartWithSavepoint()
                && (options.getRestoreEngineJobId() == null)) {
            throw new IllegalArgumentException("restoreEngineJobId must be positive when startWithSavepoint is true");
        }
    }

    private void validateStopInstance(JobInstanceVO instance) {
        if (instance == null || instance.getId() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobInstance");
        }

        if (instance.getClientId() == null || instance.getClientId() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "clientId");
        }

        if (instance.getEngineJobId() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "engineJobId");
        }
    }

    private String safeConfig(String config) {
        return config == null ? "" : config;
    }
}