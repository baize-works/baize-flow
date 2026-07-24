package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.*;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** SeaTunnel REST adapter. Maps vendor responses before they leave this module. */
@Component
public class SeaTunnelEngineGateway implements EngineGateway {
    private final SeaTunnelRestClient client;
    public SeaTunnelEngineGateway(SeaTunnelRestClient client) { this.client = client; }
    @Override public EngineType engineType() { return EngineType.SEATUNNEL; }
    @Override public EngineSubmitResult submit(EngineEndpoint endpoint, EngineSubmitCommand command) {
        try {
            Map response = client.submitJobUpload(clientId(endpoint), command.config().getBytes(StandardCharsets.UTF_8), command.fileName() == null ? "job.conf" : command.fileName());
            Object id = response == null ? null : response.get("jobId");
            if (id == null) throw new EngineException(EngineException.Code.RESPONSE_INVALID, "SeaTunnel submit response does not contain jobId");
            return new EngineSubmitResult(id.toString(), EngineJobStatus.SUBMITTED);
        } catch (EngineException e) { throw e; } catch (Exception e) { throw SeaTunnelErrorMapper.transport("submit", e); }
    }
    @Override public void stop(EngineEndpoint endpoint, String jobId) { try { client.stopJob(clientId(endpoint), jobId, false); } catch (Exception e) { throw SeaTunnelErrorMapper.transport("stop", e); } }
    @Override public EngineJobSnapshot job(EngineEndpoint endpoint, String jobId) {
        try { Map info = client.jobInfo(clientId(endpoint), jobId); String status = info == null ? null : String.valueOf(info.get("status")); return new EngineJobSnapshot(jobId, SeaTunnelJobStatusMapper.map(status), info == null ? null : string(info.get("errorMessage")), List.of(), List.of()); }
        catch (Exception e) { throw SeaTunnelErrorMapper.transport("job query", e); }
    }
    @Override public EngineMetrics metrics(EngineEndpoint endpoint, String jobId) { try { return SeaTunnelMetricsMapper.map(Map.of()); } catch (Exception e) { throw SeaTunnelErrorMapper.transport("metrics query", e); } }
    @Override public EngineHealth health(EngineEndpoint endpoint) { try { client.runningJobs(clientId(endpoint)); return new EngineHealth(true, "reachable"); } catch (Exception e) { return new EngineHealth(false, e.getMessage()); } }
    @Override public EngineCapabilities capabilities() { return new EngineCapabilities(true, true, true, true); }
    private long clientId(EngineEndpoint endpoint) { try { return Long.parseLong(endpoint.endpointId()); } catch (RuntimeException e) { throw new EngineException(EngineException.Code.ENDPOINT_INVALID, "SeaTunnel endpoint id must be a client id", e); } }
    private String string(Object value) { return value == null ? null : value.toString(); }
}
