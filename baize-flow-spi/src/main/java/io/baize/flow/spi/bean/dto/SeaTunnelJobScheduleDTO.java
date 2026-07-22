package io.baize.flow.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.ScheduleStatusEnum;
import io.baize.flow.spi.bean.dto.config.JobScheduleConfig;
import io.baize.flow.spi.bean.dto.pagination.PaginationBaseDTO;

import java.sql.Date;


@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Job schedule DTO")
public class SeaTunnelJobScheduleDTO extends PaginationBaseDTO {


    private Long id;


    private Long jobDefinitionId;


    private String cronExpression;


    private ScheduleStatusEnum scheduleStatus;


    private Date lastScheduleTime;


    private Date nextScheduleTime;


    private JobScheduleConfig scheduleConfig;

}