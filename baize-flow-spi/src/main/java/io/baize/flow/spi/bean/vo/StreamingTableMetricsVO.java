package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StreamingTableMetricsVO {

    private Long collectTimeMs;

    private Long jobInstanceId;

    private Long jobDefinitionId;

    private String engineJobId;

    private Long clientId;

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