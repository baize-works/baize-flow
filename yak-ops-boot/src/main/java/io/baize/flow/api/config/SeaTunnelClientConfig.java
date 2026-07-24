package io.baize.flow.api.config;

import io.baize.flow.engine.client.rest.SeaTunnelClientProperties;
import io.baize.flow.engine.client.rest.SeaTunnelClientResolver;
import io.baize.flow.engine.client.rest.SeaTunnelRestClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(SeaTunnelClientProperties.class)
public class SeaTunnelClientConfig {

    @Bean
    public RestTemplate seaTunnelRestTemplate(SeaTunnelClientProperties props) {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(props.getConnectTimeoutMs());
        f.setReadTimeout(props.getReadTimeoutMs());
        return new RestTemplate(f);
    }

}