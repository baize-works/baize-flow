package io.baize.flow.spi.bean.dto;

import lombok.Data;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.bean.dto.config.JobBasicConfig;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;

import java.util.Map;

@Data
public class JobDefinitionEditDTO {

    private Long id;

    /**
     * GUIDE_SINGLE / GUIDE_MULTI / SCRIPT
     */
    private JobDefinitionMode mode;

    /**
     * 基础配置，来自 job_definition 主表
     */
    private JobBasicConfig basic;

    /**
     * 可视化模式下的工作流原始结构
     */
    private Map<String, Object> workflow;

    /**
     * 调度配置，来自 job_schedule 表
     */
    private JobScheduleConfig schedule;
}