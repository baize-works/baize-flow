import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, message, Popover, Row, Space, Tooltip } from "antd";
import { Blocks, Braces, Database, Eye, Upload } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ReactFlowProvider } from "reactflow";
import { seatunnelJobDefinitionApi } from "../api";
import { validateServerIdRange } from "../config/serverId";
import { CheckListPopover } from "./components/CheckListPopover";
import type {
  BasicConfig,
  EnvConfig,
} from "./components/ScheduleConfigContent/types";
import FlowCanvas from "./FlowCanvas";
import { useFlowChecks } from "./hooks/useFlowChecks";
import "./index.less";
import CodeBlockWithCopy from "./operator/CodeBlockWithCopy";
import RightConfigPanel from "./RightConfigPanel";

type PageScene = "create" | "edit";

type EditorSyncState = "UNPUBLISHED" | "SYNCED" | "DIRTY";

type JobDefinitionState = {
  editorSyncState?: EditorSyncState | string;
  releaseState?: "ONLINE" | "OFFLINE" | string;
  jobVersion?: number | null;
  contentVersion?: number | null;
};

interface WorkflowProps {
  pageScene: PageScene;
  contextKey: string;

  params: any;
  goBack: () => void;
  sourceType: any;
  setSourceType: (value: any) => void;
  targetType: any;
  setTargetType: (value: any) => void;
  basicConfig: BasicConfig;
  setBasicConfig: Dispatch<SetStateAction<BasicConfig>>;
  setParams: Dispatch<SetStateAction<any>>;
  envConfig: EnvConfig;
  setEnvConfig: Dispatch<SetStateAction<EnvConfig>>;
}

const getInitialWorkflowGraph = (params?: any) => {
  const workflow = params?.workflow || {};

  return {
    nodes: Array.isArray(workflow?.nodes) ? workflow.nodes : [],
    edges: Array.isArray(workflow?.edges) ? workflow.edges : [],
  };
};

const buildDirtySignature = (data: {
  basicConfig: BasicConfig;
  envConfig: EnvConfig;
  workflowGraph: {
    nodes: any[];
    edges: any[];
  };
}) => {
  return JSON.stringify({
    basic: data.basicConfig,
    env: data.envConfig,
    workflow: {
      nodes: data.workflowGraph?.nodes || [],
      edges: data.workflowGraph?.edges || [],
    },
  });
};

const normalizeInitialState = (
  state: JobDefinitionState | undefined,
  pageScene: PageScene
): JobDefinitionState => {
  if (pageScene === "create") {
    return {
      editorSyncState: "UNPUBLISHED",
      releaseState: "OFFLINE",
      jobVersion: null,
      contentVersion: null,
    };
  }

  return {
    editorSyncState: "SYNCED",
    releaseState: state?.releaseState || "OFFLINE",
    jobVersion: state?.jobVersion ?? null,
    contentVersion: state?.contentVersion ?? null,
  };
};

const normalizeSavedState = (
  state: JobDefinitionState | undefined,
  currentState: JobDefinitionState
): JobDefinitionState => {
  return {
    editorSyncState: "SYNCED",
    releaseState: state?.releaseState || currentState?.releaseState || "OFFLINE",
    jobVersion: state?.jobVersion ?? currentState?.jobVersion ?? null,
    contentVersion: state?.contentVersion ?? currentState?.contentVersion ?? null,
  };
};

const getSaveResponseData = (res: any) => {
  const data = res?.data;

  /**
   * 兼容两种后端返回：
   * 1. 新版：data = { id, state }
   * 2. 旧版：data = id
   */
  if (data && typeof data === "object") {
    return {
      id: data?.id,
      state: data?.state,
    };
  }

  return {
    id: data,
    state: undefined,
  };
};

