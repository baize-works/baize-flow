package io.baize.flow.core.verify.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConnectivityTestJob {
    private String jobName;
    private String jobConfig;
    private String configFormat;
    private boolean cleanupRequired;
}
