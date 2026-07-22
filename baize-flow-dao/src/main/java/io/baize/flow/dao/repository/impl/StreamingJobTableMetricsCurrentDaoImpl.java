package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import lombok.NonNull;
import io.baize.flow.dao.entity.StreamingJobTableMetricsCurrent;
import io.baize.flow.dao.mapper.StreamingJobTableMetricsCurrentMapper;
import io.baize.flow.dao.repository.BaseDao;
import io.baize.flow.dao.repository.StreamingJobTableMetricsCurrentDao;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class StreamingJobTableMetricsCurrentDaoImpl
        extends BaseDao<StreamingJobTableMetricsCurrent, StreamingJobTableMetricsCurrentMapper>
        implements StreamingJobTableMetricsCurrentDao {

    @Resource
    private StreamingJobTableMetricsCurrentMapper streamingJobTableMetricsCurrentMapper;

    public StreamingJobTableMetricsCurrentDaoImpl(
            @NonNull StreamingJobTableMetricsCurrentMapper streamingJobTableMetricsCurrentMapper) {
        super(streamingJobTableMetricsCurrentMapper);
    }

    @Override
    public void upsertBatch(List<StreamingJobTableMetricsCurrent> metricsList) {
        if (metricsList == null || metricsList.isEmpty()) {
            return;
        }

        streamingJobTableMetricsCurrentMapper.upsertBatch(metricsList);
    }

    @Override
    public List<StreamingJobTableMetricsCurrent> selectByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return Collections.emptyList();
        }

        return streamingJobTableMetricsCurrentMapper.selectList(
                new LambdaQueryWrapper<StreamingJobTableMetricsCurrent>()
                        .eq(StreamingJobTableMetricsCurrent::getJobInstanceId, instanceId)
                        .orderByAsc(StreamingJobTableMetricsCurrent::getPipelineId)
                        .orderByAsc(StreamingJobTableMetricsCurrent::getSourceTable)
                        .orderByAsc(StreamingJobTableMetricsCurrent::getSinkTable)
        );
    }

    @Override
    public void deleteByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return;
        }

        streamingJobTableMetricsCurrentMapper.delete(
                new LambdaQueryWrapper<StreamingJobTableMetricsCurrent>()
                        .eq(StreamingJobTableMetricsCurrent::getJobInstanceId, instanceId)
        );
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return;
        }

        streamingJobTableMetricsCurrentMapper.delete(
                new LambdaQueryWrapper<StreamingJobTableMetricsCurrent>()
                        .eq(StreamingJobTableMetricsCurrent::getJobDefinitionId, definitionId)
        );
    }
}