package io.baize.flow.spi.bean.dto.command;

import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;
import io.baize.flow.spi.enums.JobRuntimeType;

public interface BatchJobSaveCommand extends JobDefinitionSaveCommand {

    JobScheduleConfig getSchedule();

    @Override
    default JobRuntimeType getRuntimeType() {
        return JobRuntimeType.BATCH;
    }
}