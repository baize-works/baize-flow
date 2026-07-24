import { message } from "antd";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { seatunnelStremJobDefinitionApi } from "@/pages/stream-link-up/api";
import { hoconTemplateApi } from "../hoconTemplateApi";
import {
  markJobDefinitionSynced,
  normalizeJobDefinitionState,
  type JobDefinitionState,
} from "../jobDefinitionState";

interface UseCustomWorkflowStateProps {
  params: any;
  setParams: React.Dispatch<React.SetStateAction<any>>;
  basicConfig: any;
  scheduleConfig: any;
  envConfig: any;
}

type SaveResponseData = {
  id?: number | string;
  state?: JobDefinitionState;
};

const stableStringify = (value: any) => {
  try {
    return JSON.stringify(value ?? {});
  } catch (error) {
    return "";
  }
};

const getSaveResponseData = (res: any): SaveResponseData => {
  const data = res?.data;

  /**
   * 兼容新版返回：
   * data = {
   *   id: 123,
   *   state: {
   *     editorSyncState: "SYNCED",
   *     releaseState: "OFFLINE",
   *     jobVersion: 1,
   *     contentVersion: 1
   *   }
   * }
   */
  if (data && typeof data === "object") {
    return {
      id:
        data.id ??
        data.jobDefineId ??
        data.jobDefinitionId ??
        data.definitionId,
      state: data.state,
    };
  }

  /**
   * 兼容旧版返回：
   * data = 123
   */
  return {
    id: data,
    state: undefined,
  };
};

