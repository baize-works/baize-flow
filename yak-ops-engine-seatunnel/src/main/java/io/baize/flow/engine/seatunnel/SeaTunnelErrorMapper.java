package io.baize.flow.engine.seatunnel;

import io.baize.flow.engine.api.EngineException;

final class SeaTunnelErrorMapper {
    private SeaTunnelErrorMapper() { }
    static EngineException transport(String operation, Exception cause) {
        return new EngineException(EngineException.Code.TRANSPORT_FAILURE, "SeaTunnel " + operation + " failed", cause);
    }
}
