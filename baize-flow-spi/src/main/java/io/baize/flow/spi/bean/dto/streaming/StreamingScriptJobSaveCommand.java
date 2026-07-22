package io.baize.flow.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.ScriptJobContentCommand;
import io.baize.flow.spi.bean.dto.command.StreamingJobSaveCommand;
import io.baize.flow.spi.bean.dto.config.CheckpointConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.ScriptJobContent;
import io.baize.flow.spi.bean.dto.config.StreamingJobEnvConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingScriptJobSaveCommand implements StreamingJobSaveCommand, ScriptJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private ScriptJobContent content;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.SCRIPT;
    }
}