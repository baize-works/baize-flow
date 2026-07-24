package io.baize.flow.core.builder.env;

import io.baize.flow.spi.bean.dto.config.JobEnvConfig;

import java.util.Map;

public interface EnvConfigExtender {

    boolean supports(JobEnvConfig envConfig);

    void fill(Map<String, Object> envMap, JobEnvConfig envConfig);
}