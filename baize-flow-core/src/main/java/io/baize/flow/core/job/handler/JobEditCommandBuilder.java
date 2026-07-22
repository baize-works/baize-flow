package io.baize.flow.core.job.handler;

import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.enums.JobRuntimeType;

public interface JobEditCommandBuilder<D, C> {

    JobRuntimeType runtimeType();

    JobDefinitionMode mode();

    JobDefinitionSaveCommand build(D definition, C content, Object runtimeConfig);
}