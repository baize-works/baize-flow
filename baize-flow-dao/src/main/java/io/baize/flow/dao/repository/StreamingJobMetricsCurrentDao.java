package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.StreamingJobMetricsCurrent;

public interface StreamingJobMetricsCurrentDao extends IDao<StreamingJobMetricsCurrent> {

    void upsert(StreamingJobMetricsCurrent metrics);

    StreamingJobMetricsCurrent selectByInstanceId(Long instanceId);

    void deleteByInstanceId(Long instanceId);

    void deleteByDefinitionId(Long definitionId);
}