package io.baize.flow.core.job.assembler;

import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.common.modal.JobDefinitionAnalysisResult;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobEnvConfig;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class StreamingJobDefinitionAssembler {

    public StreamingJobDefinitionEntity create(JobDefinitionSaveCommand command,
                                               JobDefinitionAnalysisResult analysis) {
        JobBasicConfig basic = command.getBasic();
        JobEnvConfig env = command.getEnv();

        StreamingJobDefinitionEntity entity = StreamingJobDefinitionEntity.builder()
                .jobName(basic.getJobName())
                .jobDesc(basic.getJobDesc())
                .mode(command.getMode())
                .jobType(env.getJobMode())
                .clientId(basic.getClientId())
                .releaseState(ReleaseState.OFFLINE)
                .jobVersion(1)
                .sourceType(analysis.getSourceType())
                .sinkType(analysis.getSinkType())
                .sourceDatasourceId(analysis.getSourceDatasourceId())
                .sinkDatasourceId(analysis.getSinkDatasourceId())
                .sourceTable(analysis.getSourceTable())
                .sinkTable(analysis.getSinkTable())
                .build();

        entity.setId(command.getId());
        entity.setCreateTime(new Date());
        entity.setUpdateTime(new Date());
        return entity;
    }

    public void update(StreamingJobDefinitionEntity entity,
                       JobDefinitionSaveCommand command,
                       JobDefinitionAnalysisResult analysis,
                       Date now,
                       int nextVersion) {
        JobBasicConfig basic = command.getBasic();
        JobEnvConfig env = command.getEnv();

        entity.setJobName(basic.getJobName());
        entity.setJobDesc(basic.getJobDesc());
        entity.setMode(command.getMode());
        entity.setJobType(env.getJobMode());
        entity.setClientId(basic.getClientId());
        entity.setJobVersion(nextVersion);
        entity.setSourceType(analysis.getSourceType());
        entity.setSinkType(analysis.getSinkType());
        entity.setSourceDatasourceId(analysis.getSourceDatasourceId());
        entity.setSinkDatasourceId(analysis.getSinkDatasourceId());
        entity.setSourceTable(analysis.getSourceTable());
        entity.setSinkTable(analysis.getSinkTable());
        entity.setUpdateTime(now);
        entity.setReleaseState(ReleaseState.OFFLINE);
    }
}