package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.JobDefinitionContentEntity;

import java.util.List;

public interface JobDefinitionContentDao extends IDao<JobDefinitionContentEntity> {

    int save(JobDefinitionContentEntity po);

    List<JobDefinitionContentEntity> queryByJobDefinitionId(Long jobDefinitionId);

    JobDefinitionContentEntity queryLatestByJobDefinitionId(Long jobDefinitionId);

    void deleteByJobDefinitionId(Long jobDefinitionId);
}
