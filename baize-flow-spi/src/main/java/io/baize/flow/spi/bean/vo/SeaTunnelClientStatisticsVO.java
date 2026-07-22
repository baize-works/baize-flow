package io.baize.flow.spi.bean.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientStatisticsVO {
    private Integer total;
    private Integer liveCount;
    private Integer downCount;
}