const syncStreamSessionCache = (id: number | string | undefined, data: any) => {
  if (!id) return;

  try {
    sessionStorage.setItem(
      `stream-link-up-detail-${id}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Update stream custom workflow session cache failed", error);
  }
};

export function useCustomWorkflowState({
  params,
  setParams,
  basicConfig,
  scheduleConfig,
  envConfig,
}: UseCustomWorkflowStateProps) {
  const [activeTab, setActiveTab] = useState<any>(null);
  const [hoconContent, setHoconContent] = useState<string>("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const [publishedJobDefineId, setPublishedJobDefineId] = useState<
    number | string | undefined
  >(params?.id);

  const [publishLoading, setPublishLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const initializingRef = useRef(false);
  const contentInitializedRef = useRef(false);
  const baselineSignatureRef = useRef("");

  useEffect(() => {
    if (params?.id) {
      setPublishedJobDefineId(params.id);
    }
  }, [params?.id]);

  const loadTemplate = useCallback(async () => {
    const sourceDbType = basicConfig?.sourceType;
    const sourcePluginName = basicConfig?.sourcePluginName;
    const targetDbType = basicConfig?.targetType;
    const targetPluginName = basicConfig?.targetPluginName;

    if (
      !sourceDbType ||
      !sourcePluginName ||
      !targetDbType ||
      !targetPluginName
    ) {
      return;
    }

    try {
      setTemplateLoading(true);

      const res = await hoconTemplateApi.preview({
        sourceDbType,
        sourcePluginName,
        targetDbType,
        targetPluginName,
      });

      setHoconContent(res?.data?.fullTemplate || "");
    } catch (error) {
      console.error(error);
      message.warning("默认 HOCON 模板加载失败，请手动填写");
    } finally {
      setTemplateLoading(false);
    }
  }, [
    basicConfig?.sourceType,
    basicConfig?.sourcePluginName,
    basicConfig?.targetType,
    basicConfig?.targetPluginName,
  ]);

  useEffect(() => {
    if (contentInitializedRef.current) return;
    if (!params) return;

    initializingRef.current = true;

    const initialContent =
      params?.workflow?.hoconContent ||
      params?.content?.hoconContent ||
      params?.jobDefinitionInfo?.hoconContent ||
      params?.hoconContent ||
      "";

    if (initialContent?.trim()) {
      setHoconContent(initialContent);
      contentInitializedRef.current = true;
      initializingRef.current = false;
      return;
    }

    contentInitializedRef.current = true;

    loadTemplate().finally(() => {
      initializingRef.current = false;
    });
  }, [params, loadTemplate]);

  const buildFinalPayload = useCallback(() => {
    return {
      id: params?.id ?? publishedJobDefineId,

      basic: {
        ...basicConfig,
        mode: "SCRIPT",
      },

      content: {
        scriptType: "HOCON",
        hoconContent,
      },

      workflow: {
        ...(params?.workflow || {}),
        hoconContent,
      },

      schedule: {
        ...scheduleConfig,
      },

      env: {
        ...envConfig,
      },
    };
  }, [
    params?.id,
    params?.workflow,
    publishedJobDefineId,
    basicConfig,
    hoconContent,
    scheduleConfig,
    envConfig,
  ]);

  const currentSignature = useMemo(() => {
    return stableStringify({
      basic: {
        ...basicConfig,
        mode: "SCRIPT",
      },
      content: {
        scriptType: "HOCON",
        hoconContent,
      },
      schedule: scheduleConfig,
      env: envConfig,
    });
  }, [basicConfig, hoconContent, scheduleConfig, envConfig]);

  const isDirty =
    !!publishedJobDefineId &&
    !!baselineSignatureRef.current &&
    currentSignature !== baselineSignatureRef.current;

  useEffect(() => {
    if (!params?.id && !publishedJobDefineId) {
      baselineSignatureRef.current = "";
      return;
    }

    if (!initializingRef.current && !baselineSignatureRef.current) {
      baselineSignatureRef.current = currentSignature;
    }
  }, [params?.id, publishedJobDefineId, currentSignature]);

  const resetBaseline = useCallback(() => {
    baselineSignatureRef.current = currentSignature;
  }, [currentSignature]);

  const validateBeforeSubmit = async () => {
    if (!basicConfig?.jobName?.trim()) {
      message.warning("请先填写任务名称");
      setActiveTab("basic");
      return false;
    }

    if (!basicConfig?.clientId) {
      message.warning("请选择运行客户端");
      setActiveTab("basic");
      return false;
    }

    if (!hoconContent?.trim()) {
      message.warning("请先填写 HOCON 配置");
      return false;
    }

    return true;
  };

  const handleReloadTemplate = async () => {
    if (
      !basicConfig?.sourceType ||
      !basicConfig?.sourcePluginName ||
      !basicConfig?.targetType ||
      !basicConfig?.targetPluginName
    ) {
      message.warning("请先完成来源和目标类型配置");
      setActiveTab("basic");
      return;
    }

    await loadTemplate();
  };

  const handleSave = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPublishLoading(true);

      const finalPayload = buildFinalPayload();

      const res = await seatunnelStremJobDefinitionApi.saveOrUpdateScript(
        finalPayload
      );

      if (res?.code !== 0) {
        return;
      }

      const saveData = getSaveResponseData(res);
      const jobDefineId = saveData.id ?? finalPayload.id;

      if (!jobDefineId) {
        message.error("发布成功但未返回任务定义ID");
        return;
      }

      /**
       * 关键点：
       * 发布成功后必须把 editorSyncState 改成 SYNCED。
       * 如果后端返回了 state，优先用后端 state。
       * 如果后端没有返回 state，就基于当前 state 前端兜底标记为 SYNCED。
       */
      const syncedState = saveData.state
        ? normalizeJobDefinitionState(saveData.state)
        : markJobDefinitionSynced(params?.state);

      setPublishedJobDefineId(jobDefineId);

      setParams((prev: any) => {
        const nextParams = {
          ...(prev || {}),
          id: jobDefineId,
          state: syncedState,

          workflow: {
            ...(prev?.workflow || {}),
            hoconContent,
          },

          content: {
            ...(prev?.content || {}),
            scriptType: "HOCON",
            hoconContent,
          },

          hoconContent,
          scheduleConfig,
          env: envConfig,
        };

        /**
         * create 场景是从 sessionStorage 初始化的。
         * 发布成功后同步缓存，避免刷新后又显示未发布。
         */
        syncStreamSessionCache(prev?.id, nextParams);
        syncStreamSessionCache(jobDefineId, nextParams);

        return nextParams;
      });

      resetBaseline();

      message.success("发布成功");
    } catch (error: any) {
    } finally {
      setPublishLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPreviewLoading(true);

      const finalPayload = buildFinalPayload();

      const res = await seatunnelStremJobDefinitionApi.buildScriptConfig(
        finalPayload
      );

      setPreviewContent(res?.data || hoconContent);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  const canRun =
    !!publishedJobDefineId && !isDirty && !publishLoading && !runLoading;

  const runDisabledReason = !publishedJobDefineId
    ? "请先发布任务，再执行"
    : isDirty
    ? "当前内容已变更，请重新发布后再执行"
    : "";

  const handleRun = async () => {
    const pass = await validateBeforeSubmit();
    if (!pass) return;

    if (!publishedJobDefineId) {
      message.warning("请先发布任务，再执行");
      return;
    }

    if (isDirty) {
      message.warning("当前内容已变更，请重新发布后再执行");
      return;
    }

    try {
      setRunLoading(true);

      /**
       * TODO:
       * 后续这里接入实时任务执行接口。
       * 例如：
       * await seatunnelStremJobDefinitionApi.execute(publishedJobDefineId);
       */

      message.success("运行校验通过，可继续接入执行逻辑");
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "运行失败");
    } finally {
      setRunLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,

    hoconContent,
    setHoconContent,

    previewOpen,
    setPreviewOpen,
    previewContent,
    previewLoading,
    templateLoading,

    publishedJobDefineId,
    publishLoading,
    runLoading,
    isDirty,
    canRun,
    runDisabledReason,

    handleSave,
    handlePreview,
    handleReloadTemplate,
    handleRun,

    buildFinalPayload,
    resetBaseline,
  };
}