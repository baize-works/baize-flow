package io.baize.flow.spi.bean.dto.config;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class StreamingJobEnvConfig extends JobEnvConfig {

    private Integer checkpointInterval;

}