package io.baize.flow.api.metrics.streaming;

import lombok.Getter;

/**
 * Options used when submitting a streaming job to SeaTunnel Zeta engine.
 */
@Getter
public class StreamingJobSubmitOptions {

    private final String restoreEngineJobId;
    private final boolean startWithSavepoint;

    private StreamingJobSubmitOptions(String restoreEngineJobId, boolean startWithSavepoint) {
        this.restoreEngineJobId = restoreEngineJobId;
        this.startWithSavepoint = startWithSavepoint;
    }

    public static StreamingJobSubmitOptions normal() {
        return new StreamingJobSubmitOptions(null, false);
    }

    public static StreamingJobSubmitOptions restoreFromSavepoint(String restoreEngineJobId) {
        if (restoreEngineJobId == null) {
            throw new IllegalArgumentException("restoreEngineJobId must be positive");
        }
        return new StreamingJobSubmitOptions(restoreEngineJobId, true);
    }

    public String getEngineJobIdParam() {
        return restoreEngineJobId == null ? null : String.valueOf(restoreEngineJobId);
    }
}