package io.baize.flow.spi.bean.dto;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.SyncModeEnum;
import io.baize.flow.spi.bean.dto.pagination.PaginationBaseDTO;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Batch job definition DTO")
public class BatchJobDefinitionQueryDTO extends PaginationBaseDTO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String sourceType;

    private String sinkType;

    private JobMode jobType;

    private SyncModeEnum syncMode;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTimeStart;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTimeEnd;

    private String jobName;

    private String status;

    private String sourceTable;

    private String scheduleConfig;

    private String sinkTable;

}