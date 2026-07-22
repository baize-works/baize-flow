package io.baize.flow.core.job.registry;

import jakarta.annotation.Resource;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.core.job.handler.StreamingJobEditCommandBuilder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StreamingJobEditCommandBuilderRegistry {

    @Resource
    private List<StreamingJobEditCommandBuilder> builders;

    public StreamingJobEditCommandBuilder getBuilder(JobDefinitionMode mode) {
        return builders.stream()
                .filter(builder -> builder.mode() == mode)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No streaming edit command builder found for mode=" + mode));
    }
}