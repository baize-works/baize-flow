package io.baize.flow.dao.repository;

import org.apache.ibatis.annotations.Param;
import io.baize.flow.dao.entity.StreamingJobMetrics;

import java.util.List;

public interface StreamingJobMetricsDao extends IDao<StreamingJobMetrics> {

    StreamingJobMetrics selectLatestByInstanceId(Long instanceId);

    List<StreamingJobMetrics> selectByInstanceIdAndTimeRange(Long instanceId,
                                                             Long startTimeMs,
                                                             Long endTimeMs);

    List<StreamingJobMetrics> selectRecentByInstanceId(Long instanceId, Integer limit);

    void deleteByInstanceId( Long instanceId);

    void deleteByDefinitionId(Long definitionId);

    void deleteBefore( Long collectTimeMs);
}