package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.util.List;

@Data
public class OverviewChartsVO {
    private List<ChartDataItemVO> recordsTrend;
    private List<ChartDataItemVO> bytesTrend;
    private List<ChartDataItemVO> recordsSpeedTrend;
    private List<ChartDataItemVO> bytesSpeedTrend;
}
