package io.baize.flow.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.GuideMultiJobContentCommand;
import io.baize.flow.spi.bean.dto.command.StreamingJobSaveCommand;
import io.baize.flow.spi.bean.dto.config.GuideMultiJobContent;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.StreamingJobEnvConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingGuideMultiJobSaveCommand implements StreamingJobSaveCommand, GuideMultiJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private GuideMultiJobContent content;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }
}