export default function Workflow({
  pageScene,
  contextKey,
  params,
  goBack,
  sourceType,
  targetType,
  basicConfig,
  setBasicConfig,
  setParams,
  envConfig,
  setEnvConfig,
}: WorkflowProps) {
  const [form] = Form.useForm();

  const [rightWidth, setRightWidth] = useState(540);
  const [activeTab, setActiveTab] = useState<
    "basic" | "mapping" | "env" | null
  >(null);

  const draggingRef = useRef(false);
  const contextRef = useRef<string>("");

  const [workflowGraph, setWorkflowGraph] = useState<{
    nodes: any[];
    edges: any[];
  }>(() => getInitialWorkflowGraph(params));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [definitionState, setDefinitionState] = useState<JobDefinitionState>(() =>
    normalizeInitialState(params?.state, pageScene)
  );

  const [baselineSignature, setBaselineSignature] = useState<string>("");

  const [publishLoading, setPublishLoading] = useState(false);

  const currentSignature = useMemo(() => {
    return buildDirtySignature({
      basicConfig,
      envConfig,
      workflowGraph,
    });
  }, [basicConfig, envConfig, workflowGraph]);

  /**
   * id 只是任务标识，不代表当前页面已经发布。
   * 是否发布，要看 editorSyncState 和当前内容是否等于 baseline。
   */
  const jobDefinitionId = params?.id;

  /**
   * 进入新的任务上下文时初始化一次 baseline。
   * 不要在 currentSignature 变化时重置 baseline，否则 dirty 状态会被抹掉。
   */
  useEffect(() => {
    if (!contextKey) return;

    if (contextRef.current === contextKey) {
      return;
    }

    contextRef.current = contextKey;

    const nextWorkflowGraph = getInitialWorkflowGraph(params);
    const nextState = normalizeInitialState(params?.state, pageScene);

    setWorkflowGraph(nextWorkflowGraph);
    setDefinitionState(nextState);

    setBaselineSignature(
      buildDirtySignature({
        basicConfig,
        envConfig,
        workflowGraph: nextWorkflowGraph,
      })
    );
  }, [contextKey, params, pageScene, basicConfig, envConfig]);

  const hasSyncedDefinition =
    !!jobDefinitionId && definitionState?.editorSyncState === "SYNCED";

  const isDirty =
    hasSyncedDefinition &&
    !!baselineSignature &&
    currentSignature !== baselineSignature;

  const editorSyncState: EditorSyncState = !hasSyncedDefinition
    ? "UNPUBLISHED"
    : isDirty
    ? "DIRTY"
    : "SYNCED";

  const publishStatusView = {
    UNPUBLISHED: {
      text: "未发布",
      tooltip: "当前实时任务还没有发布到数据库",
      className: "border-amber-200 bg-amber-50 text-amber-600",
    },
    SYNCED: {
      text: "已发布",
      tooltip: "当前内容已同步到数据库",
      className: "border-emerald-200 bg-emerald-50 text-emerald-600",
    },
    DIRTY: {
      text: "已修改，未发布",
      tooltip: "当前页面内容已变更，需要重新发布",
      className: "border-blue-200 bg-blue-50 text-blue-600",
    },
  }[editorSyncState];

  const { checkStat, checkGroups } = useFlowChecks(workflowGraph.nodes || []);

  const validateServerIdBeforeAction = () => {
    const sourceNode = (workflowGraph.nodes || []).find(
      (node: any) => node?.data?.nodeType === "source"
    );
    const sourceConfig = sourceNode?.data?.config || {};

    if (sourceConfig.serverIdMode === "AUTO") {
      return true;
    }

    const result = validateServerIdRange(
      sourceConfig.serverId || sourceConfig["server-id"]
    );
    if (!result.valid) {
      message.warning(result.message);
      return false;
    }

    return true;
  };

  const validateChecklistBeforeAction = () => {
    const total =
      (checkStat as any)?.total ??
      (checkStat as any)?.count ??
      (checkStat as any)?.checklistCount ??
      0;

    if (total !== 0) {
      message.warning("请先完成 Checklist 检查后，再进行预览或同步");
      return false;
    }

    return true;
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;

      const viewportWidth = window.innerWidth;
      const nextWidth = viewportWidth - event.clientX - 18;
      const clampedWidth = Math.max(320, Math.min(520, nextWidth));

      setRightWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const buildEnvData = () => {
    return {
      ...envConfig,
      jobMode: "STREAMING",
    };
  };

  const handleResizeStart = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const buildWorkflowData = () => {
    return {
      nodes: workflowGraph.nodes,
      edges: workflowGraph.edges,
    };
  };

  const buildBasicData = () => {
    return {
      ...basicConfig,
    };
  };

  const buildFinalPayload = () => {
    return {
      id: jobDefinitionId,
      basic: buildBasicData(),
      workflow: buildWorkflowData(),
      env: buildEnvData(),
    };
  };

  const handlePreview = async () => {
    try {
      if (!validateChecklistBeforeAction() || !validateServerIdBeforeAction()) {
        return;
      }

      setPreviewLoading(true);

      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.buildGuideSingleConfig(
        finalPayload
      );

      setPreviewContent(res?.data || "");
      setPreviewOpen(true);
    } catch (error: any) {
      message.error(error?.message || "预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!validateChecklistBeforeAction() || !validateServerIdBeforeAction()) {
        return;
      }

      setPublishLoading(true);

      const nextBasic = buildBasicData();
      const nextWorkflow = buildWorkflowData();
      const nextEnv = buildEnvData();

      const finalPayload = {
        id: jobDefinitionId,
        basic: nextBasic,
        workflow: nextWorkflow,
        env: nextEnv,
      };

      const res = await seatunnelJobDefinitionApi.saveOrUpdateGuideSingle(
        finalPayload
      );

      const saveData = getSaveResponseData(res);
      const nextJobDefinitionId = saveData.id ?? finalPayload.id;

      if (!nextJobDefinitionId) {
        message.error("发布失败：未获取到任务定义ID");
        return;
      }

      const nextState = normalizeSavedState(saveData.state, definitionState);

      const nextSignature = buildDirtySignature({
        basicConfig: nextBasic,
        envConfig: nextEnv,
        workflowGraph: nextWorkflow,
      });

      setDefinitionState(nextState);
      setBaselineSignature(nextSignature);

      setParams((prev: any) => ({
        ...prev,
        id: nextJobDefinitionId,

        __pageScene: "edit",
        state: nextState,

        workflow: nextWorkflow,
        basic: nextBasic,
        env: nextEnv,

        jobName: nextBasic?.jobName ?? prev?.jobName,
        jobDesc: (nextBasic as any)?.jobDesc ?? prev?.jobDesc,
        description: (nextBasic as any)?.description ?? prev?.description,
        clientId: nextBasic?.clientId ?? prev?.clientId,
      }));

      message.success("发布成功");
    } catch (error: any) {
      message.error(error?.message || "发布失败");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleWorkflowChange = (nextGraph: { nodes: any[]; edges: any[] }) => {
    setWorkflowGraph((prev) => {
      const prevSignature = JSON.stringify({
        nodes: prev?.nodes || [],
        edges: prev?.edges || [],
      });

      const nextSignature = JSON.stringify({
        nodes: nextGraph?.nodes || [],
        edges: nextGraph?.edges || [],
      });

      if (prevSignature === nextSignature) {
        return prev;
      }

      return {
        nodes: nextGraph?.nodes || [],
        edges: nextGraph?.edges || [],
      };
    });
  };

  const actionChipClass =
    "inline-flex h-[34px] cursor-pointer select-none items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3.5 text-[13px] font-medium leading-none text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-white/80 hover:text-slate-700 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] active:translate-y-0";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-indigo-50 text-indigo-600">
              <Blocks size={18} />
            </div>

            <div>
              <div className="mb-0 text-[20px] font-bold leading-[1.2] text-slate-900">
                单表实时任务
              </div>
              <div className="text-[14px] leading-6 text-slate-500">
                配置同步链路、字段映射与运行参数，在一个页面完成创建与调试。
              </div>
            </div>
          </div>

          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
              className="!h-10 !rounded-full !border !border-slate-200 !bg-white !px-4 !text-slate-700 !shadow-sm hover:!border-slate-300 hover:!bg-slate-50 hover:!text-slate-800"
            >
              返回上一步
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-[18px]">
        <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white via-white to-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex h-full min-w-0 items-stretch">
            <div className="h-full min-w-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 px-[18px]">
                  <div className="text-[15px] font-semibold text-slate-800">
                    同步编排
                  </div>

                  <Space size={10}>
                    <CheckListPopover
                      checkStat={checkStat}
                      checkGroups={checkGroups}
                      triggerClassName={actionChipClass}
                    />

                    <Popover
                      open={previewOpen}
                      placement="leftTop"
                      trigger="click"
                      overlayClassName="st-hocon-popover"
                      content={
                        <div className="w-[700px]">
                          <CodeBlockWithCopy
                            content={previewContent}
                            height={670}
                            title="HOCON Preview"
                            onClose={() => setPreviewOpen(false)}
                          />
                        </div>
                      }
                    >
                      <button
                        type="button"
                        className={actionChipClass}
                        onClick={handlePreview}
                      >
                        <Eye
                          size={15}
                          strokeWidth={1.9}
                          className={previewLoading ? "animate-spin" : ""}
                        />
                        <span className="ml-1">预览</span>
                      </button>
                    </Popover>

                    <Tooltip title={publishStatusView.tooltip}>
                      <span
                        className={[
                          "inline-flex h-[34px] select-none items-center justify-center rounded-full border px-3 text-[13px] font-medium leading-none",
                          publishStatusView.className,
                        ].join(" ")}
                      >
                        {publishStatusView.text}
                      </span>
                    </Tooltip>

                    <Button
                      type="default"
                      icon={<Upload size={15} strokeWidth={1.9} />}
                      onClick={handleSave}
                      loading={publishLoading}
                      className="!inline-flex !h-[34px] !items-center !justify-center !rounded-full !border !border-slate-200 !bg-slate-50 !px-3.5 !text-[13px] !font-medium !text-slate-500 transition-colors duration-200 hover:!border-slate-300 hover:!bg-white/80 hover:!text-slate-700 hover:!shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
                    >
                      发布
                    </Button>
                  </Space>
                </div>

                <div className="min-h-0 flex-1 bg-white p-[18px] [background:radial-gradient(circle_at_top_left,rgba(78,116,248,0.04),transparent_22%),#ffffff]">
                  <Row gutter={24} style={{ height: "100%" }}>
                    <Col span={4}>
                      <div className="flex h-full flex-col gap-3 overflow-auto border-r border-slate-100 p-3">
                        <div className="px-0.5 pb-2 pt-1 text-[13px] font-semibold text-slate-700">
                          节点组件
                        </div>

                        <div
                          className="flex cursor-grab select-none items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "application/reactflow",
                              JSON.stringify({
                                nodeType: "transform",
                                componentType: "FIELDMAPPER",
                                iconType: "braces",
                                label: "字段映射",
                              })
                            );
                            event.dataTransfer.effectAllowed = "move";
                          }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-50 to-indigo-100 text-indigo-600">
                            <Braces size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-[1.2] text-slate-900">
                              字段映射
                            </div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-slate-500">
                              配置字段对应关系
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex cursor-grab select-none items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "application/reactflow",
                              JSON.stringify({
                                nodeType: "transform",
                                componentType: "SQL",
                                iconType: "database",
                                label: "SQL 脚本",
                              })
                            );
                            event.dataTransfer.effectAllowed = "move";
                          }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-violet-50 to-violet-100 text-violet-600">
                            <Database size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-[1.2] text-slate-900">
                              SQL
                            </div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-slate-500">
                              支持自定义查询
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={20}>
                      <div className="h-full overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-[14px] text-slate-400">
                        <ReactFlowProvider>
                          <FlowCanvas
                            form={form}
                            params={params}
                            goBack={goBack}
                            sourceType={sourceType}
                            targetType={targetType}
                            onWorkflowChange={handleWorkflowChange}
                          />
                        </ReactFlowProvider>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            {activeTab && (
              <div
                className="relative flex w-[20px] shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors duration-100 hover:bg-[rgba(49,94,251,0.04)]"
                onMouseDown={handleResizeStart}
                role="separator"
                aria-orientation="vertical"
                aria-label="调整左右面板宽度"
                aria-valuenow={rightWidth}
                tabIndex={0}
              >
                <div className="h-full w-px bg-slate-200 transition-colors duration-100" />
                <div className="absolute left-1/2 top-1/2 flex h-[46px] w-5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-slate-200 bg-white opacity-90 shadow-sm transition-all duration-200 hover:scale-100 hover:opacity-100 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)]">
                  <span className="block h-1 w-1 rounded-full bg-slate-400" />
                  <span className="block h-1 w-1 rounded-full bg-slate-400" />
                </div>
              </div>
            )}

            <div
              className="h-full shrink-0 overflow-hidden"
              style={{ width: activeTab ? rightWidth : 58 }}
            >
              <RightConfigPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                params={params}
                basicConfig={basicConfig}
                setBasicConfig={setBasicConfig}
                envConfig={envConfig}
                setEnvConfig={setEnvConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}