package io.baize.flow.api.client.scheduler;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.metrics.JobResultHandler;
import io.baize.flow.api.metrics.JobRuntimeContext;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.dao.entity.JobInstance;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.dao.repository.JobInstanceDao;
import io.baize.flow.dao.repository.StreamingJobInstanceDao;
import io.baize.flow.engine.client.handler.ZetaJobStatusHandler;
import io.baize.flow.engine.client.modal.ZetaJobStatusResolveResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Recover local job instance status after Baize Flow restart.
 *
 * <p>
 * When Baize Flow is stopped or restarted, in-memory watchers are lost.
 * Some local job instances may remain RUNNING even though the corresponding
 * Zeta job has already finished.
 * </p>
 */
@Slf4j
@Component
public class JobInstanceRecoveryScheduler {

    private static final String JOB_TYPE_BATCH = "BATCH";

    @Resource
    private JobInstanceDao jobInstanceDao;

    @Resource
    private StreamingJobInstanceDao streamingJobInstanceDao;

    @Resource
    private ZetaJobStatusHandler zetaJobStatusHandler;

    @Resource
    private JobResultHandler jobResultHandler;

    @Value("${seatunnel.job.recovery.enabled:true}")
    private boolean enabled;

    @EventListener(ApplicationReadyEvent.class)
    public void recoverOnStartup() {
        if (!enabled) {
            return;
        }

        log.info("Start recovering running job instances after Baize Flow startup");

        recoverBatchInstances();
        recoverStreamingInstances();

        log.info("Recover running job instances after Baize Flow startup finished");
    }

    @Scheduled(
            initialDelayString = "${seatunnel.job.recovery.initial-delay-ms:60000}",
            fixedDelayString = "${seatunnel.job.recovery.fixed-delay-ms:60000}"
    )
    public void recoverPeriodically() {
        if (!enabled) {
            return;
        }

        recoverBatchInstances();
        recoverStreamingInstances();
    }

    private void recoverBatchInstances() {
        List<JobInstance> instances = jobInstanceDao.listRunningLikeInstances();
        if (instances == null || instances.isEmpty()) {
            return;
        }

        log.info("Start recovering batch running-like instances, count={}", instances.size());

        for (JobInstance instance : instances) {
            try {
                recoverBatchInstance(instance);
            } catch (Exception e) {
                log.warn(
                        "Recover batch job instance failed, instanceId={}, engineJobId={}",
                        instance == null ? null : instance.getId(),
                        instance == null ? null : instance.getEngineJobId(),
                        e
                );
            }
        }
    }

    private void recoverStreamingInstances() {
        List<StreamingJobInstance> instances = streamingJobInstanceDao.listRunningLikeInstances();
        if (instances == null || instances.isEmpty()) {
            return;
        }

        log.info("Start recovering streaming running-like instances, count={}", instances.size());

        for (StreamingJobInstance instance : instances) {
            try {
                recoverStreamingInstance(instance);
            } catch (Exception e) {
                log.warn(
                        "Recover streaming job instance failed, instanceId={}, engineJobId={}",
                        instance == null ? null : instance.getId(),
                        instance == null ? null : instance.getEngineJobId(),
                        e
                );
            }
        }
    }

    private void recoverBatchInstance(JobInstance instance) {
        if (instance == null || instance.getId() == null) {
            return;
        }

        ZetaJobStatusResolveResult result = zetaJobStatusHandler.resolve(
                instance.getClientId(),
                instance.getEngineJobId()
        );

        if (shouldSkipRecovery(instance.getId(), instance.getEngineJobId(), result)) {
            return;
        }

        JobStatus targetStatus = result.getLocalStatus();

        String errorMessage = buildRecoveryMessage(
                instance.getId(),
                instance.getEngineJobId(),
                result
        );

        log.warn(
                "Recover batch job instance final status, instanceId={}, engineJobId={}, targetStatus={}, engineStatus={}, message={}",
                instance.getId(),
                instance.getEngineJobId(),
                targetStatus,
                result.getEngineStatus(),
                result.getMessage()
        );

        JobRuntimeContext context = buildBatchRuntimeContext(instance);

        /*
         * Important:
         * Recovery must use context mode.
         *
         * Because Baize Flow has restarted, JobMetricsMonitor.monitoringJobs is empty.
         * If we only pass instanceId, metrics finalization cannot find runtime context.
         */
        jobResultHandler.handleFinalStatus(
                context,
                targetStatus,
                errorMessage
        );
    }

