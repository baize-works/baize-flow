package io.baize.flow.engine.client.rest;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.dao.entity.SeaTunnelClient;
import io.baize.flow.dao.repository.SeaTunnelClientDao;
import io.baize.flow.engine.client.modal.SeaTunnelClientAuth;
import org.springframework.stereotype.Component;

import static org.apache.seatunnel.plugin.datasource.api.utils.PasswordUtils.decodePassword;

@Component
public class SeaTunnelClientResolver {

    @Resource
    private SeaTunnelClientDao seatunnelClientDao;

    public String resolveBaseApiUrl(Long clientId) {
        SeaTunnelClient entity = seatunnelClientDao.queryById(clientId);
        String baseUrl = entity.getBaseUrl();
        String contextPath = entity.getContextPath();

        // context_path
        if (StringUtils.isNotBlank(contextPath)) {
            return baseUrl + "/" + StringUtils.removeStart(contextPath, "/") + contextPath;
        }

        return baseUrl;
    }

    public SeaTunnelClientAuth resolveAuth(Long clientId) {
        SeaTunnelClient client = seatunnelClientDao.selectById(clientId);

        SeaTunnelClientAuth auth = new SeaTunnelClientAuth();
        auth.setAuthEnabled(client.getAuthEnabled());
        auth.setUsername(client.getUsername());
        auth.setPassword(client.getPassword());
        return auth;
    }
}
