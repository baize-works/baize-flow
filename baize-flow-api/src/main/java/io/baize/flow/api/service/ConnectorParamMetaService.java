package io.baize.flow.api.service;

import io.baize.flow.spi.bean.dto.ConnectorParamMetaCreateDTO;
import io.baize.flow.spi.bean.dto.ConnectorParamMetaQueryDTO;
import io.baize.flow.spi.bean.dto.ConnectorParamMetaUpdateDTO;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.ConnectorParamMetaOptionVO;
import io.baize.flow.spi.bean.vo.ConnectorParamMetaVO;

import java.util.List;

public interface ConnectorParamMetaService {

    Long create(ConnectorParamMetaCreateDTO dto);

    Boolean update(Long id, ConnectorParamMetaUpdateDTO dto);

    ConnectorParamMetaVO getById(Long id);

    PaginationResult<ConnectorParamMetaVO> pageQuery(ConnectorParamMetaQueryDTO dto);

    List<ConnectorParamMetaVO> list(String connectorName, String type);

    void delete(Long id);

    List<ConnectorParamMetaOptionVO> option(
            String connectorName,
            String connectorType,
            String type
    );
}