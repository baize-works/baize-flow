import { history, useLocation, useParams } from "@umijs/max";
import { Empty, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { seatunnelJobDefinitionApi } from "../../api";
import Workflow from "../../workflow";
import {
  BasicConfig,
  defaultEnvConfig,
  EnvConfig,
} from "../../workflow/components/ScheduleConfigContent/types";

type PageScene = "create" | "edit";

type EditorSyncState = "UNPUBLISHED" | "SYNCED" | "DIRTY";

type JobDefinitionState = {
  editorSyncState: EditorSyncState;
  releaseState?: "ONLINE" | "OFFLINE" | string;
  jobVersion?: number | null;
  contentVersion?: number | null;
};

const defaultStreamingEnvConfig: EnvConfig = {
  ...defaultEnvConfig,
  jobMode: "STREAMING",
  parallelism: 1,
  checkpointInterval: 30000,
} as EnvConfig;

const defaultBasicConfig: BasicConfig = {
  jobName: "",
  jobDesc: "",
  clientId: "",
  mode: "GUIDE_SINGLE",
  sourceType: "SOURCE",
  targetType: "SINK",
  sourceDataSourceId: "",
  targetDataSourceId: "",
};

const buildUnpublishedState = (): JobDefinitionState => {
  return {
    editorSyncState: "UNPUBLISHED",
    releaseState: "OFFLINE",
    jobVersion: null,
    contentVersion: null,
  };
};

const buildSyncedState = (rawState?: any): JobDefinitionState => {
  return {
    editorSyncState: "SYNCED",
    releaseState: rawState?.releaseState || "OFFLINE",
    jobVersion: rawState?.jobVersion ?? null,
    contentVersion: rawState?.contentVersion ?? null,
  };
};

const buildInitialBasicConfigForCreate = (rawData?: any): BasicConfig => {
  return {
    ...defaultBasicConfig,
    jobName: rawData?.jobName || "",
    jobDesc: rawData?.jobDesc || "",
    clientId: rawData?.clientId || "",
    mode: rawData?.mode || "GUIDE_SINGLE",
    sourceType: rawData?.sourceType?.dbType || "SOURCE",
    targetType: rawData?.targetType?.dbType || "SINK",
    sourceDataSourceId: rawData?.sourceDataSourceId || rawData?.sourceId || "",
    targetDataSourceId: rawData?.targetDataSourceId || rawData?.targetId || "",
  };
};

const buildInitialBasicConfigForEdit = (editData?: any): BasicConfig => {
  const basic = editData?.basic || {};
  const workflow = editData?.workflow || {};

  return {
    ...defaultBasicConfig,
    jobName: basic?.jobName || "",
    jobDesc: basic?.jobDesc || "",
    clientId: basic?.clientId ? String(basic.clientId) : "",
    mode: basic?.mode || editData?.mode || "GUIDE_SINGLE",
    sourceType: workflow?.sourceType?.dbType || "SOURCE",
    targetType: workflow?.targetType?.dbType || "SINK",
    sourceDataSourceId:
      workflow?.sourceDataSourceId || workflow?.sourceId || "",
    targetDataSourceId:
      workflow?.targetDataSourceId || workflow?.targetId || "",
  };
};

const buildInitialEnvConfigForCreate = (rawData?: any): EnvConfig => {
  return {
    ...defaultStreamingEnvConfig,
    ...(rawData?.env || rawData?.envConfig || {}),
    jobMode: "STREAMING",
  } as EnvConfig;
};

const buildInitialEnvConfigForEdit = (editData?: any): EnvConfig => {
  return {
    ...defaultStreamingEnvConfig,
    ...(editData?.env || {}),
    jobMode: "STREAMING",
  } as EnvConfig;
};

const buildPageParamsForCreate = (rawData: any, routeId?: string) => {
  return {
    ...rawData,
    id: rawData?.id || routeId,
    runtimeType: "STREAMING",
    __pageScene: "create",
    state: buildUnpublishedState(),
  };
};

const buildPageParamsForEdit = (editData?: any) => {
  const basic = editData?.basic || {};
  const workflow = editData?.workflow || {};
  const env = editData?.env || {};

  return {
    id: editData?.id,
    mode: editData?.mode,
    runtimeType: editData?.runtimeType || "STREAMING",

    jobName: basic?.jobName || "",
    jobDesc: basic?.jobDesc || "",
    clientId: basic?.clientId || "",

    sourceType: workflow?.sourceType || null,
    targetType: workflow?.targetType || null,
    sourceDataSourceId:
      workflow?.sourceDataSourceId || workflow?.sourceId || "",
    targetDataSourceId:
      workflow?.targetDataSourceId || workflow?.targetId || "",

    workflow,
    basic,
    env,

    __pageScene: "edit",
    state: editData?.state
      ? buildSyncedState(editData.state)
      : buildSyncedState({
          releaseState: editData?.releaseState,
          jobVersion: editData?.jobVersion,
          contentVersion: editData?.contentVersion,
        }),
  };
};

export default function SingleConfigPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [pageScene, setPageScene] = useState<PageScene>("create");
  const [params, setParams] = useState<any>(null);
  const [sourceType, setSourceType] = useState<any>(null);
  const [targetType, setTargetType] = useState<any>(null);
  const [envConfig, setEnvConfig] =
    useState<EnvConfig>(defaultStreamingEnvConfig);
  const [basicConfig, setBasicConfig] =
    useState<BasicConfig>(defaultBasicConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const searchParams = new URLSearchParams(location.search);
    const scene = searchParams.get("scene");
    const cacheKey = `stream-link-up-detail-${id}`;

    const initCreate = () => {
      setPageScene("create");

      const cache = sessionStorage.getItem(cacheKey);
      if (!cache) {
        setParams(null);
        return;
      }

      try {
        const data = JSON.parse(cache);
        const pageParams = buildPageParamsForCreate(data, id);

        setParams(pageParams);
        setSourceType(data?.sourceType || null);
        setTargetType(data?.targetType || null);
        setBasicConfig(buildInitialBasicConfigForCreate(data));
        setEnvConfig(buildInitialEnvConfigForCreate(data));
      } catch (error) {
        message.error("读取配置缓存失败，请返回重新选择数据源");
        setParams(null);
      }
    };

    const initEdit = async () => {
      try {
        setLoading(true);
        setPageScene("edit");

        const res = await seatunnelJobDefinitionApi.selectEditDetail(id);
        if (res?.code !== 0 || !res?.data) {
          message.error(res?.message || res?.msg || "获取编辑详情失败");
          setParams(null);
          return;
        }

        const data = res.data;
        const pageParams = buildPageParamsForEdit(data);

        setParams(pageParams);
        setSourceType(data?.workflow?.sourceType || null);
        setTargetType(data?.workflow?.targetType || null);
        setBasicConfig(buildInitialBasicConfigForEdit(data));
        setEnvConfig(buildInitialEnvConfigForEdit(data));
      } catch (error) {
        message.error("获取编辑详情失败");
        setParams(null);
      } finally {
        setLoading(false);
      }
    };

    if (scene === "edit") {
      initEdit();
      return;
    }

    if (scene === "create") {
      initCreate();
      return;
    }

    const cache = sessionStorage.getItem(cacheKey);
    if (cache) {
      initCreate();
    } else {
      initEdit();
    }
  }, [id, location.search]);

  const goBack = () => {
    const searchParams = new URLSearchParams(location.search);
    const scene = searchParams.get("scene");

    if (scene === "edit") {
      history.push(`/sync/stream-link-up`);
      return;
    }

    history.push(`/sync/stream-link-up/${id}/detail`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Spin />
      </div>
    );
  }

  if (!params) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Empty description="未找到配置数据，请检查任务是否存在" />
      </div>
    );
  }

  const effectivePageScene = (params?.__pageScene as PageScene) || pageScene;

  const workflowContextKey = [
    effectivePageScene,
    params?.id || id || "unknown",
    params?.state?.jobVersion ?? "none",
    params?.state?.contentVersion ?? "none",
  ].join("-");

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Workflow
        pageScene={effectivePageScene}
        contextKey={workflowContextKey}
        params={params}
        goBack={goBack}
        sourceType={sourceType}
        setSourceType={setSourceType}
        targetType={targetType}
        setTargetType={setTargetType}
        setParams={setParams}
        basicConfig={basicConfig}
        setBasicConfig={setBasicConfig}
        envConfig={envConfig}
        setEnvConfig={setEnvConfig}
      />
    </div>
  );
}