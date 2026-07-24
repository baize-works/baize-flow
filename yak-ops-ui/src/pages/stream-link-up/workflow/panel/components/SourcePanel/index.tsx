import QualityDetail from "@/pages/batch-link-up/DataViewSQL";
import { validateServerIdRange } from "@/pages/stream-link-up/config/serverId";
import {
  Button,
  Divider,
  Input,
  InputNumber,
  Radio,
  Segmented,
  Select,
  Tooltip,
} from "antd";
import { BarChart3, Database, Eye, Info } from "lucide-react";
import { memo, useMemo, useRef } from "react";
import PanelShell from "../PanelShell";
import ExtraParamsConfig from "./ExtraParamsConfig";
import { useSourcePanelLogic } from "./hooks/useSourcePanelLogic";

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  scheduleConfig: any;
}

const STARTUP_MODE_OPTIONS = [
  {
    label: "initial",
    value: "initial",
    shortDesc: "全量 + 增量",
    desc: "先同步历史全量数据，再继续同步增量 binlog",
  },
  {
    label: "latest",
    value: "latest",
    shortDesc: "仅新增变更",
    desc: "从最新 binlog 位点开始，只同步启动后的新增变更",
  },
  {
    label: "specific",
    value: "specific",
    shortDesc: "指定 binlog",
    desc: "从指定 binlog 文件和 position 开始同步",
  },
  {
    label: "timestamp",
    value: "timestamp",
    shortDesc: "指定时间戳",
    desc: "从指定时间戳开始同步",
  },
];

function SourcePanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  scheduleConfig,
}: Props) {
  const qualityDetailRef = useRef<any>(null);

  const {
    title,
    dbType,
    description,
    dataSourceId,
    table,
    extraParams,
    dataSourceOptions,
    tableOptions,
    tableLoading,
    updateNode,
    handleDataSourceChange,
    handlePreview,
    viewLoading,
    handleResolveColumns,
  } = useSourcePanelLogic({
    selectedNode,
    onNodeDataChange,
    qualityDetailRef,
    scheduleConfig,
  });

  const sourceConfig = selectedNode?.data?.config || {};

  const startupMode = sourceConfig.startupMode || "initial";
  const startupSpecificOffsetFile =
    sourceConfig.startupSpecificOffsetFile || "";
  const startupSpecificOffsetPos = sourceConfig.startupSpecificOffsetPos;
  const startupTimestamp = sourceConfig.startupTimestamp;
  const serverIdMode = sourceConfig.serverIdMode || "MANUAL";
  const serverId = sourceConfig.serverId || sourceConfig["server-id"] || "";

  const startupModeDesc = useMemo(() => {
    return (
      STARTUP_MODE_OPTIONS.find((item) => item.value === startupMode)?.desc ||
      "配置 CDC 启动读取位点"
    );
  }, [startupMode]);

  const resetSchemaMeta = {
    outputSchema: [],
    schemaStatus: "idle",
    schemaError: "",
  };

  const handleStartupModeChange = (value: string) => {
    updateNode(
      {
        startupMode: value,
        startupSpecificOffsetFile:
          value === "specific" ? startupSpecificOffsetFile : undefined,
        startupSpecificOffsetPos:
          value === "specific" ? startupSpecificOffsetPos : undefined,
        startupTimestamp: value === "timestamp" ? startupTimestamp : undefined,
      },
      undefined,
      resetSchemaMeta
    );
  };

  return (
    <>
      <PanelShell
        eyebrow="Source Config"
        title="来源配置"
        badge="CDC 输入节点"
        desc="修改后会实时同步到当前画布节点"
        heroTitle={title}
        heroDesc={description}
        heroTag="CDC SOURCE"
        dbType={dbType}
        onClose={onClose}
        footer={
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            onClick={onClose}
          >
            关闭
          </button>
        }
      >
        {/* SECTION */}
        <section
          className="mb-3 p-3 rounded-2xl  bg-white space-y-4"
          style={{ border: "1px solid #ebeff5" }}
        >
          {/* ================= 数据源 ================= */}
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-slate-400 tracking-wide">
              数据源
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100"
              style={{ border: "1px solid #ebeff5" }}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-indigo-500">
                <Database size={16} />
              </div>

              <Select
                value={dataSourceId}
                onChange={handleDataSourceChange}
                options={dataSourceOptions}
                placeholder="请选择来源数据源"
                showSearch
                className="w-full"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* ================= 读取方式 ================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-slate-400 tracking-wide">
                读取方式
              </div>

              <div className="flex items-center ">
                <Tooltip title="预览读取结果">
                  <Button
                    size="small"
                    type="text"
                    icon={<Eye size={14} />}
                    style={{
                      fontSize: 13,
                    }}
                    onClick={handlePreview}
                    loading={viewLoading}
                  >
                    预览
                  </Button>
                </Tooltip>

                <Divider
                  type="vertical"
                  style={{ padding: 0, margin: "0 4px" }}
                />

                <Tooltip title="解析字段">
                  <Button
                    size="small"
                    style={{
                      fontSize: 13,
                    }}
                    type="text"
                    icon={<BarChart3 size={14} />}
                    onClick={handleResolveColumns}
                  >
                    字段解析
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Select
              value={table}
              onChange={(value) =>
                updateNode({
                  table: value,
                  tableNames: value ? [value] : [],
                })
              }
              showSearch
              options={tableOptions}
              loading={tableLoading}
              placeholder="请选择 CDC 表"
              className="w-full"
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* ================= 启动模式 ================= */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="text-[13px] font-semibold text-slate-400 tracking-wide">
                  启动模式
                </div>

                <Tooltip title="控制 CDC 数据同步的起始方式，例如全量、增量或指定位点">
                  <Info
                    size={14}
                    className="text-slate-400 cursor-pointer hover:text-slate-600 transition"
                  />
                </Tooltip>
              </div>
            </div>

            <div className="p-1 rounded-2xl border border-slate-200 bg-slate-50">
              <Segmented
                block
                value={startupMode}
                onChange={(v) => handleStartupModeChange(String(v))}
                options={STARTUP_MODE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: (
                    <div className="flex h-[54px] flex-col items-center justify-center">
                      <div className="text-[13px] font-semibold">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.shortDesc}
                      </div>
                    </div>
                  ),
                }))}
                className="w-full"
              />
            </div>

            {startupMode === "specific" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={startupSpecificOffsetFile}
                  placeholder="mysql-bin.000001"
                  onChange={(e) =>
                    updateNode({ startupSpecificOffsetFile: e.target.value })
                  }
                />

                <InputNumber
                  value={startupSpecificOffsetPos}
                  style={{ width: "100%" }}
                  onChange={(v) => updateNode({ startupSpecificOffsetPos: v })}
                />
              </div>
            )}

            {startupMode === "timestamp" && (
              <InputNumber
                value={startupTimestamp}
                style={{ width: "100%" }}
                placeholder="timestamp"
                onChange={(v) => updateNode({ startupTimestamp: v })}
              />
            )}
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-slate-400 tracking-wide">
                ServerId
              </div>

              <Tooltip title="同一 MySQL 集群内必须保证 server-id 唯一，避免多个 CDC 任务冲突">
                <Info
                  size={14}
                  className="text-slate-400 cursor-pointer hover:text-slate-600 transition"
                />
              </Tooltip>
            </div>
            <Radio.Group
              value={serverIdMode}
              onChange={(e) => updateNode({ serverIdMode: e.target.value })}
              className="flex gap-3"
            >
              <Radio value="MANUAL">手动指定</Radio>
              <Radio value="AUTO" disabled>
                自动分配
              </Radio>
            </Radio.Group>

            <Input
              value={serverId}
              disabled={serverIdMode === "AUTO"}
              placeholder="5400 或 5400-5408"
              status={
                validateServerIdRange(serverId).valid ? undefined : "error"
              }
              onChange={(e) =>
                updateNode({
                  serverId: e.target.value,
                  "server-id": e.target.value.trim() || undefined,
                })
              }
              allowClear
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* ================= Extra Params ================= */}
          <ExtraParamsConfig
            params={extraParams}
            onParamsChange={(params) => updateNode({ extraParams: params })}
            selectedNode={selectedNode}
            hideHeader
          />
        </section>
      </PanelShell>

      <QualityDetail ref={qualityDetailRef} />
    </>
  );
}

export default memo(SourcePanel);
