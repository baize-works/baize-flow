package io.baize.flow.dao.repository;


import io.baize.flow.dao.entity.JobTableMetrics;
import io.baize.flow.spi.bean.vo.JobTableMetricsVO;

import java.util.List;

/**
 * DAO for SeaTunnel table level metrics.
 */
public interface JobTableMetricsDao extends IDao<JobTableMetrics> {
    List<JobTableMetricsVO> selectByInstanceId(Long instanceId);

    void deleteByDefinitionId(Long definitionId);
}
