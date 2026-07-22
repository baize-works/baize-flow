package io.baize.flow.spi.bean.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientVO {
    private Long id;
    private String clientName;
    private String engineType;
    private String baseUrl;
    private String contextPath;
    private Integer clientStatus;
    private String clientStatusName;
    private Integer healthStatus;
    private String healthStatusName;
    private Date heartbeatTime;
    private String version;
    private String containerId;
    private String clientAddress;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
