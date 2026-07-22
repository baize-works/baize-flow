package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class StreamingJobMetricsPointVO {

    private Long collectTimeMs;

    private Date collectTime;

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