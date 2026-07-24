package io.baize.flow.spi.bean.vo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobDefinitionEditDetailVO {

    private Long id;

    private JobBasicConfig basic;

    /**
     * GUIDE_SINGLE / GUIDE_MULTI workflow content.
     */
    private Object workflow;

    /**
     * SCRIPT mode content.
     */
    private Object content;

    private JobScheduleConfig schedule;

    private Object env;

    private Object mode;

    private Object runtimeType;

    private JobDefinitionStateVO state;
}