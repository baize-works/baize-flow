package io.baize.flow.spi.bean.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientMetricsVO {
    private Double cpuUsage;

    private Double memoryUsage;

    private Integer threadCount;

    private Integer runningOps;
}
