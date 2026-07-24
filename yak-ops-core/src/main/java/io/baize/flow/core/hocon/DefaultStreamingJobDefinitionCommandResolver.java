package io.baize.flow.core.hocon;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.core.job.registry.StreamingJobEditCommandBuilderRegistry;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.dao.repository.StreamingJobDefinitionContentDao;
import io.baize.flow.dao.repository.StreamingJobDefinitionDao;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.enums.Status;
import org.springframework.stereotype.Component;

/**
 * Resolve persisted streaming definition data into executable save command.
 */
@Slf4j
@Component
public class DefaultStreamingJobDefinitionCommandResolver implements StreamingJobDefinitionCommandResolver {

    private final StreamingJobDefinitionDao streamingJobDefinitionDao;
    private final StreamingJobDefinitionContentDao streamingJobDefinitionContentDao;
    private final StreamingJobEditCommandBuilderRegistry editCommandBuilderRegistry;

    public DefaultStreamingJobDefinitionCommandResolver(
            StreamingJobDefinitionDao streamingJobDefinitionDao,
            StreamingJobDefinitionContentDao streamingJobDefinitionContentDao,
            StreamingJobEditCommandBuilderRegistry editCommandBuilderRegistry) {
        this.streamingJobDefinitionDao = streamingJobDefinitionDao;
        this.streamingJobDefinitionContentDao = streamingJobDefinitionContentDao;
        this.editCommandBuilderRegistry = editCommandBuilderRegistry;
    }

    @Override
    public JobDefinitionSaveCommand resolve(Long jobDefinitionId) {
        validateId(jobDefinitionId);

        try {
            StreamingJobDefinitionEntity definition =
                    streamingJobDefinitionDao.queryById(jobDefinitionId);

            if (definition == null) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
            }

            if (definition.getMode() == null) {
                throw new ServiceException(
                        Status.BATCH_JOB_DEFINITION_NOT_EXIST,
                        "streaming definition mode not found"
                );
            }

            StreamingJobDefinitionContentEntity latestContent =
                    streamingJobDefinitionContentDao.queryLatestByJobDefinitionId(jobDefinitionId);

            if (latestContent == null || StringUtils.isBlank(latestContent.getDefinitionContent())) {
                throw new ServiceException(
                        Status.BATCH_JOB_DEFINITION_NOT_EXIST,
                        "streaming definition content not found"
                );
            }

            return editCommandBuilderRegistry
                    .getBuilder(definition.getMode())
                    .build(definition, latestContent);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Resolve streaming job definition command failed, jobDefinitionId={}",
                    jobDefinitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    private void validateId(Long jobDefinitionId) {
        if (jobDefinitionId == null || jobDefinitionId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinitionId");
        }
    }
}