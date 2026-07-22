package io.baize.flow.spi.bean.dto.config;

import lombok.Data;
import io.baize.flow.common.enums.ScheduleStatusEnum;

import java.util.List;
import java.util.Map;

@Data
public class JobScheduleConfig {

    private List<ScheduleParamItem> paramsList;

    /**
     * 例如：nextDay
     */
    private String instanceGenerateMode;

    /**
     * 前端统一传：normal / pause / empty
     */
    private String scheduleRunType;

    private String timeoutMode;

    private Integer timeoutValue;

    private String timeoutUnit;

    private String rerunPolicy;

    private Boolean autoRetry;

    private Integer retryTimes;

    private Integer retryInterval;

    private String scheduleType;

    private String hourMode;

    private Map<String, Object> hourlyRangeValue;

    private Map<String, Object> hourlyAppointValue;

    private Map<String, Object> dailyValue;

    private Map<String, Object> weeklyValue;

    private String effectType;

    private String cronExpression;

    public ScheduleStatusEnum resolveScheduleStatus() {
        return ScheduleStatusEnum.fromCode(this.scheduleRunType);
    }

    @Data
    public static class ScheduleParamItem {

        private String key;

        private String paramName;

        private String paramValue;
    }
}