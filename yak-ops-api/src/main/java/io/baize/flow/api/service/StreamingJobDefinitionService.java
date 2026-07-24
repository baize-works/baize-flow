package io.baize.flow.api.service;

import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import io.baize.flow.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import io.baize.flow.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import io.baize.flow.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.JobDefinitionEditDetailVO;
import io.baize.flow.spi.bean.vo.JobDefinitionSaveResultVO;
import io.baize.flow.spi.bean.vo.StreamingJobDefinitionVO;

public interface StreamingJobDefinitionService {

    JobDefinitionSaveResultVO saveOrUpdate(StreamingScriptJobSaveCommand command);

    JobDefinitionSaveResultVO saveOrUpdate(StreamingGuideSingleJobSaveCommand command);

    JobDefinitionSaveResultVO saveOrUpdate(StreamingGuideMultiJobSaveCommand command);

    StreamingJobDefinitionVO selectById(Long id);

    PaginationResult<StreamingJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto);

    Boolean delete(Long id);

    String buildHoconConfig(StreamingScriptJobSaveCommand command);

    String buildHoconConfig(StreamingGuideSingleJobSaveCommand command);

    String buildHoconConfig(StreamingGuideMultiJobSaveCommand command);

    JobDefinitionEditDetailVO selectEditDetail(Long id);

    Boolean updateReleaseState(Long id, ReleaseState releaseState);
}