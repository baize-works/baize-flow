package io.baize.flow.spi.bean.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.spi.bean.dto.pagination.PaginationBaseDTO;

@Data
@EqualsAndHashCode(callSuper = true)
public class StreamingJobDefinitionQueryDTO extends PaginationBaseDTO {


    private String jobName;

    private JobDefinitionMode mode;

    private JobMode jobType;

    private ReleaseState releaseState;

    private Long clientId;

    private String sourceType;

    private String sinkType;
}