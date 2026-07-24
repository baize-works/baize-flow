package io.baize.flow.core.verify.modal;

import lombok.Builder;
import lombok.Data;
import io.baize.flow.dao.entity.DataSource;
import io.baize.flow.dao.entity.SeaTunnelClient;
import io.baize.flow.spi.enums.DbType;

@Data
@Builder
public class DatasourceVerifyContext {

    private SeaTunnelClient client;

    private DataSource datasource;

    private DbType dbType;

    private String pluginName;

    private String connectorType;

    private String role;

    private long timeoutMs;

    private long pollIntervalMs;
}