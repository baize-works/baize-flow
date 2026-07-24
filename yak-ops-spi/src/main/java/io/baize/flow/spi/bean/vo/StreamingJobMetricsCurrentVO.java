package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class StreamingJobMetricsCurrentVO {

    private Long jobInstanceId;

    private Long jobDefinitionId;

    private String engineJobId;

    private Long clientId;

    private String jobStatus;

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

    private Integer pipelineCount;

    private Integer tableCount;

    private Long lastCollectTimeMs;

    private Date lastCollectTime;
}