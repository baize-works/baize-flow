package io.baize.flow.spi.bean.dto;


import lombok.Data;

@Data
public class TimeVariablePreviewReq {

    /**
     * 动态表达式，如 schedule_time-1d@day_start
     */
    private String expression;

    /**
     * 输出格式，如 yyyy-MM-dd HH:mm:ss
     */
    private String timeFormat;

    /**
     * 基准时间。
     * 不传则使用当前时间。
     *
     * 示例：2026-05-02 09:30:00
     */
    private String baseTime;
}
