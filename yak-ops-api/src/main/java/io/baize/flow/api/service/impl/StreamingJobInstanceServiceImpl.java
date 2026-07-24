package io.baize.flow.api.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.api.utils.HoconSensitiveMaskUtil;
import io.baize.flow.common.enums.JobMode;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.common.enums.RunMode;
import io.baize.flow.common.utils.CodeGenerateUtils;
import io.baize.flow.common.utils.ConvertUtil;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.core.hocon.JobDefinitionHoconBuilder;
import io.baize.flow.core.hocon.StreamingJobDefinitionCommandResolver;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.dao.entity.StreamingJobMetrics;
import io.baize.flow.dao.entity.StreamingJobMetricsCurrent;
import io.baize.flow.dao.entity.StreamingJobTableMetricsCurrent;
import io.baize.flow.dao.repository.StreamingJobInstanceDao;
import io.baize.flow.dao.repository.StreamingJobMetricsCurrentDao;
import io.baize.flow.dao.repository.StreamingJobMetricsDao;
import io.baize.flow.dao.repository.StreamingJobTableMetricsCurrentDao;
import io.baize.flow.spi.bean.dto.SeaTunnelJobInstanceDTO;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.*;
import io.baize.flow.spi.enums.Status;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class StreamingJobInstanceServiceImpl implements StreamingJobInstanceService {

    @Resource
    private StreamingJobInstanceDao streamingJobInstanceDao;

    @Resource
    private StreamingJobMetricsCurrentDao streamingJobMetricsCurrentDao;

    @Resource
    private StreamingJobMetricsDao streamingJobMetricsDao;

    @Resource
    private StreamingJobTableMetricsCurrentDao streamingJobTableMetricsCurrentDao;

    @Resource
    private JobDefinitionHoconBuilder jobDefinitionHoconBuilder;

    @Resource
    private StreamingJobDefinitionCommandResolver streamingJobDefinitionCommandResolver;

    @Value("${seatunnel.job.log-dir:logs}")
    private String baseLogDir;

    @Value("${seatunnel.job.max-log-query-bytes:52428800}")
    private long maxLogQueryBytes;

    @Override
    public JobInstanceVO create(Long jobDefineId, RunMode runMode, JobMode jobMode) {
        validateDefinitionId(jobDefineId);
        validateRunMode(runMode);
        validateJobMode(jobMode);

        try {
            log.info("Creating streaming job instance, jobDefineId={}, runMode={}", jobDefineId, runMode);

            JobDefinitionSaveCommand command = loadDefinitionCommand(jobDefineId);
            StreamingJobInstance instance = buildStreamingJobInstance(command, runMode);

            streamingJobInstanceDao.insert(instance);

            log.info("Streaming job instance created successfully, instanceId={}", instance.getId());
            return ConvertUtil.sourceToTarget(instance, JobInstanceVO.class);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Create streaming job instance failed, jobDefineId={}, runMode={}", jobDefineId, runMode, e);
            throw new ServiceException(Status.CREATE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public PaginationResult<JobInstanceVO> paging(SeaTunnelJobInstanceDTO dto) {
        validatePagingRequest(dto);

        try {
            IPage<JobInstanceVO> pageResult = streamingJobInstanceDao.pageWithDefinition(dto);

            if (pageResult.getRecords() != null) {
                pageResult.getRecords().forEach(this::maskSensitiveFields);
            }

            return PaginationResult.buildSuc(pageResult.getRecords(), pageResult);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job instance paging failed, dto={}", dto, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public JobInstanceVO selectById(Long id) {
        validateInstanceId(id);

        try {
            JobInstanceVO vo = streamingJobInstanceDao.selectDetailById(id);
            if (vo == null) {
                throw new ServiceException(Status.BATCH_JOB_INSTANCE_NOT_EXIST);
            }

            vo.setTableMetrics(listTableMetrics(id));
            maskSensitiveFields(vo);
            return vo;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job instance by id failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public String getLogContent(Long instanceId) {
        validateInstanceId(instanceId);

        try {
            JobInstanceVO instance = selectById(instanceId);
            String logPath = instance.getLogPath();

            if (StringUtils.isBlank(logPath)) {
                throw new ServiceException(Status.BATCH_JOB_INSTANCE_LOG_NOT_EXIST);
            }

            Path path = Paths.get(logPath);
            if (!Files.exists(path)) {
                throw new ServiceException(Status.BATCH_JOB_INSTANCE_LOG_NOT_EXIST);
            }

            long fileSize = Files.size(path);
            if (fileSize > maxLogQueryBytes) {
                log.warn(
                        "Streaming job log file is too large, instanceId={}, path={}, fileSize={}, maxLogQueryBytes={}",
                        instanceId,
                        path,
                        fileSize,
                        maxLogQueryBytes
                );

                throw new ServiceException(
                        Status.QUERY_STREAMING_JOB_INSTANCE_LOG_ERROR.getCode(),
                        "当前日志文件过大（>50MB)，请在服务器上查看"
                );
            }

            byte[] bytes = Files.readAllBytes(path);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (ServiceException e) {
            throw e;
        } catch (IOException e) {
            log.error("Read streaming job instance log failed, instanceId={}", instanceId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_LOG_ERROR);
        } catch (Exception e) {
            log.error("Query streaming job instance log failed, instanceId={}", instanceId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_LOG_ERROR);
        }
    }

    @Override
    public boolean existsRunningInstance(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return false;
        }

        try {
            return streamingJobInstanceDao.existsRunningInstance(definitionId);
        } catch (Exception e) {
            log.error("Check running streaming job instance failed, definitionId={}", definitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeAllByDefinitionId(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return;
        }

        try {
            // 1. Delete latest table metrics.
            streamingJobTableMetricsCurrentDao.deleteByDefinitionId(definitionId);

            // 2. Delete latest summary metrics.
            streamingJobMetricsCurrentDao.deleteByDefinitionId(definitionId);

            // 3. Delete snapshot metrics.
            streamingJobMetricsDao.deleteByDefinitionId(definitionId);

            // 4. Delete streaming instances.
            streamingJobInstanceDao.deleteByDefinitionId(definitionId);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Remove all streaming job instances by definition id failed, definitionId={}", definitionId, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public void updateById(StreamingJobInstance po) {
        if (po == null || po.getId() == null || po.getId() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "streamingJobInstance");
        }

        try {
            po.setUpdateTime(new Date());
            streamingJobInstanceDao.updateById(po);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Update streaming job instance failed, id={}", po.getId(), e);
            throw new ServiceException(Status.UPDATE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public List<JobTableMetricsVO> listTableMetrics(Long instanceId) {
        validateInstanceId(instanceId);

        try {
            List<StreamingJobTableMetricsCurrent> records =
                    streamingJobTableMetricsCurrentDao.selectByInstanceId(instanceId);

            if (records == null || records.isEmpty()) {
                return Collections.emptyList();
            }

            return records.stream()
                    .map(item -> ConvertUtil.sourceToTarget(item, JobTableMetricsVO.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Query streaming table metrics failed, instanceId={}", instanceId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public List<JobInstanceVO> listRunningStreamingInstances() {
        try {
            return streamingJobInstanceDao.listRunning();
        } catch (Exception e) {
            log.error("List running streaming job instances failed", e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public StreamingInstanceMetricsDashboardVO getMetricsDashboard(Long instanceId, String range) {
        validateInstanceId(instanceId);

        try {
            JobInstanceVO instance = streamingJobInstanceDao.selectDetailById(instanceId);
            if (instance == null) {
                throw new ServiceException(Status.STREAMING_JOB_INSTANCE_NOT_EXIST);
            }

            StreamingJobMetricsCurrent current =
                    streamingJobMetricsCurrentDao.selectByInstanceId(instanceId);

            long endTimeMs = System.currentTimeMillis();
            long startTimeMs = resolveStartTimeMs(range, endTimeMs);

            List<StreamingJobMetrics> trends =
                    streamingJobMetricsDao.selectByInstanceIdAndTimeRange(
                            instanceId,
                            startTimeMs,
                            endTimeMs
                    );

            List<JobTableMetricsVO> tableMetrics = listTableMetrics(instanceId);

            StreamingInstanceMetricsDashboardVO vo = new StreamingInstanceMetricsDashboardVO();
            vo.setInstance(instance);
            vo.setCurrent(ConvertUtil.sourceToTarget(current, StreamingJobMetricsCurrentVO.class));
            vo.setTrends(convertTrendPoints(trends));
            vo.setTableMetrics(tableMetrics);
            vo.setTopLagTables(buildTopRowDiffTables(tableMetrics, 5));

            maskSensitiveFields(instance);
            return vo;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming instance metrics dashboard failed, instanceId={}, range={}",
                    instanceId, range, e);
            throw new ServiceException(Status.QUERY_STREAMING_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public StreamingJobInstance lastInstance(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return null;
        }

        try {
            return streamingJobInstanceDao.lastInstance(definitionId);
        } catch (Exception e) {
            log.error("Get streaming job last instance failed, definitionId={}", definitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public void updateStatus(Long instanceId, JobStatus targetStatus, String errorMessage) {
        if (instanceId == null || instanceId <= 0) {
            return;
        }
        if (targetStatus == null) {
            return;
        }
        streamingJobInstanceDao.updateStatus(
                instanceId,
                targetStatus,
                errorMessage
        );
    }

    private long resolveStartTimeMs(String range, long endTimeMs) {
        if (StringUtils.isBlank(range)) {
            return endTimeMs - 15 * 60 * 1000L;
        }

        return switch (range) {
            case "15m" -> endTimeMs - 15 * 60 * 1000L;
            case "1h" -> endTimeMs - 60 * 60 * 1000L;
            case "6h" -> endTimeMs - 6 * 60 * 60 * 1000L;
            case "24h" -> endTimeMs - 24 * 60 * 60 * 1000L;
            default -> endTimeMs - 15 * 60 * 1000L;
        };
    }

    private List<StreamingJobMetricsPointVO> convertTrendPoints(List<StreamingJobMetrics> records) {
        if (records == null || records.isEmpty()) {
            return Collections.emptyList();
        }

        return records.stream()
                .map(item -> ConvertUtil.sourceToTarget(item, StreamingJobMetricsPointVO.class))
                .collect(Collectors.toList());
    }

    private List<JobTableMetricsVO> buildTopRowDiffTables(List<JobTableMetricsVO> tableMetrics, int limit) {
        if (tableMetrics == null || tableMetrics.isEmpty()) {
            return Collections.emptyList();
        }

        return tableMetrics.stream()
                .map(this::fillTableMetricsDerivedFields)
                .sorted((a, b) -> {
                    Long diffA = a.getRowDiff() == null ? 0L : a.getRowDiff();
                    Long diffB = b.getRowDiff() == null ? 0L : b.getRowDiff();
                    return diffB.compareTo(diffA);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    private JobTableMetricsVO fillTableMetricsDerivedFields(JobTableMetricsVO vo) {
        if (vo == null) {
            return null;
        }

        Long read = vo.getReadRowCount();
        Long write = vo.getWriteRowCount();

        if (read != null && write != null) {
            vo.setRowDiff(Math.max(read - write, 0L));
        } else {
            vo.setRowDiff(0L);
        }

        return vo;
    }

    private JobDefinitionSaveCommand loadDefinitionCommand(Long jobDefineId) {
        return streamingJobDefinitionCommandResolver.resolve(jobDefineId);
    }

    private StreamingJobInstance buildStreamingJobInstance(
            JobDefinitionSaveCommand command,
            RunMode runMode) {
        validateDefinitionCommand(command);

        Long id = generateInstanceId();
        String runtimeConfig = buildJobConfig(command);
        Date now = new Date();

        return StreamingJobInstance.builder()
                .id(id)
                .jobDefinitionId(command.getId())
                .clientId(command.getBasic().getClientId())
                .runMode(runMode)
                .jobStatus(JobStatus.RUNNING)
                .triggerSource(runMode.name())
                .retryCount(0)
                .runtimeConfig(runtimeConfig)
                .logPath(buildLogPath(id))
                .createTime(now)
                .updateTime(now)
                .build();
    }

    private String buildJobConfig(JobDefinitionSaveCommand command) {
        validateDefinitionCommand(command);

        try {
            return jobDefinitionHoconBuilder.build(command);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build streaming job config failed, command={}", command, e);
            throw new ServiceException(Status.BUILD_JOB_INSTANCE_CONFIG_ERROR);
        }
    }

    private Long generateInstanceId() {
        try {
            return CodeGenerateUtils.getInstance().genCode();
        } catch (CodeGenerateUtils.CodeGenerateException e) {
            log.error("Generate streaming job instance id failed", e);
            throw new ServiceException(Status.GENERATE_JOB_INSTANCE_ID_ERROR);
        }
    }

    private String buildLogPath(Long id) {
        return System.getProperty("user.dir")
                + File.separator
                + Paths.get(baseLogDir, "streaming-job-" + id + ".log");
    }

    private void validateDefinitionId(Long jobDefineId) {
        if (jobDefineId == null || jobDefineId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefineId");
        }
    }

    private void validateInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "instanceId");
        }
    }

    private void validateRunMode(RunMode runMode) {
        if (runMode == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "runMode");
        }
    }

    private void validateJobMode(JobMode jobMode) {
        if (jobMode == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobMode");
        }

        if (!JobMode.STREAMING.equals(jobMode)) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobMode must be STREAMING");
        }
    }

    private void validateDefinitionCommand(JobDefinitionSaveCommand command) {
        if (command == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinition");
        }

        if (command.getId() == null || command.getId() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinitionId");
        }
    }

    private void validatePagingRequest(SeaTunnelJobInstanceDTO dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "dto");
        }

        if (dto.getPageNo() == null || dto.getPageNo() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageNo");
        }

        if (dto.getPageSize() == null || dto.getPageSize() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageSize");
        }
    }

    private void maskSensitiveFields(JobInstanceVO vo) {
        if (vo == null) {
            return;
        }

        if (vo.getRuntimeConfig() != null) {
            vo.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(vo.getRuntimeConfig()));
        }
    }
}