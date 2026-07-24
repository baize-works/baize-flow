package io.baize.flow.spi.bean.dto.batch;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.BatchJobSaveCommand;
import io.baize.flow.spi.bean.dto.command.GuideMultiJobContentCommand;
import io.baize.flow.spi.bean.dto.config.BatchJobEnvConfig;
import io.baize.flow.spi.bean.dto.config.GuideMultiJobContent;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class BatchGuideMultiJobSaveCommand implements BatchJobSaveCommand, GuideMultiJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private GuideMultiJobContent content;

    private JobScheduleConfig schedule;

    private BatchJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }
}