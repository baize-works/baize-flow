package io.baize.flow.core.job.handler.single;

import com.fasterxml.jackson.core.type.TypeReference;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.common.utils.JSONUtils;
import io.baize.flow.core.job.handler.StreamingJobEditCommandBuilder;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.dto.config.CheckpointConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.StreamingJobEnvConfig;
import io.baize.flow.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class StreamingGuideSingleEditCommandBuilder implements StreamingJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }

    @Override
    public JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity) {

        StreamingGuideSingleJobSaveCommand cmd = new StreamingGuideSingleJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setEnv(JSONUtils.parseObject(contentEntity.getEnvConfig(), StreamingJobEnvConfig.class));

        Map<String, Object> workflow = JSONUtils.parseObject(
                contentEntity.getDefinitionContent(),
                new TypeReference<Map<String, Object>>() {
                }
        );

        cmd.setWorkflow(workflow == null ? Collections.emptyMap() : workflow);
        return cmd;
    }

    private JobBasicConfig buildBasicConfig(StreamingJobDefinitionEntity definition) {
        JobBasicConfig basic = new JobBasicConfig();
        basic.setMode(definition.getMode());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        return basic;
    }
}