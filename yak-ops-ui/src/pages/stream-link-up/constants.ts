import type { RealtimeTask, StreamStatus } from "./types";

export const sourceOptions = [
  { label: "MySQL", value: "MYSQL", connectorType: "Jdbc" },
  { label: "PostgreSQL", value: "POSTGRE_SQL", connectorType: "Jdbc" },
  { label: "Kingbase", value: "KINGBASE", connectorType: "Jdbc" },
  { label: "Dameng", value: "DAMENG", connectorType: "Jdbc" },
  { label: "Kafka", value: "KAFKA", connectorType: "Kafka" },
  { label: "Oracle", value: "ORACLE", connectorType: "Jdbc" },
];

export const sinkOptions = [
  { label: "Kafka", value: "KAFKA", connectorType: "Kafka" },
  { label: "StarRocks", value: "STARROCKS", connectorType: "StarRocks" },
  {
    label: "Elasticsearch",
    value: "ELASTICSEARCH",
    connectorType: "Elasticsearch",
  },
  { label: "Doris", value: "DORIS", connectorType: "Doris" },
];

export const mockTasks: RealtimeTask[] = [
  {
    id: "9c3f2b7e3a1d",
    name: "订单实时入仓链路",
    sourceType: "MYSQL",
    sourceLabel: "MySQL CDC",
    sinkType: "STARROCKS",
    sinkLabel: "StarRocks",
    status: "RUNNING",
    throughput: "12.8k",
    latency: "120 ms",
    checkpoint: ["binlog.000678", "pos: 15423873"],
    updateTime: "2026/05/06 14:28:32",
    trendType: "green",
  },
  {
    id: "a7f8d4c9b2e5",
    name: "用户行为实时分析",
    sourceType: "KAFKA",
    sourceLabel: "Kafka",
    sinkType: "ELASTICSEARCH",
    sinkLabel: "Elasticsearch",
    status: "RUNNING",
    throughput: "9.3k",
    latency: "210 ms",
    checkpoint: ["offset: 23453211", "partition: 3"],
    updateTime: "2026/05/06 14:27:18",
    trendType: "blue",
  },
  {
    id: "c1d4e7a892f3",
    name: "库存变更实时同步",
    sourceType: "POSTGRESQL",
    sourceLabel: "PostgreSQL",
    sinkType: "KAFKA",
    sinkLabel: "Kafka",
    status: "WARNING",
    throughput: "3.2k",
    latency: "480 ms",
    checkpoint: ["lsn: 16/B374D848", "slot: pg_slot_01"],
    updateTime: "2026/05/06 14:25:44",
    trendType: "orange",
  },
  {
    id: "b2e6f5d1c9a8",
    name: "日志流实时入仓",
    sourceType: "KAFKA",
    sourceLabel: "Kafka",
    sinkType: "STARROCKS",
    sinkLabel: "StarRocks",
    status: "PAUSED",
    throughput: "-",
    latency: "-",
    checkpoint: ["offset: 8923412", "partition: 1"],
    updateTime: "2026/05/06 14:20:11",
    trendType: "gray",
  },
];

export const statusMeta: Record<
  StreamStatus,
  {
    text: string;
    dotClassName: string;
    className: string;
  }
> = {
  RUNNING: {
    text: "RUNNING",
    dotClassName: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-600",
  },
  WARNING: {
    text: "WARNING",
    dotClassName: "bg-amber-500",
    className: "bg-amber-50 text-amber-600",
  },
  PAUSED: {
    text: "PAUSED",
    dotClassName: "bg-slate-400",
    className: "bg-slate-100 text-slate-500",
  },
  STOPPED: {
    text: "STOPPED",
    dotClassName: "bg-red-500",
    className: "bg-red-50 text-red-500",
  },
};
