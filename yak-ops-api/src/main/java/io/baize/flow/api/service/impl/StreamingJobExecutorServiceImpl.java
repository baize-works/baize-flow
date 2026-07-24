package io.baize.flow.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.api.metrics.streaming.StreamingJobSubmitter;
import io.baize.flow.api.service.StreamingJobExecutorService;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.common.enums.RunMode;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.engine.client.handler.ZetaJobStatusHandler;
import io.baize.flow.engine.client.modal.ZetaJobStatusResolveResult;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import io.baize.flow.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@Slf4j
public class StreamingJobExecutorServiceImpl implements StreamingJobExecutorService {

    private static final String ZETA_SAVEPOINT_TOKEN_PREFIX = "zeta://savepoint/job/";

    private final StreamingJobInstanceService streamingJobInstanceService;
    private final StreamingJobDefinitionQueryService streamingJobDefinitionQueryService;
    private final StreamingJobSubmitter streamingJobSubmitter;
    private final ZetaJobStatusHandler zetaJobStatusHandler;

    public StreamingJobExecutorServiceImpl(StreamingJobInstanceService streamingJobInstanceService,
                                           StreamingJobDefinitionQueryService streamingJobDefinitionQueryService,
                                           StreamingJobSubmitter streamingJobSubmitter,
                                           ZetaJobStatusHandler zetaJobStatusHandler) {
        this.streamingJobInstanceService = streamingJobInstanceService;
        this.streamingJobDefinitionQueryService = streamingJobDefinitionQueryService;
        this.streamingJobSubmitter = streamingJobSubmitter;
        this.zetaJobStatusHandler = zetaJobStatusHandler;
    }

    @Override
    public Long jobExecute(Long jobDefineId, RunMode runMode) {
        validateDefinitionId(jobDefineId);
        validateRunnable(jobDefineId);

        if (streamingJobInstanceService.existsRunningInstance(jobDefineId)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job already has a running instance"
            );
        }

        /*
            异常场景停止，重启逻辑
            1：服务启动时有定时任务，将可恢复的SeaTunnel任务重新关联
            2：其他情况，SeaTunnel任务正常运行，但管理功能是失败（触发一次运行后进行关联）
        */
        // 最后一次运行任务实例进行重试
        StreamingJobInstance lastInstance = streamingJobInstanceService.lastInstance(jobDefineId);
        if (lastInstance != null) {
            try {

                ZetaJobStatusResolveResult result = zetaJobStatusHandler.resolve(
                        lastInstance.getClientId(),
                        lastInstance.getEngineJobId()
                );

                if (result != null && result.isRunning()) {
                    log.debug(
                            "recovering job instance because Zeta job is still running, instanceId={}, engineJobId={}, engineStatus={}",
                            lastInstance.getClientId(),
                            lastInstance.getEngineJobId(),
                            result.getEngineStatus()
                    );

                    JobStatus targetStatus = result.getLocalStatus();

                    String errorMessage = "Yak Ops 重启后执行任务状态恢复失败，Zeta 状态解析结果为空。"
                            + " instanceId=" + lastInstance.getId()
                            + ", engineJobId=" + lastInstance.getEngineJobId()
                            + ", recoveryTime=" + new Date();

                    log.warn(
                            "Recover streaming job instance final status, instanceId={}, engineJobId={}, targetStatus={}, engineStatus={}, message={}",
                            lastInstance.getId(),
                            lastInstance.getEngineJobId(),
                            targetStatus,
                            result.getEngineStatus(),
                            result.getMessage()
                    );

                    streamingJobInstanceService.updateStatus(
                            lastInstance.getId(),
                            targetStatus,
                            errorMessage
                    );

                    throw new ServiceException(
                            Status.JOB_DEFINITION_EXECUTE_RECOVERY,
                            "streaming job already has a recovery instance"
                    );

                }

            } catch (ServiceException e){
                throw e;
            } catch (Exception e) {
                log.warn(
                        "Recover streaming job instance failed, instanceId={}, engineJobId={}",
                        lastInstance == null ? null : lastInstance.getId(),
                        lastInstance == null ? null : lastInstance.getEngineJobId(),
                        e
                );
            }
        }

