import { Divider, message, Modal } from "antd";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { history } from "umi";

import RunLogDrawer from "../batch-link-up/components/SyncTaskList/components/RunLogDrawer";
import {
  seatunnelCheckpointApi,
  seatunnelStreamingJobExecuteApi,
  seatunnelStremJobDefinitionApi,
} from "./api";
import BottomActionBar from "./components/BottomActionBar";
import RealtimeCheckpointModal from "./components/RealtimeCheckpointModal";
import RealtimeHeader from "./components/RealtimeHeader";
import RealtimeTaskTable from "./components/RealtimeTaskTable";
import RealtimeTaskViewModal from "./components/RealtimeTaskViewModal";
import SearchToolbar from "./components/SearchToolbar";
import StreamingHelperSection from "./components/StreamingHelperSection";
import TaskViewModal from "./components/TaskViewModal";

const REALTIME_DETAIL_CACHE_PREFIX = "stream-link-up-detail";

const DEFAULT_TIME_RANGE = [
  moment().subtract(4, "days"),
  moment().add(1, "days"),
];

interface StreamingJobDefinitionVO {
  id: string | number;
  jobName?: string;
  jobDesc?: string;
  mode?: string;
  jobType?: string;
  clientId?: string | number;
  jobVersion?: number;
  releaseState?: "ONLINE" | "OFFLINE" | string | number;
  lastJobStatus?: string;
  instanceId?: string | number;
  engineJobId?: string | number;
  sourceType?: string;
  sinkType?: string;
  sourceTable?: string;
  sinkTable?: string;
  sourceDatasourceId?: string | number;
  sinkDatasourceId?: string | number;
  createTime?: string;
  updateTime?: string;
  savepointPath?: string;
  checkpointPath?: string;
  lastErrorMessage?: string;
  checkpointConfig?: string;
}

