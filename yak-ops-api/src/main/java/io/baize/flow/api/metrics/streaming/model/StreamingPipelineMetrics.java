package io.baize.flow.api.metrics.streaming.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StreamingPipelineMetrics {

    private Integer pipelineId;

    private Long readRowCount;

    private Long writeRowCount;

    private BigDecimal readQps;

    private BigDecimal writeQps;

    private Long readBytes;

    private Long writeBytes;

    private BigDecimal readBps;

    private BigDecimal writeBps;

    private Long intermediateQueueSize;

    private Long lagCount;

    private Long recordDelay;
}