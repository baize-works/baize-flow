package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StreamingMetricsTrendItemVO {

    private String date;

    private Long readRowCount;

    private Long writeRowCount;

    private BigDecimal readQps;

    private BigDecimal writeQps;

    private Long readBytes;

    private Long writeBytes;

    private BigDecimal readBps;

    private BigDecimal writeBps;

    private Long intermediateQueueSize;
}