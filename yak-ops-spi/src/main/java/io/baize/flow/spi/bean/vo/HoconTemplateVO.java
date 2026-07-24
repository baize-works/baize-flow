package io.baize.flow.spi.bean.vo;

import lombok.Data;

@Data
public class HoconTemplateVO {

    private String sourceDbType;

    private String sourcePluginName;

    private String targetDbType;

    private String targetPluginName;

    private String sourceTemplate;

    private String sinkTemplate;

    private String fullTemplate;
}