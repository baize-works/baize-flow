package io.baize.flow.api.service;

import io.baize.flow.common.enums.RunMode;
import io.baize.flow.dao.entity.JobInstance;
import io.baize.flow.spi.bean.dto.SeaTunnelJobInstanceDTO;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import io.baize.flow.spi.bean.vo.JobTableMetricsVO;

import java.util.List;

public interface BatchJobInstanceService {

    JobInstanceVO create(Long jobDefineId, RunMode runMode);

    PaginationResult<JobInstanceVO> paging(SeaTunnelJobInstanceDTO dto);

    String buildJobConfig(JobDefinitionSaveCommand command);

    JobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void removeAllByDefinitionId(Long definitionId);

    void updateById(JobInstance po);

    /**
     * Query table level metrics for one job instance.
     */
    List<JobTableMetricsVO> listTableMetrics(Long instanceId);

    List<JobInstance> listRunningInstanceByDefinitionIds(List<Long> definitionIds);
}