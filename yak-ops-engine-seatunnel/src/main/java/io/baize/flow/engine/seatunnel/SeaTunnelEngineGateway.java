package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.*;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;

/** SeaTunnel REST adapter. Maps vendor responses before they leave this module. */
@Component
public class SeaTunnelEngineGateway implements EngineGateway {
    private final SeaTunnelEngineClient client;
    public SeaTunnelEngineGateway(SeaTunnelRestClient client) { this(new RestTemplateSeaTunnelEngineClient(client)); }
    SeaTunnelEngineGateway(SeaTunnelEngineClient client) { this.client = client; }
    @Override public EngineType engineType() { return EngineType.SEATUNNEL; }
    @Override public EngineSubmitResult submit(EngineEndpoint endpoint, EngineSubmitCommand command) {
        try {
            SeaTunnelSubmitResponse response = client.submit(clientId(endpoint), command.config().getBytes(StandardCharsets.UTF_8), command.fileName() == null ? "job.conf" : command.fileName());
            if (response == null || response.jobId() == null || response.jobId().isBlank()) throw new EngineException(EngineException.Code.RESPONSE_INVALID, "SeaTunnel submit response does not contain jobId");
            return new EngineSubmitResult(response.jobId(), EngineJobStatus.SUBMITTED);
        } catch (EngineException e) { throw e; } catch (Exception e) { throw SeaTunnelErrorMapper.transport("submit", e); }
    }
    @Override public void stop(EngineEndpoint endpoint, String jobId) { try { client.cancel(clientId(endpoint), jobId); } catch (Exception e) { throw SeaTunnelErrorMapper.transport("stop", e); } }
    @Override public EngineJobSnapshot job(EngineEndpoint endpoint, String jobId) {
        try { SeaTunnelJobResponse info = client.job(clientId(endpoint), jobId); if (info == null) throw new EngineException(EngineException.Code.RESPONSE_INVALID, "SeaTunnel job response is empty"); return new EngineJobSnapshot(jobId, SeaTunnelJobStatusMapper.map(info.status()), info.errorMessage(), info.pipelines().stream().map(SeaTunnelPipelineMapper::map).toList(), info.tasks().stream().map(SeaTunnelTaskMapper::map).toList()); }
        catch (EngineException e) { throw e; } catch (Exception e) { throw SeaTunnelErrorMapper.transport("job query", e); }
    }
    @Override public EngineMetrics metrics(EngineEndpoint endpoint, String jobId) { try { SeaTunnelMetricsResponse response = client.metrics(clientId(endpoint), jobId); if (response == null) throw new EngineException(EngineException.Code.RESPONSE_INVALID, "SeaTunnel metrics response is empty"); return SeaTunnelMetricsMapper.map(response.values()); } catch (EngineException e) { throw e; } catch (Exception e) { throw SeaTunnelErrorMapper.transport("metrics query", e); } }
    @Override public EngineHealth health(EngineEndpoint endpoint) { try { client.probe(clientId(endpoint)); return new EngineHealth(true, "reachable"); } catch (Exception e) { return new EngineHealth(false, e.getMessage()); } }
    @Override public EngineCapabilities capabilities() { return new EngineCapabilities(true, true, true, true); }
    private long clientId(EngineEndpoint endpoint) { try { return Long.parseLong(endpoint.endpointId()); } catch (RuntimeException e) { throw new EngineException(EngineException.Code.ENDPOINT_INVALID, "SeaTunnel endpoint id must be a client id", e); } }
}
