package io.baize.flow.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import io.baize.flow.dao.entity.StreamingJobTableMetricsCurrent;

import java.util.List;

@Mapper
public interface StreamingJobTableMetricsCurrentMapper extends BaseMapper<StreamingJobTableMetricsCurrent> {

    void upsertBatch(List<StreamingJobTableMetricsCurrent> metricsList);
}