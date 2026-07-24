import { useIntl } from "@umijs/max";

interface ExecutionStatusProps {
  record: any;
}

const toNumber = (value: any, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatNumber = (value: any) => {
  const num = toNumber(value, 0);
  return num.toLocaleString();
};

const formatBytes = (bytes?: number | string | null) => {
  const value = toNumber(bytes, 0);

  if (!value) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return "-";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const parseTime = (value?: string | null) => {
  if (!value) return undefined;

  // 兼容 "2026-05-21 15:32:59" 和 ISO 时间
  const normalized = String(value).replace(" ", "T");
  const time = new Date(normalized).getTime();

  return Number.isFinite(time) ? time : undefined;
};

const getDurationSeconds = (record: any) => {
  // 兼容旧字段
  if (record?.duration !== undefined && record?.duration !== null) {
    return toNumber(record.duration, 0);
  }

  const startTime = parseTime(record?.lastStartTime || record?.lastSubmitTime);
  const endTime = parseTime(record?.lastEndTime);

  if (!startTime) return 0;

  const finalTime = endTime || Date.now();

  return Math.max(0, Math.floor((finalTime - startTime) / 1000));
};

const MetricRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => {
  return (
    <div className="flex items-center text-xs leading-6">
      <span className="mr-2 text-lg font-bold leading-none text-slate-400">·</span>
      <span className="w-[64px] shrink-0 font-bold text-slate-700">{label}</span>
      <span className="min-w-0 flex-1 truncate text-slate-500">{value}</span>
    </div>
  );
};

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  const intl = useIntl();

  const latestMetrics = record?.latestMetrics || {};

  const durationSeconds = getDurationSeconds(record);

  const readRowCount =
    latestMetrics?.readRowCount ?? record?.readRowCount ?? record?.amount ?? 0;

  const writeRowCount =
    latestMetrics?.writeRowCount ?? record?.writeRowCount ?? undefined;

  const readQps = latestMetrics?.readQps ?? record?.readQps ?? record?.qps ?? 0;

  const writeQps = latestMetrics?.writeQps ?? record?.writeQps ?? undefined;

  const readBytes = latestMetrics?.readBytes ?? record?.readBytes;
  const writeBytes = latestMetrics?.writeBytes ?? record?.writeBytes;

  return (
    <div className="space-y-0.5">
      <MetricRow
        label="已运行:"
        value={formatDuration(durationSeconds)}
      />

      <MetricRow
        label={intl.formatMessage({
          id: "pages.job.execution.amount",
          defaultMessage: "Amount:",
        })}
        value={
          writeRowCount !== undefined ? (
            <span>
              R {formatNumber(readRowCount)} / W {formatNumber(writeRowCount)}
            </span>
          ) : (
            <span>
              {formatNumber(readRowCount)}{" "}
              {intl.formatMessage({
                id: "pages.job.execution.unit.rows",
                defaultMessage: "r",
              })}
            </span>
          )
        }
      />

      <MetricRow
        label={intl.formatMessage({
          id: "pages.job.execution.qps",
          defaultMessage: "QPS:",
        })}
        value={
          writeQps !== undefined ? (
            <span>
              R {formatNumber(readQps)} / W {formatNumber(writeQps)}
            </span>
          ) : (
            <span>
              {formatNumber(readQps)}{" "}
              {intl.formatMessage({
                id: "pages.job.execution.unit.rowsPerSecond",
                defaultMessage: "r/s",
              })}
            </span>
          )
        }
      />

      <MetricRow
        label={intl.formatMessage({
          id: "pages.job.execution.size",
          defaultMessage: "Size:",
        })}
        value={
          writeBytes !== undefined || readBytes !== undefined ? (
            <span>
              R {formatBytes(readBytes)} / W {formatBytes(writeBytes)}
            </span>
          ) : (
            record?.syncSize || "-"
          )
        }
      />
    </div>
  );
};

export default ExecutionStatus;