    private void recoverStreamingInstance(StreamingJobInstance instance) {
        if (instance == null || instance.getId() == null) {
            return;
        }

        ZetaJobStatusResolveResult result = zetaJobStatusHandler.resolve(
                instance.getClientId(),
                instance.getEngineJobId()
        );

        if (shouldSkipRecovery(instance.getId(), instance.getEngineJobId(), result)) {
            return;
        }

        JobStatus targetStatus = result.getLocalStatus();

        String errorMessage = buildRecoveryMessage(
                instance.getId(),
                instance.getEngineJobId(),
                result
        );

        log.warn(
                "Recover streaming job instance final status, instanceId={}, engineJobId={}, targetStatus={}, engineStatus={}, message={}",
                instance.getId(),
                instance.getEngineJobId(),
                targetStatus,
                result.getEngineStatus(),
                result.getMessage()
        );

        streamingJobInstanceDao.updateStatus(
                instance.getId(),
                targetStatus,
                errorMessage
        );
    }

    private JobRuntimeContext buildBatchRuntimeContext(JobInstance instance) {
        JobRuntimeContext context = new JobRuntimeContext();

        context.setInstanceId(instance.getId());
        context.setJobDefinitionId(instance.getJobDefinitionId());
        context.setClientId(instance.getClientId());
        context.setEngineId(instance.getEngineJobId());
        context.setJobType(JOB_TYPE_BATCH);

        /*
         * Recovery 场景下 configFile 可以为空。
         * finalize metrics 主要依赖 instanceId、definitionId、clientId、engineId。
         */
        context.setConfigFile(null);

        return context;
    }

    private boolean shouldSkipRecovery(Long instanceId,
                                       String engineJobId,
                                       ZetaJobStatusResolveResult result) {
        if (result == null) {
            log.warn(
                    "Skip recovering job instance because Zeta resolve result is null, instanceId={}, engineJobId={}",
                    instanceId,
                    engineJobId
            );
            return true;
        }

        if (result.isRunning()) {
            log.debug(
                    "Skip recovering job instance because Zeta job is still running, instanceId={}, engineJobId={}, engineStatus={}",
                    instanceId,
                    engineJobId,
                    result.getEngineStatus()
            );
            return true;
        }

        JobStatus localStatus = result.getLocalStatus();

        if (localStatus == null) {
            log.warn(
                    "Skip recovering job instance because local status is null, instanceId={}, engineJobId={}, message={}",
                    instanceId,
                    engineJobId,
                    result.getMessage()
            );
            return true;
        }

        if (JobStatus.UNKNOWABLE.equals(localStatus)) {
            log.warn(
                    "Skip recovering job instance because Zeta status is unknown, instanceId={}, engineJobId={}, message={}",
                    instanceId,
                    engineJobId,
                    result.getMessage()
            );
            return true;
        }

        if (!localStatus.isEndState()) {
            log.debug(
                    "Skip recovering job instance because target status is not end state, instanceId={}, engineJobId={}, targetStatus={}",
                    instanceId,
                    engineJobId,
                    localStatus
            );
            return true;
        }

        return false;
    }

    private String buildRecoveryMessage(Long instanceId,
                                        String engineJobId,
                                        ZetaJobStatusResolveResult result) {
        if (result == null) {
            return "Baize Flow 重启后执行任务状态恢复失败，Zeta 状态解析结果为空。"
                    + " instanceId=" + instanceId
                    + ", engineJobId=" + engineJobId
                    + ", recoveryTime=" + new Date();
        }

        if (JobStatus.FINISHED.equals(result.getLocalStatus())) {
            return null;
        }

        StringBuilder builder = new StringBuilder();

        builder.append("Baize Flow 重启后执行任务状态恢复，发现该实例已不再处于 Zeta 运行中状态，已自动补偿本地状态。")
                .append(" instanceId=").append(instanceId)
                .append(", engineJobId=").append(engineJobId)
                .append(", engineStatus=").append(safe(result.getEngineStatus()))
                .append(", reason=").append(safe(result.getMessage()));

        if (result.getErrorMessage() != null && !result.getErrorMessage().trim().isEmpty()) {
            builder.append(", engineError=").append(result.getErrorMessage());
        }

        builder.append(", recoveryTime=").append(new Date());

        return builder.toString();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}