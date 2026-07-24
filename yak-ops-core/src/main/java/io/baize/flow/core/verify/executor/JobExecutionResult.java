package io.baize.flow.core.verify.executor;

import lombok.Data;

@Data
public class JobExecutionResult {
    private boolean success;
    private String jobId;
    private String finalStatus;
    private String rawLog;
    private String errorMessage;
    private long durationMs;
}
