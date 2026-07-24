package io.baize.flow.api.metrics.streaming;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.metrics.JobFileLogger;
import io.baize.flow.api.metrics.JobRuntimeContext;
import io.baize.flow.api.metrics.streaming.model.StreamingParsedJobMetrics;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.api.service.StreamingJobMetricsService;
import io.baize.flow.api.websocket.WorkflowWebSocketService;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class StreamingJobMetricsMonitor {

    private final Map<Long, JobRuntimeContext> monitoringJobs = new ConcurrentHashMap<>();

    private final Map<Long, MonitorState> monitorStates = new ConcurrentHashMap<>();

    private final Map<Long, JobFileLogger> loggers = new ConcurrentHashMap<>();

    @Value("${seatunnel.streaming.metrics.max-empty-times:30}")
    private int maxEmptyTimes;

    @Value("${seatunnel.streaming.metrics.max-error-times:30}")
    private int maxErrorTimes;

    @Value("${seatunnel.streaming.metrics.log-every-times:10}")
    private int logEveryTimes;

    @Resource
    private StreamingJobMetricsService streamingJobMetricsService;

    @Resource
    private StreamingJobInstanceService streamingJobInstanceService;

    @Resource
    private WorkflowWebSocketService webSocketService;

    @PostConstruct
    public void restoreRunningStreamingJobs() {
        try {
            List<JobInstanceVO> runningInstances =
                    streamingJobInstanceService.listRunningStreamingInstances();

            if (runningInstances == null || runningInstances.isEmpty()) {
                log.info("No running streaming jobs need to restore metrics monitor.");
                return;
            }

            for (JobInstanceVO instance : runningInstances) {
                if (instance.getId() == null
                        || instance.getJobDefinitionId() == null
                        || instance.getClientId() == null
                        || instance.getEngineJobId() == null) {
                    log.warn(
                            "Skip restore streaming metrics monitor because required field is missing, instance={}",
                            instance
                    );
                    continue;
                }

                JobRuntimeContext context = new JobRuntimeContext();
                context.setInstanceId(instance.getId());
                context.setJobDefinitionId(instance.getJobDefinitionId());
                context.setClientId(instance.getClientId());
                context.setEngineId(instance.getEngineJobId());
                context.setJobType(JobMode.STREAMING.getCode());

                register(context);

                log.info(
                        "Restore streaming metrics monitor success, instanceId={}, engineJobId={}",
                        instance.getId(),
                        instance.getEngineJobId()
                );
            }
        } catch (Exception e) {
            log.error("Restore running streaming metrics monitor failed.", e);
        }
    }


    public void register(JobRuntimeContext context) {
        if (context == null || context.getInstanceId() == null) {
            return;
        }

        Long instanceId = context.getInstanceId();

        monitoringJobs.put(instanceId, context);
        monitorStates.put(instanceId, MonitorState.create());

        try {
            JobInstanceVO instance = streamingJobInstanceService.selectById(instanceId);
            if (instance != null && instance.getLogPath() != null) {
                loggers.put(instanceId, new JobFileLogger(instance.getLogPath()));
            }
        } catch (Exception e) {
            log.warn("Create streaming metrics logger failed, instanceId={}", instanceId, e);
        }

        log.info("Streaming metrics monitor registered, instanceId={}, engineId={}",
                instanceId, context.getEngineId());
    }

    @Scheduled(fixedDelayString = "${seatunnel.streaming.metrics.interval-ms:5000}")
    public void pollAll() {
        if (monitoringJobs.isEmpty()) {
            return;
        }

        monitoringJobs.forEach((instanceId, context) -> {
            try {
                pollSingle(instanceId, context);
            } catch (Exception e) {
                handleFetchError(instanceId, context, e);
            }
        });
    }

    private void pollSingle(Long instanceId, JobRuntimeContext context) {
        MonitorState state = monitorStates.computeIfAbsent(instanceId, key -> MonitorState.create());

        StreamingParsedJobMetrics parsed =
                streamingJobMetricsService.getRealtimeMetricsFromEngine(
                        context.getClientId(),
                        context.getEngineId()
                );

        if (parsed == null || parsed.isEmpty()) {
            handleEmptyMetrics(instanceId, context, state);
            return;
        }

        state.setPollTimes(state.getPollTimes() + 1);
        state.setEmptyTimes(0);
        state.setErrorTimes(0);

        streamingJobMetricsService.saveSnapshot(
                context.getInstanceId(),
                context.getJobDefinitionId(),
                context.getClientId(),
                context.getEngineId(),
                parsed
        );

        writeLogIfNecessary(instanceId, parsed, state);

        webSocketService.sendMessage(
                buildChannel(instanceId, context.getEngineId()),
                buildPayload(instanceId, context.getEngineId(), parsed)
        );
    }

    public void cleanup(Long instanceId) {
        monitoringJobs.remove(instanceId);
        monitorStates.remove(instanceId);

        JobFileLogger logger = loggers.remove(instanceId);
        if (logger != null) {
            try {
                logger.close();
            } catch (Exception e) {
                log.warn("Close streaming metrics logger failed, instanceId={}", instanceId, e);
            }
        }

        log.info("Streaming metrics monitor cleaned, instanceId={}", instanceId);
    }

    public void finalizeAndPersist(Long instanceId, String finalStatus) {
        JobRuntimeContext context = monitoringJobs.get(instanceId);

        if (context == null) {
            log.warn("Streaming metrics monitor context not found when finalizing, instanceId={}", instanceId);
            cleanup(instanceId);
            return;
        }

        try {
            StreamingParsedJobMetrics parsed =
                    streamingJobMetricsService.getRealtimeMetricsFromEngine(
                            context.getClientId(),
                            context.getEngineId()
                    );

            if (parsed != null && !parsed.isEmpty()) {
                streamingJobMetricsService.saveSnapshot(
                        context.getInstanceId(),
                        context.getJobDefinitionId(),
                        context.getClientId(),
                        context.getEngineId(),
                        parsed
                );

                JobFileLogger logger = loggers.get(instanceId);
                if (logger != null) {
                    logger.info("Final Streaming Metrics Snapshot: " + parsed);
                }

                log.info("Final streaming metrics persisted, instanceId={}, engineId={}, status={}",
                        instanceId, context.getEngineId(), finalStatus);
            }

            sendFinalEvent(instanceId, context.getEngineId(), finalStatus);
        } catch (Exception e) {
            log.warn("Failed to finalize streaming metrics, instanceId={}", instanceId, e);

            if (context.getEngineId() != null) {
                sendFinalEvent(instanceId, context.getEngineId(), "FAILED");
            }
        } finally {
            cleanup(instanceId);
        }
    }

    public void finalizeAndPersist(Long instanceId) {
        finalizeAndPersist(instanceId, "FINISHED");
    }

    private void handleEmptyMetrics(Long instanceId, JobRuntimeContext context, MonitorState state) {
        state.setEmptyTimes(state.getEmptyTimes() + 1);

        if (state.getEmptyTimes() == 1 || state.getEmptyTimes() % 10 == 0) {
            log.warn("Streaming metrics empty, instanceId={}, engineId={}, emptyTimes={}",
                    instanceId, context.getEngineId(), state.getEmptyTimes());
        }

        if (maxEmptyTimes > 0 && state.getEmptyTimes() >= maxEmptyTimes) {
            sendFinalEvent(instanceId, context.getEngineId(), "METRICS_EMPTY_TIMEOUT");
            cleanup(instanceId);
        }
    }

    private void handleFetchError(Long instanceId, JobRuntimeContext context, Exception e) {
        MonitorState state = monitorStates.computeIfAbsent(instanceId, key -> MonitorState.create());
        state.setErrorTimes(state.getErrorTimes() + 1);

        if (state.getErrorTimes() == 1 || state.getErrorTimes() % 10 == 0) {
            log.warn("Fetch streaming metrics failed, instanceId={}, engineId={}, errorTimes={}",
                    instanceId, context.getEngineId(), state.getErrorTimes(), e);
        }

        if (maxErrorTimes > 0 && state.getErrorTimes() >= maxErrorTimes) {
            sendFinalEvent(instanceId, context.getEngineId(), "METRICS_FETCH_FAILED");
            cleanup(instanceId);
        }
    }

    private void writeLogIfNecessary(Long instanceId,
                                     StreamingParsedJobMetrics parsed,
                                     MonitorState state) {
        JobFileLogger logger = loggers.get(instanceId);
        if (logger == null) {
            return;
        }

        long pollTimes = state.getPollTimes();
        boolean shouldWrite = logEveryTimes <= 1 || pollTimes == 1 || pollTimes % logEveryTimes == 0;
        if (!shouldWrite) {
            return;
        }

        logger.info("Streaming Metrics Snapshot: " + parsed);
    }

    private void sendFinalEvent(Long instanceId, String engineId, String status) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "JOB_STATUS");
        message.put("instanceId", instanceId);
        message.put("engineId", engineId);
        message.put("status", status);
        message.put("timestamp", Instant.now().toEpochMilli());

        webSocketService.sendMessage(buildChannel(instanceId, engineId), message);
    }

    private Map<String, Object> buildPayload(Long instanceId,
                                             String engineId,
                                             StreamingParsedJobMetrics parsed) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "STREAMING_METRICS");
        message.put("instanceId", instanceId);
        message.put("engineId", engineId);
        message.put("jobStatus", parsed.getJobStatus());
        message.put("pipelineMetrics", parsed.getPipelineMetrics());
        message.put("tableMetrics", parsed.getTableMetrics());
        message.put("timestamp", parsed.getCollectTimeMs() == null ? Instant.now().toEpochMilli() : parsed.getCollectTimeMs());
        return message;
    }

    private String buildChannel(Long instanceId, String engineId) {
        return "streaming-job-" + instanceId + "-" + engineId;
    }

    @Data
    private static class MonitorState {

        private long startTime;

        private long pollTimes;

        private int emptyTimes;

        private int errorTimes;

        static MonitorState create() {
            MonitorState state = new MonitorState();
            state.setStartTime(System.currentTimeMillis());
            return state;
        }
    }
}