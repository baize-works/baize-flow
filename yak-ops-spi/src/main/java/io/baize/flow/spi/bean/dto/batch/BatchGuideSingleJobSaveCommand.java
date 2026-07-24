package io.baize.flow.spi.bean.dto.batch;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.command.BatchJobSaveCommand;
import io.baize.flow.spi.bean.dto.command.GuideSingleJobContentCommand;
import io.baize.flow.spi.bean.dto.config.BatchJobEnvConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
/**
 * @deprecated Phase 4/5 compatibility contract; migrate to an application or web contract.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
public class BatchGuideSingleJobSaveCommand implements BatchJobSaveCommand, GuideSingleJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private Map<String, Object> workflow;

    private JobScheduleConfig schedule;

    private BatchJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }
}