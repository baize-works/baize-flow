package io.baize.flow.spi.bean.vo;

import lombok.Data;

@Data
public class OverviewSummaryVO {
    private long totalRecords;
    private long totalBytes;
    private long totalTasks;
    private long successTasks;
    private String totalRecordsUnit;
    private String totalBytesUnit;

}
