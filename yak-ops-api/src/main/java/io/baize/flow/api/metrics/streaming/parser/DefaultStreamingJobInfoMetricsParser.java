package io.baize.flow.api.metrics.streaming.parser;

import lombok.Data;
import io.baize.flow.api.metrics.fetch.EngineJobInfo;
import io.baize.flow.api.metrics.streaming.model.StreamingParsedJobMetrics;
import io.baize.flow.api.metrics.streaming.model.StreamingPipelineMetrics;
import io.baize.flow.api.metrics.streaming.model.StreamingTableMetrics;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

import java.util.*;

@Component
@SuppressWarnings({"rawtypes", "unchecked"})
public class DefaultStreamingJobInfoMetricsParser implements StreamingJobInfoMetricsParser {

    @Override
    public StreamingParsedJobMetrics parse(EngineJobInfo jobInfo) {
        StreamingParsedJobMetrics parsed = new StreamingParsedJobMetrics();

        if (jobInfo == null) {
            return parsed;
        }

        parsed.setClientId(jobInfo.getClientId());
        parsed.setEngineJobId(jobInfo.getEngineJobId());
        parsed.setJobName(jobInfo.getJobName());
        parsed.setJobStatus(jobInfo.getJobStatus());
        parsed.setCollectTimeMs(System.currentTimeMillis());

        Map<String, Object> metrics = jobInfo.getRawMetrics();
        if (metrics == null || metrics.isEmpty()) {
            return parsed;
        }

        Map<Integer, StreamingPipelineMetrics> pipelineMetrics = parsePipelineMetrics(metrics);
        List<StreamingTableMetrics> tableMetrics = parseTableMetrics(jobInfo.getRawJobInfo(), metrics);

        fillPipelineSpeedFromTableIfNecessary(pipelineMetrics, tableMetrics);

        parsed.setPipelineMetrics(pipelineMetrics);
        parsed.setTableMetrics(tableMetrics);

        return parsed;
    }

    private Map<Integer, StreamingPipelineMetrics> parsePipelineMetrics(Map<String, Object> metrics) {
        Map<Integer, StreamingPipelineMetrics> result = new LinkedHashMap<>();

        boolean pipelineKeyed = isPipelineKeyed(metrics);
        if (pipelineKeyed) {
            for (Map.Entry<String, Object> entry : metrics.entrySet()) {
                if (!(entry.getValue() instanceof Map)) {
                    continue;
                }

                Integer pipelineId = toInteger(entry.getKey(), 0);
                StreamingPipelineMetrics item = mapPipelineBlock(pipelineId, (Map<?, ?>) entry.getValue());
                result.put(pipelineId, item);
            }
            return result;
        }

        StreamingPipelineMetrics item = mapPipelineBlock(0, metrics);
        result.put(0, item);
        return result;
    }

    private StreamingPipelineMetrics mapPipelineBlock(Integer pipelineId, Map<?, ?> block) {
        StreamingPipelineMetrics item = new StreamingPipelineMetrics();
        item.setPipelineId(pipelineId == null ? 0 : pipelineId);

        item.setReadRowCount(getLong(block,
                "readRowCount",
                "ReadRowCount",
                "SourceReceivedCount",
                "sourceReceivedCount"));

        item.setWriteRowCount(getLong(block,
                "writeRowCount",
                "WriteRowCount",
                "SinkWriteCount",
                "sinkWriteCount"));

        item.setReadQps(getDecimal(block,
                "readQps",
                "ReadQps",
                "SourceReceivedQPS",
                "SourceReceivedQps",
                "sourceReceivedQPS",
                "sourceReceivedQps"));

        item.setWriteQps(getDecimal(block,
                "writeQps",
                "WriteQps",
                "SinkWriteQPS",
                "SinkWriteQps",
                "sinkWriteQPS",
                "sinkWriteQps"));

        item.setReadBytes(getLong(block,
                "readBytes",
                "ReadBytes",
                "SourceReceivedBytes",
                "sourceReceivedBytes"));

        item.setWriteBytes(getLong(block,
                "writeBytes",
                "WriteBytes",
                "SinkWriteBytes",
                "sinkWriteBytes"));

        item.setReadBps(getDecimal(block,
                "readBps",
                "ReadBps",
                "SourceReceivedBytesPerSeconds",
                "sourceReceivedBytesPerSeconds"));

        item.setWriteBps(getDecimal(block,
                "writeBps",
                "WriteBps",
                "SinkWriteBytesPerSeconds",
                "sinkWriteBytesPerSeconds"));

        item.setIntermediateQueueSize(getLong(block,
                "intermediateQueueSize",
                "IntermediateQueueSize"));

        item.setLagCount(getLong(block,
                "lagCount",
                "LagCount"));

        item.setRecordDelay(getLong(block,
                "recordDelay",
                "RecordDelay",
                "RecordDelayMs"));

        fillDefaultPipelineMetrics(item);
        return item;
    }

