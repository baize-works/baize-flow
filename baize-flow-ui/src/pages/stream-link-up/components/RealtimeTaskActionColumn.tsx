import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FileSearchOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Dropdown, Popconfirm, Space, message } from "antd";
import React, { useState } from "react";

export interface StreamingJobDefinitionVO {
  id: string | number;
  jobName?: string;
  jobDesc?: string;
  mode?: string;
  jobType?: string;
  clientId?: string | number;
  jobVersion?: number;
  releaseState?: "ONLINE" | "OFFLINE" | string | number;
  lastJobStatus?: string;
  lastErrorMessage?: string;
  instanceId?: string | number;
  sourceType?: string;
  sinkType?: string;
  sourceTable?: string;
  sinkTable?: string;
  sourceDatasourceId?: string | number;
  sinkDatasourceId?: string | number;
  createTime?: string;
  updateTime?: string;
  checkpointConfig?: string;
  checkpointPath?: string;
  savepointPath?: string;
}

interface RealtimeTaskActionColumnProps {
  record: StreamingJobDefinitionVO;

  onDetail?: (record: StreamingJobDefinitionVO) => void;
  onEdit?: (record: StreamingJobDefinitionVO) => void;
  onRun?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onStop?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onStopWithSavepoint?: (
    record: StreamingJobDefinitionVO
  ) => Promise<void> | void;
  onResumeFromSavepoint?: (
    record: StreamingJobDefinitionVO
  ) => Promise<void> | void;
  onOnline?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onOffline?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onDelete?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onLog?: (record: StreamingJobDefinitionVO) => void;
  onCheckpoint?: (record: StreamingJobDefinitionVO) => void;
}

const actionBaseClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all duration-150";

const primaryActionClass = `${actionBaseClass} bg-[#eef3ff] text-[#3157d5] hover:bg-[#e1e9ff] hover:text-[#2448c2]`;

const dangerActionClass = `${actionBaseClass} bg-[#fff1f0] text-[#cf1322] hover:bg-[#ffe1de] hover:text-[#a8071a]`;

