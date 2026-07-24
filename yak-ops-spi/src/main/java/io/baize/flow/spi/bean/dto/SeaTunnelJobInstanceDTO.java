package io.baize.flow.spi.bean.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.RunMode;
import io.baize.flow.spi.bean.dto.pagination.PaginationBaseDTO;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Job instance DTO representing a single execution of a job")
public class SeaTunnelJobInstanceDTO extends PaginationBaseDTO {

    @Schema(
            description = "Job instance ID (unique identifier for this execution)",
            example = "10001",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    @Schema(
            description = "Job definition ID that this instance belongs to",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "2001"
    )
    private Long jobDefinitionId;

    @Schema(description = "Job name keyword for fuzzy search", example = "mysql-sync")
    private String keyword;

    @Schema(
            description = "Job execution status filter",
            example = "RUNNING",
            allowableValues = {"SUBMITTED", "PENDING", "RUNNING", "FINISHED", "FAILED", "CANCELLED", "SUSPENDED"}
    )
    private String jobStatus;

    @Schema(
            description = "Query start time range (task startTime >= queryStartTime)",
            example = "2024-01-01 00:00:00",
            type = "string",
            format = "date-time",
            nullable = true
    )
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date queryStartTime;

    @Schema(
            description = "Query end time range (task startTime <= queryEndTime)",
            example = "2024-01-31 23:59:59",
            type = "string",
            format = "date-time",
            nullable = true
    )
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date queryEndTime;

    @Schema(
            description = "Path to the execution log file",
            example = "/var/log/seatunnel/jobs/2024/01/15/instance_10001.log",
            nullable = true
    )
    private String logPath;

    @Schema(description = "Job configuration used for this execution")
    private String jobConfig;

    @Schema(
            description = "Job execution start time",
            example = "2024-01-15 10:00:00",
            type = "string",
            format = "date-time"
    )
    private Date startTime;

    @Schema(
            description = "Run mode (MANUAL or SCHEDULED)",
            example = "MANUAL",
            allowableValues = {"MANUAL", "SCHEDULED"}
    )
    private RunMode runMode;

    @Schema(
            description = "Job execution end time",
            example = "2024-01-15 10:05:30",
            type = "string",
            format = "date-time",
            nullable = true
    )
    private Date endTime;

    @Schema(
            description = "Job type (BATCH or STREAMING)",
            example = "BATCH",
            allowableValues = {"BATCH", "STREAMING"}
    )
    private JobMode jobType;

    @Schema(
            description = "Error message if job failed",
            example = "Connection refused: MySQL server not available",
            nullable = true
    )
    private String errorMessage;

    @Schema(
            description = "Engine-specific job ID (Flink JobID, Spark application ID, etc.)",
            example = "application_1705318800000_1234",
            nullable = true
    )
    private String jobEngineId;
}