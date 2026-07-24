export interface ParamRow {
    key: string;
    paramName: string;
    paramValue: string;
}

export interface BasicConfig {
    jobName: string;
    jobDesc: string;
    clientId: string;
    mode: string;
    sourceType: string;
    targetType: string;
    sourceDataSourceId: string | number;
    targetDataSourceId: string | number;
}

export interface EnvConfig {
  jobMode: "BATCH";
  parallelism: number;
}

export const defaultEnvConfig: EnvConfig = {
  jobMode: "BATCH",
  parallelism: 1,
};

export interface ScheduleConfig {
    // 调度参数
    paramsList: Array<{
        key: string;
        value: string;
        description?: string;
    }>;

    // 调度策略
    instanceGenerateMode: "nextDay" | "immediately";
    scheduleRunType: "normal" | "pause" | "empty";
    timeoutMode: "system" | "custom";
    timeoutValue?: number;
    timeoutUnit?: "minute" | "hour" | "day";
    rerunPolicy: "success_or_fail" | "fail_only" | "disabled";
    autoRetry: boolean;
    retryTimes?: number;
    retryInterval?: number;

    // 调度时间
    scheduleType: "hour" | "day" | "week";
    hourMode?: "range" | "appoint";
    hourlyRangeValue?: {
        startTime: string;
        intervalHour: number;
        endTime: string;
    };
    hourlyAppointValue?: {
        hours: number[];
        minute: string;
    };
    dailyValue?: {
        time: string;
    };
    weeklyValue?: {
        weekdays: string[];
        time: string;
    };

    effectType: "forever" | "assign";
    effectStartTime?: string;
    effectEndTime?: string;
    cronExpression?: string;
}
