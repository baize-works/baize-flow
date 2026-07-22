package io.baize.flow.api.service;

import io.baize.flow.core.time.TimeVariableRenderService;
import io.baize.flow.spi.bean.dto.TimeVariableCreateDTO;
import io.baize.flow.spi.bean.dto.TimeVariablePageReq;
import io.baize.flow.spi.bean.dto.TimeVariablePreviewReq;
import io.baize.flow.spi.bean.dto.TimeVariableUpdateDTO;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.TimeVariablePreviewVO;
import io.baize.flow.spi.bean.vo.TimeVariableVO;

public interface TimeVariableService{

    Long create(TimeVariableCreateDTO dto);

    Boolean update(Long id, TimeVariableUpdateDTO dto);

    TimeVariableVO getById(Long id);

    PaginationResult<TimeVariableVO> pageQuery(TimeVariablePageReq req);

    void delete(Long id);

    TimeVariablePreviewVO preview(TimeVariablePreviewReq req);
}