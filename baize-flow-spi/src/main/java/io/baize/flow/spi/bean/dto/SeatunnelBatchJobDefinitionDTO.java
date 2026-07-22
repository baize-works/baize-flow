package io.baize.flow.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import io.baize.flow.common.enums.ScheduleStatusEnum;


@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Batch job definition DTO")
public class SeatunnelBatchJobDefinitionDTO extends BaseJobDefinitionCommand {

    @Schema(description = "Cron expression", example = "0 0 1 * * ?")
    private String cronExpression;

    @Schema(description = "Schedule status")
    private ScheduleStatusEnum scheduleStatus;

    @Schema(description = "Schedule config json")
    private String scheduleConfig;
}