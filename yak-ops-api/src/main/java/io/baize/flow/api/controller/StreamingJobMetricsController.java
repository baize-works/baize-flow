package io.baize.flow.api.controller;

import jakarta.annotation.Resource;
import io.baize.flow.api.service.StreamingJobMetricsService;
import io.baize.flow.spi.bean.vo.StreamingMetricsSnapshotVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendVO;
import io.baize.flow.spi.bean.vo.StreamingTableMetricsVO;
import io.baize.flow.spi.enums.Status;
import io.baize.flow.core.exceptions.ServiceException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/streaming/job/metrics")
public class StreamingJobMetricsController {

    @Resource
    private StreamingJobMetricsService streamingJobMetricsService;

    @GetMapping("/{instanceId}/latest")
    public StreamingMetricsSnapshotVO latest(@PathVariable Long instanceId) {
        validateInstanceId(instanceId);
        return streamingJobMetricsService.latest(instanceId);
    }

    @GetMapping("/{instanceId}/trend")
    public StreamingMetricsTrendVO trend(@PathVariable Long instanceId,
                                         @RequestParam(required = false) Long startTimeMs,
                                         @RequestParam(required = false) Long endTimeMs,
                                         @RequestParam(required = false, defaultValue = "minute") String granularity) {
        validateInstanceId(instanceId);
        return streamingJobMetricsService.trend(instanceId, startTimeMs, endTimeMs, granularity);
    }

    @GetMapping("/{instanceId}/tables/latest")
    public List<StreamingTableMetricsVO> latestTables(@PathVariable Long instanceId) {
        validateInstanceId(instanceId);
        return streamingJobMetricsService.listLatestTableMetrics(instanceId);
    }

    private void validateInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "instanceId");
        }
    }
}