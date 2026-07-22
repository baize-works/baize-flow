package io.baize.flow.core.job.handler.script;

import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.common.utils.JSONUtils;
import io.baize.flow.core.job.handler.StreamingJobEditCommandBuilder;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.dto.config.CheckpointConfig;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.ScriptJobContent;
import io.baize.flow.spi.bean.dto.config.StreamingJobEnvConfig;
import io.baize.flow.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class StreamingScriptEditCommandBuilder implements StreamingJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.SCRIPT;
    }

    @Override
    public JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity) {

        StreamingScriptJobSaveCommand cmd = new StreamingScriptJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setContent(JSONUtils.parseObject(contentEntity.getDefinitionContent(), ScriptJobContent.class));
        cmd.setEnv(JSONUtils.parseObject(contentEntity.getEnvConfig(), StreamingJobEnvConfig.class));
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