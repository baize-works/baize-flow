package io.baize.flow.core.hocon;

import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;

/**
 * Resolve persisted streaming job definition data into save command.
 */
public interface StreamingJobDefinitionCommandResolver {

    JobDefinitionSaveCommand resolve(Long jobDefinitionId);
}