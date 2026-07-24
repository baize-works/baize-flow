package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import lombok.NonNull;
import io.baize.flow.dao.entity.StreamingJobMetrics;
import io.baize.flow.dao.mapper.StreamingJobMetricsMapper;
import io.baize.flow.dao.repository.BaseDao;
import io.baize.flow.dao.repository.StreamingJobMetricsDao;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class StreamingJobMetricsDaoImpl
        extends BaseDao<StreamingJobMetrics, StreamingJobMetricsMapper>
        implements StreamingJobMetricsDao {

    @Resource
    private StreamingJobMetricsMapper streamingJobMetricsMapper;

    public StreamingJobMetricsDaoImpl(@NonNull StreamingJobMetricsMapper streamingJobMetricsMapper) {
        super(streamingJobMetricsMapper);
    }

    @Override
    public StreamingJobMetrics selectLatestByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return null;
        }

        return streamingJobMetricsMapper.selectOne(
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .eq(StreamingJobMetrics::getJobInstanceId, instanceId)
                        .orderByDesc(StreamingJobMetrics::getCollectTimeMs)
                        .last("LIMIT 1")
        );
    }

    @Override
    public List<StreamingJobMetrics> selectByInstanceIdAndTimeRange(Long instanceId,
                                                                    Long startTimeMs,
                                                                    Long endTimeMs) {
        if (instanceId == null || instanceId <= 0) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<StreamingJobMetrics> wrapper =
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .eq(StreamingJobMetrics::getJobInstanceId, instanceId);

        if (startTimeMs != null) {
            wrapper.ge(StreamingJobMetrics::getCollectTimeMs, startTimeMs);
        }

        if (endTimeMs != null) {
            wrapper.le(StreamingJobMetrics::getCollectTimeMs, endTimeMs);
        }

        wrapper.orderByAsc(StreamingJobMetrics::getCollectTimeMs)
                .orderByAsc(StreamingJobMetrics::getPipelineId);

        return streamingJobMetricsMapper.selectList(wrapper);
    }

    @Override
    public List<StreamingJobMetrics> selectRecentByInstanceId(Long instanceId, Integer limit) {
        if (instanceId == null || instanceId <= 0) {
            return Collections.emptyList();
        }

        int finalLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 200);

        List<StreamingJobMetrics> rows = streamingJobMetricsMapper.selectList(
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .eq(StreamingJobMetrics::getJobInstanceId, instanceId)
                        .orderByDesc(StreamingJobMetrics::getCollectTimeMs)
                        .orderByAsc(StreamingJobMetrics::getPipelineId)
                        .last("LIMIT " + finalLimit)
        );

        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        Collections.reverse(rows);
        return rows;
    }
    @Override
    public void deleteByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return;
        }

        streamingJobMetricsMapper.delete(
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .eq(StreamingJobMetrics::getJobInstanceId, instanceId)
        );
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return;
        }

        streamingJobMetricsMapper.delete(
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .eq(StreamingJobMetrics::getJobDefinitionId, definitionId)
        );
    }

    @Override
    public void deleteBefore(Long collectTimeMs) {
        if (collectTimeMs == null || collectTimeMs <= 0) {
            return;
        }

        streamingJobMetricsMapper.delete(
                new LambdaQueryWrapper<StreamingJobMetrics>()
                        .lt(StreamingJobMetrics::getCollectTimeMs, collectTimeMs)
        );
    }
}