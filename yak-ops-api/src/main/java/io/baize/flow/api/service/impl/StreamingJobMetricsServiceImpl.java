package io.baize.flow.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.metrics.fetch.EngineJobInfo;
import io.baize.flow.api.metrics.fetch.EngineMetricsFetchService;
import io.baize.flow.api.metrics.streaming.model.StreamingParsedJobMetrics;
import io.baize.flow.api.metrics.streaming.model.StreamingPipelineMetrics;
import io.baize.flow.api.metrics.streaming.model.StreamingTableMetrics;
import io.baize.flow.api.metrics.streaming.parser.StreamingJobInfoMetricsParser;
import io.baize.flow.api.service.StreamingJobMetricsService;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.dao.entity.StreamingJobMetrics;
import io.baize.flow.dao.entity.StreamingJobMetricsCurrent;
import io.baize.flow.dao.entity.StreamingJobTableMetricsCurrent;
import io.baize.flow.dao.repository.StreamingJobMetricsCurrentDao;
import io.baize.flow.dao.repository.StreamingJobMetricsDao;
import io.baize.flow.dao.repository.StreamingJobTableMetricsCurrentDao;
import io.baize.flow.spi.bean.vo.StreamingMetricsSnapshotVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendItemVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendVO;
import io.baize.flow.spi.bean.vo.StreamingTableMetricsVO;
import io.baize.flow.spi.enums.Status;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class StreamingJobMetricsServiceImpl implements StreamingJobMetricsService {

    private static final ZoneId ZONE_ID = ZoneId.systemDefault();

    private static final DateTimeFormatter SECOND_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final DateTimeFormatter MINUTE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:00");

    private static final DateTimeFormatter HOUR_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00:00");

    private static final DateTimeFormatter DAY_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd 00:00:00");

    @Resource
    private EngineMetricsFetchService engineMetricsFetchService;

    @Resource
    private StreamingJobInfoMetricsParser streamingJobInfoMetricsParser;

    /**
     * 任务级趋势历史表 DAO。
     *
     * 这里只保存采样后的历史趋势，不再每次都写。
     */
    @Resource
    private StreamingJobMetricsDao streamingJobMetricsDao;

    /**
     * 实时任务最新汇总表 DAO。
     *
     */
    @Resource
    private StreamingJobMetricsCurrentDao streamingJobMetricsCurrentDao;

    /**
     * 实时任务表级最新明细表 DAO。
     *
     */
    @Resource
    private StreamingJobTableMetricsCurrentDao streamingJobTableMetricsCurrentDao;

    /**
     * 趋势历史采样间隔。
     *
     * current 表每次采集都会 upsert。
     * snapshot 历史表按这个间隔 insert。
     */
    @Value("${seatunnel.streaming.metrics.snapshot-interval-ms:60000}")
    private long snapshotIntervalMs;

    private final Map<Long, Long> lastSnapshotTimeMap = new ConcurrentHashMap<>();

    @Override
    public StreamingParsedJobMetrics getRealtimeMetricsFromEngine(Long clientId, String engineJobId) {
        validatePositive(clientId, "clientId");

        EngineJobInfo jobInfo = engineMetricsFetchService.fetchJobInfo(clientId, engineJobId);
        return streamingJobInfoMetricsParser.parse(jobInfo);
    }

    /**
     * 方法名仍然保留 saveSnapshot，是为了兼容 StreamingJobMetricsMonitor 当前调用。
     *
     * 实际行为：
     * 1. 每次采集 upsert 最新任务汇总；
     * 2. 每次采集 upsert 最新表级明细；
     * 3. 按 snapshotIntervalMs 采样写入任务级趋势历史；
     * 4. 不再写入表级历史表。
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveSnapshot(Long jobInstanceId,
                             Long jobDefinitionId,
                             Long clientId,
                             String engineJobId,
                             StreamingParsedJobMetrics parsed) {
        validatePositive(jobInstanceId, "jobInstanceId");
        validatePositive(jobDefinitionId, "jobDefinitionId");

        if (parsed == null || parsed.isEmpty()) {
            return;
        }

        Long collectTimeMs = parsed.getCollectTimeMs() == null
                ? System.currentTimeMillis()
                : parsed.getCollectTimeMs();

        Date collectTime = new Date(collectTimeMs);
        Date now = new Date();

        StreamingJobMetricsCurrent current = buildCurrentMetrics(
                jobInstanceId,
                jobDefinitionId,
                clientId,
                engineJobId,
                parsed,
                collectTimeMs,
                collectTime
        );

        streamingJobMetricsCurrentDao.upsert(current);

        List<StreamingJobTableMetricsCurrent> tableCurrentList = buildTableCurrentMetrics(
                jobInstanceId,
                jobDefinitionId,
                clientId,
                engineJobId,
                parsed,
                collectTimeMs,
                collectTime
        );

        if (!tableCurrentList.isEmpty()) {
            streamingJobTableMetricsCurrentDao.upsertBatch(tableCurrentList);
        }

        if (shouldSaveSnapshot(jobInstanceId, collectTimeMs)) {
            List<StreamingJobMetrics> pipelineMetrics = buildPipelineSnapshotMetrics(
                    jobInstanceId,
                    jobDefinitionId,
                    clientId,
                    engineJobId,
                    parsed,
                    collectTimeMs,
                    collectTime,
                    now
            );

            if (!pipelineMetrics.isEmpty()) {
                streamingJobMetricsDao.insertBatch(pipelineMetrics);
            }
        }
    }

    @Override
    public StreamingMetricsSnapshotVO latest(Long instanceId) {
        validatePositive(instanceId, "instanceId");

        StreamingJobMetricsCurrent latest =
                streamingJobMetricsCurrentDao.selectByInstanceId(instanceId);

        List<StreamingJobTableMetricsCurrent> tableMetrics =
                streamingJobTableMetricsCurrentDao.selectByInstanceId(instanceId);

        StreamingMetricsSnapshotVO vo = new StreamingMetricsSnapshotVO();

        if (latest != null) {
            vo.setCollectTimeMs(latest.getLastCollectTimeMs());
            vo.setJobInstanceId(latest.getJobInstanceId());
            vo.setJobDefinitionId(latest.getJobDefinitionId());
            vo.setEngineJobId(latest.getEngineJobId());
            vo.setClientId(latest.getClientId());
            vo.setJobStatus(latest.getJobStatus());

            vo.setReadRowCount(defaultLong(latest.getReadRowCount()));
            vo.setWriteRowCount(defaultLong(latest.getWriteRowCount()));
            vo.setReadQps(defaultDecimal(latest.getReadQps()));
            vo.setWriteQps(defaultDecimal(latest.getWriteQps()));

            vo.setReadBytes(defaultLong(latest.getReadBytes()));
            vo.setWriteBytes(defaultLong(latest.getWriteBytes()));
            vo.setReadBps(defaultDecimal(latest.getReadBps()));
            vo.setWriteBps(defaultDecimal(latest.getWriteBps()));

            vo.setIntermediateQueueSize(defaultLong(latest.getIntermediateQueueSize()));

            /*
             * 如果 StreamingMetricsSnapshotVO 已经加了这些字段，可以放开：
             *
             * vo.setLagCount(defaultLong(latest.getLagCount()));
             * vo.setRecordDelay(defaultLong(latest.getRecordDelay()));
             * vo.setPipelineCount(defaultInteger(latest.getPipelineCount()));
             * vo.setTableCount(defaultInteger(latest.getTableCount()));
             */
        }

        vo.setTableMetrics(toCurrentTableVOList(tableMetrics));
        return vo;
    }

    @Override
    public StreamingMetricsTrendVO trend(Long instanceId,
                                         Long startTimeMs,
                                         Long endTimeMs,
                                         String granularity) {
        validatePositive(instanceId, "instanceId");

        long now = System.currentTimeMillis();
        Long start = startTimeMs == null ? now - Duration.ofHours(1).toMillis() : startTimeMs;
        Long end = endTimeMs == null ? now : endTimeMs;
        String finalGranularity = granularity == null || granularity.isBlank()
                ? "minute"
                : granularity;

        List<StreamingJobMetrics> rows =
                streamingJobMetricsDao.selectByInstanceIdAndTimeRange(instanceId, start, end);

        StreamingMetricsTrendVO vo = new StreamingMetricsTrendVO();
        vo.setItems(buildTrendItems(rows, finalGranularity));
        return vo;
    }

    @Override
    public List<StreamingMetricsTrendItemVO> recentTrend(Long instanceId, Integer limit) {
        validatePositive(instanceId, "instanceId");

        List<StreamingJobMetrics> rows =
                streamingJobMetricsDao.selectRecentByInstanceId(instanceId, limit);

        return toTrendItems(rows);
    }

    private List<StreamingMetricsTrendItemVO> toTrendItems(List<StreamingJobMetrics> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        List<StreamingMetricsTrendItemVO> result = new ArrayList<>();

        for (StreamingJobMetrics item : rows) {
            StreamingMetricsTrendItemVO vo = new StreamingMetricsTrendItemVO();

            vo.setDate(formatTime(item.getCollectTimeMs()));

            vo.setReadRowCount(defaultLong(item.getReadRowCount()));
            vo.setWriteRowCount(defaultLong(item.getWriteRowCount()));

            vo.setReadBytes(defaultLong(item.getReadBytes()));
            vo.setWriteBytes(defaultLong(item.getWriteBytes()));

            vo.setIntermediateQueueSize(defaultLong(item.getIntermediateQueueSize()));

            vo.setReadQps(defaultDecimal(item.getReadQps()));
            vo.setWriteQps(defaultDecimal(item.getWriteQps()));

            vo.setReadBps(defaultDecimal(item.getReadBps()));
            vo.setWriteBps(defaultDecimal(item.getWriteBps()));

            result.add(vo);
        }

        return result;
    }

    private String formatTime(Long collectTimeMs) {
        long timestamp = collectTimeMs == null ? System.currentTimeMillis() : collectTimeMs;

        LocalDateTime time = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(timestamp),
                ZONE_ID
        );

        return time.format(SECOND_FORMATTER);
    }

    @Override
    public List<StreamingTableMetricsVO> listLatestTableMetrics(Long instanceId) {
        validatePositive(instanceId, "instanceId");

        List<StreamingJobTableMetricsCurrent> rows =
                streamingJobTableMetricsCurrentDao.selectByInstanceId(instanceId);

        return toCurrentTableVOList(rows);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteByInstanceId(Long instanceId) {
        if (instanceId == null) {
            return;
        }

        streamingJobTableMetricsCurrentDao.deleteByInstanceId(instanceId);
        streamingJobMetricsCurrentDao.deleteByInstanceId(instanceId);
        streamingJobMetricsDao.deleteByInstanceId(instanceId);

        lastSnapshotTimeMap.remove(instanceId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteByDefinitionId(Long definitionId) {
        if (definitionId == null) {
            return;
        }

        streamingJobTableMetricsCurrentDao.deleteByDefinitionId(definitionId);
        streamingJobMetricsCurrentDao.deleteByDefinitionId(definitionId);
        streamingJobMetricsDao.deleteByDefinitionId(definitionId);
    }

    @Override
    public void deleteExpired(Long retentionDays) {
        if (retentionDays == null || retentionDays <= 0) {
            return;
        }

        long before = System.currentTimeMillis() - Duration.ofDays(retentionDays).toMillis();

        /*
         * current 表代表最新状态，不按过期时间删除。
         * 这里只清理任务级趋势历史。
         */
        streamingJobMetricsDao.deleteBefore(before);
    }

    private StreamingJobMetricsCurrent buildCurrentMetrics(Long jobInstanceId,
                                                           Long jobDefinitionId,
                                                           Long clientId,
                                                           String engineJobId,
                                                           StreamingParsedJobMetrics parsed,
                                                           Long collectTimeMs,
                                                           Date collectTime) {
        StreamingJobMetricsCurrent current = new StreamingJobMetricsCurrent();

        current.setJobInstanceId(jobInstanceId);
        current.setJobDefinitionId(jobDefinitionId);
        current.setClientId(clientId);
        current.setEngineJobId(engineJobId);
        current.setJobStatus(parsed.getJobStatus());

        long readRowCount = 0L;
        long writeRowCount = 0L;
        long readBytes = 0L;
        long writeBytes = 0L;
        long intermediateQueueSize = 0L;
        long lagCount = 0L;
        long recordDelay = 0L;

        BigDecimal readQps = BigDecimal.ZERO;
        BigDecimal writeQps = BigDecimal.ZERO;
        BigDecimal readBps = BigDecimal.ZERO;
        BigDecimal writeBps = BigDecimal.ZERO;

        if (parsed.getPipelineMetrics() != null && !parsed.getPipelineMetrics().isEmpty()) {
            for (StreamingPipelineMetrics item : parsed.getPipelineMetrics().values()) {
                readRowCount += defaultLong(item.getReadRowCount());
                writeRowCount += defaultLong(item.getWriteRowCount());

                readBytes += defaultLong(item.getReadBytes());
                writeBytes += defaultLong(item.getWriteBytes());

                intermediateQueueSize += defaultLong(item.getIntermediateQueueSize());
                lagCount += defaultLong(item.getLagCount());

                /*
                 * 延迟类指标取最大值更直观。
                 */
                recordDelay = Math.max(recordDelay, defaultLong(item.getRecordDelay()));

                readQps = readQps.add(defaultDecimal(item.getReadQps()));
                writeQps = writeQps.add(defaultDecimal(item.getWriteQps()));

                readBps = readBps.add(defaultDecimal(item.getReadBps()));
                writeBps = writeBps.add(defaultDecimal(item.getWriteBps()));
            }
        }

        current.setReadRowCount(readRowCount);
        current.setWriteRowCount(writeRowCount);

        current.setReadQps(readQps);
        current.setWriteQps(writeQps);

        current.setReadBytes(readBytes);
        current.setWriteBytes(writeBytes);

        current.setReadBps(readBps);
        current.setWriteBps(writeBps);

        current.setIntermediateQueueSize(intermediateQueueSize);
        current.setLagCount(lagCount);
        current.setRecordDelay(recordDelay);

        current.setPipelineCount(
                parsed.getPipelineMetrics() == null ? 0 : parsed.getPipelineMetrics().size()
        );
        current.setTableCount(
                parsed.getTableMetrics() == null ? 0 : parsed.getTableMetrics().size()
        );

        current.setLastCollectTimeMs(collectTimeMs);
        current.setLastCollectTime(collectTime);

        return current;
    }

    private List<StreamingJobTableMetricsCurrent> buildTableCurrentMetrics(Long jobInstanceId,
                                                                           Long jobDefinitionId,
                                                                           Long clientId,
                                                                           String engineJobId,
                                                                           StreamingParsedJobMetrics parsed,
                                                                           Long collectTimeMs,
                                                                           Date collectTime) {
        if (parsed.getTableMetrics() == null || parsed.getTableMetrics().isEmpty()) {
            return Collections.emptyList();
        }

        List<StreamingJobTableMetricsCurrent> result = new ArrayList<>();

        for (StreamingTableMetrics item : parsed.getTableMetrics()) {
            StreamingJobTableMetricsCurrent po = new StreamingJobTableMetricsCurrent();

            String tableKey = buildTableKey(
                    item.getSourceTable(),
                    item.getSinkTable(),
                    item.getTableKey()
            );

            po.setJobInstanceId(jobInstanceId);
            po.setJobDefinitionId(jobDefinitionId);
            po.setClientId(clientId);
            po.setEngineJobId(engineJobId);
            po.setPipelineId(defaultPipelineId(item.getPipelineId()));

            po.setSourceTable(item.getSourceTable());
            po.setSinkTable(item.getSinkTable());
            po.setTableKey(tableKey);
            po.setTableKeyHash(md5Hex(tableKey));

            po.setReadRowCount(defaultLong(item.getReadRowCount()));
            po.setWriteRowCount(defaultLong(item.getWriteRowCount()));

            po.setReadQps(defaultDecimal(item.getReadQps()));
            po.setWriteQps(defaultDecimal(item.getWriteQps()));

            po.setReadBytes(defaultLong(item.getReadBytes()));
            po.setWriteBytes(defaultLong(item.getWriteBytes()));

            po.setReadBps(defaultDecimal(item.getReadBps()));
            po.setWriteBps(defaultDecimal(item.getWriteBps()));

            po.setStatus(item.getStatus());
            po.setErrorMsg(item.getErrorMsg());

            po.setLastCollectTimeMs(collectTimeMs);
            po.setLastCollectTime(collectTime);

            result.add(po);
        }

        return result;
    }

    private List<StreamingJobMetrics> buildPipelineSnapshotMetrics(Long jobInstanceId,
                                                                   Long jobDefinitionId,
                                                                   Long clientId,
                                                                   String engineJobId,
                                                                   StreamingParsedJobMetrics parsed,
                                                                   Long collectTimeMs,
                                                                   Date collectTime,
                                                                   Date now) {
        if (parsed.getPipelineMetrics() == null || parsed.getPipelineMetrics().isEmpty()) {
            return Collections.emptyList();
        }

        List<StreamingJobMetrics> result = new ArrayList<>();

        for (StreamingPipelineMetrics item : parsed.getPipelineMetrics().values()) {
            StreamingJobMetrics po = new StreamingJobMetrics();

            po.setCollectTimeMs(collectTimeMs);
            po.setJobInstanceId(jobInstanceId);
            po.setJobDefinitionId(jobDefinitionId);
            po.setClientId(clientId);
            po.setEngineJobId(engineJobId);
            po.setPipelineId(defaultPipelineId(item.getPipelineId()));
            po.setJobStatus(parsed.getJobStatus());

            po.setReadRowCount(defaultLong(item.getReadRowCount()));
            po.setWriteRowCount(defaultLong(item.getWriteRowCount()));

            po.setReadQps(defaultDecimal(item.getReadQps()));
            po.setWriteQps(defaultDecimal(item.getWriteQps()));

            po.setReadBytes(defaultLong(item.getReadBytes()));
            po.setWriteBytes(defaultLong(item.getWriteBytes()));

            po.setReadBps(defaultDecimal(item.getReadBps()));
            po.setWriteBps(defaultDecimal(item.getWriteBps()));

            po.setIntermediateQueueSize(defaultLong(item.getIntermediateQueueSize()));
            po.setLagCount(defaultLong(item.getLagCount()));
            po.setRecordDelay(defaultLong(item.getRecordDelay()));

            po.setCollectTime(collectTime);
            po.setCreateTime(now);

            result.add(po);
        }

        return result;
    }

    private List<StreamingMetricsTrendItemVO> buildTrendItems(List<StreamingJobMetrics> rows,
                                                              String granularity) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, List<StreamingJobMetrics>> groupMap = new LinkedHashMap<>();

        for (StreamingJobMetrics row : rows) {
            String bucket = buildBucket(row.getCollectTimeMs(), granularity);
            groupMap.computeIfAbsent(bucket, key -> new ArrayList<>()).add(row);
        }

        List<StreamingMetricsTrendItemVO> result = new ArrayList<>();

        for (Map.Entry<String, List<StreamingJobMetrics>> entry : groupMap.entrySet()) {
            List<StreamingJobMetrics> bucketRows = entry.getValue();

            long readRowCount = 0L;
            long writeRowCount = 0L;
            long readBytes = 0L;
            long writeBytes = 0L;
            long intermediateQueueSize = 0L;

            BigDecimal readQps = BigDecimal.ZERO;
            BigDecimal writeQps = BigDecimal.ZERO;
            BigDecimal readBps = BigDecimal.ZERO;
            BigDecimal writeBps = BigDecimal.ZERO;

            for (StreamingJobMetrics item : bucketRows) {
                /*
                 * row count / bytes 一般是累计值。
                 * 同一个时间桶内取最大值。
                 */
                readRowCount = Math.max(readRowCount, defaultLong(item.getReadRowCount()));
                writeRowCount = Math.max(writeRowCount, defaultLong(item.getWriteRowCount()));

                readBytes = Math.max(readBytes, defaultLong(item.getReadBytes()));
                writeBytes = Math.max(writeBytes, defaultLong(item.getWriteBytes()));

                intermediateQueueSize = Math.max(
                        intermediateQueueSize,
                        defaultLong(item.getIntermediateQueueSize())
                );

                /*
                 * qps / bps 是速率值。
                 * 同一个时间桶内取平均值。
                 */
                readQps = readQps.add(defaultDecimal(item.getReadQps()));
                writeQps = writeQps.add(defaultDecimal(item.getWriteQps()));

                readBps = readBps.add(defaultDecimal(item.getReadBps()));
                writeBps = writeBps.add(defaultDecimal(item.getWriteBps()));
            }

            BigDecimal bucketSize = BigDecimal.valueOf(Math.max(bucketRows.size(), 1));

            StreamingMetricsTrendItemVO vo = new StreamingMetricsTrendItemVO();
            vo.setDate(entry.getKey());

            vo.setReadRowCount(readRowCount);
            vo.setWriteRowCount(writeRowCount);

            vo.setReadBytes(readBytes);
            vo.setWriteBytes(writeBytes);

            vo.setIntermediateQueueSize(intermediateQueueSize);

            vo.setReadQps(divide(readQps, bucketSize));
            vo.setWriteQps(divide(writeQps, bucketSize));

            vo.setReadBps(divide(readBps, bucketSize));
            vo.setWriteBps(divide(writeBps, bucketSize));

            result.add(vo);
        }

        return result;
    }

    private List<StreamingTableMetricsVO> toCurrentTableVOList(List<StreamingJobTableMetricsCurrent> list) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        List<StreamingTableMetricsVO> result = new ArrayList<>();

        for (StreamingJobTableMetricsCurrent item : list) {
            StreamingTableMetricsVO vo = new StreamingTableMetricsVO();

            vo.setCollectTimeMs(item.getLastCollectTimeMs());
            vo.setJobInstanceId(item.getJobInstanceId());
            vo.setJobDefinitionId(item.getJobDefinitionId());
            vo.setEngineJobId(item.getEngineJobId());
            vo.setClientId(item.getClientId());
            vo.setPipelineId(item.getPipelineId());

            vo.setSourceTable(item.getSourceTable());
            vo.setSinkTable(item.getSinkTable());
            vo.setTableKey(item.getTableKey());

            vo.setReadRowCount(defaultLong(item.getReadRowCount()));
            vo.setWriteRowCount(defaultLong(item.getWriteRowCount()));

            vo.setReadQps(defaultDecimal(item.getReadQps()));
            vo.setWriteQps(defaultDecimal(item.getWriteQps()));

            vo.setReadBytes(defaultLong(item.getReadBytes()));
            vo.setWriteBytes(defaultLong(item.getWriteBytes()));

            vo.setReadBps(defaultDecimal(item.getReadBps()));
            vo.setWriteBps(defaultDecimal(item.getWriteBps()));

            vo.setStatus(item.getStatus());
            vo.setErrorMsg(item.getErrorMsg());

            result.add(vo);
        }

        return result;
    }

    private boolean shouldSaveSnapshot(Long instanceId, Long collectTimeMs) {
        if (instanceId == null || collectTimeMs == null) {
            return false;
        }

        if (snapshotIntervalMs <= 0) {
            return false;
        }

        Long lastTime = lastSnapshotTimeMap.get(instanceId);
        if (lastTime == null || collectTimeMs - lastTime >= snapshotIntervalMs) {
            lastSnapshotTimeMap.put(instanceId, collectTimeMs);
            return true;
        }

        return false;
    }

    private String buildBucket(Long collectTimeMs, String granularity) {
        long timestamp = collectTimeMs == null ? System.currentTimeMillis() : collectTimeMs;

        LocalDateTime time = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(timestamp),
                ZONE_ID
        );

        String finalGranularity = granularity == null ? "minute" : granularity;

        if ("second".equalsIgnoreCase(finalGranularity)) {
            return time.format(SECOND_FORMATTER);
        }

        if ("hour".equalsIgnoreCase(finalGranularity)) {
            return time.format(HOUR_FORMATTER);
        }

        if ("day".equalsIgnoreCase(finalGranularity)) {
            return time.format(DAY_FORMATTER);
        }

        return time.format(MINUTE_FORMATTER);
    }

    private String buildTableKey(String sourceTable, String sinkTable, String tableKey) {
        if (tableKey != null && !tableKey.isBlank()) {
            return tableKey;
        }

        return safe(sourceTable) + "->" + safe(sinkTable);
    }

    private String md5Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(
                    (value == null ? "" : value).getBytes(StandardCharsets.UTF_8)
            );

            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Generate tableKey hash failed", e);
        }
    }

    private int defaultPipelineId(Integer pipelineId) {
        return pipelineId == null ? 0 : pipelineId;
    }

    private Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private Integer defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal defaultDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal divide(BigDecimal value, BigDecimal divisor) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (divisor == null || BigDecimal.ZERO.compareTo(divisor) == 0) {
            return BigDecimal.ZERO;
        }

        return value.divide(divisor, 4);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private void validatePositive(Long value, String name) {
        if (value == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, name);
        }
    }
}