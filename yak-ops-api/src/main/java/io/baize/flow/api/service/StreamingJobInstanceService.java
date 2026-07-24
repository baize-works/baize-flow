package io.baize.flow.api.service;

import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.common.enums.RunMode;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.spi.bean.dto.SeaTunnelJobInstanceDTO;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import io.baize.flow.spi.bean.vo.JobTableMetricsVO;
import io.baize.flow.spi.bean.vo.StreamingInstanceMetricsDashboardVO;

import java.util.List;

public interface StreamingJobInstanceService {

    JobInstanceVO create(Long jobDefineId, RunMode runMode, JobMode jobMode);

    PaginationResult<JobInstanceVO> paging(SeaTunnelJobInstanceDTO dto);

    JobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void removeAllByDefinitionId(Long definitionId);

    void updateById(StreamingJobInstance po);

    List<JobTableMetricsVO> listTableMetrics(Long instanceId);

    List<JobInstanceVO> listRunningStreamingInstances();

    StreamingInstanceMetricsDashboardVO getMetricsDashboard(Long instanceId, String range);

    StreamingJobInstance lastInstance(Long definitionId);

    void updateStatus(Long instanceId, JobStatus status, String errorMessage);
}