    private List<StreamingTableMetrics> parseTableMetrics(Map<String, Object> jobInfo,
                                                          Map<String, Object> metrics) {
        List<TablePair> tablePairs = parseTablePairsFromJobDag(jobInfo);

        Map<String, Object> sourceCountMap = asStringObjectMap(metrics.get("TableSourceReceivedCount"));
        Map<String, Object> sinkCountMap = asStringObjectMap(metrics.get("TableSinkWriteCount"));

        Map<String, Object> sourceQpsMap = asStringObjectMap(metrics.get("TableSourceReceivedQPS"));
        Map<String, Object> sinkQpsMap = asStringObjectMap(metrics.get("TableSinkWriteQPS"));

        Map<String, Object> sourceBytesMap = asStringObjectMap(metrics.get("TableSourceReceivedBytes"));
        Map<String, Object> sinkBytesMap = asStringObjectMap(metrics.get("TableSinkWriteBytes"));

        Map<String, Object> sourceBpsMap = asStringObjectMap(metrics.get("TableSourceReceivedBytesPerSeconds"));
        Map<String, Object> sinkBpsMap = asStringObjectMap(metrics.get("TableSinkWriteBytesPerSeconds"));

        if (tablePairs.isEmpty()) {
            tablePairs = buildTablePairsFromMetricKeys(sourceCountMap, sinkCountMap);
        }

        List<StreamingTableMetrics> result = new ArrayList<>();

        for (TablePair pair : tablePairs) {
            StreamingTableMetrics item = new StreamingTableMetrics();

            item.setPipelineId(pair.getPipelineId() == null ? 0 : pair.getPipelineId());
            item.setSourceTable(pair.getSourceTable());
            item.setSinkTable(pair.getSinkTable());
            item.setTableKey(buildTableKey(pair.getSourceTable(), pair.getSinkTable()));

            item.setReadRowCount(toLong(getMetricValueByTable(sourceCountMap, pair.getSourceTable())));
            item.setWriteRowCount(toLong(getMetricValueByTable(sinkCountMap, pair.getSinkTable())));

            item.setReadQps(toDecimal(getMetricValueByTable(sourceQpsMap, pair.getSourceTable())));
            item.setWriteQps(toDecimal(getMetricValueByTable(sinkQpsMap, pair.getSinkTable())));

            item.setReadBytes(toLong(getMetricValueByTable(sourceBytesMap, pair.getSourceTable())));
            item.setWriteBytes(toLong(getMetricValueByTable(sinkBytesMap, pair.getSinkTable())));

            item.setReadBps(toDecimal(getMetricValueByTable(sourceBpsMap, pair.getSourceTable())));
            item.setWriteBps(toDecimal(getMetricValueByTable(sinkBpsMap, pair.getSinkTable())));

            item.setStatus(resolveTableStatus(item));

            fillDefaultTableMetrics(item);

            result.add(item);
        }

        return result;
    }

