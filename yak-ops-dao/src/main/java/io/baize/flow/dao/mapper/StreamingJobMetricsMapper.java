package io.baize.flow.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import io.baize.flow.dao.entity.StreamingJobMetrics;

@Mapper
public interface StreamingJobMetricsMapper extends BaseMapper<StreamingJobMetrics> {
}