package io.baize.flow.engine.seatunnel.rest;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "seatunnel.client")
public class SeaTunnelClientProperties {


    private int connectTimeoutMs = 2000;
    private int readTimeoutMs = 10000;

}
