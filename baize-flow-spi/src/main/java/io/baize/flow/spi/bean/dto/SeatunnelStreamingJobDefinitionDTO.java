package io.baize.flow.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Streaming job definition DTO")
public class SeatunnelStreamingJobDefinitionDTO extends BaseJobDefinitionCommand {

    @Schema(description = "Whether auto restart when failed", example = "true")
    private Boolean autoRestart;

    @Schema(description = "Checkpoint config json")
    private String checkpointConfig;

    @Schema(description = "Runtime config json")
    private String runtimeConfig;
}
