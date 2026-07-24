package io.baize.flow.plugin.datasource.connection.driver;


import io.baize.flow.plugin.datasource.connection.api.DataSourceId;
import io.baize.flow.plugin.datasource.connection.api.DriverClassPath;
import io.baize.flow.plugin.datasource.connection.api.DriverDescriptor;

import java.io.Serializable;

public interface DriverStorageStrategy extends Serializable {



    DriverClassPath prepare(DataSourceId dataSourceId, DriverDescriptor descriptor);


    void release(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void shutdown();
}
