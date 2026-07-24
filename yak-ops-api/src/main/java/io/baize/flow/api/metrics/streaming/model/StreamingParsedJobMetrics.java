package io.baize.flow.api.metrics.streaming.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class StreamingParsedJobMetrics {

    private Long clientId;

    private String engineJobId;

    private String jobName;

    private String jobStatus;

    private Long collectTimeMs;

    private Map<Integer, StreamingPipelineMetrics> pipelineMetrics = new LinkedHashMap<>();

    private List<StreamingTableMetrics> tableMetrics = new ArrayList<>();

    public boolean isEmpty() {
        return (pipelineMetrics == null || pipelineMetrics.isEmpty())
                && (tableMetrics == null || tableMetrics.isEmpty());
    }
}