    private List<TablePair> parseTablePairsFromJobDag(Map<String, Object> jobInfo) {
        if (jobInfo == null || jobInfo.isEmpty()) {
            return Collections.emptyList();
        }

        Object jobDagObj = jobInfo.get("jobDag");
        if (!(jobDagObj instanceof Map)) {
            return Collections.emptyList();
        }

        Map jobDag = (Map) jobDagObj;
        Object vertexInfoMapObj = jobDag.get("vertexInfoMap");

        if (!(vertexInfoMapObj instanceof Collection)) {
            return Collections.emptyList();
        }

        List<String> sourceTables = new ArrayList<>();
        List<String> sinkTables = new ArrayList<>();

        for (Object vertexObj : (Collection<?>) vertexInfoMapObj) {
            if (!(vertexObj instanceof Map)) {
                continue;
            }

            Map vertex = (Map) vertexObj;
            String type = String.valueOf(vertex.get("type"));

            Object tablePathsObj = vertex.get("tablePaths");
            if (!(tablePathsObj instanceof Collection)) {
                continue;
            }

            List<String> tables = new ArrayList<>();
            for (Object tableObj : (Collection<?>) tablePathsObj) {
                if (tableObj != null) {
                    tables.add(String.valueOf(tableObj));
                }
            }

            if ("source".equalsIgnoreCase(type)) {
                sourceTables.addAll(tables);
            } else if ("sink".equalsIgnoreCase(type)) {
                sinkTables.addAll(tables);
            }
        }

        int size = Math.max(sourceTables.size(), sinkTables.size());
        List<TablePair> result = new ArrayList<>(size);

        for (int i = 0; i < size; i++) {
            TablePair pair = new TablePair();
            pair.setPipelineId(0);
            pair.setSourceTable(i < sourceTables.size() ? sourceTables.get(i) : null);
            pair.setSinkTable(i < sinkTables.size() ? sinkTables.get(i) : null);
            result.add(pair);
        }

        return result;
    }

    private List<TablePair> buildTablePairsFromMetricKeys(Map<String, Object> sourceCountMap,
                                                          Map<String, Object> sinkCountMap) {
        List<String> sourceTables = new ArrayList<>(sourceCountMap.keySet());
        List<String> sinkTables = new ArrayList<>(sinkCountMap.keySet());

        int size = Math.max(sourceTables.size(), sinkTables.size());
        List<TablePair> result = new ArrayList<>(size);

        for (int i = 0; i < size; i++) {
            TablePair pair = new TablePair();
            pair.setPipelineId(0);
            pair.setSourceTable(i < sourceTables.size() ? sourceTables.get(i) : null);
            pair.setSinkTable(i < sinkTables.size() ? sinkTables.get(i) : null);
            result.add(pair);
        }

        return result;
    }

    private void fillPipelineSpeedFromTableIfNecessary(Map<Integer, StreamingPipelineMetrics> pipelineMetrics,
                                                       List<StreamingTableMetrics> tableMetrics) {
        if (pipelineMetrics == null || pipelineMetrics.isEmpty()) {
            return;
        }

        if (tableMetrics == null || tableMetrics.isEmpty()) {
            return;
        }

        Map<Integer, BigDecimal> readQps = new HashMap<>();
        Map<Integer, BigDecimal> writeQps = new HashMap<>();
        Map<Integer, BigDecimal> readBps = new HashMap<>();
        Map<Integer, BigDecimal> writeBps = new HashMap<>();

        for (StreamingTableMetrics item : tableMetrics) {
            Integer pipelineId = item.getPipelineId() == null ? 0 : item.getPipelineId();

            readQps.merge(pipelineId, defaultDecimal(item.getReadQps()), BigDecimal::add);
            writeQps.merge(pipelineId, defaultDecimal(item.getWriteQps()), BigDecimal::add);
            readBps.merge(pipelineId, defaultDecimal(item.getReadBps()), BigDecimal::add);
            writeBps.merge(pipelineId, defaultDecimal(item.getWriteBps()), BigDecimal::add);
        }

        for (Map.Entry<Integer, StreamingPipelineMetrics> entry : pipelineMetrics.entrySet()) {
            Integer pipelineId = entry.getKey() == null ? 0 : entry.getKey();
            StreamingPipelineMetrics item = entry.getValue();

            if (isZero(item.getReadQps())) {
                item.setReadQps(readQps.getOrDefault(pipelineId, BigDecimal.ZERO));
            }

            if (isZero(item.getWriteQps())) {
                item.setWriteQps(writeQps.getOrDefault(pipelineId, BigDecimal.ZERO));
            }

            if (isZero(item.getReadBps())) {
                item.setReadBps(readBps.getOrDefault(pipelineId, BigDecimal.ZERO));
            }

            if (isZero(item.getWriteBps())) {
                item.setWriteBps(writeBps.getOrDefault(pipelineId, BigDecimal.ZERO));
            }
        }
    }

