package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.EngineTask;
import java.util.Map;

final class SeaTunnelTaskMapper {
    private SeaTunnelTaskMapper() { }
    static EngineTask map(Map<?, ?> source) { return new EngineTask(value(source, "taskId"), value(source, "name"), SeaTunnelJobStatusMapper.map(value(source, "status")), value(source, "errorMessage")); }
    private static String value(Map<?, ?> source, String key) { Object value = source == null ? null : source.get(key); return value == null ? null : value.toString(); }
}
