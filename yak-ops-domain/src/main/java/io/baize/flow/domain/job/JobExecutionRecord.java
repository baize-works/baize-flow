package io.baize.flow.domain.job;

import java.time.Instant;
import java.util.Objects;

/** Append-only history record for one submission attempt of a job instance. */
public record JobExecutionRecord(
        Long id, long instanceId, int attemptNo, String engineType, Long engineEndpointId,
        String externalJobId, JobExecutionStatus submissionStatus, JobExecutionStatus executionStatus,
        Instant createdAt, Instant submittingAt, Instant submittedAt, Instant startedAt, Instant cancellingAt,
        Instant canceledAt, Instant finishedAt, Instant lastSyncedAt, String errorCode, String errorMessage,
        String engineSnapshot, String createdBy, String updatedBy, Instant updatedAt) {
    public JobExecutionRecord {
        if (instanceId <= 0) throw new IllegalArgumentException("instanceId must be positive");
        if (attemptNo <= 0) throw new IllegalArgumentException("attemptNo must be positive");
        engineType = require(engineType, "engineType");
        submissionStatus = Objects.requireNonNull(submissionStatus, "submissionStatus");
        executionStatus = Objects.requireNonNull(executionStatus, "executionStatus");
    }
    private static String require(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " must not be blank");
        return value;
    }
}
