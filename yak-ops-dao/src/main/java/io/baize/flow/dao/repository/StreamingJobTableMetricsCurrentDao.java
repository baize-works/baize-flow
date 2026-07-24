package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.StreamingJobTableMetricsCurrent;

import java.util.List;

public interface StreamingJobTableMetricsCurrentDao extends IDao<StreamingJobTableMetricsCurrent> {

    void upsertBatch(List<StreamingJobTableMetricsCurrent> metricsList);

    List<StreamingJobTableMetricsCurrent> selectByInstanceId(Long instanceId);

    void deleteByInstanceId(Long instanceId);

    void deleteByDefinitionId(Long definitionId);
}