package io.baize.flow.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.exceptions.ApiException;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.spi.bean.dto.SeaTunnelJobInstanceDTO;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.entity.Result;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import io.baize.flow.spi.bean.vo.JobTableMetricsVO;
import io.baize.flow.spi.bean.vo.StreamingInstanceMetricsDashboardVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.baize.flow.spi.enums.Status.*;

/**
 * Streaming Job Instance Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/job/streaming-instance")
@Validated
@Tag(name = "STREAMING_JOB_INSTANCE_TAG")
public class StreamingJobInstanceController {

    @Resource
    private StreamingJobInstanceService streamingJobInstanceService;

    @PostMapping("/page")
    @Operation(
            summary = "queryStreamingJobInstancePaging",
            description = "QUERY_STREAMING_JOB_INSTANCE_PAGING_NOTES"
    )
    @ApiException(QUERY_BATCH_JOB_INSTANCE_ERROR)
    public PaginationResult<JobInstanceVO> paging(@RequestBody SeaTunnelJobInstanceDTO dto) {
        return streamingJobInstanceService.paging(dto);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "selectStreamingJobInstanceById",
            description = "SELECT_STREAMING_JOB_INSTANCE_BY_ID_NOTES"
    )
    @Parameters({
            @Parameter(name = "id", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(STREAMING_JOB_INSTANCE_NOT_EXIST)
    public Result<JobInstanceVO> selectById(@PathVariable("id") @NotNull Long id) {
        return Result.buildSuc(streamingJobInstanceService.selectById(id));
    }

    @GetMapping("/{instanceId}/table-metrics")
    @Operation(
            summary = "queryStreamingJobInstanceTableMetrics",
            description = "QUERY_STREAMING_JOB_INSTANCE_TABLE_METRICS_NOTES"
    )
    @Parameters({
            @Parameter(name = "instanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(QUERY_STREAMING_JOB_INSTANCE_ERROR)
    public Result<List<JobTableMetricsVO>> listTableMetrics(
            @PathVariable("instanceId") @NotNull Long instanceId) {
        return Result.buildSuc(streamingJobInstanceService.listTableMetrics(instanceId));
    }

    @GetMapping("/{instanceId}/log")
    @Operation(
            summary = "queryStreamingJobInstanceLog",
            description = "QUERY_STREAMING_JOB_INSTANCE_LOG_NOTES"
    )
    @Parameters({
            @Parameter(name = "instanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(QUERY_STREAMING_JOB_INSTANCE_LOG_ERROR)
    public Result<String> getLog(@PathVariable("instanceId") @NotNull Long instanceId) {
        return Result.buildSuc(streamingJobInstanceService.getLogContent(instanceId));
    }

    @GetMapping("/running")
    @Operation(
            summary = "listRunningStreamingJobInstances",
            description = "LIST_RUNNING_STREAMING_JOB_INSTANCES_NOTES"
    )
    @ApiException(QUERY_STREAMING_JOB_INSTANCE_ERROR)
    public Result<List<JobInstanceVO>> listRunningStreamingInstances() {
        return Result.buildSuc(streamingJobInstanceService.listRunningStreamingInstances());
    }

    @GetMapping("/{instanceId}/metrics-dashboard")
    @Operation(
            summary = "queryStreamingJobInstanceMetricsDashboard",
            description = "QUERY_STREAMING_JOB_INSTANCE_METRICS_DASHBOARD_NOTES"
    )
    @Parameters({
            @Parameter(name = "instanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true),
            @Parameter(name = "range", description = "METRICS_TIME_RANGE")
    })
    @ApiException(QUERY_STREAMING_JOB_INSTANCE_ERROR)
    public Result<StreamingInstanceMetricsDashboardVO> getMetricsDashboard(
            @PathVariable("instanceId") @NotNull Long instanceId,
            @RequestParam(value = "range", defaultValue = "15m") String range) {
        return Result.buildSuc(streamingJobInstanceService.getMetricsDashboard(instanceId, range));
    }
}