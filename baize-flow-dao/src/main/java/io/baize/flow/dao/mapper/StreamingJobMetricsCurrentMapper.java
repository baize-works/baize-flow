package io.baize.flow.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import io.baize.flow.dao.entity.StreamingJobMetricsCurrent;

@Mapper
public interface StreamingJobMetricsCurrentMapper extends BaseMapper<StreamingJobMetricsCurrent> {

    void upsert(StreamingJobMetricsCurrent metrics);
}