interface SearchValues {
  jobName?: string;
  id?: string | number;
  status?: string;
  sourceType?: string;
  sinkType?: string;
  sourceTable?: string;
  sinkTable?: string;
  createTime?: any[];
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const parseSearchParamsFromUrl = (): SearchValues => {
  const params = new URLSearchParams(window.location.search);

  const createTimeStart = params.get("createTimeStart");
  const createTimeEnd = params.get("createTimeEnd");

  return {
    jobName: params.get("jobName") || undefined,
    id: params.get("id") || undefined,
    status: params.get("status") || undefined,
    sourceType: params.get("sourceType") || undefined,
    sinkType: params.get("sinkType") || undefined,
    sourceTable: params.get("sourceTable") || undefined,
    sinkTable: params.get("sinkTable") || undefined,
    createTime:
      createTimeStart && createTimeEnd
        ? [
            moment(createTimeStart, "YYYY-MM-DD HH:mm:ss"),
            moment(createTimeEnd, "YYYY-MM-DD HH:mm:ss"),
          ]
        : DEFAULT_TIME_RANGE,
  };
};

const parsePaginationFromUrl = (): PaginationState => {
  const params = new URLSearchParams(window.location.search);

  const current = Number(params.get("current") || 1);
  const pageSize = Number(params.get("pageSize") || 10);

  return {
    current: Number.isNaN(current) || current <= 0 ? 1 : current,
    pageSize: Number.isNaN(pageSize) || pageSize <= 0 ? 10 : pageSize,
    total: 0,
  };
};

const syncUrlParams = (
  params: SearchValues,
  pageInfo: {
    current: number;
    pageSize: number;
  }
) => {
  const query = new URLSearchParams();

  if (params?.jobName) {
    query.set("jobName", String(params.jobName));
  }

  if (params?.id) {
    query.set("id", String(params.id));
  }

  if (params?.status) {
    query.set("status", params.status);
  }

  if (params?.sourceType) {
    query.set("sourceType", params.sourceType);
  }

  if (params?.sinkType) {
    query.set("sinkType", params.sinkType);
  }

  if (params?.sourceTable) {
    query.set("sourceTable", params.sourceTable);
  }

  if (params?.sinkTable) {
    query.set("sinkTable", params.sinkTable);
  }

  if (params?.createTime?.length === 2) {
    query.set(
      "createTimeStart",
      moment(params.createTime[0]).format("YYYY-MM-DD HH:mm:ss")
    );
    query.set(
      "createTimeEnd",
      moment(params.createTime[1]).format("YYYY-MM-DD HH:mm:ss")
    );
  }

  query.set("current", String(pageInfo.current || 1));
  query.set("pageSize", String(pageInfo.pageSize || 10));

  history.replace({
    search: `?${query.toString()}`,
  });
};

const RealtimeSyncPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "MySQL-CDC",
    pluginName: "MySQL-CDC",
  });

  const [sinkType, setSinkType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const ref = useRef<any>(null);
  const refDetail = useRef<any>(null);

  const [searchValues, setSearchValues] = useState<SearchValues>(() =>
    parseSearchParamsFromUrl()
  );

  const [pagination, setPagination] = useState<PaginationState>(() =>
    parsePaginationFromUrl()
  );

  const [dataSource, setDataSource] = useState<StreamingJobDefinitionVO[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [logRecord, setLogRecord] = useState<StreamingJobDefinitionVO | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [logOpen, setLogOpen] = useState(false);

  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointRecord, setCheckpointRecord] =
    useState<StreamingJobDefinitionVO | null>(null);
  const [checkpointOverview, setCheckpointOverview] = useState<any>(null);
  const [checkpointHistory, setCheckpointHistory] = useState<any[]>([]);
  const [checkpointLoading, setCheckpointLoading] = useState(false);

  const hasSelected = selectedRowKeys.length > 0;

  const queryParams = useMemo(() => {
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    };

    if (searchValues?.jobName?.trim()) {
      params.jobName = searchValues.jobName.trim();
    }

    if (searchValues?.id) {
      params.id = searchValues.id;
    }

    if (searchValues?.status) {
      params.status = searchValues.status;
    }

    if (searchValues?.sourceType) {
      params.sourceType = searchValues.sourceType;
    }

    if (searchValues?.sinkType) {
      params.sinkType = searchValues.sinkType;
    }

    if (searchValues?.sourceTable?.trim()) {
      params.sourceTable = searchValues.sourceTable.trim();
    }

    if (searchValues?.sinkTable?.trim()) {
      params.sinkTable = searchValues.sinkTable.trim();
    }

    if (searchValues?.createTime?.length === 2) {
      params.createTimeStart = moment(searchValues.createTime[0]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      params.createTimeEnd = moment(searchValues.createTime[1]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    return params;
  }, [pagination.current, pagination.pageSize, searchValues]);

  const getPageRecords = (res: any) => {
    const payload = res?.data;

    const records = payload?.bizData || [];
    const nextTotal = payload?.pagination?.total;

    return {
      records,
      total: Number(nextTotal || 0),
    };
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await seatunnelStremJobDefinitionApi.page(queryParams);

      if (res?.code !== undefined && res.code !== 0) {
        setDataSource([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
        }));
        return;
      }

      const { records, total: nextTotal } = getPageRecords(res);

      setDataSource(records || []);
      setPagination((prev) => ({
        ...prev,
        total: nextTotal || 0,
      }));
    } catch (error) {
      setDataSource([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    syncUrlParams(searchValues, {
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, [searchValues, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!sourceType?.dbType) {
      message.warning("请选择来源类型");
      return;
    }

    if (!sinkType?.dbType) {
      message.warning("请选择去向类型");
      return;
    }

    try {
      setCreating(true);

      const data = await seatunnelStremJobDefinitionApi.getUniqueId();

      if (data?.code !== 0) {
        message.error(data?.message || "获取实时任务定义ID失败");
        return;
      }

      const returnId = data?.data;

      if (!returnId) {
        message.error("创建实时任务失败：未获取到任务定义ID");
        return;
      }

      sessionStorage.setItem(
        `${REALTIME_DETAIL_CACHE_PREFIX}-${returnId}`,
        JSON.stringify({
          id: returnId,
          sourceType,
          targetType: sinkType,
        })
      );

      history.push(`/sync/stream-link-up/${returnId}/detail`);
    } catch (error) {
      message.error("创建实时任务失败");
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (values: SearchValues) => {
    setSearchValues(values || {});
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    setSelectedRowKeys([]);
  };

  const handleReset = () => {
    setSearchValues({
      createTime: DEFAULT_TIME_RANGE,
    });

    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));

    setSelectedRowKeys([]);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));

    setSelectedRowKeys([]);
  };

  const handleView = (record: StreamingJobDefinitionVO) => {
    ref.current?.onOpen(true, record, () => {});
  };

  const handleDetail = (record: StreamingJobDefinitionVO) => {
    refDetail.current?.onOpen(true, record, () => {});
  };

  const handleEdit = async (item: StreamingJobDefinitionVO) => {
    if (!item?.id) {
      message.warning("任务定义ID不能为空");
      return;
    }

    const id = item?.id;

    try {
      const mode = item?.mode;

      if (mode === "GUIDE_SINGLE") {
        history.push(`/sync/stream-link-up/${id}/config/single?scene=edit`);
        return;
      }

      if (mode === "GUIDE_MULTI") {
        history.push(`/sync/stream-link-up/${id}/config/multi?scene=edit`);
        return;
      }

      if (mode === "SCRIPT") {
        history.push(`/sync/stream-link-up/${id}/config/script?scene=edit`);
      }
    } catch (error) {}
  };

  const handleRun = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务定义ID 不存在");
      return;
    }

    const isOnline =
      record.releaseState === "ONLINE" || record.releaseState === 1;

    if (!isOnline) {
      message.warning("请先上线任务，再执行运行操作");
      return;
    }

    try {
      const res = await seatunnelStreamingJobExecuteApi.execute(record.id);

      if (res?.code !== 0) {
        message.error(res?.msg || "运行实时任务失败");
        return;
      }

      message.success("实时任务已启动");
      loadData();
    } catch (error) {
      message.error("运行实时任务失败");
    }
  };

  const handleStop = async (record: StreamingJobDefinitionVO) => {
    if (!record?.instanceId) {
      message.warning("当前任务没有运行实例");
      return;
    }

    try {
      const res = await seatunnelStreamingJobExecuteApi.pause(
        record.instanceId
      );

      if (res?.code !== 0) {
        message.error(res?.msg || "停止实时任务失败");
        return;
      }

      message.success("实时任务已停止");
      loadData();
    } catch (error) {
      message.error("停止实时任务失败");
    }
  };

  const handleOnline = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务定义ID 不存在");
      return;
    }

    try {
      const res = await seatunnelStremJobDefinitionApi.online(record.id);

      if (res?.code !== 0) {
        message.error(res?.message || res?.msg || "上线实时任务失败");
        return;
      }

      message.success("实时任务已上线");
      loadData();
    } catch (error) {
      message.error("上线实时任务失败");
    }
  };

  const handleOffline = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务定义ID 不存在");
      return;
    }

    try {
      const res = await seatunnelStremJobDefinitionApi.offline(record.id);

      if (res?.code !== 0) {
        message.error(res?.message || res?.msg || "下线实时任务失败");
        return;
      }

      message.success("实时任务已下线");
      loadData();
    } catch (error) {
      message.error("下线实时任务失败");
    }
  };

  const handleDelete = (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务定义ID 不存在");
      return;
    }

    Modal.confirm({
      title: "确认删除实时任务？",
      centered: true,
      content: (
        <span>
          删除后不可恢复：
          <span className="font-medium text-orange-500">
            {record.jobName || record.id}
          </span>
        </span>
      ),
      okText: "删除",
      cancelText: "取消",
      okButtonProps: {
        danger: true,
        size: "small",
      },
      cancelButtonProps: {
        size: "small",
      },
      async onOk() {
        try {
          const res = await seatunnelStremJobDefinitionApi.delete(
            String(record.id)
          );

          if (res?.code !== 0) {
            message.error(res?.msg || "删除实时任务失败");
            return;
          }

          message.success("实时任务已删除");

          setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));

          if (dataSource.length === 1 && pagination.current > 1) {
            setPagination((prev) => ({
              ...prev,
              current: prev.current - 1,
            }));
          } else {
            loadData();
          }
        } catch (error) {
          message.error("删除实时任务失败");
        }
      },
    });
  };

  const handleLog = (record: StreamingJobDefinitionVO) => {
    if (!record?.instanceId) {
      message.warning("当前任务没有运行实例，暂无日志");
      return;
    }

    setLogRecord(record);
    setLogOpen(true);
  };

  const loadCheckpointData = async (record: StreamingJobDefinitionVO) => {
    if (!record?.clientId) {
      message.warning("当前任务没有绑定 SeaTunnel Client");
      return;
    }

    if (!record?.engineJobId) {
      message.warning("当前任务没有 Engine Job ID，暂无检查点数据");
      setCheckpointOverview(null);
      setCheckpointHistory([]);
      return;
    }

    const clientId = record.clientId;
    const engineJobId = String(record.engineJobId);

    try {
      setCheckpointLoading(true);

      const [overviewRes, historyRes] = await Promise.all([
        seatunnelCheckpointApi.overview(clientId, engineJobId),
        seatunnelCheckpointApi.history(clientId, engineJobId, {
          limit: 20,
        }),
      ]);

      if (overviewRes?.code !== undefined && overviewRes.code !== 0) {
        message.error(
          overviewRes?.message || overviewRes?.msg || "获取检查点概览失败"
        );
        setCheckpointOverview(null);
      } else {
        setCheckpointOverview(overviewRes?.data || null);
      }

      if (historyRes?.code !== undefined && historyRes.code !== 0) {
        message.error(
          historyRes?.message || historyRes?.msg || "获取检查点历史失败"
        );
        setCheckpointHistory([]);
      } else {
        setCheckpointHistory(historyRes?.data || []);
      }
    } catch (error) {
      message.error("获取检查点数据失败");
      setCheckpointOverview(null);
      setCheckpointHistory([]);
    } finally {
      setCheckpointLoading(false);
    }
  };

  const handleCheckpoint = async (record: StreamingJobDefinitionVO) => {
    if (!record?.clientId) {
      message.warning("当前任务没有绑定 SeaTunnel Client");
      return;
    }

    if (!record?.engineJobId) {
      message.warning("当前任务没有 Engine Job ID，暂无检查点数据");
      return;
    }

    setCheckpointRecord(record);
    setCheckpointOpen(true);
    setCheckpointOverview(null);
    setCheckpointHistory([]);

    await loadCheckpointData(record);
  };

  const handleBatchStart = async () => {
    if (!hasSelected) return;

    try {
      await Promise.all(
        selectedRowKeys.map((id) => seatunnelStremJobDefinitionApi.online(id))
      );

      message.success(`已提交 ${selectedRowKeys.length} 个实时任务上线请求`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error("批量上线失败");
    }
  };

  const handleBatchStop = async () => {
    if (!hasSelected) return;

    try {
      await Promise.all(
        selectedRowKeys.map((id) => seatunnelStremJobDefinitionApi.offline(id))
      );

      message.success(`已提交 ${selectedRowKeys.length} 个实时任务下线请求`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error("批量下线失败");
    }
  };

  const handleStopWithSavepoint = async (record: StreamingJobDefinitionVO) => {
    if (!record?.instanceId) {
      message.warning("当前任务没有运行实例");
      return;
    }

    Modal.confirm({
      title: "停止并保存检查点？",
      centered: true,
      content: (
        <div className="leading-6">
          该操作会先保存当前实时任务状态，然后停止运行实例。
          <br />
          后续可以基于该检查点继续恢复运行。
        </div>
      ),
      okText: "确认保存并停止",
      cancelText: "取消",
      okButtonProps: {
        danger: true,
        size: "small",
      },
      cancelButtonProps: {
        size: "small",
      },
      async onOk() {
        try {
          const res = await seatunnelStreamingJobExecuteApi.stopWithSavepoint(
            record.instanceId
          );

          if (res?.code !== 0) {
            message.error(res?.message || res?.msg || "停止并保存检查点失败");
            return;
          }

          message.success("已停止任务，并保存检查点");
          loadData();
        } catch (error) {
          message.error("停止并保存检查点失败");
        }
      },
    });
  };

  const handleResumeFromSavepoint = async (
    record: StreamingJobDefinitionVO
  ) => {
    if (!record?.instanceId) {
      message.warning("当前任务没有可恢复的历史实例");
      return;
    }

    const isOnline =
      record.releaseState === "ONLINE" || record.releaseState === 1;

    if (!isOnline) {
      message.warning("请先上线任务，再从检查点恢复");
      return;
    }

    if (record.lastJobStatus === "RUNNING") {
      message.warning("任务正在运行中，不能重复恢复");
      return;
    }

    if (!record.savepointPath) {
      message.warning("当前任务没有可恢复的检查点，请先使用“停止并保存检查点”");
      return;
    }

    Modal.confirm({
      title: "从检查点恢复实时任务？",
      centered: true,
      content: (
        <div className="leading-6">
          系统会基于最近一次保存的检查点创建新的运行实例。
          <br />
          适用于 MySQL CDC、实时同步等需要断点续跑的任务。
        </div>
      ),
      okText: "确认恢复",
      cancelText: "取消",
      okButtonProps: {
        size: "small",
      },
      cancelButtonProps: {
        size: "small",
      },
      async onOk() {
        try {
          const res = await seatunnelStreamingJobExecuteApi.resumeFromSavepoint(
            record.instanceId
          );

          if (res?.code !== 0) {
            message.error(res?.message || res?.msg || "从检查点恢复失败");
            return;
          }

          message.success("已从检查点恢复实时任务");
          loadData();
        } catch (error) {
          message.error("从检查点恢复失败");
        }
      },
    });
  };

  return (
    <>
      <div className="min-h-screen px-6 pb-24 pt-7 text-slate-950">
        <RealtimeHeader
          sourceType={sourceType}
          sinkType={sinkType}
          onSourceChange={setSourceType}
          onSinkChange={setSinkType}
          onCreate={handleCreate}
          creating={creating}
        />

        <div className="mb-5 overflow-hidden">
          <SearchToolbar
            initialValues={searchValues}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          <Divider style={{ padding: 0, margin: "16px 0" }} />

          <RealtimeTaskTable
            loading={loading}
            dataSource={dataSource}
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChange={setSelectedRowKeys}
            pagination={false}
            onView={handleView}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onRun={handleRun}
            onStopWithSavepoint={handleStopWithSavepoint}
            onResumeFromSavepoint={handleResumeFromSavepoint}
            onStop={handleStop}
            onOnline={handleOnline}
            onOffline={handleOffline}
            onDelete={handleDelete}
            onLog={handleLog}
            onCheckpoint={handleCheckpoint}
          />
        </div>

        {dataSource.length <= 1 ? (
          <>
            <Divider style={{ padding: 0, margin: "12px 0" }} />
            <StreamingHelperSection />
          </>
        ) : null}

        <BottomActionBar
          total={pagination.total}
          selectedCount={selectedRowKeys.length}
          disabled={!hasSelected}
          onStart={handleBatchStart}
          onStop={handleBatchStop}
          current={pagination.current}
          pageSize={pagination.pageSize}
          onPageChange={handlePaginationChange}
        />
      </div>

      <RealtimeTaskViewModal ref={ref} />
      <TaskViewModal ref={refDetail} />

      <RunLogDrawer
        open={logOpen}
        jobMode="STREAMING"
        instanceId={logRecord?.instanceId}
        onClose={() => {
          setLogOpen(false);
          setLogRecord(null);
        }}
        title="运行日志"
        subtitle={
          logRecord?.jobName ? `任务：${logRecord.jobName}` : "查看任务运行输出"
        }
      />

      <RealtimeCheckpointModal
        open={checkpointOpen}
        record={checkpointRecord}
        overview={checkpointOverview}
        history={checkpointHistory}
        loading={checkpointLoading}
        onRefresh={() => {
          if (checkpointRecord) {
            loadCheckpointData(checkpointRecord);
          }
        }}
        onClose={() => {
          setCheckpointOpen(false);
          setCheckpointRecord(null);
          setCheckpointOverview(null);
          setCheckpointHistory([]);
        }}
      />
    </>
  );
};

export default RealtimeSyncPage;