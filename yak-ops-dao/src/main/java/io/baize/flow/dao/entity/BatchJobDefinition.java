package io.baize.flow.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.SyncModeEnum;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@TableName("t_baize_flow_job_definition")
public class BatchJobDefinition {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobName;

    private String jobDesc;

    private String jobDefinitionInfo;

    private Integer jobVersion;

    private Integer parallelism;

    private JobMode jobType;

    private SyncModeEnum syncMode;

    private String sourceType;

    private String sourceTable;

    private String sinkType;

    private String sinkTable;

    private Date createTime;

    private Date updateTime;
}
