package io.baize.flow.spi.bean.dto.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.baize.flow.common.enums.JobMode;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobEnvConfig {

    /**
     * SeaTunnel env.job.mode
     * BATCH / STREAMING
     */
    private JobMode jobMode;

    private Integer parallelism;
}