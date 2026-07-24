package io.baize.flow.api.service.application.job;
import io.baize.flow.engine.api.EngineEndpoint;
import io.baize.flow.engine.api.EngineGatewayRegistry;
import org.springframework.stereotype.Component;
/** Application boundary for engine liveness probes used by scheduler adapters. */
@Component public class CheckEngineHealthUseCase { private final EngineGatewayRegistry gateways; public CheckEngineHealthUseCase(EngineGatewayRegistry gateways){this.gateways=gateways;} public boolean check(Long clientId){EngineEndpoint endpoint=EngineEndpoint.seatunnel(clientId); return gateways.get(endpoint.engineType()).health(endpoint).healthy();} }
