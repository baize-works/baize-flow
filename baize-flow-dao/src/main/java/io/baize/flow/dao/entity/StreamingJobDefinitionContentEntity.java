package io.baize.flow.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import io.baize.flow.common.enums.JobDefinitionMode;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("t_baize_flow_streaming_job_definition_content")
public class StreamingJobDefinitionContentEntity extends BaseEntity{

    private Long jobDefinitionId;

    private Integer version;

    private JobDefinitionMode mode;

    private Integer contentSchemaVersion;

    private String definitionContent;

    private String envConfig;

    private String checkpointConfig;
}