import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Empty, Modal, Select, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useMemo, useState } from "react";

type CheckpointStatus = "COMPLETED" | "FAILED" | "CANCELED" | string;

interface RealtimeCheckpointRecord {
  id?: string | number;
  jobName?: string;
  clientId?: string | number;
  instanceId?: string | number;
  engineJobId?: string | number;
  checkpointConfig?: string;
  checkpointPath?: string;
  savepointPath?: string;
}

interface CheckpointCounts {
  triggered?: number;
  completed?: number;
  failed?: number;
  inProgress?: number;
  restored?: number;
}

interface CheckpointMeta {
  checkpointId?: number | string;
  checkpointType?: string;
  status?: CheckpointStatus;
  triggerTimestamp?: number;
  completedTimestamp?: number;
  durationMillis?: number;
  stateSize?: number;
  failureReason?: string;
}

interface InProgressCheckpoint {
  checkpointId?: number | string;
  checkpointType?: string;
  triggerTimestamp?: number;
  acknowledged?: number;
  total?: number;
}

interface CheckpointHistoryItem {
  pipelineId?: number | string;
  checkpoint?: CheckpointMeta;
}

interface PipelineCheckpointOverview {
  pipelineId?: number | string;
  counts?: CheckpointCounts;
  latestCompleted?: CheckpointMeta | null;
  latestFailed?: CheckpointMeta | null;
  latestSavepoint?: CheckpointMeta | null;
  inProgress?: InProgressCheckpoint[];
  history?: CheckpointHistoryItem[];
}

interface CheckpointOverviewResponse {
  jobId?: string | number;
  updatedAt?: number;
  pipelines?: PipelineCheckpointOverview[];
}

interface RealtimeCheckpointModalProps {
  open: boolean;
  record?: RealtimeCheckpointRecord | null;
  overview?: CheckpointOverviewResponse | null;
  history?: CheckpointHistoryItem[];
  loading?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const formatTime = (value?: number) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const formatDuration = (value?: number) => {
  if (value === undefined || value === null) return "-";
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(2)} s`;
};

const formatBytes = (value?: number) => {
  if (value === undefined || value === null) return "-";
  if (value < 1024) return `${value} B`;

  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  return `${(mb / 1024).toFixed(1)} GB`;
};

const StatusTag: React.FC<{ status?: CheckpointStatus }> = ({ status }) => {
  const nextStatus = String(status || "-").toUpperCase();

  if (nextStatus === "COMPLETED") {
    return (
      <Tag color="success" className="m-0 rounded-full px-2">
        COMPLETED
      </Tag>
    );
  }

  if (nextStatus === "FAILED") {
    return (
      <Tag color="error" className="m-0 rounded-full px-2">
        FAILED
      </Tag>
    );
  }

  if (nextStatus === "CANCELED") {
    return <Tag className="m-0 rounded-full px-2 text-slate-500">CANCELED</Tag>;
  }

  return <Tag className="m-0 rounded-full px-2">{nextStatus}</Tag>;
};

const MetricItem: React.FC<{
  label: string;
  value?: number;
}> = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold leading-none text-slate-950">
        {value ?? 0}
      </div>
    </div>
  );
};

const LatestItem: React.FC<{
  title: string;
  checkpoint?: CheckpointMeta | null;
  type: "success" | "failed" | "savepoint";
}> = ({ title, checkpoint, type }) => {
  const iconClassName =
    type === "success"
      ? "bg-emerald-50 text-emerald-600"
      : type === "failed"
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-blue-600";

  return (
    <div className="min-w-0 border border-slate-200 bg-white p-4 rounded-xl" >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {type === "failed" ? (
              <CloseCircleOutlined />
            ) : (
              <CheckCircleOutlined />
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-950">
              {title}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {checkpoint?.checkpointId
                ? `Checkpoint #${checkpoint.checkpointId}`
                : "暂无数据"}
            </div>
          </div>
        </div>

        {checkpoint?.status ? <StatusTag status={checkpoint.status} /> : null}
      </div>

      {checkpoint ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs">
          <div>
            <span className="text-slate-400">类型：</span>
            <span className="text-slate-700">
              {checkpoint.checkpointType || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-400">耗时：</span>
            <span className="text-slate-700">
              {formatDuration(checkpoint.durationMillis)}
            </span>
          </div>

          <div>
            <span className="text-slate-400">状态大小：</span>
            <span className="text-slate-700">
              {formatBytes(checkpoint.stateSize)}
            </span>
          </div>

          <div>
            <span className="text-slate-400">触发时间：</span>
            <span className="text-slate-700">
              {formatTime(checkpoint.triggerTimestamp)}
            </span>
          </div>

          {checkpoint.failureReason ? (
            <div className="col-span-2 truncate">
              <span className="text-slate-400">失败原因：</span>
              <span className="text-red-500">{checkpoint.failureReason}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-5 text-center text-sm text-slate-400">
          暂无数据
        </div>
      )}
    </div>
  );
};

