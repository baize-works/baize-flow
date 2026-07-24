package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.EnginePipeline;
import java.util.Map;

final class SeaTunnelPipelineMapper {
    private SeaTunnelPipelineMapper() { }
    static EnginePipeline map(Map<?, ?> source) { return new EnginePipeline(value(source, "pipelineId"), value(source, "name"), SeaTunnelJobStatusMapper.map(value(source, "status"))); }
    private static String value(Map<?, ?> source, String key) { Object value = source == null ? null : source.get(key); return value == null ? null : value.toString(); }
}
