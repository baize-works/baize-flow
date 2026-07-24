package io.baize.flow.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.common.utils.ConvertUtil;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.core.job.registry.StreamingJobEditCommandBuilderRegistry;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.dao.repository.StreamingJobDefinitionDao;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.vo.StreamingJobDefinitionVO;
import io.baize.flow.spi.enums.Status;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StreamingJobDefinitionQueryService {

    @Resource
    private StreamingJobDefinitionDao streamingJobDefinitionDao;

    @Resource
    private StreamingJobEditCommandBuilderRegistry editCommandBuilderRegistry;

    public StreamingJobDefinitionVO selectById(Long id) {
        validateId(id);

        try {
            StreamingJobDefinitionEntity entity = getDefinitionOrThrow(id);
            return ConvertUtil.sourceToTarget(entity, StreamingJobDefinitionVO.class);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition by id failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    public StreamingJobDefinitionEntity getDefinitionOrThrow(Long id) {
        validateId(id);

        StreamingJobDefinitionEntity entity = streamingJobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }
        return entity;
    }

    public JobDefinitionSaveCommand buildEditCommand(StreamingJobDefinitionEntity definition,
                                                     StreamingJobDefinitionContentEntity contentEntity) {
        if (definition == null || contentEntity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        return editCommandBuilderRegistry
                .getBuilder(definition.getMode())
                .build(definition, contentEntity);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
    }
}