package io.baize.flow.core.verify.job;

import io.baize.flow.dao.entity.DataSource;
import io.baize.flow.dao.entity.SeaTunnelClient;
import io.baize.flow.spi.enums.DbType;

/**
 * Builder for datasource-specific connectivity test job definitions.
 */
public interface ConnectivityTestJobDefinitionBuilder {

    /**
     * Whether this builder supports the given datasource type.
     */
    boolean supports(DbType dbType);

    /**
     * Build a connectivity test job for the given client and datasource.
     */
    ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource);
}