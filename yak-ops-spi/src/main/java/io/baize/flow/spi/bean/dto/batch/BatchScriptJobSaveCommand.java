package io.baize.flow.spi.bean.dto.batch;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.BatchJobSaveCommand;
import io.baize.flow.spi.bean.dto.command.ScriptJobContentCommand;
import io.baize.flow.spi.bean.dto.config.BatchJobEnvConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;
import io.baize.flow.spi.bean.dto.config.ScriptJobContent;

@Data
@EqualsAndHashCode(callSuper = false)
public class BatchScriptJobSaveCommand implements BatchJobSaveCommand, ScriptJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private ScriptJobContent content;

    private JobScheduleConfig schedule;

    private BatchJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.SCRIPT;
    }
}