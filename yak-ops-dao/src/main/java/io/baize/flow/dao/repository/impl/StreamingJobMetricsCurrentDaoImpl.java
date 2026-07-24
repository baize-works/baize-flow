package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import lombok.NonNull;
import io.baize.flow.dao.entity.StreamingJobMetricsCurrent;
import io.baize.flow.dao.mapper.StreamingJobMetricsCurrentMapper;
import io.baize.flow.dao.repository.BaseDao;
import io.baize.flow.dao.repository.StreamingJobMetricsCurrentDao;
import org.springframework.stereotype.Repository;

@Repository
public class StreamingJobMetricsCurrentDaoImpl
        extends BaseDao<StreamingJobMetricsCurrent, StreamingJobMetricsCurrentMapper>
        implements StreamingJobMetricsCurrentDao {

    @Resource
    private StreamingJobMetricsCurrentMapper streamingJobMetricsCurrentMapper;

    public StreamingJobMetricsCurrentDaoImpl(
            @NonNull StreamingJobMetricsCurrentMapper streamingJobMetricsCurrentMapper) {
        super(streamingJobMetricsCurrentMapper);
    }

    @Override
    public void upsert(StreamingJobMetricsCurrent metrics) {
        if (metrics == null || metrics.getJobInstanceId() == null) {
            return;
        }

        streamingJobMetricsCurrentMapper.upsert(metrics);
    }

    @Override
    public StreamingJobMetricsCurrent selectByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return null;
        }

        return streamingJobMetricsCurrentMapper.selectOne(
                new LambdaQueryWrapper<StreamingJobMetricsCurrent>()
                        .eq(StreamingJobMetricsCurrent::getJobInstanceId, instanceId)
                        .last("LIMIT 1")
        );
    }

    @Override
    public void deleteByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return;
        }

        streamingJobMetricsCurrentMapper.delete(
                new LambdaQueryWrapper<StreamingJobMetricsCurrent>()
                        .eq(StreamingJobMetricsCurrent::getJobInstanceId, instanceId)
        );
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return;
        }

        streamingJobMetricsCurrentMapper.delete(
                new LambdaQueryWrapper<StreamingJobMetricsCurrent>()
                        .eq(StreamingJobMetricsCurrent::getJobDefinitionId, definitionId)
        );
    }
}