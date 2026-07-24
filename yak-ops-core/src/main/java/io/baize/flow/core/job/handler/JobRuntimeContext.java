package io.baize.flow.core.job.handler;

import lombok.Builder;
import lombok.Data;
import io.baize.flow.spi.bean.dto.config.JobEnvConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;
import io.baize.flow.spi.enums.JobRuntimeType;

@Data
@Builder
public class JobRuntimeContext {

    private JobRuntimeType runtimeType;

    private JobEnvConfig env;

    private JobScheduleConfig schedule;

    public boolean isBatch() {
        return JobRuntimeType.BATCH == runtimeType;
    }

    public boolean isStreaming() {
        return JobRuntimeType.STREAMING == runtimeType;
    }
}