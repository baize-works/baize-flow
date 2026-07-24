package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.util.List;

@Data
public class StreamingInstanceMetricsDashboardVO {

    /**
     * Instance basic info.
     */
    private JobInstanceVO instance;

    /**
     * Latest summary metrics.
     */
    private StreamingJobMetricsCurrentVO current;

    /**
     * Trend metrics from snapshot table.
     */
    private List<StreamingJobMetricsPointVO> trends;

    /**
     * Latest table level metrics.
     */
    private List<JobTableMetricsVO> tableMetrics;

    /**
     * Top lag table metrics.
     */
    private List<JobTableMetricsVO> topLagTables;
}