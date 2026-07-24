package io.baize.flow.core.job.handler;

import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;

public interface StreamingJobEditCommandBuilder {

    JobDefinitionMode mode();

    JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity
    );
}