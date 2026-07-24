package io.baize.flow.api.service;

import io.baize.flow.api.metrics.streaming.model.StreamingParsedJobMetrics;
import io.baize.flow.spi.bean.vo.StreamingMetricsSnapshotVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendItemVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendVO;
import io.baize.flow.spi.bean.vo.StreamingTableMetricsVO;

import java.util.List;

public interface StreamingJobMetricsService {

    StreamingParsedJobMetrics getRealtimeMetricsFromEngine(Long clientId, String engineJobId);

    void saveSnapshot(Long jobInstanceId,
                      Long jobDefinitionId,
                      Long clientId,
                      String engineJobId,
                      StreamingParsedJobMetrics parsed);

    StreamingMetricsSnapshotVO latest(Long instanceId);

    StreamingMetricsTrendVO trend(Long instanceId,
                                  Long startTimeMs,
                                  Long endTimeMs,
                                  String granularity);

    List<StreamingMetricsTrendItemVO> recentTrend(Long instanceId, Integer limit);

    List<StreamingTableMetricsVO> listLatestTableMetrics(Long instanceId);

    void deleteByInstanceId(Long instanceId);

    void deleteByDefinitionId(Long definitionId);

    void deleteExpired(Long retentionDays);
}