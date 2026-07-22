package io.baize.flow.spi.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientEndpointDTO {

    private Long id;

    private String host;

    private String hostname;

    private Integer port;

    /**
     * MASTER / WORKER
     */
    private String role;

    private String healthStatus;

    private Boolean activeMaster;

    private String baseUrl;

    private String lastError;
}