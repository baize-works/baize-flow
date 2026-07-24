package io.baize.flow.engine.seatunnel.rest;

import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@SuppressWarnings({"rawtypes", "unchecked"})
public class SeaTunnelEngineRestClient {

    @Resource
    private SeaTunnelRestClient seatunnelRestClient;

    public Map<String, Object> jobInfo(Long clientId, String jobEngineId) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId must not be null");
        }
        if (jobEngineId == null) {
            throw new IllegalArgumentException("jobEngineId must not be null");
        }
        return seatunnelRestClient.jobInfo(clientId, jobEngineId);
    }
}