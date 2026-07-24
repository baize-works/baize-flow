package io.baize.flow.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.GuideSingleJobContentCommand;
import io.baize.flow.spi.bean.dto.command.StreamingJobSaveCommand;
import io.baize.flow.spi.bean.dto.config.CheckpointConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.StreamingJobEnvConfig;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingGuideSingleJobSaveCommand implements StreamingJobSaveCommand, GuideSingleJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private Map<String, Object> workflow;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }
}