        JobInstanceVO instance = streamingJobInstanceService.create(jobDefineId, runMode, JobMode.STREAMING);

        log.info("Streaming job execute requested: jobDefineId={}, runMode={}, instanceId={}",
                jobDefineId, runMode, instance.getId());

        streamingJobSubmitter.submit(instance);

        return instance.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long jobPause(Long jobInstanceId) {
        validateInstanceId(jobInstanceId);

        JobInstanceVO instance = getInstanceOrThrow(jobInstanceId);

        if (isFinishedStatus(instance.getJobStatus())) {
            log.info("Streaming job instance already finished, skip pause: instanceId={}, status={}",
                    jobInstanceId, instance.getJobStatus());
            return jobInstanceId;
        }

        log.info("Streaming job pause requested: instanceId={}, status={}",
                jobInstanceId, instance.getJobStatus());

        try {
            streamingJobSubmitter.pause(instance);

            StreamingJobInstance update = new StreamingJobInstance();
            update.setId(jobInstanceId);
            update.setJobStatus(JobStatus.CANCELED);
            update.setEndTime(new Date());
            update.setErrorMessage("Streaming job was manually paused by user.");

            streamingJobInstanceService.updateById(update);

            log.info("Streaming job pause success: instanceId={}", jobInstanceId);
            return jobInstanceId;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Streaming job pause failed: instanceId={}", jobInstanceId, e);

            StreamingJobInstance update = new StreamingJobInstance();
            update.setId(jobInstanceId);
            update.setErrorMessage("Streaming job pause failed: " + e.getMessage());

            streamingJobInstanceService.updateById(update);

            throw new ServiceException(Status.JOB_DEFINITION_EXECUTE_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long jobStopWithSavepoint(Long jobInstanceId) {
        validateInstanceId(jobInstanceId);

        JobInstanceVO instance = getInstanceOrThrow(jobInstanceId);

        if (isFinishedStatus(instance.getJobStatus())) {
            if (hasSavepointToken(instance)) {
                log.info("Streaming job instance already stopped with savepoint, skip stop: instanceId={}, savepointPath={}",
                        jobInstanceId, instance.getSavepointPath());
                return jobInstanceId;
            }

            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job is already finished and has no savepoint"
            );
        }

        String engineJobId = instance.getEngineJobId();
        if (engineJobId == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "engineJobId");
        }

        log.info("Streaming job stop with savepoint requested: instanceId={}, engineJobId={}, status={}",
                jobInstanceId, engineJobId, instance.getJobStatus());

        try {
            streamingJobSubmitter.stopWithSavepoint(instance);

            StreamingJobInstance update = new StreamingJobInstance();
            update.setId(jobInstanceId);

            /*
             * If your JobStatus enum has SAVEPOINT_DONE, you can use it here.
             * To keep compatibility with the current project, we keep CANCELED
             * and use savepointPath to distinguish normal cancel and savepoint stop.
             */
            update.setJobStatus(JobStatus.CANCELED);
            update.setEndTime(new Date());
            update.setSavepointPath(buildSavepointToken(engineJobId));
            update.setErrorMessage("Streaming job was manually stopped with savepoint.");

            streamingJobInstanceService.updateById(update);

            log.info("Streaming job stop with savepoint success: instanceId={}, engineJobId={}, savepointToken={}",
                    jobInstanceId, engineJobId, buildSavepointToken(engineJobId));

            return jobInstanceId;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Streaming job stop with savepoint failed: instanceId={}", jobInstanceId, e);

            StreamingJobInstance update = new StreamingJobInstance();
            update.setId(jobInstanceId);
            update.setErrorMessage("Streaming job stop with savepoint failed: " + e.getMessage());

            streamingJobInstanceService.updateById(update);

            throw new ServiceException(Status.JOB_DEFINITION_EXECUTE_ERROR);
        }
    }

    @Override
    public Long jobResumeFromSavepoint(Long sourceJobInstanceId, RunMode runMode) {
        validateInstanceId(sourceJobInstanceId);

        JobInstanceVO sourceInstance = getInstanceOrThrow(sourceJobInstanceId);

        if (isRunningStatus(sourceInstance.getJobStatus())) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "running streaming job can not be used as savepoint source"
            );
        }