    private String resolveTableStatus(StreamingTableMetrics item) {
        long read = item.getReadRowCount() == null ? 0L : item.getReadRowCount();
        long write = item.getWriteRowCount() == null ? 0L : item.getWriteRowCount();

        if (read == 0 && write == 0) {
            return "IDLE";
        }

        if (read == write) {
            return "NORMAL";
        }

        if (write < read) {
            return "LAGGING";
        }

        return "UNKNOWN";
    }

    private boolean isPipelineKeyed(Map<String, Object> metrics) {
        if (metrics == null || metrics.isEmpty()) {
            return false;
        }

        for (String key : metrics.keySet()) {
            if (!isNumeric(key)) {
                return false;
            }
        }

        return true;
    }

    private Object getValueIgnoreCase(Map<?, ?> map, String... keys) {
        if (map == null || map.isEmpty() || keys == null || keys.length == 0) {
            return null;
        }

        for (String key : keys) {
            if (map.containsKey(key)) {
                return map.get(key);
            }

            for (Object currentKey : map.keySet()) {
                if (currentKey != null && key.equalsIgnoreCase(String.valueOf(currentKey))) {
                    return map.get(currentKey);
                }
            }
        }

        return null;
    }

    /**
     * Compatible with metric keys like:
     *
     * 1. test1.t_test_20w
     * 2. Source[0].test1.t_test_20w
     * 3. Sink[0].test1.ggahg123
     */
    private Object getMetricValueByTable(Map<String, Object> map, String tableName) {
        if (map == null || map.isEmpty() || tableName == null || tableName.trim().isEmpty()) {
            return null;
        }

        String normalizedTableName = tableName.trim();

        if (map.containsKey(normalizedTableName)) {
            return map.get(normalizedTableName);
        }

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            String metricKey = entry.getKey();
            if (metricKey == null || metricKey.trim().isEmpty()) {
                continue;
            }

            String normalizedMetricKey = metricKey.trim();

            if (normalizedMetricKey.equals(normalizedTableName)) {
                return entry.getValue();
            }

            if (normalizedMetricKey.endsWith("." + normalizedTableName)) {
                return entry.getValue();
            }
        }

