package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConnectorParamMetaVO {

    private Long id;

    private String type;

    private String connectorName;

    private String connectorType;

    private String paramName;

    private String paramDesc;

    private String paramType;

    private Integer requiredFlag;

    private String defaultValue;

    private String exampleValue;

    private String paramContext;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
