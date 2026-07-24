package io.baize.flow.infrastructure.engine;

import io.baize.flow.engine.api.EngineGateway;
import io.baize.flow.engine.api.EngineGatewayRegistry;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EngineGatewayConfiguration {
    @Bean
    EngineGatewayRegistry engineGatewayRegistry(List<EngineGateway> gateways) {
        return new EngineGatewayRegistry(gateways);
    }
}