        return null;
    }

    private Long getLong(Map<?, ?> map, String... keys) {
        return toLong(getValueIgnoreCase(map, keys));
    }

    private BigDecimal getDecimal(Map<?, ?> map, String... keys) {
        return toDecimal(getValueIgnoreCase(map, keys));
    }

    private Long toLong(Object value) {
        if (value == null) {
            return 0L;
        }

        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }

            String str = String.valueOf(value).trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str)) {
                return 0L;
            }

            return new BigDecimal(str).longValue();
        } catch (Exception e) {
            return 0L;
        }
    }

    private BigDecimal toDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal decimal;

            if (value instanceof BigDecimal) {
                decimal = (BigDecimal) value;
            } else if (value instanceof Number) {
                decimal = new BigDecimal(String.valueOf(value));
            } else {
                String str = String.valueOf(value).trim();
                if (str.isEmpty() || "null".equalsIgnoreCase(str)) {
                    return BigDecimal.ZERO;
                }
                decimal = new BigDecimal(str);
            }

            return decimal.setScale(4, BigDecimal.ROUND_HALF_UP);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }



    private Map<String, Object> asStringObjectMap(Object obj) {
        if (!(obj instanceof Map)) {
            return Collections.emptyMap();
        }

        Map<?, ?> raw = (Map<?, ?>) obj;
        Map<String, Object> result = new LinkedHashMap<>();

        for (Map.Entry<?, ?> entry : raw.entrySet()) {
            if (entry.getKey() != null) {
                result.put(String.valueOf(entry.getKey()), entry.getValue());
            }
        }

        return result;
    }

    private void fillDefaultPipelineMetrics(StreamingPipelineMetrics item) {
        if (item.getReadRowCount() == null) {
            item.setReadRowCount(0L);
        }
        if (item.getWriteRowCount() == null) {
            item.setWriteRowCount(0L);
        }
        if (item.getReadQps() == null) {
            item.setReadQps(BigDecimal.ZERO);
        }
        if (item.getWriteQps() == null) {
            item.setWriteQps(BigDecimal.ZERO);
        }
        if (item.getReadBytes() == null) {
            item.setReadBytes(0L);
        }
        if (item.getWriteBytes() == null) {
            item.setWriteBytes(0L);
        }
        if (item.getReadBps() == null) {
            item.setReadBps(BigDecimal.ZERO);
        }
        if (item.getWriteBps() == null) {
            item.setWriteBps(BigDecimal.ZERO);
        }
        if (item.getIntermediateQueueSize() == null) {
            item.setIntermediateQueueSize(0L);
        }
        if (item.getLagCount() == null) {
            item.setLagCount(0L);
        }
        if (item.getRecordDelay() == null) {
            item.setRecordDelay(0L);
        }
    }

    private void fillDefaultTableMetrics(StreamingTableMetrics item) {
        if (item.getReadRowCount() == null) {
            item.setReadRowCount(0L);
        }
        if (item.getWriteRowCount() == null) {
            item.setWriteRowCount(0L);
        }
        if (item.getReadQps() == null) {
            item.setReadQps(BigDecimal.ZERO);
        }
        if (item.getWriteQps() == null) {
            item.setWriteQps(BigDecimal.ZERO);
        }
        if (item.getReadBytes() == null) {
            item.setReadBytes(0L);
        }
        if (item.getWriteBytes() == null) {
            item.setWriteBytes(0L);
        }
        if (item.getReadBps() == null) {
            item.setReadBps(BigDecimal.ZERO);
        }
        if (item.getWriteBps() == null) {
            item.setWriteBps(BigDecimal.ZERO);
        }
        if (item.getStatus() == null) {
            item.setStatus("UNKNOWN");
        }
        if (item.getTableKey() == null) {
            item.setTableKey(buildTableKey(item.getSourceTable(), item.getSinkTable()));
        }
    }

    private String buildTableKey(String sourceTable, String sinkTable) {
        return safe(sourceTable) + "->" + safe(sinkTable);
    }

    private String safe(String value) {
        return value == null ? "-" : value;
    }

    private boolean isZero(BigDecimal value) {
        return value == null || BigDecimal.ZERO.compareTo(value) == 0;
    }

    private BigDecimal defaultDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isNumeric(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }

        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c < '0' || c > '9') {
                return false;
            }
        }

        return true;
    }

    private Integer toInteger(String value, Integer defaultValue) {
        try {
            return Integer.valueOf(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    @Data
    private static class TablePair {
        private Integer pipelineId;
        private String sourceTable;
        private String sinkTable;
    }
}