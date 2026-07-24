package io.baize.flow.spi.bean.dto;

import lombok.Data;

@Data
public class TimeVariablePageReq {

    private Integer pageNo = 1;

    private Integer pageSize = 10;

    /**
     * 关键词：变量名 / 说明 / 表达式
     */
    private String keyword;

    /**
     * SYSTEM / CUSTOM
     */
    private String variableSource;

    /**
     * FIXED / DYNAMIC
     */
    private String valueType;

    private Boolean enabled;
}
