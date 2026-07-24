package io.baize.flow.api.service.application.engine;

import io.baize.flow.dao.entity.SeaTunnelClient;
import io.baize.flow.dao.repository.SeaTunnelClientDao;
import io.baize.flow.engine.api.EngineConnectionConfig;
import io.baize.flow.engine.api.EngineConnectionConfigProvider;
import io.baize.flow.engine.api.EngineEndpoint;
import io.baize.flow.engine.api.EngineException;
import io.baize.flow.engine.api.EngineType;
import org.springframework.stereotype.Component;

/** Resolves persisted client settings at the application boundary, not in an engine adapter. */
@Component
public class SeaTunnelConnectionConfigProvider implements EngineConnectionConfigProvider {
    private final SeaTunnelClientDao clients;
    public SeaTunnelConnectionConfigProvider(SeaTunnelClientDao clients) { this.clients = clients; }
    @Override public EngineConnectionConfig connectionFor(EngineEndpoint endpoint) {
        if (endpoint.engineType() != EngineType.SEATUNNEL) throw new EngineException(EngineException.Code.ENDPOINT_INVALID, "Expected a SeaTunnel endpoint");
        long id;
        try { id = Long.parseLong(endpoint.endpointId()); } catch (RuntimeException e) { throw new EngineException(EngineException.Code.ENDPOINT_INVALID, "SeaTunnel endpoint id must be a client id", e); }
        SeaTunnelClient client = clients.queryById(id);
        if (client == null) throw new EngineException(EngineException.Code.ENDPOINT_INVALID, "SeaTunnel client does not exist: " + id);
        return new EngineConnectionConfig(client.getBaseUrl(), client.getContextPath(), Boolean.TRUE.equals(client.getAuthEnabled()), client.getUsername(), client.getPassword());
    }
}
