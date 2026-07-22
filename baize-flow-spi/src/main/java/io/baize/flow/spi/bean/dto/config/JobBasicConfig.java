package io.baize.flow.spi.bean.dto.config;

import lombok.Data;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.spi.enums.JobRuntimeType;

@Data
public class JobBasicConfig {

    /**
     * 编辑模式：SCRIPT / GUIDE_SINGLE / GUIDE_MULTI
     */
    private JobDefinitionMode mode;

    /**
     * 运行类型：BATCH / STREAMING
     */
    private JobRuntimeType runtimeType;

    private String jobName;

    private String jobDesc;

    private Long clientId;
}