package io.baize.flow.infrastructure.metrics.fetch;

import lombok.Data;

import java.util.Collections;
import java.util.Map;

@Data
public class EngineJobInfo {

    private Long clientId;

    private String engineJobId;

    private String jobName;

    private String jobStatus;

    private Map<String, Object> rawJobInfo = Collections.emptyMap();

    private Map<String, Object> rawMetrics = Collections.emptyMap();

    public boolean hasMetrics() {
        return rawMetrics != null && !rawMetrics.isEmpty();
    }
}