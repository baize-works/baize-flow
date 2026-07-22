package io.baize.flow.api.service;

import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.spi.bean.dto.BatchJobDefinitionQueryDTO;
import io.baize.flow.spi.bean.dto.batch.BatchGuideMultiJobSaveCommand;
import io.baize.flow.spi.bean.dto.batch.BatchGuideSingleJobSaveCommand;
import io.baize.flow.spi.bean.dto.batch.BatchScriptJobSaveCommand;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.BatchJobDefinitionVO;
import io.baize.flow.spi.bean.vo.JobDefinitionEditDetailVO;
import io.baize.flow.spi.bean.vo.JobDefinitionSaveResultVO;

import java.util.List;

public interface BatchJobDefinitionService {

    JobDefinitionSaveResultVO saveOrUpdate(BatchScriptJobSaveCommand command);

    JobDefinitionSaveResultVO saveOrUpdate(BatchGuideSingleJobSaveCommand command);

    JobDefinitionSaveResultVO saveOrUpdate(BatchGuideMultiJobSaveCommand command);

    String buildHoconConfig(BatchScriptJobSaveCommand command);

    String buildHoconConfig(BatchGuideSingleJobSaveCommand command);

    String buildHoconConfig(BatchGuideMultiJobSaveCommand command);

    BatchJobDefinitionVO selectById(Long id);

    PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto);

    Boolean delete(Long jobDefinitionId);

    JobDefinitionEditDetailVO selectEditDetail(Long id);

    Boolean updateReleaseState(Long id, ReleaseState releaseState);

    List<BatchJobDefinitionVO> listByIds(List<Long> ids);
}