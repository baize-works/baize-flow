package io.baize.flow.core.time;

import io.baize.flow.dao.entity.TimeVariable;
import io.baize.flow.spi.bean.dto.TimeVariableRenderReq;
import io.baize.flow.spi.bean.vo.TimeVariableRenderVO;

import java.util.List;

public interface TimeVariableRenderService {

    TimeVariableRenderVO render(TimeVariableRenderReq req);

    String renderContent(String content);

    List<TimeVariable> getAllEnabledVariables();
}