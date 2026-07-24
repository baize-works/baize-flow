package io.baize.flow.api.port;

import io.baize.flow.engine.api.EngineEndpoint;
import io.baize.flow.engine.api.EngineHealth;

/** Application port for engine liveness operations. */
public interface EngineHealthGateway { EngineHealth health(EngineEndpoint endpoint); }
