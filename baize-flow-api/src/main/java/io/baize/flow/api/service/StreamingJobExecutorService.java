package io.baize.flow.api.service;

import io.baize.flow.common.enums.RunMode;

/**
 * Service interface for executing and managing streaming SeaTunnel jobs.
 */
public interface StreamingJobExecutorService {

    /**
     * Execute a streaming SeaTunnel job based on the streaming job definition ID.
     *
     * @param jobDefineId streaming job definition id
     * @param runMode run mode
     * @return job instance id
     */
    Long jobExecute(Long jobDefineId, RunMode runMode);

    /**
     * Pause a running streaming job instance without savepoint.
     *
     * @param jobInstanceId job instance id
     * @return job instance id
     */
    Long jobPause(Long jobInstanceId);

    /**
     * Stop a running streaming job instance with savepoint.
     *
     * @param jobInstanceId job instance id
     * @return job instance id
     */
    Long jobStopWithSavepoint(Long jobInstanceId);

    /**
     * Resume a streaming job from a previous savepoint.
     *
     * @param sourceJobInstanceId source job instance id which was stopped with savepoint
     * @param runMode run mode
     * @return new job instance id
     */
    Long jobResumeFromSavepoint(Long sourceJobInstanceId, RunMode runMode);
}