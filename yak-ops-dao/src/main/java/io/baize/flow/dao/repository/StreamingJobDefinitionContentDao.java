package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;

public interface StreamingJobDefinitionContentDao {

    void save(StreamingJobDefinitionContentEntity entity);

    StreamingJobDefinitionContentEntity queryLatestByJobDefinitionId(Long jobDefinitionId);

    void deleteByJobDefinitionId(Long jobDefinitionId);
}