const secondaryActionClass = `${actionBaseClass} bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

const disabledActionClass = `${actionBaseClass} cursor-not-allowed bg-slate-100 text-slate-400`;

const moreActionClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800";

const isReleaseOnline = (releaseState?: string | number) => {
  return releaseState === "ONLINE" || releaseState === 1;
};

const isRunningStatus = (status?: string) => {
  return String(status || "").toUpperCase() === "RUNNING";
};

const RealtimeTaskActionColumn: React.FC<RealtimeTaskActionColumnProps> = ({
  record,
  onDetail,
  onEdit,
  onRun,
  onStop,
  onStopWithSavepoint,
  onResumeFromSavepoint,
  onOnline,
  onOffline,
  onDelete,
  onLog,
  onCheckpoint,
}) => {
  const [runOpen, setRunOpen] = useState(false);
  const [offlineOpen, setOfflineOpen] = useState(false);

  const [runLoading, setRunLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const isOnline = isReleaseOnline(record.releaseState);
  const isRunning = isRunningStatus(record.lastJobStatus);
  const hasInstance = !!record.instanceId;
  const hasSavepoint = !!record.savepointPath;

  const canRun = isOnline && !isRunning;
  const canOffline = isOnline && !isRunning;
  const canStopWithSavepoint = isRunning && hasInstance;
  const canResumeFromSavepoint =
    isOnline && !isRunning && hasInstance && hasSavepoint;

  const disableEditOrDelete = isOnline || isRunning;

  const stopPropagation = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleRun = async () => {
    if (!canRun) {
      if (!isOnline) {
        message.warning("请先上线任务，再执行运行操作");
      }

      if (isRunning) {
        message.warning("任务正在运行中");
      }

      return;
    }

    try {
      setRunLoading(true);
      await onRun?.(record);
      setRunOpen(false);
    } finally {
      setRunLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setStopLoading(true);
      await onStop?.(record);
    } finally {
      setStopLoading(false);
    }
  };

  const handleOnline = async () => {
    try {
      setOnlineLoading(true);
      await onOnline?.(record);
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleOffline = async () => {
    if (!canOffline) {
      if (isRunning) {
        message.warning("任务正在运行中，请先停止任务后再下线");
      }

      return;
    }

    try {
      setOfflineLoading(true);
      await onOffline?.(record);
      setOfflineOpen(false);
    } finally {
      setOfflineLoading(false);
    }
  };

  return (
    <Space size={6} className="whitespace-nowrap">
      {isRunning ? (
        <Popconfirm
          title="停止实时任务"
          description={
            <div className="mr-3">
              停止后当前运行实例会被暂停，
              <br />
              确认停止该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            danger: true,
            size: "small",
            loading: stopLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleStop}
        >
          <button
            type="button"
            className={dangerActionClass}
            onClick={stopPropagation}
          >
            <PauseCircleOutlined />
            停止
          </button>
        </Popconfirm>
      ) : (
        <Popconfirm
          title="运行实时任务"
          open={canRun ? runOpen : false}
          onOpenChange={(open) => {
            if (!canRun) {
              if (!isOnline) {
                message.warning("请先上线任务，再执行运行操作");
              }

              if (isRunning) {
                message.warning("任务正在运行中");
              }

              return;
            }

            if (!runLoading) {
              setRunOpen(open);
            }
          }}
          description={
            <div className="mr-3">
              实时任务会持续运行，
              <br/>
              确认立即启动该任务吗？
              {hasSavepoint ? (
                <>
                  <br />
                  <span>存在保存点：{record.savepointPath}</span>
                </>
              ) : null}
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: runLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleRun}
        >
          <button
            type="button"
            className={canRun ? primaryActionClass : disabledActionClass}
            onClick={(event) => {
              event.stopPropagation();

              if (!canRun) {
                if (!isOnline) {
                  message.warning("请先上线任务，再执行运行操作");
                }

                if (isRunning) {
                  message.warning("任务正在运行中");
                }
              }
            }}
          >
            <PlayCircleOutlined />
            运行
          </button>
        </Popconfirm>
      )}

      {isOnline ? (
        <Popconfirm
          title="任务下线"
          open={canOffline ? offlineOpen : false}
          onOpenChange={(open) => {
            if (!canOffline) {
              if (isRunning) {
                message.warning("任务正在运行中，请先停止任务后再下线");
              }

              return;
            }

            if (!offlineLoading) {
              setOfflineOpen(open);
            }
          }}
          description={
            <div className="mr-3">
              下线后任务将不会再被调度触发，
              <br />
              确认下线该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: offlineLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleOffline}
        >
          <button
            type="button"
            className={canOffline ? secondaryActionClass : disabledActionClass}
            onClick={(event) => {
              event.stopPropagation();

              if (!canOffline && isRunning) {
                message.warning("任务正在运行中，请先停止任务后再下线");
              }
            }}
          >
            <CloudDownloadOutlined />
            下线
          </button>
        </Popconfirm>
      ) : (
        <Popconfirm
          title="任务上线"
          description={
            <div className="mr-3">
              上线后任务将恢复可运行状态，确认上线该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: onlineLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleOnline}
        >
          <button
            type="button"
            className={secondaryActionClass}
            onClick={stopPropagation}
          >
            <CloudUploadOutlined />
            上线
          </button>
        </Popconfirm>
      )}

      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            {
              key: "view",
              icon: <EyeOutlined />,
              label: "查看详情",
            },
            // {
            //   key: "log",
            //   icon: <FileTextOutlined />,
            //   label: "查看日志",
            // },
            // {
            //   key: "checkpoint",
            //   icon: <SaveOutlined />,
            //   label: "检查点配置",
            // },
            {
              type: "divider",
            },
            {
              key: "stopWithSavepoint",
              icon: <SaveOutlined />,
              label: "停止并保存检查点",
              disabled: !canStopWithSavepoint,
            },
            {
              key: "resumeFromSavepoint",
              icon: <SyncOutlined />,
              label: "从检查点恢复",
              disabled: !canResumeFromSavepoint,
            },
            {
              type: "divider",
            },
            {
              key: "log",
              icon: <FileSearchOutlined />,
              label: "查看日志",
            },
            {
              key: "checkpoint",
              icon: <SaveOutlined />,
              label: "查看检查点",
            },
            {
              type: "divider",
            },
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "编辑配置",
              disabled: disableEditOrDelete,
            },
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "删除任务",
              danger: true,
              disabled: disableEditOrDelete,
            },
          ],
          onClick: async (info) => {
            info.domEvent.stopPropagation();

            if (info.key === "view") {
              onDetail?.(record);
              return;
            }

            if (info.key === "log") {
              onLog?.(record);
              return;
            }

            if (info.key === "checkpoint") {
              onCheckpoint?.(record);
              return;
            }

            if (info.key === "stopWithSavepoint") {
              if (!canStopWithSavepoint) {
                message.warning("只有运行中的任务才能保存检查点停止");
                return;
              }

              await onStopWithSavepoint?.(record);
              return;
            }

            if (info.key === "resumeFromSavepoint") {
              if (!canResumeFromSavepoint) {
                if (!isOnline) {
                  message.warning("请先上线任务，再执行检查点恢复");
                  return;
                }

                if (isRunning) {
                  message.warning("任务正在运行中，不能重复恢复");
                  return;
                }

                if (!hasSavepoint) {
                  message.warning("当前任务没有可恢复的检查点");
                  return;
                }

                return;
              }

              await onResumeFromSavepoint?.(record);
              return;
            }

            if (info.key === "edit") {
              if (disableEditOrDelete) {
                message.warning("任务已上线，请先下线后再编辑");
                return;
              }

              onEdit?.(record);
              return;
            }

            if (info.key === "delete") {
              if (disableEditOrDelete) {
                message.warning("任务已上线，请先下线后再删除");
                return;
              }

              onDelete?.(record);
            }
          },
        }}
        placement="bottomLeft"
      >
        <button
          type="button"
          className={moreActionClass}
          onClick={stopPropagation}
        >
          更多
          <DownOutlined className="text-[10px]" />
        </button>
      </Dropdown>
    </Space>
  );
};

export default RealtimeTaskActionColumn;