        Long jobDefineId = sourceInstance.getJobDefinitionId();
        validateDefinitionId(jobDefineId);
        validateRunnable(jobDefineId);

        if (streamingJobInstanceService.existsRunningInstance(jobDefineId)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job already has a running instance"
            );
        }

        String restoreEngineJobId = resolveRestoreEngineJobId(sourceInstance);

        JobInstanceVO newInstance =
                streamingJobInstanceService.create(jobDefineId, runMode, JobMode.STREAMING);

        log.info(
                "Streaming job resume from savepoint requested: sourceInstanceId={}, newInstanceId={}, jobDefineId={}, restoreEngineJobId={}",
                sourceJobInstanceId,
                newInstance.getId(),
                jobDefineId,
                restoreEngineJobId
        );

        streamingJobSubmitter.submitFromSavepoint(newInstance, restoreEngineJobId);

        StreamingJobInstance update = new StreamingJobInstance();
        update.setId(newInstance.getId());
        update.setCheckpointPath(sourceInstance.getCheckpointPath());
        update.setSavepointPath(sourceInstance.getSavepointPath());
        update.setErrorMessage("Streaming job was resumed from savepoint, sourceInstanceId=" + sourceJobInstanceId);

        streamingJobInstanceService.updateById(update);

        log.info(
                "Streaming job resume from savepoint success: sourceInstanceId={}, newInstanceId={}, restoreEngineJobId={}",
                sourceJobInstanceId,
                newInstance.getId(),
                restoreEngineJobId
        );

        return newInstance.getId();
    }

    private JobInstanceVO getInstanceOrThrow(Long jobInstanceId) {
        JobInstanceVO instance = streamingJobInstanceService.selectById(jobInstanceId);
        if (instance == null || instance.getId() == null) {
            throw new ServiceException(Status.BATCH_JOB_INSTANCE_NOT_EXIST);
        }
        return instance;
    }

    private void validateRunnable(Long jobDefineId) {
        StreamingJobDefinitionEntity definition =
                streamingJobDefinitionQueryService.getDefinitionOrThrow(jobDefineId);

        if (definition.getReleaseState() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        if (definition.getReleaseState() != ReleaseState.ONLINE) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "only online streaming job can be executed"
            );
        }
    }

    private void validateDefinitionId(Long jobDefineId) {
        if (jobDefineId == null || jobDefineId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefineId");
        }
    }

    private void validateInstanceId(Long jobInstanceId) {
        if (jobInstanceId == null || jobInstanceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobInstanceId");
        }
    }

    private boolean isFinishedStatus(String status) {
        if (status == null) {
            return false;
        }

        return "FINISHED".equalsIgnoreCase(status)
                || "FAILED".equalsIgnoreCase(status)
                || "CANCELED".equalsIgnoreCase(status)
                || "CANCELLED".equalsIgnoreCase(status)
                || "STOPPED".equalsIgnoreCase(status)
                || "SAVEPOINT_DONE".equalsIgnoreCase(status);
    }

    private boolean isRunningStatus(String status) {
        if (status == null) {
            return false;
        }

        return "RUNNING".equalsIgnoreCase(status)
                || "SUBMITTED".equalsIgnoreCase(status)
                || "STARTING".equalsIgnoreCase(status)
                || "CREATED".equalsIgnoreCase(status);
    }

    private boolean hasSavepointToken(JobInstanceVO instance) {
        return instance != null && StringUtils.isNotBlank(instance.getSavepointPath());
    }

    private String buildSavepointToken(String engineJobId) {
        return ZETA_SAVEPOINT_TOKEN_PREFIX + engineJobId;
    }

    private String resolveRestoreEngineJobId(JobInstanceVO sourceInstance) {
        if (sourceInstance == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "sourceJobInstance");
        }

        String savepointPath = sourceInstance.getSavepointPath();
        if (StringUtils.isBlank(savepointPath)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "source job instance has no savepoint"
            );
        }

        String engineJobIdText = savepointPath.trim();

        if (engineJobIdText.startsWith(ZETA_SAVEPOINT_TOKEN_PREFIX)) {
            engineJobIdText = engineJobIdText.substring(ZETA_SAVEPOINT_TOKEN_PREFIX.length());
        }

        return engineJobIdText;
    }
}