const RealtimeCheckpointModal: React.FC<RealtimeCheckpointModalProps> = ({
  open,
  record,
  overview,
  history,
  loading = false,
  onClose,
  onRefresh,
}) => {
  const [pipelineFilter, setPipelineFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const pipelines = overview?.pipelines || [];

  const summary = useMemo(() => {
    return pipelines.reduce(
      (acc, item) => {
        acc.triggered += item.counts?.triggered || 0;
        acc.completed += item.counts?.completed || 0;
        acc.failed += item.counts?.failed || 0;
        acc.inProgress += item.counts?.inProgress || 0;
        acc.restored += item.counts?.restored || 0;
        return acc;
      },
      {
        triggered: 0,
        completed: 0,
        failed: 0,
        inProgress: 0,
        restored: 0,
      }
    );
  }, [pipelines]);

  const latestCompleted = useMemo(() => {
    return pipelines
      .map((item) => item.latestCompleted)
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b?.triggerTimestamp || 0) - Number(a?.triggerTimestamp || 0)
      )[0];
  }, [pipelines]);

  const latestFailed = useMemo(() => {
    return pipelines
      .map((item) => item.latestFailed)
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b?.triggerTimestamp || 0) - Number(a?.triggerTimestamp || 0)
      )[0];
  }, [pipelines]);

  const latestSavepoint = useMemo(() => {
    return pipelines
      .map((item) => item.latestSavepoint)
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b?.triggerTimestamp || 0) - Number(a?.triggerTimestamp || 0)
      )[0];
  }, [pipelines]);

  const historyData = useMemo(() => {
    if (history?.length) return history;
    return pipelines.flatMap((item) => item.history || []);
  }, [history, pipelines]);

  const pipelineOptions = useMemo(() => {
    const ids = Array.from(
      new Set(
        historyData
          .map((item) => item.pipelineId)
          .filter((item) => item !== undefined && item !== null)
          .map(String)
      )
    );

    return [
      { label: "全部 Pipeline", value: "ALL" },
      ...ids.map((id) => ({
        label: `Pipeline ${id}`,
        value: id,
      })),
    ];
  }, [historyData]);

  const filteredHistoryData = useMemo(() => {
    return historyData.filter((item) => {
      const matchPipeline =
        pipelineFilter === "ALL" || String(item.pipelineId) === pipelineFilter;

      const matchStatus =
        statusFilter === "ALL" ||
        String(item.checkpoint?.status || "").toUpperCase() === statusFilter;

      return matchPipeline && matchStatus;
    });
  }, [historyData, pipelineFilter, statusFilter]);

  const pipelineColumns: ColumnsType<PipelineCheckpointOverview> = [
    {
      title: "Pipeline",
      dataIndex: "pipelineId",
      width: 120,
      render: (value) => (
        <span className="font-medium text-slate-900">
          Pipeline {value ?? "-"}
        </span>
      ),
    },
    {
      title: "Triggered",
      dataIndex: ["counts", "triggered"],
      width: 110,
      render: (value) => value ?? 0,
    },
    {
      title: "Completed",
      dataIndex: ["counts", "completed"],
      width: 110,
      render: (value) => value ?? 0,
    },
    {
      title: "Failed",
      dataIndex: ["counts", "failed"],
      width: 100,
      render: (value) => (
        <span className={value ? "font-medium text-red-500" : ""}>
          {value ?? 0}
        </span>
      ),
    },
    {
      title: "In Progress",
      dataIndex: ["counts", "inProgress"],
      width: 120,
      render: (value) => value ?? 0,
    },
    {
      title: "Restored",
      dataIndex: ["counts", "restored"],
      width: 110,
      render: (value) => value ?? 0,
    },
    {
      title: "运行中检查点",
      dataIndex: "inProgress",
      render: (value: InProgressCheckpoint[]) => {
        if (!value?.length) {
          return <span className="text-slate-400">-</span>;
        }

        return (
          <div className="space-y-1">
            {value.map((item) => {
              const acknowledged = item.acknowledged ?? 0;
              const total = item.total ?? 0;

              return (
                <div
                  key={`${item.checkpointId}-${item.triggerTimestamp}`}
                  className="text-[13px] text-slate-600"
                >
                  #{item.checkpointId} · ACK {acknowledged}/{total}
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  const historyColumns: ColumnsType<CheckpointHistoryItem> = [
    {
      title: "检查点 ID",
      dataIndex: ["checkpoint", "checkpointId"],
      width: 120,
      render: (value) => (
        <span className="font-medium text-slate-900">#{value ?? "-"}</span>
      ),
    },
    {
      title: "Pipeline",
      dataIndex: "pipelineId",
      width: 120,
      render: (value) => <span>Pipeline {value ?? "-"}</span>,
    },
    {
      title: "状态",
      dataIndex: ["checkpoint", "status"],
      width: 130,
      render: (value) => <StatusTag status={value} />,
    },
    {
      title: "类型",
      dataIndex: ["checkpoint", "checkpointType"],
      width: 160,
      render: (value) => value || "-",
    },
    {
      title: "触发时间",
      dataIndex: ["checkpoint", "triggerTimestamp"],
      width: 190,
      render: (value) => formatTime(value),
    },
    {
      title: "完成时间",
      dataIndex: ["checkpoint", "completedTimestamp"],
      width: 190,
      render: (value) => formatTime(value),
    },
    {
      title: "耗时",
      dataIndex: ["checkpoint", "durationMillis"],
      width: 100,
      render: (value) => formatDuration(value),
    },
    {
      title: "状态大小",
      dataIndex: ["checkpoint", "stateSize"],
      width: 120,
      render: (value) => formatBytes(value),
    },
    {
      title: "失败原因",
      dataIndex: ["checkpoint", "failureReason"],
      ellipsis: true,
      render: (value) =>
        value ? (
          <span className="text-red-500">{value}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  const jobId =
    overview?.jobId || record?.engineJobId || record?.instanceId || record?.id;

  return (
    <Modal
      width="84vw"
      open={open}
      centered
      maskClosable={false}
      destroyOnClose
      footer={null}
      onCancel={onClose}
      styles={{
        content: {
          borderRadius: 18,
          overflow: "hidden",
          padding: 0,
        },
        body: {
          padding: 0,
          background: "#F8FAFC",
        },
      }}
    >
      <div className="flex h-[78vh] flex-col bg-[#F8FAFC]">
  <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <SaveOutlined />
      </div>

      <div className="min-w-0">
        <div className="text-base font-semibold text-slate-950">
          检查点详情
        </div>
        <div className="mt-1 truncate text-xs text-slate-500">
          任务：{record?.jobName || "-"}
          {jobId ? ` ｜ Job ID：${jobId}` : ""}
          {overview?.updatedAt
            ? ` ｜ 更新时间：${formatTime(overview.updatedAt)}`
            : ""}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {onRefresh ? (
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={onRefresh}
          className="rounded-full"
          style={{ marginRight: 48 }}
        >
          刷新
        </Button>
      ) : null}
    </div>
  </div>

  <div className="min-h-0 flex-1 p-4">
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 ">
      <Tabs
        defaultActiveKey="overview"
        className="checkpoint-tabs flex min-h-0 flex-1 flex-col"
        items={[
          {
            key: "overview",
            label: "概览",
            children: (
              <div
                className="h-[calc(78vh-142px)] overflow-auto px-5 pb-5 pt-2"
                style={{ marginTop: 12 }}
              >
                <div className="mb-4 rounded-xl border border-slate-200 bg-white px-5 py-4 ">
                  <div className="grid grid-cols-6 gap-8">
                    <MetricItem
                      label="Triggered"
                      value={summary.triggered}
                    />
                    <MetricItem
                      label="Completed"
                      value={summary.completed}
                    />
                    <MetricItem label="Failed" value={summary.failed} />
                    <MetricItem
                      label="In Progress"
                      value={summary.inProgress}
                    />
                    <MetricItem
                      label="Restored"
                      value={summary.restored}
                    />

                    <div className="flex items-center justify-end text-xs font-medium text-slate-400">
                      {pipelines.length} Pipelines
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <LatestItem
                    title="最新完成检查点"
                    checkpoint={latestCompleted}
                    type="success"
                  />
                  <LatestItem
                    title="最新失败检查点"
                    checkpoint={latestFailed}
                    type="failed"
                  />
                  <LatestItem
                    title="最新保存点"
                    checkpoint={latestSavepoint}
                    type="savepoint"
                  />
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white ">
                  <div className="border-b border-slate-200 px-5 py-3">
                    <div className="text-sm font-semibold text-slate-950">
                      Pipeline Overview
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      每个 Pipeline 的检查点统计与运行中检查点
                    </div>
                  </div>

                  <Table
                    rowKey={(item) => String(item.pipelineId)}
                    loading={loading}
                    columns={pipelineColumns}
                    dataSource={pipelines}
                    pagination={false}
                    size="small"
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="暂无 Pipeline 检查点数据"
                        />
                      ),
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "history",
            label: "历史记录",
            children: (
              <div
                className="h-[calc(78vh-142px)] overflow-auto px-5 pb-5 pt-2"
                style={{ marginTop: 12 }}
              >
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white ">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        Checkpoint History
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        作业的 Checkpoint 历史记录
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={pipelineFilter}
                        options={pipelineOptions}
                        onChange={setPipelineFilter}
                        className="w-36"
                        size="small"
                      />

                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-36"
                        size="small"
                        options={[
                          { label: "全部状态", value: "ALL" },
                          { label: "COMPLETED", value: "COMPLETED" },
                          { label: "FAILED", value: "FAILED" },
                          { label: "CANCELED", value: "CANCELED" },
                        ]}
                      />
                    </div>
                  </div>

                  <Table
                    rowKey={(item) =>
                      `${item.pipelineId}-${item.checkpoint?.checkpointId}-${item.checkpoint?.triggerTimestamp}`
                    }
                    loading={loading}
                    columns={historyColumns}
                    dataSource={filteredHistoryData}
                    size="small"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                    }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  </div>
</div>
    </Modal>
  );
};

export default RealtimeCheckpointModal;
