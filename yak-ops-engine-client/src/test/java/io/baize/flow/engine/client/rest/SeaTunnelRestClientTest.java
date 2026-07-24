package io.baize.flow.engine.client.rest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import io.baize.flow.engine.client.exceptions.SeaTunnelClientException;
import java.net.ConnectException;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

class SeaTunnelRestClientTest {
    private RestTemplate http;
    private SeaTunnelRestClient client;

    @BeforeEach void setUp() {
        http = mock(RestTemplate.class);
        SeaTunnelClientResolver resolver = mock(SeaTunnelClientResolver.class);
        when(resolver.resolveBaseApiUrl(1L)).thenReturn("http://seatunnel:5801");
        client = new SeaTunnelRestClient(http, resolver);
    }

    @Test void translates_connection_failures() {
        when(http.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class))).thenThrow(new org.springframework.web.client.ResourceAccessException("down", new ConnectException()));
        SeaTunnelClientException error = assertThrows(SeaTunnelClientException.class, () -> client.jobInfo(1L, "9"));
        assertEquals(0, error.getHttpStatus());
        assertInstanceOf(ConnectException.class, error.getCause().getCause());
    }

    @Test void preserves_non_2xx_response_details() {
        when(http.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class))).thenThrow(HttpServerErrorException.create(org.springframework.http.HttpStatus.BAD_GATEWAY, "bad gateway", null, "upstream failed".getBytes(), null));
        SeaTunnelClientException error = assertThrows(SeaTunnelClientException.class, () -> client.jobInfo(1L, "9"));
        assertEquals(502, error.getHttpStatus());
        assertEquals("upstream failed", error.getResponseBody());
    }
}
