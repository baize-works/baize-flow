package io.baize.flow.core.hocon;


import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;

/**
 * Resolve persisted job definition into executable save command.
 */
public interface JobDefinitionCommandResolver {

    /**
     * Resolve latest definition command by definition id.
     *
     * @param jobDefinitionId definition id
     * @return resolved save command
     */
    JobDefinitionSaveCommand resolve(Long jobDefinitionId);
}
