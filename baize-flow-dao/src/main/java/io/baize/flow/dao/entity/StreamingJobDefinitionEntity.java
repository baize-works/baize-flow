package io.baize.flow.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import io.baize.flow.common.enums.JobDefinitionMode;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.ReleaseState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("t_baize_flow_streaming_job_definition")
public class StreamingJobDefinitionEntity extends BaseEntity {

    private String jobName;

    private String jobDesc;

    private JobDefinitionMode mode;

    private JobMode jobType;

    private Long clientId;

    private Integer jobVersion;

    private ReleaseState releaseState;

    private String sourceType;

    private String sinkType;

    private String sourceTable;

    private String sinkTable;

    private Long sourceDatasourceId;

    private Long sinkDatasourceId;
}