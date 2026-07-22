package io.baize.flow.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.exceptions.ApiException;
import io.baize.flow.api.service.StreamingJobExecutorService;
import io.baize.flow.common.enums.RunMode;
import io.baize.flow.spi.bean.entity.Result;
import org.springframework.web.bind.annotation.*;

import static io.baize.flow.spi.enums.Status.JOB_DEFINITION_EXECUTE_ERROR;

@Slf4j
@RestController
@Tag(name = "STREAMING_JOB_EXECUTOR_TAG")
@RequestMapping("/api/v1/streaming-executor")
public class StreamingJobExecutorController {

    @Resource
    private StreamingJobExecutorService streamingJobExecutorService;

    /**
     * Execute a streaming SeaTunnel job by streaming job definition ID.
     */
    @GetMapping("/execute")
    @Operation(summary = "executeStreamingJob", description = "Execute streaming job by definition id")
    @Parameters({
            @Parameter(name = "jobDefineId", description = "STREAMING_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> execute(@RequestParam("jobDefineId") Long jobDefineId) {
        Long jobInstanceId = streamingJobExecutorService.jobExecute(jobDefineId, RunMode.MANUAL);
        return Result.buildSuc(jobInstanceId);
    }

    /**
     * Pause / stop a running streaming SeaTunnel job instance.
     */
    @GetMapping("/pause")
    @Operation(summary = "pauseStreamingJob", description = "Pause streaming job by instance id")
    @Parameters({
            @Parameter(name = "jobInstanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> pause(@RequestParam("jobInstanceId") Long jobInstanceId) {
        Long id = streamingJobExecutorService.jobPause(jobInstanceId);
        return Result.buildSuc(id);
    }

    /**
     * Stop a running streaming job with savepoint.
     *
     * <p>
     * This API is mainly used by CDC jobs. The engine will stop the job after saving
     * the current state. The saved state can be used by resume-from-savepoint.
     * </p>
     */
    @PostMapping("/stop-with-savepoint")
    @Operation(
            summary = "stopStreamingJobWithSavepoint",
            description = "Stop streaming job with Zeta savepoint by instance id"
    )
    @Parameters({
            @Parameter(name = "jobInstanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> stopWithSavepoint(@RequestParam("jobInstanceId") Long jobInstanceId) {
        Long id = streamingJobExecutorService.jobStopWithSavepoint(jobInstanceId);
        return Result.buildSuc(id);
    }

    /**
     * Resume a streaming job from a previous savepoint.
     *
     * <p>
     * sourceJobInstanceId is the stopped instance id which was stopped by
     * stop-with-savepoint.
     * </p>
     */
    @PostMapping("/resume-from-savepoint")
    @Operation(
            summary = "resumeStreamingJobFromSavepoint",
            description = "Resume streaming job from previous Zeta savepoint"
    )
    @Parameters({
            @Parameter(name = "sourceJobInstanceId", description = "SOURCE_STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> resumeFromSavepoint(@RequestParam("sourceJobInstanceId") Long sourceJobInstanceId) {
        Long newJobInstanceId =
                streamingJobExecutorService.jobResumeFromSavepoint(sourceJobInstanceId, RunMode.MANUAL);
        return Result.buildSuc(newJobInstanceId);
    }
}