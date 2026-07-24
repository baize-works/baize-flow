package io.baize.flow.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("t_baize_flow_streaming_job_metrics_current")
public class StreamingJobMetricsCurrent {

    @TableId(value = "job_instance_id", type = IdType.INPUT)
    private Long jobInstanceId;

    private Long jobDefinitionId;

    private String engineJobId;

    private Long clientId;

    private String jobStatus;

    private Long readRowCount;

    private Long writeRowCount;

    private BigDecimal readQps;

    private BigDecimal writeQps;

    private Long readBytes;

    private Long writeBytes;

    private BigDecimal readBps;

    private BigDecimal writeBps;

    private Long intermediateQueueSize;

    private Long lagCount;

    private Long recordDelay;

    private Integer pipelineCount;

    private Integer tableCount;

    private Long lastCollectTimeMs;

    private Date lastCollectTime;

    private Date createTime;

    private Date updateTime;
}