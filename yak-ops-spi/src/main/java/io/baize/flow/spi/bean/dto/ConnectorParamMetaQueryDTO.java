package io.baize.flow.spi.bean.dto;

import lombok.Data;

@Data
public class ConnectorParamMetaQueryDTO {

    /**
     * 参数类型，如 connector/time
     */
    private String type;

    /**
     * 连接器名称
     */
    private String connectorName;
    private String connectorType;

    /**
     * 参数名，支持模糊查询
     */
    private String paramName;

    /**
     * 当前页
     */
    private Long pageNum = 1L;

    /**
     * 每页大小
     */
    private Long pageSize = 10L;
}
