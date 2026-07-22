package io.baize.flow.api.metrics.streaming.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StreamingTableMetrics {

    private Integer pipelineId;

    private String sourceTable;

    private String sinkTable;

    private String tableKey;

    private Long readRowCount;

    private Long writeRowCount;

    private BigDecimal readQps;

    private BigDecimal writeQps;

    private Long readBytes;

    private Long writeBytes;

    private BigDecimal readBps;

    private BigDecimal writeBps;

    private String status;

    private String errorMsg;
}