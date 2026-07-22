package io.baize.flow.plugin.datasource.connection.driver;

import io.baize.flow.plugin.datasource.connection.api.DataSourceId;
import io.baize.flow.plugin.datasource.connection.api.DriverDescriptor;

public interface DriverProvider {
    DriverHandle getOrCreate(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void release(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void shutdown();
}
