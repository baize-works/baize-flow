package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.EngineJobStatus;
import java.util.Locale;

/** Converts SeaTunnel's unstable wire status strings at the adapter boundary. */
public final class SeaTunnelJobStatusMapper {
    private SeaTunnelJobStatusMapper() { }
    public static EngineJobStatus map(String status) {
        if (status == null) return EngineJobStatus.UNKNOWN;
        return switch (status.toUpperCase(Locale.ROOT)) {
            case "RUNNING", "INITIALIZING", "CREATED", "RESTARTING" -> EngineJobStatus.RUNNING;
            case "FINISHED" -> EngineJobStatus.FINISHED;
            case "FAILED" -> EngineJobStatus.FAILED;
            case "CANCELED", "CANCELLED" -> EngineJobStatus.CANCELED;
            case "SUBMITTED" -> EngineJobStatus.SUBMITTED;
            default -> EngineJobStatus.UNKNOWN;
        };
    }
}
