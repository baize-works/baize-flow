package io.baize.flow.spi.bean.dto.command;


import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobEnvConfig;
import io.baize.flow.spi.enums.JobRuntimeType;

public interface JobDefinitionSaveCommand {

    Long getId();

    JobDefinitionMode getMode();

    JobRuntimeType getRuntimeType();

    JobBasicConfig getBasic();

    JobEnvConfig getEnv();
}