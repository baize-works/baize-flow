import { DashboardOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import * as echarts from "echarts";
import React, { useEffect, useMemo, useRef } from "react";

interface MetricPoint {
  date?: string;
  readRowCount?: number;
  writeRowCount?: number;
  readQps?: number;
  writeQps?: number;
}

interface RealtimeMetricsTrendProps {
  record: any;
  onView?: (record: any) => void;
}

const toNumber = (value: any, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatNumber = (value: any) => {
  return toNumber(value).toLocaleString();
};

const dashboardIconClass =
  "absolute bottom-1 right-1 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d6e4ff] bg-white/95 text-xs text-[#3157d5] opacity-0 shadow-sm backdrop-blur transition-all duration-150 hover:bg-[#eef3ff] hover:text-[#2448c2] group-hover:opacity-100";

const RealtimeMetricsTrend: React.FC<RealtimeMetricsTrendProps> = ({
  record,
  onView,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const points = useMemo(() => {
    return (record?.recentMetrics || []).slice(-20);
  }, [record?.recentMetrics]);

  const rowValues = useMemo(() => {
    return points.map((item) =>
      toNumber(item.writeRowCount ?? item.readRowCount),
    );
  }, [points]);

  const qpsValues = useMemo(() => {
    return points.map((item) => toNumber(item.readQps));
  }, [points]);

  const latest = record?.latestMetrics || points[points.length - 1] || {};

  const latestReadRows = latest.readRowCount ?? 0;
  const latestWriteRows = latest.writeRowCount;
  const latestReadQps = latest.readQps ?? 0;
  const latestWriteQps = latest.writeQps;

  const handleOpenDashboard = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onView?.(record);
  };

  useEffect(() => {
    if (!chartRef.current || !points.length) return;

    const chart = echarts.init(chartRef.current);

    chart.setOption({
      animation: false,
      grid: {
        left: 0,
        right: 0,
        top: 4,
        bottom: 4,
        containLabel: false,
      },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        borderWidth: 0,
        padding: [6, 8],
        textStyle: {
          fontSize: 12,
        },
        formatter: (params: any[]) => {
          const rowItem = params?.find((item) => item.seriesName === "条数");
          const qpsItem = params?.find((item) => item.seriesName === "速度");

          return `
            <div>
              <div>条数：${formatNumber(rowItem?.value ?? 0)}</div>
              <div>速度：${formatNumber(qpsItem?.value ?? 0)} r/s</div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
        data: points.map((item, index) => item.date || index),
      },
      yAxis: [
        {
          type: "value",
          show: false,
          splitLine: {
            show: false,
          },
        },
        {
          type: "value",
          show: false,
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "条数",
          type: "line",
          yAxisIndex: 0,
          data: rowValues,
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 2,
            color: "#1677ff",
          },
          areaStyle: {
            color: "#1677ff",
            opacity: 0.08,
          },
        },
        {
          name: "速度",
          type: "line",
          yAxisIndex: 1,
          data: qpsValues,
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 2,
            color: "#52c41a",
            type: "dashed",
          },
        },
      ],
    });

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [points, rowValues, qpsValues]);

  const renderDashboardIcon = () => {
    if (!onView) return null;

    return (
      <Tooltip title="打开实时指标看板">
        <button
          type="button"
          className={dashboardIconClass}
          onClick={handleOpenDashboard}
        >
          <DashboardOutlined />
        </button>
      </Tooltip>
    );
  };

  if (!points.length) {
    return (
      <div className="group relative min-h-[54px] w-[350px]">
        <span className="text-xs text-slate-400">暂无趋势数据</span>
        {renderDashboardIcon()}
      </div>
    );
  }

  return (
    <div className="group relative w-[350px]">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-700">条数</div>
          <div className="truncate text-xs text-slate-400">
            {latestWriteRows !== undefined ? (
              <>
                R {formatNumber(latestReadRows)} / W{" "}
                {formatNumber(latestWriteRows)}
              </>
            ) : (
              <>{formatNumber(latestReadRows)} rows</>
            )}
          </div>
        </div>

        <div className="min-w-0 text-right">
          <div className="text-xs font-bold text-slate-700">速度</div>
          <div className="truncate text-xs text-slate-400">
            {latestWriteQps !== undefined ? (
              <>
                R {formatNumber(latestReadQps)} / W{" "}
                {formatNumber(latestWriteQps)} r/s
              </>
            ) : (
              <>{formatNumber(latestReadQps)} r/s</>
            )}
          </div>
        </div>
      </div>

      <div ref={chartRef} className="h-[54px] w-[350px]" />

      {renderDashboardIcon()}
    </div>
  );
};

export default RealtimeMetricsTrend;