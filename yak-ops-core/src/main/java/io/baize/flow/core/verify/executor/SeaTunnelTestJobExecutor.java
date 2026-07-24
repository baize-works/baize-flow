package io.baize.flow.core.verify.executor;

import io.baize.flow.core.verify.job.ConnectivityTestJob;
import io.baize.flow.dao.entity.SeaTunnelClient;

/**
 * Execute a SeaTunnel test job and wait for the final result.
 */
public interface SeaTunnelTestJobExecutor {

    /**
     * Submit the test job and wait until it finishes or times out.
     */
    JobExecutionResult executeAndWait(
            SeaTunnelClient client,
            ConnectivityTestJob job,
            long timeoutMs,
            long pollIntervalMs
    );
}