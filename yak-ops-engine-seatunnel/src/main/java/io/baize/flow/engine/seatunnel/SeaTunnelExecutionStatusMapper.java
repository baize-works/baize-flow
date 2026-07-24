package io.baize.flow.engine.seatunnel;

import io.baize.flow.domain.job.JobExecutionStatus;
import io.baize.flow.engine.api.EngineJobStatus;

/** Maps SeaTunnel adapter outcomes to Yak Ops' engine-neutral execution lifecycle. */
public final class SeaTunnelExecutionStatusMapper {
    private SeaTunnelExecutionStatusMapper() { }
    public static JobExecutionStatus submitted() { return JobExecutionStatus.SUBMITTED; }
    public static JobExecutionStatus submitting() { return JobExecutionStatus.SUBMITTING; }
    public static JobExecutionStatus submissionFailed() { return JobExecutionStatus.FAILED; }
    public static JobExecutionStatus unreachable() { return JobExecutionStatus.UNKNOWN; }
    public static JobExecutionStatus map(EngineJobStatus status) {
        if (status == null) return JobExecutionStatus.UNKNOWN;
        return switch (status) {
            case SUBMITTED -> JobExecutionStatus.SUBMITTED;
            case RUNNING -> JobExecutionStatus.RUNNING;
            case FINISHED -> JobExecutionStatus.SUCCEEDED;
            case FAILED -> JobExecutionStatus.FAILED;
            case CANCELED -> JobExecutionStatus.CANCELED;
            case UNKNOWN -> JobExecutionStatus.UNKNOWN;
        };
    }
}
