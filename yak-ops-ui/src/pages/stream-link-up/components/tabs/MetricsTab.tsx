import * as echarts from "echarts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Empty, Spin, Table, Tag, Tooltip, message } from "antd";
import { useIntl } from "@umijs/max";
import {
  ArrowRight,
  Gauge,
  Layers3,
  Table2,
} from "lucide-react";

interface MetricsTabProps {
  instanceItem: any;
}

interface FlowMetricPoint {
  name: string;
  readQps: number;
  writeQps: number;
  readRows: number;
  writeRows: number;
}

const toNumber = (value: any) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (value: any) => {
  const n = toNumber(value);
  return n.toLocaleString();
};

const formatDecimal = (value: any) => {
  const n = toNumber(value);

  if (n === 0) {
    return "0";
  }

  if (n < 1) {
    return n.toFixed(4);
  }

  return n.toFixed(2).replace(/\.?0+$/, "");
};

const formatCompactNumber = (value: any) => {
  const n = toNumber(value);

  if (n >= 100000000) {
    return `${(n / 100000000).toFixed(1).replace(/\.0$/, "")}亿`;
  }

  if (n >= 10000) {
    return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}万`;
  }

  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return `${n}`;
};

const getShortTableName = (table?: string) => {
  if (!table) {
    return "-";
  }

  const parts = String(table).split(".");
  return parts[parts.length - 1] || table;
};

const getStatusMeta = (status?: string) => {
  const value = String(status || "UNKNOWN").toUpperCase();

  if (value === "NORMAL") {
    return {
      color: "success",
      text: "正常",
    };
  }

  if (value === "LAGGING") {
    return {
      color: "warning",
      text: "写入滞后",
    };
  }

  if (value === "IDLE") {
    return {
      color: "default",
      text: "暂无数据",
    };
  }

  if (value === "FAILED") {
    return {
      color: "error",
      text: "失败",
    };
  }

  return {
    color: "default",
    text: "未知",
  };
};

const SectionHeader: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, description, icon, extra }) => {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          {icon}
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-0.5 text-xs text-slate-400">{description}</div>
        </div>
      </div>

      {extra}
    </div>
  );
};

const buildTrend = (value: number, seed = 1) => {
  const base = Math.max(value, 1);

  return Array.from({ length: 16 }, (_, index) => {
    const wave = Math.sin((index + seed) * 0.75) * 0.12;
    const slope = index * 0.012;
    return Math.max(Math.round(base * (0.82 + wave + slope)), 0);
  });
};

const buildFlowMetricPoints = (instanceItem: any, metrics: any) => {
  const recentMetrics = Array.isArray(instanceItem?.recentMetrics)
    ? instanceItem.recentMetrics.slice(-20)
    : [];

  if (recentMetrics.length > 0) {
    return recentMetrics.map((item: any, index: number) => ({
      name:
        item.date ||
        item.time ||
        item.collectTime ||
        item.createTime ||
        `采样 ${index + 1}`,
      readQps: toNumber(item.readQps),
      writeQps: toNumber(item.writeQps),
      readRows: toNumber(item.readRowCount),
      writeRows: toNumber(item.writeRowCount),
    }));
  }

  return metrics.readQpsTrend.map((_: any, index: number) => ({
    name: `T-${metrics.readQpsTrend.length - index}`,
    readQps: metrics.readQpsTrend[index],
    writeQps: metrics.writeQpsTrend[index],
    readRows: metrics.readRowsTrend[index],
    writeRows: metrics.writeRowsTrend[index],
  }));
};

const MetricsFlowChart: React.FC<{ data: FlowMetricPoint[] }> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;

    if (!chart) {
      return;
    }

    const safeData =
      data.length > 0
        ? data
        : [
            {
              name: "-",
              readQps: 0,
              writeQps: 0,
              readRows: 0,
              writeRows: 0,
            },
          ];

    chart.setOption(
      {
        color: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"],
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255,255,255,0.96)",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: [10, 12],
          textStyle: {
            color: "#334155",
            fontSize: 12,
          },
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#94a3b8",
              width: 1,
              type: "dashed",
            },
          },
          formatter: (params: any) => {
            const list = Array.isArray(params) ? params : [params];
            const title = list[0]?.axisValue || "";

            const rows = list
              .map((item: any) => {
                const isQps = String(item.seriesName).includes("QPS");
                const unit = isQps ? "行/秒" : "行";
                const value = isQps
                  ? formatDecimal(item.value)
                  : formatNumber(item.value);

                return `
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:6px;">
                    <span>${item.marker}${item.seriesName}</span>
                    <span style="font-weight:600;color:#0f172a;">${value} ${unit}</span>
                  </div>
                `;
              })
              .join("");

            return `
              <div>
                <div style="font-weight:600;color:#0f172a;margin-bottom:4px;">${title}</div>
                ${rows}
              </div>
            `;
          },
        },
        legend: {
          top: 2,
          right: 8,
          itemWidth: 10,
          itemHeight: 6,
          icon: "roundRect",
          textStyle: {
            color: "#64748b",
            fontSize: 12,
          },
        },
        grid: {
          top: 48,
          left: 46,
          right: 54,
          bottom: 32,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: safeData.map((item) => item.name),
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 11,
          },
        },
        yAxis: [
          {
            type: "value",
            name: "QPS",
            min: 0,
            nameTextStyle: {
              color: "#94a3b8",
              fontSize: 11,
            },
            axisLabel: {
              color: "#94a3b8",
              formatter: (value: number) => formatCompactNumber(value),
            },
            splitLine: {
              lineStyle: {
                color: "#f1f5f9",
              },
            },
          },
          {
            type: "value",
            name: "行数",
            min: 0,
            nameTextStyle: {
              color: "#94a3b8",
              fontSize: 11,
            },
            axisLabel: {
              color: "#94a3b8",
              formatter: (value: number) => formatCompactNumber(value),
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: "读取 QPS",
            type: "line",
            yAxisIndex: 0,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              opacity: 0.08,
            },
            emphasis: {
              focus: "series",
            },
            data: safeData.map((item) => item.readQps),
          },
          {
            name: "写入 QPS",
            type: "line",
            yAxisIndex: 0,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              opacity: 0.08,
            },
            emphasis: {
              focus: "series",
            },
            data: safeData.map((item) => item.writeQps),
          },
          {
            name: "读取行数",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              opacity: 0.06,
            },
            emphasis: {
              focus: "series",
            },
            data: safeData.map((item) => item.readRows),
          },
          {
            name: "写入行数",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              opacity: 0.06,
            },
            emphasis: {
              focus: "series",
            },
            data: safeData.map((item) => item.writeRows),
          },
        ],
      },
      true
    );
  }, [data]);

  return (
    <div className="rounded-2xl  border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div ref={chartRef} className="h-[300px] w-full" />
    </div>
  );
};

const MetricsTab: React.FC<MetricsTabProps> = ({ instanceItem }) => {
  const intl = useIntl();

  const [tableMetrics, setTableMetrics] = useState<any[]>([]);
  const [tableMetricsLoading, setTableMetricsLoading] = useState(false);

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const instanceId = instanceItem?.id;

  const readQps = toNumber(instanceItem?.readQps);
  const writeQps = toNumber(instanceItem?.writeQps);
  const readRows = toNumber(instanceItem?.readRowCount);
  const writeRows = toNumber(instanceItem?.writeRowCount);

  useEffect(() => {
    let cancelled = false;

    const loadTableMetrics = async () => {
      if (!instanceId) {
        setTableMetrics([]);
        return;
      }

      setTableMetricsLoading(true);

      try {
        // const res = await batchJobInstanceApi.tableMetrics(instanceId);
        // const list = getResponseData(res);
        //
        // if (!cancelled) {
        //   setTableMetrics(list);
        // }

        if (!cancelled) {
          setTableMetrics([]);
        }
      } catch (error) {
        if (!cancelled) {
          setTableMetrics([]);
          message.warning("表级指标加载失败，请稍后重试");
        }
      } finally {
        if (!cancelled) {
          setTableMetricsLoading(false);
        }
      }
    };

    loadTableMetrics();

    return () => {
      cancelled = true;
    };
  }, [instanceId]);

  const metrics = useMemo(
    () => ({
      readQpsTrend: buildTrend(readQps, 1),
      writeQpsTrend: buildTrend(writeQps, 2),
      readRowsTrend: buildTrend(readRows, 3),
      writeRowsTrend: buildTrend(writeRows, 4),
    }),
    [readQps, writeQps, readRows, writeRows]
  );

  const flowMetricPoints = useMemo(
    () => buildFlowMetricPoints(instanceItem, metrics),
    [instanceItem, metrics]
  );

  const tableColumns = useMemo(
    () => [
      {
        title: "来源表",
        dataIndex: "sourceTable",
        key: "sourceTable",
        ellipsis: true,
        render: (value: string) => (
          <Tooltip title={value}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                <Table2 size={14} strokeWidth={1.9} />
              </span>

              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-800">
                  {getShortTableName(value)}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {value || "-"}
                </div>
              </div>
            </div>
          </Tooltip>
        ),
      },
      {
        title: "",
        key: "arrow",
        width: 44,
        align: "center" as const,
        render: () => (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <ArrowRight size={14} strokeWidth={1.9} />
          </span>
        ),
      },
      {
        title: "目标表",
        dataIndex: "sinkTable",
        key: "sinkTable",
        ellipsis: true,
        render: (value: string) => (
          <Tooltip title={value}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                <Table2 size={14} strokeWidth={1.9} />
              </span>

              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-800">
                  {getShortTableName(value)}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {value || "-"}
                </div>
              </div>
            </div>
          </Tooltip>
        ),
      },
      {
        title: "读取行数",
        dataIndex: "readRowCount",
        key: "readRowCount",
        width: 110,
        align: "right" as const,
        render: (value: any) => (
          <span className="font-medium text-slate-800">
            {formatNumber(value)}
          </span>
        ),
      },
      {
        title: "写入行数",
        dataIndex: "writeRowCount",
        key: "writeRowCount",
        width: 110,
        align: "right" as const,
        render: (value: any) => (
          <span className="font-medium text-slate-800">
            {formatNumber(value)}
          </span>
        ),
      },
      {
        title: "读取 QPS",
        dataIndex: "readQps",
        key: "readQps",
        width: 100,
        align: "right" as const,
        render: (value: any) => (
          <span className="text-slate-600">{formatDecimal(value)}</span>
        ),
      },
      {
        title: "写入 QPS",
        dataIndex: "writeQps",
        key: "writeQps",
        width: 100,
        align: "right" as const,
        render: (value: any) => (
          <span className="text-slate-600">{formatDecimal(value)}</span>
        ),
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 96,
        render: (value: string) => {
          const meta = getStatusMeta(value);
          return <Tag color={meta.color}>{meta.text}</Tag>;
        },
      },
    ],
    []
  );

  return (
    <Card
      size="small"
      className="mt-2 !rounded-2xl !border-slate-200 !shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      bodyStyle={{ padding: 16, marginBottom: 116 }}
    >
      <div className="space-y-6">
        <section>
          <SectionHeader
            icon={<Gauge size={16} strokeWidth={1.9} />}
            title={t("pages.job.detail.metrics.flowTrend", "同步流量趋势")}
            description={t(
              "pages.job.detail.metrics.flowTrendDesc",
              "查看当前实例读取、写入速率与累计同步数据量变化"
            )}
          />

          <MetricsFlowChart data={flowMetricPoints} />
        </section>

        <section>
          <SectionHeader
            icon={<Layers3 size={16} strokeWidth={1.9} />}
            title="表级同步明细"
            description="查看当前运行实例的来源表与目标表同步情况"
            extra={
              <div className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                {tableMetricsLoading ? "加载中" : `${tableMetrics.length} 张表`}
              </div>
            }
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <Spin spinning={tableMetricsLoading}>
              <Table
                size="small"
                rowKey={(record: any, index) =>
                  record.id ||
                  `${record.sourceTable || "source"}-${
                    record.sinkTable || "sink"
                  }-${index}`
                }
                columns={tableColumns}
                dataSource={tableMetrics}
                pagination={false}
                scroll={{ x: 980 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无表级指标"
                    />
                  ),
                }}
              />
            </Spin>
          </div>
        </section>
      </div>
    </Card>
  );
};

export default MetricsTab;