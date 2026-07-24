package io.baize.flow.spi.bean.dto.command;

import io.baize.flow.spi.enums.JobRuntimeType;

public interface StreamingJobSaveCommand extends JobDefinitionSaveCommand {


    @Override
    default JobRuntimeType getRuntimeType() {
        return JobRuntimeType.STREAMING;
    }
}